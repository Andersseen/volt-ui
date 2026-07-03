import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';
import { COMPONENT_GROUPS } from '../lib/component-metadata';

@Component({
  selector: 'app-components-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell title="Components" browseLabel="Browse Components" [groups]="groups">
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class ComponentsLayout {
  readonly groups: DocsSidebarGroup[] = [
    {
      links: [{ path: '/docs/components', label: 'All Components', exact: true }],
    },
    ...COMPONENT_GROUPS.map(group => ({
      heading: group.title,
      links: group.components.map(component => ({
        path: component.path,
        label: component.label === 'Navigation Menu' ? 'Nav Menu' : component.label,
        stability: component.stability,
      })),
    })),
  ];
}
