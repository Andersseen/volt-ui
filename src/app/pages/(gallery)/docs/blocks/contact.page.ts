import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactSplit } from '../../../../blocks/contact-split/contact-split';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { CONTACT_SPLIT_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ContactSplit],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-contact-split />
    </app-block-showcase>
  `,
})
export default class DocsBlockContact {
  protected readonly block = blockBySlug('contact');
  protected readonly code = CONTACT_SPLIT_BLOCK;
}
