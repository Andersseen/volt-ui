import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expect, userEvent, within } from 'storybook/test';
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

const MANUAL = `
  <volt-combobox class="w-64" label="Framework" filterMode="manual" [items]="items" [loading]="loading" loadingText="Searching…" emptyText="No framework matches" (queryChange)="noop($event)">
    <ng-template let-item>{{ item }}</ng-template>
  </volt-combobox>`;

/** Opens the list and types, so the state a reviewer needs is on screen without interaction. */
async function typeIntoCombobox(canvasElement: HTMLElement, text: string): Promise<void> {
  const input = within(canvasElement).getByRole('combobox');
  await userEvent.click(input);
  await userEvent.type(input, text);
}

export const ManualLoading: Story = {
  name: 'Manual filtering — loading',
  parameters: {
    docs: {
      description: {
        story:
          'While a request is in flight the list shows `loadingText`; the options already on screen are the previous answer.',
      },
    },
  },
  render: () => ({
    props: { items: [], loading: true, noop: () => undefined },
    template: MANUAL,
  }),
  play: async ({ canvasElement }) => {
    await typeIntoCombobox(canvasElement, 'sv');
    await expect(await within(document.body).findByText('Searching…')).toBeVisible();
  },
};

export const ManualResults: Story = {
  name: 'Manual filtering — results',
  parameters: {
    docs: {
      description: {
        story:
          'Volt renders `items` exactly as supplied: these results do not contain the typed text, and none are dropped.',
      },
    },
  },
  render: () => ({
    props: { items: ['Angular', 'Svelte', 'Solid'], loading: false, noop: () => undefined },
    template: MANUAL,
  }),
  play: async ({ canvasElement }) => {
    await typeIntoCombobox(canvasElement, 'zz');
    await expect(await within(document.body).findAllByRole('option')).toHaveLength(3);
  },
};

export const ManualEmpty: Story = {
  name: 'Manual filtering — no results',
  parameters: {
    docs: {
      description: { story: 'An empty answer to a non-empty query shows `emptyText`.' },
    },
  },
  render: () => ({
    props: { items: [], loading: false, noop: () => undefined },
    template: MANUAL,
  }),
  play: async ({ canvasElement }) => {
    await typeIntoCombobox(canvasElement, 'qq');
    await expect(await within(document.body).findByText('No framework matches')).toBeVisible();
  },
};
