import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactFaq } from '../../../blocks/contact-faq/contact-faq';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { CONTACT_FAQ_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-contact-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ContactFaq],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-contact-faq />
    </app-block-showcase>
  `,
})
export default class DocsBlockContactFaq {
  protected readonly block = blockBySlug('contact-faq');
  protected readonly code = CONTACT_FAQ_BLOCK;
}
