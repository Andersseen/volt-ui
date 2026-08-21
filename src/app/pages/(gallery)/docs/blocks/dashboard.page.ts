import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppDashboard } from '../../../../blocks/app-dashboard/app-dashboard';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { APP_DASHBOARD_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, AppDashboard],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-app-dashboard />
    </app-block-showcase>
  `,
})
export default class DocsBlockDashboard {
  protected readonly block = blockBySlug('dashboard');
  protected readonly code = APP_DASHBOARD_BLOCK;
}
