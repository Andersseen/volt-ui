import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapStory } from '../../../blocks/swap-story/swap-story';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { SWAP_STORY_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-swap-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, SwapStory],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-swap-story />
    </app-block-showcase>
  `,
})
export default class DocsBlockSwapStory {
  protected readonly block = blockBySlug('swap-story');
  protected readonly code = SWAP_STORY_BLOCK;
}
