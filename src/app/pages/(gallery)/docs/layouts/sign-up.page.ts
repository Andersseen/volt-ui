import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignUpLayout } from '../../../../layouts/sign-up/sign-up';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { SIGN_UP_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-sign-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, SignUpLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-sign-up-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutSignUp {
  protected readonly layout = layoutBySlug('sign-up');
  protected readonly code = SIGN_UP_LAYOUT;
}
