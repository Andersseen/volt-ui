import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarApp } from '../../../blocks/navbar-app/navbar-app';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { NAVBAR_APP_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-navbar-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, NavbarApp],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-navbar-app />
    </app-block-showcase>
  `,
})
export default class DocsBlockNavbarApp {
  protected readonly block = blockBySlug('navbar-app');
  protected readonly code = NAVBAR_APP_BLOCK;
}
