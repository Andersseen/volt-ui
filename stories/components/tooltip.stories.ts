import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltNativeButton, VoltTooltip, VoltTooltipContent } from 'volt';

const meta: Meta<VoltTooltip> = {
  title: 'Components/Overlays/Tooltip',
  component: VoltTooltip,
  decorators: [moduleMetadata({ imports: [VoltTooltip, VoltTooltipContent, VoltNativeButton] })],
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
    delay: { control: 'number' },
    closeDelay: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: { placement: 'top', delay: 300, closeDelay: 100, disabled: false },
  render: args => ({
    props: args,
    template: `
      <div class="flex justify-center py-16">
        <button voltButton variant="outline" type="button" [voltTooltip]="tooltipTpl" [placement]="placement" [delay]="delay" [closeDelay]="closeDelay" [disabled]="disabled">Hover or focus me</button>
      </div>
      <ng-template #tooltipTpl><volt-tooltip-content>Save your changes</volt-tooltip-content></ng-template>`,
  }),
};
export default meta;
type Story = StoryObj<VoltTooltip>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shown on hover and on keyboard focus; hidden on blur or Escape. Keep the content short and non-essential.',
      },
    },
  },
};

export const IconButton: Story = {
  name: 'Naming an icon button',
  render: () => ({
    template: `
      <div class="flex justify-center py-16">
        <button voltButton variant="ghost" size="icon" type="button" aria-label="Add item" [voltTooltip]="tpl">+</button>
      </div>
      <ng-template #tpl><volt-tooltip-content>Add item</volt-tooltip-content></ng-template>`,
  }),
};

export const PlainText: Story = {
  name: 'Text shorthand',
  parameters: {
    docs: {
      description: {
        story: '`voltTooltip` also accepts a plain string when you do not need a template.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex justify-center py-16">
        <button voltButton variant="outline" type="button" voltTooltip="Copied to clipboard on click">Copy link</button>
      </div>`,
  }),
};
