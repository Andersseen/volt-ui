import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltBadge } from 'volt';
import { BADGE_API } from '../../src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltBadge> = {
  title: 'Components/Display/Badge',
  component: VoltBadge,
  decorators: [moduleMetadata({ imports: [VoltBadge] })],
  argTypes: variantArgTypes(BADGE_API),
  args: { variant: 'solid' },
  render: args => ({ props: args, template: `<volt-badge [variant]="variant">Badge</volt-badge>` }),
};
export default meta;
type Story = StoryObj<VoltBadge>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <volt-badge>Default</volt-badge>
        <volt-badge variant="secondary">Secondary</volt-badge>
        <volt-badge variant="outline">Outline</volt-badge>
        <volt-badge variant="destructive">Failed</volt-badge>
      </div>`,
  }),
};

export const Status: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Status colours are not enough on their own: keep a word that says what the status is.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <volt-badge variant="success">Connected</volt-badge>
        <volt-badge variant="warning">Needs attention</volt-badge>
        <volt-badge variant="info">Beta</volt-badge>
      </div>`,
  }),
};
