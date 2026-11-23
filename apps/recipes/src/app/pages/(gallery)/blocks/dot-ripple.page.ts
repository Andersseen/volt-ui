import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BgDotRipple } from '../../../blocks/bg-dot-ripple/bg-dot-ripple';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { BG_DOT_RIPPLE_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-dot-ripple',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, BgDotRipple],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-bg-dot-ripple />
    </app-block-showcase>
  `,
})
export default class DocsBlockDotRipple {
  protected readonly block = blockBySlug('dot-ripple');
  protected readonly code = BG_DOT_RIPPLE_BLOCK;
}
