import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarLayout } from '../../../layouts/sidebar/sidebar';
import { LayoutShowcase } from '../../../components/layout-showcase';
import { layoutBySlug } from '../../../lib/layouts-metadata';
import { SIDEBAR_LAYOUT } from '../../../lib/snippets/layouts';

/**
 * The sidebar is a library layout component (`volt-sidebar`); this page shows a consumer shell built
 * on its public API, like every other layout. The component's own implementation is on its docs
 * page and is what `volt add sidebar` copies.
 */
@Component({
  selector: 'app-layout-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, SidebarLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-sidebar-layout />
    </app-layout-showcase>
  `,
})
export default class LayoutSidebarPage {
  protected readonly layout = layoutBySlug('sidebar');
  protected readonly code = SIDEBAR_LAYOUT;
}
