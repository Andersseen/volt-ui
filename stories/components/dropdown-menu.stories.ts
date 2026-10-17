import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuLabel,
  VoltDropdownMenuSeparator,
  VoltDropdownMenuSubmenuTrigger,
  VoltDropdownMenuTrigger,
  VoltNativeButton,
} from 'volt';

const meta: Meta<VoltDropdownMenuTrigger> = {
  title: 'Components/Overlays/Dropdown Menu',
  component: VoltDropdownMenuTrigger,
  decorators: [
    moduleMetadata({
      imports: [
        VoltDropdownMenu,
        VoltDropdownMenuTrigger,
        VoltDropdownMenuItem,
        VoltDropdownMenuLabel,
        VoltDropdownMenuSeparator,
        VoltDropdownMenuSubmenuTrigger,
        VoltNativeButton,
      ],
    }),
  ],
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'bottom-start',
        'bottom',
        'bottom-end',
        'top-start',
        'top',
        'top-end',
        'right-start',
        'left-start',
      ],
    },
    disabled: { control: 'boolean' },
  },
  args: { placement: 'bottom-start', disabled: false },
  render: args => ({
    props: args,
    template: `
      <button voltButton variant="outline" type="button" [voltDropdownMenu]="menuTpl" [placement]="placement" [disabled]="disabled">Open menu</button>
      <ng-template #menuTpl>
        <volt-dropdown-menu>
          <volt-dropdown-menu-label>My account</volt-dropdown-menu-label>
          <volt-dropdown-menu-separator />
          <volt-dropdown-menu-item>Profile</volt-dropdown-menu-item>
          <volt-dropdown-menu-item>Settings</volt-dropdown-menu-item>
          <volt-dropdown-menu-item [disabled]="true">Billing (unavailable)</volt-dropdown-menu-item>
          <volt-dropdown-menu-separator />
          <volt-dropdown-menu-item>Log out</volt-dropdown-menu-item>
        </volt-dropdown-menu>
      </ng-template>`,
  }),
};
export default meta;
type Story = StoryObj<VoltDropdownMenuTrigger>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use Arrow keys, Home, End and Enter to move and choose; Escape closes it and returns focus to the trigger.',
      },
    },
  },
};

export const Submenu: Story = {
  render: () => ({
    template: `
      <button voltButton variant="outline" type="button" [voltDropdownMenu]="menuTpl">Open menu</button>
      <ng-template #menuTpl>
        <volt-dropdown-menu>
          <volt-dropdown-menu-item>New file</volt-dropdown-menu-item>
          <volt-dropdown-menu-submenu-trigger [submenu]="shareTpl">Share</volt-dropdown-menu-submenu-trigger>
        </volt-dropdown-menu>
      </ng-template>
      <ng-template #shareTpl>
        <volt-dropdown-menu>
          <volt-dropdown-menu-item>Email link</volt-dropdown-menu-item>
          <volt-dropdown-menu-item>Copy link</volt-dropdown-menu-item>
        </volt-dropdown-menu>
      </ng-template>`,
  }),
};
