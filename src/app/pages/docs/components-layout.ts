import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsSidebarNav, type DocsSidebarGroup } from '../../components/docs-sidebar-nav';

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
      links: [{ path: '.', label: 'All Components', exact: true }],
    },
    {
      links: [
        { path: 'accordion', label: 'Accordion' },
        { path: 'avatar', label: 'Avatar' },
        { path: 'badge', label: 'Badge' },
        { path: 'button', label: 'Button' },
        { path: 'card', label: 'Card' },
        { path: 'checkbox', label: 'Checkbox' },
        { path: 'dialog', label: 'Dialog' },
        { path: 'input', label: 'Input' },
        { path: 'navigation-menu', label: 'Nav Menu' },
        { path: 'radio', label: 'Radio' },
        { path: 'select', label: 'Select' },
        { path: 'separator', label: 'Separator' },
        { path: 'switch', label: 'Switch' },
        { path: 'tabs', label: 'Tabs' },
        { path: 'toggle', label: 'Toggle' },
        { path: 'tooltip', label: 'Tooltip' },
      ],
    },
  ];
}
