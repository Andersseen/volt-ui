import { Component, signal } from '@angular/core';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltAlert, VoltAlertDescription } from '../alert';
import { VoltNativeButton } from '../button';
import { VoltSpinner } from '../spinner';
import {
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogTitle,
} from './';

const PARTS = [VoltDialogOverlay, VoltDialogContent, VoltDialogTitle, VoltDialogDescription];

/** A deterministic async operation the test settles by hand. */
function deferred() {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

@Component({
  imports: [
    VoltDialogRoot,
    VoltNativeButton,
    VoltAlert,
    VoltAlertDescription,
    VoltSpinner,
    ...PARTS,
  ],
  template: `
    <button voltButton (click)="open.set(true)">Delete project</button>
    <ng-template
      voltDialogRoot
      role="alertdialog"
      [(open)]="open"
      [dismissible]="!pending()"
      let-close="close"
    >
      <div voltDialogOverlay data-testid="overlay"></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete project?</h2>
        <p voltDialogDescription>This cannot be undone.</p>
        @if (error()) {
          <volt-alert role="alert" variant="destructive">
            <volt-alert-description>{{ error() }}</volt-alert-description>
          </volt-alert>
        }
        <button voltButton variant="outline" [disabled]="pending()" (click)="close()">
          Cancel
        </button>
        <button voltButton variant="destructive" [disabled]="pending()" (click)="confirm(close)">
          @if (pending()) {
            <volt-spinner size="sm" />
            Deleting…
          } @else {
            Delete
          }
        </button>
      </div>
    </ng-template>
  `,
})
class AsyncConfirm {
  readonly open = signal(false);
  readonly pending = signal(false);
  readonly error = signal('');
  op = deferred();

  async confirm(close: (r?: unknown) => void): Promise<void> {
    this.pending.set(true);
    this.error.set('');
    try {
      await this.op.promise;
      this.pending.set(false);
      close(true);
    } catch (e) {
      this.pending.set(false);
      this.error.set((e as Error).message);
    }
  }
}

@Component({
  imports: [VoltDialogRoot, VoltNativeButton, ...PARTS],
  template: `
    <button voltButton (click)="editing.set(true)">Edit row</button>
    <ng-template voltDialogRoot [(open)]="editing" let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Edit row</h2>
        <input aria-label="Name" />
        <button voltButton (click)="discard.set(true)">Close editor</button>
      </div>
    </ng-template>
    <ng-template voltDialogRoot role="alertdialog" [(open)]="discard" let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Discard changes?</h2>
        <button voltButton (click)="close()">Keep editing</button>
        <button voltButton (click)="editing.set(false); close()">Discard</button>
      </div>
    </ng-template>
  `,
})
class NestedDialogs {
  readonly editing = signal(false);
  readonly discard = signal(false);
}

@Component({
  imports: [VoltDialogRoot, VoltNativeButton, ...PARTS],
  template: `
    <button voltButton (click)="open.set(true)">Open</button>
    <ng-template voltDialogRoot [(open)]="open" [initialFocus]="selector()" let-close="close">
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete?</h2>
        <button voltButton variant="destructive" (click)="close(true)">Delete</button>
        <button voltButton data-cancel (click)="close()">Cancel</button>
      </div>
    </ng-template>
  `,
})
class InitialFocusDialog {
  readonly open = signal(false);
  readonly selector = signal<string | undefined>(undefined);
}

const settle = () => new Promise(r => setTimeout(r, 0));

describe('Dialog application workflows', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()));

  it('ignores Escape and overlay clicks while pending, then dismisses again', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(AsyncConfirm);
    const cmp = fixture.componentInstance;

    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await screen.findByRole('alertdialog', { name: 'Delete project?' });

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('button', { name: 'Deleting…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    await user.keyboard('{Escape}');
    await user.click(screen.getByTestId('overlay'));
    await settle();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(cmp.open()).toBe(true);

    // Failure: the error stays in the dialog, the actions are usable again, Escape works.
    cmp.op.reject(new Error('Server said no'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server said no');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    // Retry succeeds and closes the dialog.
    cmp.op = deferred();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    cmp.op.resolve();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(cmp.open()).toBe(false);
  });

  it('Escape dismisses again once the operation has failed', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(AsyncConfirm);
    const cmp = fixture.componentInstance;
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await screen.findByRole('alertdialog');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    cmp.op.reject(new Error('nope'));
    await screen.findByRole('alert');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('returns focus to the opener after the dialog closes', async () => {
    const user = userEvent.setup();
    await render(AsyncConfirm);
    const opener = screen.getByRole('button', { name: 'Delete project' });
    await user.click(opener);
    await screen.findByRole('alertdialog');
    await waitFor(() =>
      expect(screen.getByRole('alertdialog').contains(document.activeElement)).toBe(true)
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('focuses the first tabbable by default and the requested element with initialFocus', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(InitialFocusDialog);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    fixture.componentInstance.selector.set('[data-cancel]');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('nested confirmation: Escape closes only the topmost, focus returns step by step', async () => {
    const user = userEvent.setup();
    await render(NestedDialogs);
    const opener = screen.getByRole('button', { name: 'Edit row' });
    await user.click(opener);
    await screen.findByRole('dialog', { name: 'Edit row' });

    const closeEditor = screen.getByRole('button', { name: 'Close editor' });
    await user.click(closeEditor);
    await screen.findByRole('alertdialog', { name: 'Discard changes?' });

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    // Editor is still open and focus is back inside it.
    const editor = screen.getByRole('dialog', { name: 'Edit row' });
    await waitFor(() => expect(editor.contains(document.activeElement)).toBe(true));

    await user.click(screen.getByRole('button', { name: 'Close editor' }));
    await screen.findByRole('alertdialog');
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
