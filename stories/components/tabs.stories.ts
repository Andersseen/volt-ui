import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltTabs, VoltTabsContent, VoltTabsList, VoltTabsTrigger } from 'volt';

const meta: Meta<VoltTabs> = {
  title: 'Components/Navigation/Tabs',
  component: VoltTabs,
  decorators: [
    moduleMetadata({ imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent] }),
  ],
  argTypes: {
    value: { control: 'select', options: ['account', 'password', 'billing'] },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    activateOnFocus: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
  },
  args: { value: 'account', orientation: 'horizontal', activateOnFocus: true },
  render: args => ({
    props: args,
    template: `
      <volt-tabs class="block max-w-md" [value]="value" [orientation]="orientation" [activateOnFocus]="activateOnFocus" (valueChange)="valueChange($event)">
        <volt-tabs-list aria-label="Settings">
          <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
          <volt-tabs-trigger value="password">Password</volt-tabs-trigger>
          <volt-tabs-trigger value="billing">Billing</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="account">Make changes to your account here.</volt-tabs-content>
        <volt-tabs-content value="password">Change your password here.</volt-tabs-content>
        <volt-tabs-content value="billing">Manage your plan and invoices.</volt-tabs-content>
      </volt-tabs>`,
  }),
};
export default meta;
type Story = StoryObj<VoltTabs>;

export const Default: Story = {};

export const ManualActivation: Story = {
  name: 'Activate on Enter or Space',
  parameters: {
    docs: {
      description: {
        story:
          'With `activateOnFocus` off, arrow keys only move focus; Enter or Space selects the tab.',
      },
    },
  },
  args: { activateOnFocus: false },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};
