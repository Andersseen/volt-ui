import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltNativeButton,
} from 'volt';

const meta: Meta<VoltEmptyState> = {
  title: 'Components/Display/Empty State',
  component: VoltEmptyState,
  decorators: [
    moduleMetadata({
      imports: [VoltEmptyState, VoltEmptyStateTitle, VoltEmptyStateDescription, VoltNativeButton],
    }),
  ],
  render: () => ({
    template: `
      <volt-empty-state>
        <svg slot="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
        <volt-empty-state-title>No projects yet</volt-empty-state-title>
        <volt-empty-state-description>Create your first project to get started.</volt-empty-state-description>
        <div slot="actions"><button voltButton type="button">Create project</button></div>
      </volt-empty-state>`,
  }),
};
export default meta;
type Story = StoryObj<VoltEmptyState>;

export const Default: Story = {};

export const NoResults: Story = {
  name: 'No search results',
  parameters: {
    docs: { description: { story: 'Same component, different words, and a way out.' } },
  },
  render: () => ({
    template: `
      <volt-empty-state>
        <volt-empty-state-title>No matches for “invoices”</volt-empty-state-title>
        <div slot="actions"><button voltButton variant="outline" type="button">Clear search</button></div>
      </volt-empty-state>`,
  }),
};
