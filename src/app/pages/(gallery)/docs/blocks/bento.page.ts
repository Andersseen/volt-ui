import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureBento } from '../../../../blocks/feature-bento/feature-bento';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { FEATURE_BENTO_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-bento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FeatureBento],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-feature-bento />
    </app-block-showcase>
  `,
})
export default class DocsBlockBento {
  protected readonly block = blockBySlug('bento');
  protected readonly code = FEATURE_BENTO_BLOCK;
}
