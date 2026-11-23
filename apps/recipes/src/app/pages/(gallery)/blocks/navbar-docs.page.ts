import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarDocs } from '../../../blocks/navbar-docs/navbar-docs';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { NAVBAR_DOCS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-navbar-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, NavbarDocs],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-navbar-docs />
    </app-block-showcase>
  `,
})
export default class DocsBlockNavbarDocs {
  protected readonly block = blockBySlug('navbar-docs');
  protected readonly code = NAVBAR_DOCS_BLOCK;
}
