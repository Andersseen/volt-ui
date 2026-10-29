import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroGlyphs } from '../../../blocks/hero-glyphs/hero-glyphs';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { HERO_GLYPHS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero-glyphs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroGlyphs],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-glyphs />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeroGlyphs {
  protected readonly block = blockBySlug('hero-glyphs');
  protected readonly code = HERO_GLYPHS_BLOCK;
}
