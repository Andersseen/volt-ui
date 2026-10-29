import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigPlayground } from '../../../blocks/config-playground/config-playground';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { CONFIG_PLAYGROUND_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ConfigPlayground],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-config-playground />
    </app-block-showcase>
  `,
})
export default class DocsBlockPlayground {
  protected readonly block = blockBySlug('playground');
  protected readonly code = CONFIG_PLAYGROUND_BLOCK;
}
