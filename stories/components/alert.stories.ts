import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltAlert, VoltAlertDescription, VoltAlertTitle, VoltNativeButton } from 'volt';
import { ALERT_API } from '../../src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltAlert> = {
  title: 'Components/Display/Alert',
  component: VoltAlert,
  decorators: [
    moduleMetadata({
      imports: [VoltAlert, VoltAlertTitle, VoltAlertDescription, VoltNativeButton],
    }),
  ],
  argTypes: {
    ...variantArgTypes(ALERT_API),
    role: { control: 'radio', options: [null, 'status', 'alert'] },
  },
  args: { variant: 'info', role: null },
  render: args => ({
    props: args,
    template: `
      <volt-alert class="max-w-lg" [variant]="variant" [role]="role">
        <volt-alert-title>Heads up</volt-alert-title>
        <volt-alert-description>You can add components to your app with the CLI.</volt-alert-description>
      </volt-alert>`,
  }),
};
export default meta;
type Story = StoryObj<VoltAlert>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-lg flex-col gap-3">
        <volt-alert variant="default"><volt-alert-title>Default</volt-alert-title></volt-alert>
        <volt-alert variant="info"><volt-alert-title>New version available</volt-alert-title></volt-alert>
        <volt-alert variant="success"><volt-alert-title>Deployment finished</volt-alert-title></volt-alert>
        <volt-alert variant="warning"><volt-alert-title>Connection needs attention</volt-alert-title></volt-alert>
        <volt-alert variant="destructive"><volt-alert-title>Payment failed</volt-alert-title></volt-alert>
      </div>`,
  }),
};

export const WithAction: Story = {
  name: 'Failed request with retry',
  parameters: {
    docs: {
      description: {
        story:
          '`role="alert"` interrupts once. Keep what the person typed and offer a way to retry. Do not also put `aria-live` on a parent: it would be read twice.',
      },
    },
  },
  render: () => ({
    template: `
      <volt-alert class="max-w-lg" variant="destructive" role="alert">
        <volt-alert-title>Could not save</volt-alert-title>
        <volt-alert-description>Your changes are still here. Try again.</volt-alert-description>
        <button slot="action" voltButton variant="outline" size="sm" type="button">Retry</button>
      </volt-alert>`,
  }),
};
