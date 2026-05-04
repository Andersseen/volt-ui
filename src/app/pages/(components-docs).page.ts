import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsSidebarNav, type DocsSidebarGroup } from '../components/docs-sidebar-nav';

@Component({
  selector: 'app-components-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsSidebarNav],
  template: `
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-12 items-start"
    >
      <app-docs-sidebar-nav title="Components" browseLabel="Browse Components" [groups]="groups" />
      <main class="flex-1 min-w-0 w-full">
        <router-outlet />
      </main>
    </div>
  `,
})
export default class ComponentsLayout {
  readonly groups: DocsSidebarGroup[] = [
    {
      links: [{ path: '/docs/components', label: 'All Components', exact: true }],
    },
    {
      heading: 'Forms',
      links: [
        { path: '/docs/components/button', label: 'Button' },
        { path: '/docs/components/input', label: 'Input' },
        { path: '/docs/components/textarea', label: 'Textarea' },
        { path: '/docs/components/form-field', label: 'Form Field' },
        { path: '/docs/components/checkbox', label: 'Checkbox' },
        { path: '/docs/components/switch', label: 'Switch' },
        { path: '/docs/components/radio', label: 'Radio' },
        { path: '/docs/components/select', label: 'Select' },
        { path: '/docs/components/combobox', label: 'Combobox' },
        { path: '/docs/components/input-otp', label: 'Input OTP' },
        { path: '/docs/components/file-upload', label: 'File Upload' },
        { path: '/docs/components/slider', label: 'Slider' },
      ],
    },
    {
      heading: 'Controls',
      links: [
        { path: '/docs/components/toggle', label: 'Toggle' },
        { path: '/docs/components/toggle-group', label: 'Toggle Group' },
        { path: '/docs/components/toolbar', label: 'Toolbar' },
        { path: '/docs/components/pagination', label: 'Pagination' },
        { path: '/docs/components/date-picker', label: 'Date Picker' },
        { path: '/docs/components/listbox', label: 'Listbox' },
      ],
    },
    {
      heading: 'Navigation',
      links: [
        { path: '/docs/components/navigation-menu', label: 'Nav Menu' },
        { path: '/docs/components/tabs', label: 'Tabs' },
        { path: '/docs/components/breadcrumbs', label: 'Breadcrumbs' },
        { path: '/docs/components/nav-sidebar', label: 'Nav Sidebar' },
      ],
    },
    {
      heading: 'Overlays',
      links: [
        { path: '/docs/components/dialog', label: 'Dialog' },
        { path: '/docs/components/popover', label: 'Popover' },
        { path: '/docs/components/dropdown-menu', label: 'Dropdown Menu' },
        { path: '/docs/components/tooltip', label: 'Tooltip' },
        { path: '/docs/components/toast', label: 'Toast' },
      ],
    },
    {
      heading: 'Display',
      links: [
        { path: '/docs/components/accordion', label: 'Accordion' },
        { path: '/docs/components/avatar', label: 'Avatar' },
        { path: '/docs/components/badge', label: 'Badge' },
        { path: '/docs/components/card', label: 'Card' },
        { path: '/docs/components/meter', label: 'Meter' },
        { path: '/docs/components/progress', label: 'Progress' },
        { path: '/docs/components/separator', label: 'Separator' },
      ],
    },
  ];
}
