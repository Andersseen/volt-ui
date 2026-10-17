import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection } from 'volt';

const meta: Meta<VoltListbox> = {
  title: 'Components/Controls/Listbox',
  component: VoltListbox,
  decorators: [
    moduleMetadata({
      imports: [
        VoltListbox,
        VoltListboxOption,
        VoltListboxSection,
        VoltListboxHeader,
        ReactiveFormsModule,
        JsonPipe,
      ],
    }),
  ],
  argTypes: {
    mode: { control: 'radio', options: ['single', 'multiple'] },
    disabled: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
  },
  args: { mode: 'single', disabled: false, value: ['angular'] },
  render: args => ({
    props: args,
    template: `
      <volt-listbox class="w-56" aria-label="Frameworks" [mode]="mode" [disabled]="disabled" [value]="value" (valueChange)="valueChange($event)">
        <volt-listbox-option value="angular">Angular</volt-listbox-option>
        <volt-listbox-option value="react">React</volt-listbox-option>
        <volt-listbox-option value="vue">Vue</volt-listbox-option>
        <volt-listbox-option value="svelte" [disabled]="true">Svelte (unavailable)</volt-listbox-option>
      </volt-listbox>`,
  }),
};
export default meta;
type Story = StoryObj<VoltListbox>;

export const Default: Story = {};

export const Multiple: Story = {
  args: { mode: 'multiple', value: ['angular', 'vue'] },
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: { selected: new FormControl(['angular'], { nonNullable: true }) },
    template: `
      <volt-listbox class="w-56" aria-label="Frameworks" [formControl]="selected">
        <volt-listbox-option value="angular">Angular</volt-listbox-option>
        <volt-listbox-option value="react">React</volt-listbox-option>
        <volt-listbox-option value="vue">Vue</volt-listbox-option>
      </volt-listbox>
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ selected.value | json }}</p>`,
  }),
};
