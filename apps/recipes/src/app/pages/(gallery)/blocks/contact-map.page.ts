import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactMap } from '../../../blocks/contact-map/contact-map';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { CONTACT_MAP_BLOCK, CONTACT_MAP_DATA } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-contact-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ContactMap],
  template: `
    <app-block-showcase [block]="block" [code]="code" [files]="files">
      <app-contact-map />
    </app-block-showcase>
  `,
})
export default class DocsBlockContactMap {
  protected readonly block = blockBySlug('contact-map');
  protected readonly code = CONTACT_MAP_BLOCK;
  protected readonly files = [{ name: 'contact-map.data.ts', code: CONTACT_MAP_DATA }];
}
