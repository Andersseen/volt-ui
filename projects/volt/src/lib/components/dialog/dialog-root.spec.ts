import { Component, inject, signal, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogService,
  VoltDialogTitle,
  type VoltDialogContext,
} from './';

const PARTS = [VoltDialogOverlay, VoltDialogContent, VoltDialogTitle, VoltDialogDescription];

@Component({
  imports: [VoltDialogRoot, ...PARTS],
  template: `
    <button (click)="open.set(true)">Edit profile</button>
    <ng-template voltDialogRoot [(open)]="open" (closed)="onClosed($event)" let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent data-testid="content">
        <h2 voltDialogTitle>Edit profile</h2>
        <p voltDialogDescription>Update your public details.</p>
        <input aria-label="Name" />
        <button (click)="close('saved')">Save</button>
      </div>
    </ng-template>
  `,
})
class ControlledDialog {
  readonly open = signal(false);
  readonly onClosed = vi.fn();
}

@Component({
  imports: [...PARTS],
  template: `
    <button (click)="confirm()">Delete</button>
    <ng-template #confirmTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete project?</h2>
        <button (click)="close(true)">Confirm delete</button>
        <button (click)="close(false)">Cancel</button>
      </div>
    </ng-template>
  `,
})
class ConfirmDialog {
  private readonly dialog = inject(VoltDialogService);
  private readonly tpl = viewChild.required<TemplateRef<VoltDialogContext<boolean>>>('confirmTpl');
  result: boolean | undefined | 'pending' = 'pending';

  private readonly viewContainerRef = inject(ViewContainerRef);

  async confirm(): Promise<void> {
    this.result = await this.dialog.open<boolean>(this.tpl(), {
      role: 'alertdialog',
      viewContainerRef: this.viewContainerRef,
    }).closed;
  }
}

describe('VoltDialogRoot (controlled)', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()));

  it('opens from state with a labelled, described modal dialog and no trigger', async () => {
    const { fixture } = await render(ControlledDialog);

    expect(screen.queryByRole('dialog')).toBeNull();
    fixture.componentInstance.open.set(true);

    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAccessibleDescription('Update your public details.');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('closes when the state becomes false', async () => {
    const { fixture } = await render(ControlledDialog);
    fixture.componentInstance.open.set(true);
    await screen.findByRole('dialog');

    fixture.componentInstance.open.set(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledWith(undefined);
  });

  it('writes open=false back and emits the result when the content closes itself', async () => {
    const { fixture } = await render(ControlledDialog);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Edit profile' }));
    await screen.findByRole('dialog');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(fixture.componentInstance.open()).toBe(false));
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledWith('saved');
  });

  it('syncs open=false when dismissed with Escape', async () => {
    const { fixture } = await render(ControlledDialog);
    fixture.componentInstance.open.set(true);
    await screen.findByRole('dialog');

    await userEvent.setup().keyboard('{Escape}');

    await waitFor(() => expect(fixture.componentInstance.open()).toBe(false));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('can be reopened after closing', async () => {
    const { fixture } = await render(ControlledDialog);
    fixture.componentInstance.open.set(true);
    await screen.findByRole('dialog');
    fixture.componentInstance.open.set(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    fixture.componentInstance.open.set(true);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

describe('VoltDialogService', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()));

  it('opens an alertdialog and resolves `closed` with the result', async () => {
    const { fixture } = await render(ConfirmDialog);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = await screen.findByRole('alertdialog', { name: 'Delete project?' });
    expect(dialog).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Confirm delete' }));
    await waitFor(() => expect(fixture.componentInstance.result).toBe(true));
  });

  it('resolves `closed` with undefined when dismissed without a result', async () => {
    const { fixture } = await render(ConfirmDialog);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByRole('alertdialog');

    fixture.debugElement.injector.get(VoltDialogService).closeAll();
    await waitFor(() => expect(fixture.componentInstance.result).toBeUndefined());
  });
});
