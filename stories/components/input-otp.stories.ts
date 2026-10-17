import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltInputOtp } from 'volt';

const meta: Meta<VoltInputOtp> = {
  title: 'Components/Forms & Inputs/Input OTP',
  component: VoltInputOtp,
  decorators: [moduleMetadata({ imports: [VoltInputOtp, ReactiveFormsModule] })],
  argTypes: {
    length: { control: { type: 'number', min: 2, max: 8 } },
    disabled: { control: 'boolean' },
    inputMode: {
      control: 'select',
      options: ['numeric', 'text', 'decimal', 'tel', 'search', 'email', 'url'],
    },
    valueChange: { action: 'valueChange' },
    complete: { action: 'complete' },
  },
  args: { length: 6, disabled: false, inputMode: 'numeric', pattern: '[0-9]' },
  render: args => ({
    props: args,
    template: `<volt-input-otp [length]="length" [disabled]="disabled" [inputMode]="inputMode" [pattern]="pattern" (valueChange)="valueChange($event)" (complete)="complete($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<VoltInputOtp>;

export const Default: Story = {};

export const Letters: Story = {
  name: 'Alphanumeric code',
  args: { length: 4, inputMode: 'text', pattern: '[A-Za-z0-9]' },
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { code: new FormControl('', { nonNullable: true }) },
    template: `
      <volt-input-otp [formControl]="code" [length]="6" />
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ code.value }}</p>`,
  }),
};
