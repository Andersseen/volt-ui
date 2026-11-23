import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroRail } from '../../../blocks/hero-rail/hero-rail';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { HERO_RAIL_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero-rail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroRail],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-rail />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeroRail {
  protected readonly block = blockBySlug('hero-rail');
  protected readonly code = HERO_RAIL_BLOCK;
}
