import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthLogin } from '../../../../blocks/auth-login/auth-login';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { AUTH_LOGIN_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, AuthLogin],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-auth-login />
    </app-block-showcase>
  `,
})
export default class DocsBlockLogin {
  protected readonly block = blockBySlug('login');
  protected readonly code = AUTH_LOGIN_BLOCK;
}
