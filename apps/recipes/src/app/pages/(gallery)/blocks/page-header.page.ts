import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../../blocks/page-header/page-header';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { PAGE_HEADER_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, PageHeader],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-page-header />
    </app-block-showcase>
  `,
})
export default class DocsBlockPageHeader {
  protected readonly block = blockBySlug('page-header');
  protected readonly code = PAGE_HEADER_BLOCK;
}
