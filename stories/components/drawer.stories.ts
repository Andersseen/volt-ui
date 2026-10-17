import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltDrawer,
  VoltDrawerClose,
  VoltDrawerContent,
  VoltDrawerDescription,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltNativeButton,
} from 'volt';

const meta: Meta<VoltDrawerContent> = {
  title: 'Components/Overlays/Drawer',
  component: VoltDrawerContent,
  decorators: [
    moduleMetadata({
      imports: [
        VoltDrawer,
        VoltDrawerContent,
        VoltDrawerTitle,
        VoltDrawerDescription,
        VoltDrawerOverlay,
        VoltDrawerClose,
        VoltNativeButton,
      ],
    }),
  ],
  argTypes: { side: { control: 'radio', options: ['left', 'right', 'top', 'bottom'] } },
  args: { side: 'right' },
  render: args => ({
    props: args,
    template: `
      <button voltButton type="button" [voltDrawer]="drawerTpl">Open drawer</button>
      <ng-template #drawerTpl>
        <div voltDrawerOverlay></div>
        <div voltDrawerContent [side]="side">
          <div class="border-border flex items-center justify-between border-b p-4">
            <h2 voltDrawerTitle>Filters</h2>
            <volt-drawer-close label="Close filters">✕</volt-drawer-close>
          </div>
          <p class="p-4" voltDrawerDescription>Narrow the results by status, owner or date.</p>
        </div>
      </ng-template>`,
  }),
};
export default meta;
type Story = StoryObj<VoltDrawerContent>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Same modal behaviour as the Dialog: focus is trapped and returned, Escape and an overlay click dismiss it.',
      },
    },
  },
};

export const Left: Story = {
  args: { side: 'left' },
};

export const Bottom: Story = {
  args: { side: 'bottom' },
};
