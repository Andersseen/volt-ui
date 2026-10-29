import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureCarousel } from '../../../blocks/feature-carousel/feature-carousel';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FEATURE_CAROUSEL_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-feature-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FeatureCarousel],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-feature-carousel />
    </app-block-showcase>
  `,
})
export default class DocsBlockFeatureCarousel {
  protected readonly block = blockBySlug('feature-carousel');
  protected readonly code = FEATURE_CAROUSEL_BLOCK;
}
