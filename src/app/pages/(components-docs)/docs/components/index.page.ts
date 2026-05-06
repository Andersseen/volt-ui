import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponents } from '../../../../icons';

interface ComponentLink {
  name: string;
  path: string;
  description: string;
}

interface ComponentGroup {
  title: string;
  links: ComponentLink[];
}

@Component({
  selector: 'app-components-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponents],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Components</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A collection of reusable, accessible components built with Angular and Tailwind CSS. Each
          component includes source code that you can copy and customize.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <div class="p-4 rounded-lg border border-border bg-muted/30">
        <p class="text-sm">
          <span class="font-medium">Quick install:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded mx-1"
            >npx &#64;voltui/cli add [component]</code
          >
          or browse below to copy source code.
          <a routerLink="/docs/introduction" class="text-primary hover:underline ml-1"
            >Learn more -></a
          >
        </p>
      </div>

      <div class="space-y-8">
        @for (group of groups; track group.title) {
          <section class="space-y-4">
            <h2 class="text-lg font-semibold">{{ group.title }}</h2>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of group.links; track item.path) {
                <a
                  [routerLink]="item.path"
                  class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                    >
                      <icon-components class="w-4 h-4" />
                    </div>
                    <div>
                      <h3 class="font-medium group-hover:text-primary">{{ item.name }}</h3>
                      <p class="text-xs text-muted-foreground">{{ item.description }}</p>
                    </div>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export default class ComponentsIndexPage {
  readonly groups: ComponentGroup[] = [
    {
      title: 'Forms',
      links: [
        { name: 'Button', path: '/docs/components/button', description: 'Interactive buttons' },
        { name: 'Input', path: '/docs/components/input', description: 'Text input fields' },
        {
          name: 'Search',
          path: '/docs/components/search',
          description: 'Search with clear action',
        },
        {
          name: 'Autofill',
          path: '/docs/components/autofill',
          description: 'Browser autofill detection',
        },
        { name: 'Textarea', path: '/docs/components/textarea', description: 'Multi-line input' },
        {
          name: 'Form Field',
          path: '/docs/components/form-field',
          description: 'Labels, hints, and errors',
        },
        { name: 'Checkbox', path: '/docs/components/checkbox', description: 'Boolean selection' },
        { name: 'Switch', path: '/docs/components/switch', description: 'On/off controls' },
        { name: 'Radio', path: '/docs/components/radio', description: 'Single-select options' },
        { name: 'Select', path: '/docs/components/select', description: 'Dropdown selection' },
        { name: 'Combobox', path: '/docs/components/combobox', description: 'Searchable select' },
        { name: 'Input OTP', path: '/docs/components/input-otp', description: 'PIN code input' },
        {
          name: 'File Upload',
          path: '/docs/components/file-upload',
          description: 'Upload controls',
        },
        { name: 'Slider', path: '/docs/components/slider', description: 'Range input' },
      ],
    },
    {
      title: 'Controls',
      links: [
        { name: 'Toggle', path: '/docs/components/toggle', description: 'Pressed state button' },
        {
          name: 'Toggle Group',
          path: '/docs/components/toggle-group',
          description: 'Grouped toggle controls',
        },
        { name: 'Toolbar', path: '/docs/components/toolbar', description: 'Grouped actions' },
        { name: 'Pagination', path: '/docs/components/pagination', description: 'Page navigation' },
        {
          name: 'Date Picker',
          path: '/docs/components/date-picker',
          description: 'Calendar input',
        },
        { name: 'Listbox', path: '/docs/components/listbox', description: 'Selection list' },
      ],
    },
    {
      title: 'Navigation',
      links: [
        {
          name: 'Navigation Menu',
          path: '/docs/components/navigation-menu',
          description: 'Navbar with dropdowns',
        },
        { name: 'Tabs', path: '/docs/components/tabs', description: 'Tabbed interface' },
        { name: 'Breadcrumbs', path: '/docs/components/breadcrumbs', description: 'Path trail' },
        { name: 'Nav Sidebar', path: '/docs/components/nav-sidebar', description: 'Sidebar nav' },
      ],
    },
    {
      title: 'Overlays',
      links: [
        { name: 'Dialog', path: '/docs/components/dialog', description: 'Modal dialogs' },
        { name: 'Popover', path: '/docs/components/popover', description: 'Floating panels' },
        {
          name: 'Dropdown Menu',
          path: '/docs/components/dropdown-menu',
          description: 'Action menus',
        },
        { name: 'Tooltip', path: '/docs/components/tooltip', description: 'Hover information' },
        { name: 'Toast', path: '/docs/components/toast', description: 'Notifications' },
      ],
    },
    {
      title: 'Display',
      links: [
        {
          name: 'Accordion',
          path: '/docs/components/accordion',
          description: 'Collapsible panels',
        },
        { name: 'Avatar', path: '/docs/components/avatar', description: 'User images' },
        { name: 'Badge', path: '/docs/components/badge', description: 'Status indicators' },
        { name: 'Card', path: '/docs/components/card', description: 'Content containers' },
        { name: 'Meter', path: '/docs/components/meter', description: 'Known-range values' },
        { name: 'Progress', path: '/docs/components/progress', description: 'Task completion' },
        { name: 'Separator', path: '/docs/components/separator', description: 'Visual dividers' },
      ],
    },
  ];
}
