import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PricingTiers } from '../../../../blocks/pricing-tiers/pricing-tiers';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { PRICING_TIERS_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, PricingTiers],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-pricing-tiers />
    </app-block-showcase>
  `,
})
export default class DocsBlockPricing {
  protected readonly block = blockBySlug('pricing');
  protected readonly code = PRICING_TIERS_BLOCK;
}
