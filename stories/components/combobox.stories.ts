import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltCombobox } from 'volt';

const FRAMEWORKS = ['Angular', 'React', 'Vue', 'Svelte', 'Solid', 'Qwik', 'Lit'];

const meta: Meta<VoltCombobox> = {
  title: 'Components/Forms & Inputs/Combobox',
  component: VoltCombobox,
  decorators: [moduleMetadata({ imports: [VoltCombobox, ReactiveFormsModule] })],
  argTypes: {
    placeholder: { control: 'text' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    filterMode: { control: 'radio', options: ['local', 'manual'] },
    valueChange: { action: 'valueChange' },
    queryChange: { action: 'queryChange' },
  },
  args: {
    placeholder: 'Pick a framework',
    multiple: false,
    disabled: false,
    loading: false,
    filterMode: 'local',
  },
  render: args => ({
    props: { ...args, frameworks: FRAMEWORKS },
    template: `
      <volt-combobox class="w-64" label="Framework" [items]="frameworks" [placeholder]="placeholder" [multiple]="multiple" [disabled]="disabled" [loading]="loading" [filterMode]="filterMode" (valueChange)="valueChange($event)" (queryChange)="queryChange($event)">
        <ng-template let-item>{{ item }}</ng-template>
      </volt-combobox>`,
  }),
};
export default meta;
type Story = StoryObj<VoltCombobox>;

export const Default: Story = {};

export const Multiple: Story = {
  args: { multiple: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ServerSide: Story = {
  name: 'Server-side search (manual filtering)',
  parameters: {
    docs: {
      description: {
        story:
          'With `filterMode="manual"` Volt renders `items` exactly as supplied and reports what the user typed through `(queryChange)`. Your code owns the request; Volt never fetches, debounces or cancels. This demo fakes a 400 ms backend.',
      },
    },
  },
  render: () => {
    const results = signal<string[]>([]);
    const loading = signal(false);
    const query = signal('');
    let latest = 0;
    return {
      props: {
        results,
        loading,
        query,
        owner: new FormControl<string | null>(null),
        search: (text: string) => {
          query.set(text);
          const mine = ++latest;
          loading.set(true);
          setTimeout(() => {
            if (mine !== latest) return;
            results.set(FRAMEWORKS.filter(f => f.toLowerCase().includes(text.toLowerCase())));
            loading.set(false);
          }, 400);
        },
      },
      template: `
        <volt-combobox class="w-64" label="Framework" filterMode="manual" [items]="results()" [loading]="loading()" loadingText="Searching…" [emptyText]="'No framework matches ' + query()" [formControl]="owner" (queryChange)="search($event)">
          <ng-template let-item>{{ item }}</ng-template>
        </volt-combobox>`,
    };
  },
};
