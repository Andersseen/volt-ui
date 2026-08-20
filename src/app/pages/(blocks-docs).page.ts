import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';
import { BLOCK_GROUPS } from '../lib/blocks-metadata';

/**
 * Shell for the blocks gallery. The sidebar is derived from `BLOCK_GROUPS` rather than
 * hand-listed, so adding a block to the catalog adds it to the navigation too.
 */
@Component({
  selector: 'app-blocks-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell
      [title]="'Blocks'"
      browseLabel="Browse Blocks"
      description="Animated page sections. Copy the source, keep the motion."
      [groups]="groups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class BlocksLayout {
  readonly groups: DocsSidebarGroup[] = [
    { links: [{ path: '/docs/blocks', label: 'Overview', exact: true }] },
    ...BLOCK_GROUPS.map(group => ({
      heading: group.heading,
      links: group.blocks.map(block => ({ path: block.path, label: block.label })),
    })),
  ];
}
