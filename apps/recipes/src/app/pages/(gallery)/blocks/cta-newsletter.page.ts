import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CtaNewsletter } from '../../../blocks/cta-newsletter/cta-newsletter';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { CTA_NEWSLETTER_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-cta-newsletter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, CtaNewsletter],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-cta-newsletter />
    </app-block-showcase>
  `,
})
export default class DocsBlockCtaNewsletter {
  protected readonly block = blockBySlug('cta-newsletter');
  protected readonly code = CTA_NEWSLETTER_BLOCK;
}
