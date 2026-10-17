import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltSlider } from 'volt';

const meta: Meta<VoltSlider> = {
  title: 'Components/Forms & Inputs/Slider',
  component: VoltSlider,
  decorators: [moduleMetadata({ imports: [VoltSlider, ReactiveFormsModule] })],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    valueChange: { action: 'valueChange' },
  },
  args: { value: 40, min: 0, max: 100, step: 1, disabled: false, orientation: 'horizontal' },
  render: args => ({
    props: args,
    template: `<volt-slider class="block w-64" ariaLabel="Volume" [value]="value" [min]="min" [max]="max" [step]="step" [disabled]="disabled" [orientation]="orientation" (valueChange)="valueChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<VoltSlider>;

export const Default: Story = {};

export const Stepped: Story = {
  args: { step: 10, value: 50 },
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { volume: new FormControl(50, { nonNullable: true }) },
    template: `
      <volt-slider class="block w-64" ariaLabel="Volume" [formControl]="volume" [min]="0" [max]="100" />
      <p class="text-muted-foreground mt-2 text-sm">Volume: {{ volume.value }}</p>`,
  }),
};
