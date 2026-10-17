import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltToggleGroup, VoltToggleGroupItem } from 'volt';

const meta: Meta<VoltToggleGroup> = {
  title: 'Components/Controls/Toggle Group',
  component: VoltToggleGroup,
  decorators: [
    moduleMetadata({
      imports: [VoltToggleGroup, VoltToggleGroupItem, ReactiveFormsModule, JsonPipe],
    }),
  ],
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    allowDeselection: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
  },
  args: {
    type: 'multiple',
    orientation: 'horizontal',
    disabled: false,
    allowDeselection: true,
    value: ['bold'],
  },
  render: args => ({
    props: args,
    template: `
      <volt-toggle-group [type]="type" [orientation]="orientation" [disabled]="disabled" [allowDeselection]="allowDeselection" [value]="value" (valueChange)="valueChange($event)">
        <volt-toggle-group-item value="bold" aria-label="Bold">Bold</volt-toggle-group-item>
        <volt-toggle-group-item value="italic" aria-label="Italic">Italic</volt-toggle-group-item>
        <volt-toggle-group-item value="underline" aria-label="Underline">Underline</volt-toggle-group-item>
      </volt-toggle-group>`,
  }),
};
export default meta;
type Story = StoryObj<VoltToggleGroup>;

export const Default: Story = {};

export const SingleSelection: Story = {
  args: { type: 'single', value: ['left'] },
  render: args => ({
    props: args,
    template: `
      <volt-toggle-group [type]="type" [value]="value" (valueChange)="valueChange($event)">
        <volt-toggle-group-item value="left" variant="outline">Left</volt-toggle-group-item>
        <volt-toggle-group-item value="center" variant="outline">Center</volt-toggle-group-item>
        <volt-toggle-group-item value="right" variant="outline">Right</volt-toggle-group-item>
      </volt-toggle-group>`,
  }),
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { formatting: new FormControl<string[]>(['bold'], { nonNullable: true }) },
    template: `
      <volt-toggle-group type="multiple" [formControl]="formatting">
        <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
        <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
        <volt-toggle-group-item value="underline">Underline</volt-toggle-group-item>
      </volt-toggle-group>
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ formatting.value | json }}</p>`,
  }),
};
