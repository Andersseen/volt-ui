import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltLabel, VoltRadioGroup, VoltRadioItem } from 'volt';

const meta: Meta<VoltRadioGroup> = {
  title: 'Components/Forms & Inputs/Radio',
  component: VoltRadioGroup,
  decorators: [
    moduleMetadata({ imports: [VoltRadioGroup, VoltRadioItem, VoltLabel, ReactiveFormsModule] }),
  ],
  argTypes: {
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
  },
  args: { orientation: 'vertical', disabled: false, value: 'comfortable' },
  render: args => ({
    props: args,
    template: `
      <volt-radio-group aria-label="Density" [value]="value" [orientation]="orientation" [disabled]="disabled" (valueChange)="valueChange($event)">
        <div class="flex items-center gap-2"><volt-radio-item id="r-default" value="default" /><volt-label htmlFor="r-default">Default</volt-label></div>
        <div class="flex items-center gap-2"><volt-radio-item id="r-comfortable" value="comfortable" /><volt-label htmlFor="r-comfortable">Comfortable</volt-label></div>
        <div class="flex items-center gap-2"><volt-radio-item id="r-compact" value="compact" /><volt-label htmlFor="r-compact">Compact</volt-label></div>
      </volt-radio-group>`,
  }),
};
export default meta;
type Story = StoryObj<VoltRadioGroup>;

export const Default: Story = {};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Disable the whole group, or a single item with `disabled` on `volt-radio-item`.',
      },
    },
  },
  render: () => ({
    template: `
      <volt-radio-group aria-label="Plan" value="free">
        <div class="flex items-center gap-2"><volt-radio-item id="p-free" value="free" /><volt-label htmlFor="p-free">Free</volt-label></div>
        <div class="flex items-center gap-2"><volt-radio-item id="p-pro" value="pro" [disabled]="true" /><volt-label htmlFor="p-pro">Pro (unavailable)</volt-label></div>
      </volt-radio-group>`,
  }),
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { plan: new FormControl<string | null>('free') },
    template: `
      <volt-radio-group aria-label="Plan" [formControl]="plan">
        <div class="flex items-center gap-2"><volt-radio-item id="f-free" value="free" /><volt-label htmlFor="f-free">Free</volt-label></div>
        <div class="flex items-center gap-2"><volt-radio-item id="f-pro" value="pro" /><volt-label htmlFor="f-pro">Pro</volt-label></div>
      </volt-radio-group>
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ plan.value }}</p>`,
  }),
};
