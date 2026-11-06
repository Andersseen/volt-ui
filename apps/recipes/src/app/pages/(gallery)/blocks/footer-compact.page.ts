import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterCompact } from '../../../blocks/footer-compact/footer-compact';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FOOTER_COMPACT_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-footer-compact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FooterCompact],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-footer-compact />
    </app-block-showcase>
  `,
})
export default class DocsBlockFooterCompact {
  protected readonly block = blockBySlug('footer-compact');
  protected readonly code = FOOTER_COMPACT_BLOCK;
}
