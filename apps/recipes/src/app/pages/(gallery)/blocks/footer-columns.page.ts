import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterColumns } from '../../../blocks/footer-columns/footer-columns';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FOOTER_COLUMNS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-footer-columns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FooterColumns],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-footer-columns />
    </app-block-showcase>
  `,
})
export default class DocsBlockFooterColumns {
  protected readonly block = blockBySlug('footer-columns');
  protected readonly code = FOOTER_COLUMNS_BLOCK;
}
