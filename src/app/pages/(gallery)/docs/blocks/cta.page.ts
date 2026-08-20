import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CtaMagnetic } from '../../../../blocks/cta-magnetic/cta-magnetic';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { CTA_MAGNETIC_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, CtaMagnetic],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-cta-magnetic />
    </app-block-showcase>
  `,
})
export default class DocsBlockCta {
  protected readonly block = blockBySlug('cta');
  protected readonly code = CTA_MAGNETIC_BLOCK;
}
