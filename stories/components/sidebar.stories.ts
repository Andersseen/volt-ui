import { provideRouter } from '@angular/router';
import {
  applicationConfig,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import {
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarFooter,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSidebarService,
} from 'volt';

const ICON =
  '<svg slot="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><circle cx="12" cy="12" r="9" /></svg>';

const meta: Meta<VoltSidebar> = {
  title: 'Components/Layout/Sidebar',
  component: VoltSidebar,
  decorators: [
    applicationConfig({
      // A catch-all route: the iframe's own URL (iframe.html) must not be a navigation error.
      providers: [provideRouter([{ path: '**', children: [] }])],
    }),
    moduleMetadata({
      imports: [
        VoltSidebar,
        VoltSidebarHeader,
        VoltSidebarContent,
        VoltSidebarGroup,
        VoltSidebarItem,
        VoltSidebarFooter,
      ],
      providers: [VoltSidebarService],
    }),
  ],
  argTypes: { width: { control: 'text' }, collapsedWidth: { control: 'text' } },
  args: { width: '16rem', collapsedWidth: '4rem' },
  parameters: { layout: 'fullscreen' },
  render: args => ({
    props: args,
    template: `
      <div class="relative h-[28rem] overflow-hidden" style="transform: translateZ(0)">
        <volt-sidebar [width]="width" [collapsedWidth]="collapsedWidth">
          <volt-sidebar-header>My app</volt-sidebar-header>
          <volt-sidebar-content>
            <volt-sidebar-group label="Main">
              <volt-sidebar-item routerLink="/" label="Home" [exact]="true">${ICON}</volt-sidebar-item>
              <volt-sidebar-item routerLink="/inbox" label="Inbox">${ICON}<span slot="trailing" class="ml-auto text-xs">3</span></volt-sidebar-item>
              <volt-sidebar-item routerLink="/settings" label="Settings">${ICON}</volt-sidebar-item>
            </volt-sidebar-group>
          </volt-sidebar-content>
          <volt-sidebar-footer><span class="text-muted-foreground text-xs">v1.0</span></volt-sidebar-footer>
        </volt-sidebar>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<VoltSidebar>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`width` and `collapsedWidth` take any CSS length per instance; items are native links.',
      },
    },
  },
};

export const Wide: Story = {
  args: { width: '20rem' },
};
