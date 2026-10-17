import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterLabel,
  VoltMeterTrack,
  VoltMeterValue,
} from 'volt';

const meta: Meta<VoltMeter> = {
  title: 'Components/Display/Meter',
  component: VoltMeter,
  decorators: [
    moduleMetadata({
      imports: [VoltMeter, VoltMeterLabel, VoltMeterValue, VoltMeterTrack, VoltMeterIndicator],
    }),
  ],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    min: { control: 'number' },
    max: { control: 'number' },
  },
  args: { value: 72, min: 0, max: 100 },
  render: args => ({
    props: args,
    template: `
      <volt-meter class="max-w-sm" [value]="value" [min]="min" [max]="max">
        <div class="mb-2 flex items-center justify-between gap-3">
          <volt-meter-label>Storage</volt-meter-label>
          <volt-meter-value>{{ value }} of {{ max }} GB used</volt-meter-value>
        </div>
        <volt-meter-track><volt-meter-indicator /></volt-meter-track>
      </volt-meter>`,
  }),
};
export default meta;
type Story = StoryObj<VoltMeter>;

export const Default: Story = {};

export const AlmostFull: Story = {
  args: { value: 96 },
};
