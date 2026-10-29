import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BgGlyphField } from '../../../blocks/bg-glyph-field/bg-glyph-field';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { BG_GLYPH_FIELD_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-glyph-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, BgGlyphField],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-bg-glyph-field />
    </app-block-showcase>
  `,
})
export default class DocsBlockGlyphField {
  protected readonly block = blockBySlug('glyph-field');
  protected readonly code = BG_GLYPH_FIELD_BLOCK;
}
