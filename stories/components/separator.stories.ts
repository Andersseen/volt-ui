import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltSeparator } from 'volt';

const meta: Meta<VoltSeparator> = {
  title: 'Components/Display/Separator',
  component: VoltSeparator,
  decorators: [moduleMetadata({ imports: [VoltSeparator] })],
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'] } },
  args: { orientation: 'horizontal' },
  render: args => ({
    props: args,
    template: `
      <div class="max-w-sm" [class.flex]="orientation === 'vertical'" [class.h-8]="orientation === 'vertical'" [class.items-center]="orientation === 'vertical'" [class.gap-3]="orientation === 'vertical'">
        <p class="text-sm">Section one</p>
        <volt-separator [orientation]="orientation" [class]="orientation === 'horizontal' ? 'my-3' : ''" />
        <p class="text-sm">Section two</p>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<VoltSeparator>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};
