import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltProgress, VoltProgressLabel, VoltProgressValue } from 'volt';

const meta: Meta<VoltProgress> = {
  title: 'Components/Display/Progress',
  component: VoltProgress,
  decorators: [moduleMetadata({ imports: [VoltProgress, VoltProgressLabel, VoltProgressValue] })],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    min: { control: 'number' },
    max: { control: 'number' },
  },
  args: { value: 60, min: 0, max: 100 },
  render: args => ({
    props: args,
    template: `
      <volt-progress class="max-w-sm" [value]="value" [min]="min" [max]="max">
        <volt-progress-label>Upload progress</volt-progress-label>
        <volt-progress-value>{{ value }}% complete</volt-progress-value>
      </volt-progress>`,
  }),
};
export default meta;
type Story = StoryObj<VoltProgress>;

export const Default: Story = {};

export const Complete: Story = {
  args: { value: 100 },
};

export const Unknown: Story = {
  name: 'Unknown amount',
  parameters: {
    docs: {
      description: { story: 'Leave `value` unset (`null`) when the amount of work is not known.' },
    },
  },
  render: () => ({
    template: `
      <volt-progress class="max-w-sm" aria-label="Preparing download">
        <volt-progress-label>Preparing download</volt-progress-label>
      </volt-progress>`,
  }),
};
