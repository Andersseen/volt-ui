import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureShowcase } from '../../../blocks/feature-showcase/feature-showcase';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FEATURE_SHOWCASE_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-feature-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FeatureShowcase],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-feature-showcase />
    </app-block-showcase>
  `,
})
export default class DocsBlockFeatureShowcase {
  protected readonly block = blockBySlug('feature-showcase');
  protected readonly code = FEATURE_SHOWCASE_BLOCK;
}
