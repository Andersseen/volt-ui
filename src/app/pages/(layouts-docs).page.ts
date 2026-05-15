import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';

@Component({
  selector: 'app-layouts-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell
      title="Layouts"
      browseLabel="Browse Layouts"
      description="Copy-paste blocks. No install needed."
      [groups]="groups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
// Layouts documentation shell
export default class LayoutsLayout {
  readonly groups: DocsSidebarGroup[] = [
    {
      heading: 'Dashboards',
      links: [
        { path: '/docs/layouts/admin-dashboard', label: 'Admin Dashboard' },
        { path: '/docs/layouts/top-nav', label: 'Top Navigation' },
        { path: '/docs/layouts/analytics', label: 'Analytics' },
        { path: '/docs/layouts/sidebar', label: 'Sidebar' },
      ],
    },
    {
      heading: 'Auth',
      links: [
        { path: '/docs/layouts/login', label: 'Login' },
        { path: '/docs/layouts/sign-up', label: 'Sign Up' },
      ],
    },
  ];
}
