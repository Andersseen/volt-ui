import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroProduct } from '../../../blocks/hero-product/hero-product';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { HERO_PRODUCT_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroProduct],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-product />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeroProduct {
  protected readonly block = blockBySlug('hero-product');
  protected readonly code = HERO_PRODUCT_BLOCK;
}
