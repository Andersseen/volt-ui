import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryTabs } from '../../../blocks/gallery-tabs/gallery-tabs';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { GALLERY_TABS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-gallery-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, GalleryTabs],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-gallery-tabs />
    </app-block-showcase>
  `,
})
export default class DocsBlockGalleryTabs {
  protected readonly block = blockBySlug('gallery-tabs');
  protected readonly code = GALLERY_TABS_BLOCK;
}
