import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterCurtain } from '../../../blocks/footer-curtain/footer-curtain';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { FOOTER_CURTAIN_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-footer-curtain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FooterCurtain],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-footer-curtain />
    </app-block-showcase>
  `,
})
export default class DocsBlockFooterCurtain {
  protected readonly block = blockBySlug('footer-curtain');
  protected readonly code = FOOTER_CURTAIN_BLOCK;
}
