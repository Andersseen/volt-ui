import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltToggle } from 'volt';
import { TOGGLE_API } from '../../src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltToggle> = {
  title: 'Components/Controls/Toggle',
  component: VoltToggle,
  decorators: [moduleMetadata({ imports: [VoltToggle, ReactiveFormsModule] })],
  argTypes: {
    ...variantArgTypes(TOGGLE_API),
    pressed: { control: 'boolean' },
    disabled: { control: 'boolean' },
    pressedChange: { action: 'pressedChange' },
  },
  args: { variant: 'default', size: 'md', pressed: false, disabled: false },
  render: args => ({
    props: args,
    template: `<volt-toggle ariaLabel="Toggle bold" [variant]="variant" [size]="size" [pressed]="pressed" [disabled]="disabled" (pressedChange)="pressedChange($event)"><b>B</b></volt-toggle>`,
  }),
};
export default meta;
type Story = StoryObj<VoltToggle>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <volt-toggle variant="default" ariaLabel="Default">Default</volt-toggle>
        <volt-toggle variant="outline" ariaLabel="Outline">Outline</volt-toggle>
        <volt-toggle variant="ghost" ariaLabel="Ghost">Ghost</volt-toggle>
        <volt-toggle variant="solid" ariaLabel="Solid">Solid</volt-toggle>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <volt-toggle size="sm" ariaLabel="Small">Small</volt-toggle>
        <volt-toggle size="md" ariaLabel="Medium">Medium</volt-toggle>
        <volt-toggle size="lg" ariaLabel="Large">Large</volt-toggle>
      </div>`,
  }),
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { bold: new FormControl(true, { nonNullable: true }) },
    template: `
      <volt-toggle [formControl]="bold" ariaLabel="Toggle bold"><b>B</b></volt-toggle>
      <p class="text-muted-foreground mt-2 text-sm">Pressed: {{ bold.value }}</p>`,
  }),
};
