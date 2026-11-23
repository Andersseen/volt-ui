import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PricingCompare } from '../../../blocks/pricing-compare/pricing-compare';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { PRICING_COMPARE_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-pricing-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, PricingCompare],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-pricing-compare />
    </app-block-showcase>
  `,
})
export default class DocsBlockPricingCompare {
  protected readonly block = blockBySlug('pricing-compare');
  protected readonly code = PRICING_COMPARE_BLOCK;
}
