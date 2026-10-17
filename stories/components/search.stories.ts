import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltInput, VoltSearch, VoltSearchClear } from 'volt';

const meta: Meta<VoltSearch> = {
  title: 'Components/Forms & Inputs/Search',
  component: VoltSearch,
  decorators: [moduleMetadata({ imports: [VoltSearch, VoltSearchClear, VoltInput] })],
  render: () => ({
    template: `
      <volt-search class="flex max-w-sm items-center gap-2">
        <volt-input type="search" placeholder="Search…" aria-label="Search" />
        <volt-search-clear aria-label="Clear search">Clear</volt-search-clear>
      </volt-search>`,
  }),
};
export default meta;
type Story = StoryObj<VoltSearch>;

export const Default: Story = {};
