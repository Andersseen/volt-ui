import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroInstall } from '../../../blocks/hero-install/hero-install';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { HERO_INSTALL_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero-install',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroInstall],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-install />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeroInstall {
  protected readonly block = blockBySlug('hero-install');
  protected readonly code = HERO_INSTALL_BLOCK;
}
