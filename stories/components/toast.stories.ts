import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltNativeButton, VoltToast, VoltToastService, type VoltToastVariant } from 'volt';

/** Raises toasts the way an application does: through `VoltToastService`. */
@Component({
  selector: 'app-story-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltNativeButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button voltButton type="button" (click)="show()">Show toast</button>
      <button
        voltButton
        variant="outline"
        type="button"
        (click)="toast.success('Copied to clipboard')"
      >
        Success
      </button>
      <button
        voltButton
        variant="outline"
        type="button"
        (click)="toast.warning('Storage almost full')"
      >
        Warning
      </button>
      <button
        voltButton
        variant="outline"
        type="button"
        (click)="toast.info('A new version is available')"
      >
        Info
      </button>
      <button voltButton variant="destructive" type="button" (click)="fail()">Error</button>
      <button voltButton variant="ghost" type="button" (click)="toast.dismissAll()">
        Dismiss all
      </button>
    </div>
  `,
})
class StoryToast {
  protected readonly toast = inject(VoltToastService);
  readonly variant = input<VoltToastVariant>('default');

  protected show() {
    this.toast.show({
      title: 'Changes saved',
      description: 'Your workspace has been updated.',
      variant: this.variant(),
    });
  }

  protected fail() {
    // Error toasts are announced with role="alert".
    this.toast.error('Could not save', { description: 'Check your connection and try again.' });
  }
}

const meta: Meta<VoltToast> = {
  title: 'Components/Overlays/Toast',
  component: VoltToast,
  decorators: [moduleMetadata({ imports: [StoryToast] })],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning', 'info'] },
  },
  args: { variant: 'default' },
  render: args => ({ props: args, template: `<app-story-toast [variant]="variant" />` }),
};
export default meta;
type Story = StoryObj<VoltToast>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Toasts are raised from code with `VoltToastService`: `show()`, `success()`, `error()`, `warning()` and `info()`. They pause on hover and can be dismissed with the close button or the keyboard. The first button uses the variant chosen in the controls.',
      },
    },
  },
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Error toasts are announced assertively (`role="alert"`); the others through a polite live region.',
      },
    },
  },
  render: () => ({ template: `<app-story-toast />` }),
};
