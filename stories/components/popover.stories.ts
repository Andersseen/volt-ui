import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltPopoverContent,
  VoltPopoverTrigger,
} from 'volt';

const meta: Meta<VoltPopoverTrigger> = {
  title: 'Components/Overlays/Popover',
  component: VoltPopoverTrigger,
  decorators: [
    moduleMetadata({
      imports: [VoltPopoverTrigger, VoltPopoverContent, VoltNativeButton, VoltInput, VoltLabel],
    }),
  ],
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
    offset: { control: 'number' },
    disabled: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    closeOnOutsideClick: { control: 'boolean' },
    openChange: { action: 'openChange' },
  },
  args: {
    placement: 'bottom',
    offset: 8,
    disabled: false,
    closeOnEscape: true,
    closeOnOutsideClick: true,
  },
  render: args => ({
    props: args,
    template: `
      <div class="flex justify-center py-16">
        <button voltButton variant="outline" type="button" [voltPopover]="popoverTpl" [placement]="placement" [offset]="offset" [disabled]="disabled" [closeOnEscape]="closeOnEscape" [closeOnOutsideClick]="closeOnOutsideClick" (openChange)="openChange($event)">Open popover</button>
      </div>
      <ng-template #popoverTpl>
        <volt-popover-content>
          <div class="flex w-64 flex-col gap-2">
            <p class="text-sm font-medium">Dimensions</p>
            <volt-label htmlFor="pop-width">Width</volt-label>
            <volt-input id="pop-width" size="sm" value="100%" />
          </div>
        </volt-popover-content>
      </ng-template>`,
  }),
};
export default meta;
type Story = StoryObj<VoltPopoverTrigger>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A non-modal panel anchored to its trigger. Escape and an outside click close it unless you turn those off.',
      },
    },
  },
};

export const Placements: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap justify-center gap-3 py-16">
        <button voltButton variant="outline" type="button" [voltPopover]="tpl" placement="top">Top</button>
        <button voltButton variant="outline" type="button" [voltPopover]="tpl" placement="right">Right</button>
        <button voltButton variant="outline" type="button" [voltPopover]="tpl" placement="bottom">Bottom</button>
        <button voltButton variant="outline" type="button" [voltPopover]="tpl" placement="left">Left</button>
      </div>
      <ng-template #tpl><volt-popover-content><p class="text-sm">Anchored content</p></volt-popover-content></ng-template>`,
  }),
};
