import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltDialog,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogService,
  VoltDialogTitle,
  VoltNativeButton,
  type VoltDialogContext,
} from 'volt';

/** Opens a dialog from code and awaits the answer, which is what `VoltDialogService` is for. */
@Component({
  selector: 'app-story-dialog-service',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNativeButton,
    VoltDialogOverlay,
    VoltDialogContent,
    VoltDialogTitle,
    VoltDialogDescription,
  ],
  template: `
    <button voltButton variant="destructive" type="button" (click)="remove()">
      Delete project
    </button>
    <p class="text-muted-foreground mt-2 text-sm">Result: {{ result() }}</p>
    <ng-template #confirmTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete project?</h2>
        <p voltDialogDescription>This action cannot be undone.</p>
        <div class="mt-4 flex justify-end gap-2">
          <button voltButton variant="outline" type="button" (click)="close(false)">Cancel</button>
          <button voltButton variant="destructive" type="button" (click)="close(true)">
            Delete
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
class StoryDialogService {
  private readonly dialog = inject(VoltDialogService);
  private readonly confirmTpl =
    viewChild.required<TemplateRef<VoltDialogContext<boolean>>>('confirmTpl');
  protected readonly result = signal('none yet');

  async remove() {
    const confirmed = await this.dialog.open<boolean>(this.confirmTpl(), { role: 'alertdialog' })
      .closed;
    this.result.set(confirmed ? 'deleted' : 'cancelled');
  }
}

const meta: Meta<VoltDialogRoot> = {
  title: 'Components/Overlays/Dialog',
  component: VoltDialogRoot,
  decorators: [
    moduleMetadata({
      imports: [
        VoltDialog,
        VoltDialogRoot,
        VoltDialogOverlay,
        VoltDialogContent,
        VoltDialogTitle,
        VoltDialogDescription,
        VoltNativeButton,
        StoryDialogService,
      ],
    }),
  ],
  argTypes: {
    open: { control: 'boolean' },
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
    closeOnEscape: { control: 'boolean' },
    closeOnClick: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    openChange: { action: 'openChange' },
    closed: { action: 'closed' },
  },
  args: { open: false, role: 'dialog', closeOnEscape: true, closeOnClick: true, dismissible: true },
  render: () => ({
    template: `
      <button voltButton type="button" [voltDialog]="infoTpl">Open dialog</button>
      <ng-template #infoTpl let-close="close">
        <div voltDialogOverlay></div>
        <div voltDialogContent>
          <h2 voltDialogTitle>Keyboard shortcuts</h2>
          <p voltDialogDescription>Press ? anywhere to open this list.</p>
          <div class="mt-4 flex justify-end"><button voltButton type="button" (click)="close()">Close</button></div>
        </div>
      </ng-template>`,
  }),
};
export default meta;
type Story = StoryObj<VoltDialogRoot>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `voltDialog` directive on a trigger opens the template. Focus moves into the dialog, stays inside it, and returns to the trigger when it closes. Escape and a click on the overlay dismiss it.',
      },
    },
  },
};

export const Controlled: Story = {
  name: 'Controlled with [(open)]',
  parameters: {
    docs: {
      description: {
        story:
          'Your state decides when the dialog is open. Use the controls to change the role and how it can be dismissed.',
      },
    },
  },
  render: args => ({
    props: { ...args, open: false },
    template: `
      <button voltButton variant="outline" type="button" (click)="open = true">Edit profile</button>
      <ng-template voltDialogRoot [(open)]="open" [role]="role" [closeOnEscape]="closeOnEscape" [closeOnClick]="closeOnClick" [dismissible]="dismissible" (closed)="closed($event)" let-close="close">
        <div voltDialogOverlay></div>
        <form voltDialogContent (submit)="$event.preventDefault(); close('saved')">
          <h2 voltDialogTitle>Edit profile</h2>
          <p voltDialogDescription>Changes are visible to your team.</p>
          <div class="mt-4 flex justify-end gap-2">
            <button voltButton variant="outline" type="button" (click)="close('cancelled')">Cancel</button>
            <button voltButton type="submit">Save</button>
          </div>
        </form>
      </ng-template>`,
  }),
};

export const AlertDialog: Story = {
  name: 'Destructive confirmation',
  parameters: {
    docs: {
      description: {
        story:
          '`role="alertdialog"` with `initialFocus` puts focus on the safe action (Cancel) rather than the destructive one.',
      },
    },
  },
  render: () => ({
    props: { open: false },
    template: `
      <button voltButton variant="destructive" type="button" (click)="open = true">Delete project</button>
      <ng-template voltDialogRoot role="alertdialog" [(open)]="open" initialFocus="[data-cancel]" let-close="close">
        <div voltDialogOverlay></div>
        <div voltDialogContent>
          <h2 voltDialogTitle>Delete project?</h2>
          <p voltDialogDescription>This permanently removes the project and its data.</p>
          <div class="mt-4 flex justify-end gap-2">
            <button voltButton data-cancel variant="outline" type="button" (click)="close()">Cancel</button>
            <button voltButton variant="destructive" type="button" (click)="close('deleted')">Delete</button>
          </div>
        </div>
      </ng-template>`,
  }),
};

export const NotDismissible: Story = {
  name: 'Not dismissible while pending',
  parameters: {
    docs: {
      description: {
        story:
          '`[dismissible]="false"` makes Escape and overlay clicks do nothing, for example while a request runs. `close()` and `[(open)]` still work.',
      },
    },
  },
  render: () => ({
    props: { open: false },
    template: `
      <button voltButton type="button" (click)="open = true">Open</button>
      <ng-template voltDialogRoot [(open)]="open" [dismissible]="false" let-close="close">
        <div voltDialogOverlay></div>
        <div voltDialogContent>
          <h2 voltDialogTitle>Saving…</h2>
          <p voltDialogDescription>Escape and outside clicks are ignored until you choose Done.</p>
          <div class="mt-4 flex justify-end"><button voltButton type="button" (click)="close()">Done</button></div>
        </div>
      </ng-template>`,
  }),
};

export const FromCode: Story = {
  name: 'Opened from code (VoltDialogService)',
  parameters: {
    docs: {
      description: {
        story:
          '`VoltDialogService.open()` returns a handle whose `closed` promise resolves with the value passed to `close()`.',
      },
    },
  },
  render: () => ({ template: `<app-story-dialog-service />` }),
};
