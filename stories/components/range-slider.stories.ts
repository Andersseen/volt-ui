import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltRangeSlider } from 'volt';

const meta: Meta<VoltRangeSlider> = {
  title: 'Components/Forms & Inputs/Range Slider',
  component: VoltRangeSlider,
  decorators: [moduleMetadata({ imports: [VoltRangeSlider, ReactiveFormsModule] })],
  argTypes: {
    low: { control: 'number' },
    high: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    lowChange: { action: 'lowChange' },
    highChange: { action: 'highChange' },
  },
  args: {
    low: 50,
    high: 300,
    min: 0,
    max: 500,
    step: 10,
    disabled: false,
    orientation: 'horizontal',
  },
  render: args => ({
    props: args,
    template: `<volt-range-slider class="block w-72" ariaLabelLow="Minimum price" ariaLabelHigh="Maximum price" [low]="low" [high]="high" [min]="min" [max]="max" [step]="step" [disabled]="disabled" [orientation]="orientation" (lowChange)="lowChange($event)" (highChange)="highChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<VoltRangeSlider>;

export const Default: Story = {};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { range: new FormControl<[number, number]>([50, 300], { nonNullable: true }) },
    template: `
      <volt-range-slider class="block w-72" ariaLabelLow="Minimum price" ariaLabelHigh="Maximum price" [formControl]="range" [min]="0" [max]="500" />
      <p class="text-muted-foreground mt-2 text-sm">{{ range.value[0] }} – {{ range.value[1] }}</p>`,
  }),
};
