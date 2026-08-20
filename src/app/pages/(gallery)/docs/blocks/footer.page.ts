import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterSitemap } from '../../../../blocks/footer-sitemap/footer-sitemap';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { FOOTER_SITEMAP_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, FooterSitemap],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-footer-sitemap />
    </app-block-showcase>
  `,
})
export default class DocsBlockFooter {
  protected readonly block = blockBySlug('footer');
  protected readonly code = FOOTER_SITEMAP_BLOCK;
}
