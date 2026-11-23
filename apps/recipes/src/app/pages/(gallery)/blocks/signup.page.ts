import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthSignup } from '../../../blocks/auth-signup/auth-signup';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { AUTH_SIGNUP_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, AuthSignup],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-auth-signup />
    </app-block-showcase>
  `,
})
export default class DocsBlockSignup {
  protected readonly block = blockBySlug('signup');
  protected readonly code = AUTH_SIGNUP_BLOCK;
}
