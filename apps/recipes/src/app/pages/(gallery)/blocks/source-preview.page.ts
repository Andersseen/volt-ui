import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SourcePreview } from '../../../blocks/source-preview/source-preview';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { SOURCE_PREVIEW_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-source-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, SourcePreview],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-source-preview />
    </app-block-showcase>
  `,
})
export default class DocsBlockSourcePreview {
  protected readonly block = blockBySlug('source-preview');
  protected readonly code = SOURCE_PREVIEW_BLOCK;
}
