import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TopNavLayout } from '../../../../layouts/top-nav/top-nav';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { TOP_NAV_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, TopNavLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-top-nav-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutTopNav {
  protected readonly layout = layoutBySlug('top-nav');
  protected readonly code = TOP_NAV_LAYOUT;
}
