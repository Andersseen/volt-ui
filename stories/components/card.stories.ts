import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
  VoltNativeButton,
} from 'volt';

const meta: Meta<VoltCard> = {
  title: 'Components/Display/Card',
  component: VoltCard,
  decorators: [
    moduleMetadata({
      imports: [
        VoltCard,
        VoltCardHeader,
        VoltCardTitle,
        VoltCardDescription,
        VoltCardContent,
        VoltCardFooter,
        VoltNativeButton,
      ],
    }),
  ],
  args: { class: 'max-w-sm' },
  render: args => ({
    props: args,
    template: `
      <volt-card [class]="class">
        <volt-card-header>
          <volt-card-title>Create project</volt-card-title>
          <volt-card-description>Deploy your new project in one click.</volt-card-description>
        </volt-card-header>
        <volt-card-content><p class="text-sm">Pick a name and a region to get started.</p></volt-card-content>
        <volt-card-footer class="justify-end gap-2">
          <button voltButton variant="outline" type="button">Cancel</button>
          <button voltButton type="button">Deploy</button>
        </volt-card-footer>
      </volt-card>`,
  }),
};
export default meta;
type Story = StoryObj<VoltCard>;

export const Default: Story = {};

export const Compact: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Every part merges `class` with `cn()`, so `p-3` replaces the default padding.',
      },
    },
  },
  render: () => ({
    template: `
      <volt-card class="max-w-sm">
        <volt-card-content class="p-3 text-center md:p-4">Compact content</volt-card-content>
        <volt-card-footer class="border-border justify-end gap-2 border-t p-3">
          <button voltButton variant="ghost" size="sm" type="button">Cancel</button>
          <button voltButton size="sm" type="button">Confirm</button>
        </volt-card-footer>
      </volt-card>`,
  }),
};
