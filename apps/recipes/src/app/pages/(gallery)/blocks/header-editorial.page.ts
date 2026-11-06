import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderEditorial } from '../../../blocks/header-editorial/header-editorial';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { HEADER_EDITORIAL_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-header-editorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeaderEditorial],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-header-editorial />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeaderEditorial {
  protected readonly block = blockBySlug('header-editorial');
  protected readonly code = HEADER_EDITORIAL_BLOCK;
}
