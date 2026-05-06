import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocsSidebarNav, type DocsSidebarGroup } from './docs-sidebar-nav';

@Component({
  selector: 'app-docs-page-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsSidebarNav],
  template: `
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-12 items-start"
    >
      <app-docs-sidebar-nav
        [title]="title()"
        [browseLabel]="browseLabel()"
        [description]="description()"
        [groups]="groups()"
      />
      <main class="flex-1 min-w-0 w-full">
        <ng-content />
      </main>
    </div>
  `,
})
export class DocsPageShell {
  readonly title = input.required<string>();
  readonly browseLabel = input<string>('Browse');
  readonly description = input<string>('');
  readonly groups = input.required<DocsSidebarGroup[]>();
}
