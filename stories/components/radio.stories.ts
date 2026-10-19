import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Unchecked and checked items show the indicator state; separate groups show disabled and disabled-while-checked controls.',
      },
    },
  },
  render: () => ({
    template: `
      <volt-radio-group aria-label="States" value="checked">
        <div class="flex items-center gap-2"><volt-radio-item id="rs-off" value="unchecked" /><volt-label htmlFor="rs-off">Unchecked</volt-label></div>
        <div class="flex items-center gap-2"><volt-radio-item id="rs-on" value="checked" /><volt-label htmlFor="rs-on">Checked</volt-label></div>
        <div class="flex items-center gap-2"><volt-radio-item id="rs-dis" value="disabled" [disabled]="true" /><volt-label htmlFor="rs-dis">Disabled</volt-label></div>
      </volt-radio-group>
      <volt-radio-group aria-label="Disabled selected state" value="selected" [disabled]="true" class="mt-6">
        <div class="flex items-center gap-2"><volt-radio-item id="rs-dis-selected" value="selected" /><volt-label htmlFor="rs-dis-selected">Disabled and selected</volt-label></div>
      </volt-radio-group>`,
  }),
};

export const Invalid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A required group that was touched with nothing chosen reports `aria-invalid="true"`.',
      },
    },
  },
  render: () => {
    const plan = new FormControl<string | null>(null, { validators: [Validators.required] });
    plan.markAsTouched();
    return {
      props: { plan },
      template: `
        <volt-radio-group aria-label="Plan" [formControl]="plan">
          <div class="flex items-center gap-2"><volt-radio-item id="ri-free" value="free" /><volt-label htmlFor="ri-free">Free</volt-label></div>
          <div class="flex items-center gap-2"><volt-radio-item id="ri-pro" value="pro" /><volt-label htmlFor="ri-pro">Pro</volt-label></div>
        </volt-radio-group>
        <p class="mt-2 text-sm text-destructive">Choose a plan.</p>`,
    };
  },
};
