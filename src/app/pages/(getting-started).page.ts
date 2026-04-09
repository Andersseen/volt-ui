import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsSidebarNav, type DocsSidebarGroup } from '../components/docs-sidebar-nav';

@Component({
  selector: 'app-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsSidebarNav],
  template: `
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-12 items-start"
    >
      <app-docs-sidebar-nav
        title="Getting Started"
        browseLabel="Browse Documentation"
        [groups]="groups"
      />
      <main class="flex-1 min-w-0 w-full">
        <router-outlet />
      </main>
    </div>
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
