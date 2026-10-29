import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollStory } from '../../../blocks/scroll-story/scroll-story';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { SCROLL_STORY_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-scroll-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ScrollStory],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-scroll-story />
    </app-block-showcase>
  `,
})
export default class DocsBlockScrollStory {
  protected readonly block = blockBySlug('scroll-story');
  protected readonly code = SCROLL_STORY_BLOCK;
}
