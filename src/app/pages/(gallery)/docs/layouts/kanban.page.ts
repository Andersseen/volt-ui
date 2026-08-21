import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KanbanLayout } from '../../../../layouts/kanban/kanban';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { KANBAN_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-kanban',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, KanbanLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-kanban-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutKanban {
  protected readonly layout = layoutBySlug('kanban');
  protected readonly code = KANBAN_LAYOUT;
}
