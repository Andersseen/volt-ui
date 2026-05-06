import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';

@Component({
  selector: 'app-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell
      title="Getting Started"
      browseLabel="Browse Documentation"
      [groups]="groups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class DocsLayout {
  readonly groups: DocsSidebarGroup[] = [
    {
      links: [
        { path: '/docs/introduction', label: 'Introduction' },
        { path: '/docs/themes', label: 'Themes' },
        { path: '/docs/mcp', label: 'AI Integration' },
      ],
    },
  ];
}
