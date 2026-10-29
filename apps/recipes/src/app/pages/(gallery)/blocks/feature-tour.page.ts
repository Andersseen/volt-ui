import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureTour } from '../../../blocks/feature-tour/feature-tour';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FEATURE_TOUR_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-feature-tour',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FeatureTour],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-feature-tour />
    </app-block-showcase>
  `,
})
export default class DocsBlockFeatureTour {
  protected readonly block = blockBySlug('feature-tour');
  protected readonly code = FEATURE_TOUR_BLOCK;
}
