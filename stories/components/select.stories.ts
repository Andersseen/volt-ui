import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  VoltNativeSelect,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from 'volt';

/** The trigger shows `displayWith(value)`; by default that is `String(value)`, so give it the label. */
const LABELS: Record<string, string> = {
  apple: 'Apple',
  banana: 'Banana',
  blueberry: 'Blueberry',
  carrot: 'Carrot',
  broccoli: 'Broccoli',
};
const displayWith = (value: unknown) => LABELS[String(value)] ?? String(value);

const meta: Meta<VoltSelect> = {
  title: 'Components/Forms & Inputs/Select',
  component: VoltSelect,
  decorators: [
    moduleMetadata({
      imports: [
        VoltSelect,
        VoltSelectContent,
        VoltSelectItem,
        VoltSelectLabel,
        VoltSelectSeparator,
        VoltNativeSelect,
        ReactiveFormsModule,
      ],
    }),
  ],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    dropdownPlacement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end'],
    },
    valueChange: { action: 'valueChange' },
  },
  args: { placeholder: 'Select a fruit', disabled: false, multiple: false },
  render: args => ({
    props: { ...args, displayWith },
    template: `
      <volt-select class="w-60" ariaLabel="Fruit" [displayWith]="displayWith" [placeholder]="placeholder" [disabled]="disabled" [multiple]="multiple" (valueChange)="valueChange($event)">
        <volt-select-content>
          <volt-select-label>Fruits</volt-select-label>
          <volt-select-item value="apple">Apple</volt-select-item>
          <volt-select-item value="banana">Banana</volt-select-item>
          <volt-select-item value="blueberry" [disabled]="true">Blueberry (out of stock)</volt-select-item>
          <volt-select-separator />
          <volt-select-label>Vegetables</volt-select-label>
          <volt-select-item value="carrot">Carrot</volt-select-item>
          <volt-select-item value="broccoli">Broccoli</volt-select-item>
        </volt-select-content>
      </volt-select>`,
  }),
};
export default meta;
type Story = StoryObj<VoltSelect>;

export const Default: Story = {};

export const Multiple: Story = {
  args: { multiple: true, placeholder: 'Select fruits' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithFormControl: Story = {
  name: 'Reactive forms',
  render: () => ({
    props: {
      displayWith,
      fruit: new FormControl<string | undefined>('banana', { nonNullable: true }),
    },
    template: `
      <volt-select class="w-60" ariaLabel="Fruit" [displayWith]="displayWith" [formControl]="fruit">
        <volt-select-content>
          <volt-select-item value="apple">Apple</volt-select-item>
          <volt-select-item value="banana">Banana</volt-select-item>
          <volt-select-item value="carrot">Carrot</volt-select-item>
        </volt-select-content>
      </volt-select>
      <p class="text-muted-foreground mt-2 text-sm">Value: {{ fruit.value }}</p>`,
  }),
};

export const NativeSelect: Story = {
  name: 'Native <select>',
  parameters: {
    docs: {
      description: {
        story:
          '`voltNativeSelect` styles a real `<select>`, which keeps the platform picker (useful on mobile).',
      },
    },
  },
  render: () => ({
    template: `
      <select voltNativeSelect class="w-60" aria-label="Fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="blueberry">Blueberry</option>
      </select>`,
  }),
};
