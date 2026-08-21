import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginLayout } from '../../../../layouts/login/login';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { LOGIN_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, LoginLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-login-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutLogin {
  protected readonly layout = layoutBySlug('login');
  protected readonly code = LOGIN_LAYOUT;
}
