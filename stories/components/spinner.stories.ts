import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltNativeButton, VoltSpinner } from 'volt';
import { SPINNER_API } from '../../apps/web/src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltSpinner> = {
  title: 'Components/Display/Spinner',
  component: VoltSpinner,
  decorators: [moduleMetadata({ imports: [VoltSpinner, VoltNativeButton] })],
  argTypes: { ...variantArgTypes(SPINNER_API), label: { control: 'text' } },
  args: { size: 'md', label: 'Loading projects' },
  render: args => ({ props: args, template: `<volt-spinner [size]="size" [label]="label" />` }),
};
export default meta;
type Story = StoryObj<VoltSpinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4">
        <volt-spinner size="sm" />
        <volt-spinner size="md" />
        <volt-spinner size="lg" />
      </div>`,
  }),
};

export const InButton: Story = {
  name: 'Decorative, next to text',
  parameters: {
    docs: {
      description: {
        story:
          'A spinner beside visible text is decorative: giving it a label as well would announce the message twice.',
      },
    },
  },
  render: () => ({
    template: `
      <button voltButton type="button" aria-disabled="true">
        <volt-spinner size="sm" />
        Saving…
      </button>`,
  }),
};
