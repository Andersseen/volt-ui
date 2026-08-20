import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminDashboardLayout } from '../../../../layouts/admin-dashboard/admin-dashboard';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { ADMIN_DASHBOARD_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, AdminDashboardLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-admin-dashboard-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutAdminDashboard {
  protected readonly layout = layoutBySlug('admin-dashboard');
  protected readonly code = ADMIN_DASHBOARD_LAYOUT;
}
