import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BgLightThreads } from '../../../blocks/bg-light-threads/bg-light-threads';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { BG_LIGHT_THREADS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-light-threads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, BgLightThreads],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-bg-light-threads />
    </app-block-showcase>
  `,
})
export default class DocsBlockLightThreads {
  protected readonly block = blockBySlug('light-threads');
  protected readonly code = BG_LIGHT_THREADS_BLOCK;
}
