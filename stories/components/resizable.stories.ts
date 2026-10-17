import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltResizable, VoltResizableHandle, VoltResizablePanel } from 'volt';

const meta: Meta<VoltResizable> = {
  title: 'Components/Layout/Resizable',
  component: VoltResizable,
  decorators: [
    moduleMetadata({ imports: [VoltResizable, VoltResizablePanel, VoltResizableHandle] }),
  ],
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'] } },
  args: { orientation: 'horizontal' },
  render: args => ({
    props: args,
    template: `
      <volt-resizable [orientation]="orientation" class="border-border h-64 max-w-2xl rounded-lg border">
        <volt-resizable-panel class="p-4"><p class="text-sm">First panel</p></volt-resizable-panel>
        <volt-resizable-handle [orientation]="orientation" />
        <volt-resizable-panel class="p-4"><p class="text-sm">Second panel</p></volt-resizable-panel>
      </volt-resizable>
      <p class="text-muted-foreground mt-2 text-sm">Drag the handle, or focus it and use the arrow keys.</p>`,
  }),
};
export default meta;
type Story = StoryObj<VoltResizable>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};
