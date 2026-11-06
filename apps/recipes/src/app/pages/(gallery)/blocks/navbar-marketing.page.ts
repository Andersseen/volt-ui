import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarMarketing } from '../../../blocks/navbar-marketing/navbar-marketing';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { NAVBAR_MARKETING_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-navbar-marketing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, NavbarMarketing],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-navbar-marketing />
    </app-block-showcase>
  `,
})
export default class DocsBlockNavbarMarketing {
  protected readonly block = blockBySlug('navbar-marketing');
  protected readonly code = NAVBAR_MARKETING_BLOCK;
}
