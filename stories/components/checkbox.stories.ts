import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltCheckbox, VoltLabel } from 'volt';

const meta: Meta<VoltCheckbox> = {
  title: 'Components/Forms & Inputs/Checkbox',
  component: VoltCheckbox,
  decorators: [moduleMetadata({ imports: [VoltCheckbox, VoltLabel, ReactiveFormsModule] })],
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    checkedChange: { action: 'checkedChange' },
  },
  args: { checked: false, indeterminate: false, disabled: false, required: false },
  render: args => ({
    props: args,
    template: `
      <div class="flex items-center gap-2">
        <volt-checkbox id="terms" [checked]="checked" [indeterminate]="indeterminate" [disabled]="disabled" [required]="required" (checkedChange)="checkedChange($event)" />
        <volt-label htmlFor="terms">Accept terms and conditions</volt-label>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<VoltCheckbox>;

export const Default: Story = {};

export const States: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2"><volt-checkbox ariaLabel="Unchecked" /><span class="text-sm">Unchecked</span></div>
        <div class="flex items-center gap-2"><volt-checkbox [checked]="true" ariaLabel="Checked" /><span class="text-sm">Checked</span></div>
        <div class="flex items-center gap-2"><volt-checkbox [indeterminate]="true" ariaLabel="Indeterminate" /><span class="text-sm">Indeterminate</span></div>
        <div class="flex items-center gap-2"><volt-checkbox [disabled]="true" ariaLabel="Disabled" /><span class="text-sm">Disabled</span></div>
        <div class="flex items-center gap-2"><volt-checkbox [disabled]="true" [checked]="true" ariaLabel="Disabled checked" /><span class="text-sm">Disabled, checked</span></div>
      </div>`,
  }),
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  parameters: {
    docs: {
      description: {
        story: 'The checkbox implements `ControlValueAccessor`; the form value is shown beside it.',
      },
    },
  },
  render: () => ({
    props: {
      accepted: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    },
    template: `
      <div class="flex items-center gap-2">
        <volt-checkbox id="accepted" [formControl]="accepted" />
        <volt-label htmlFor="accepted">Accept terms and conditions</volt-label>
      </div>
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ accepted.value }} · valid: {{ accepted.valid }}</p>`,
  }),
};

export const Invalid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A required checkbox that was touched without being ticked reports `aria-invalid="true"`; pair it with visible text.',
      },
    },
  },
  render: () => {
    const terms = new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    });
    terms.markAsTouched();
    return {
      props: { terms },
      template: `
        <div class="flex items-center gap-2">
          <volt-checkbox id="terms-invalid" [formControl]="terms" />
          <volt-label htmlFor="terms-invalid">Accept terms and conditions</volt-label>
        </div>
        <p class="mt-2 text-sm text-destructive">You must accept the terms to continue.</p>`,
    };
  },
};
