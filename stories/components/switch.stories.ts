import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltLabel, VoltSwitch } from 'volt';

const meta: Meta<VoltSwitch> = {
  title: 'Components/Forms & Inputs/Switch',
  component: VoltSwitch,
  decorators: [moduleMetadata({ imports: [VoltSwitch, VoltLabel, ReactiveFormsModule] })],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    checkedChange: { action: 'checkedChange' },
  },
  args: { checked: false, disabled: false },
  render: args => ({
    props: args,
    template: `
      <div class="flex items-center gap-2">
        <volt-switch id="airplane" [checked]="checked" [disabled]="disabled" (checkedChange)="checkedChange($event)" />
        <volt-label htmlFor="airplane">Airplane mode</volt-label>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<VoltSwitch>;

export const Default: Story = {};

export const States: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2"><volt-switch ariaLabel="Off" /><span class="text-sm">Off</span></div>
        <div class="flex items-center gap-2"><volt-switch [checked]="true" ariaLabel="On" /><span class="text-sm">On</span></div>
        <div class="flex items-center gap-2"><volt-switch [disabled]="true" ariaLabel="Disabled" /><span class="text-sm">Disabled</span></div>
      </div>`,
  }),
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { enabled: new FormControl(true, { nonNullable: true }) },
    template: `
      <div class="flex items-center gap-2">
        <volt-switch id="notifications" [formControl]="enabled" />
        <volt-label htmlFor="notifications">Notifications</volt-label>
      </div>
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ enabled.value }}</p>`,
  }),
};

export const Invalid: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A required switch that was touched while off reports `aria-invalid="true"`.',
      },
    },
  },
  render: () => {
    const consent = new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    });
    consent.markAsTouched();
    return {
      props: { consent },
      template: `
        <div class="flex items-center gap-2">
          <volt-switch id="consent-invalid" [formControl]="consent" />
          <volt-label htmlFor="consent-invalid">Share anonymous usage data</volt-label>
        </div>
        <p class="mt-2 text-sm text-destructive">This setting is required.</p>`,
    };
  },
};
