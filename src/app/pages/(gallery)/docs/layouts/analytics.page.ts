import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AnalyticsLayout } from '../../../../layouts/analytics/analytics';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { ANALYTICS_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, AnalyticsLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-analytics-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutAnalytics {
  protected readonly layout = layoutBySlug('analytics');
  protected readonly code = ANALYTICS_LAYOUT;
}
