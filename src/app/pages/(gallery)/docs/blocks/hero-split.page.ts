import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSplit } from '../../../../blocks/hero-split/hero-split';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { HERO_SPLIT_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroSplit],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-split />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeroSplit {
  protected readonly block = blockBySlug('hero-split');
  protected readonly code = HERO_SPLIT_BLOCK;
}
