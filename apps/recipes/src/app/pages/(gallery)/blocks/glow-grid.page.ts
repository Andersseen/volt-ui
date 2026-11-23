import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureGlowGrid } from '../../../blocks/feature-glow-grid/feature-glow-grid';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FEATURE_GLOW_GRID_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-glow-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FeatureGlowGrid],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-feature-glow-grid />
    </app-block-showcase>
  `,
})
export default class DocsBlockGlowGrid {
  protected readonly block = blockBySlug('glow-grid');
  protected readonly code = FEATURE_GLOW_GRID_BLOCK;
}
