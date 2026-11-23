import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatsBand } from '../../../blocks/stats-band/stats-band';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { STATS_BAND_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-stats-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, StatsBand],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-stats-band />
    </app-block-showcase>
  `,
})
export default class DocsBlockStatsBand {
  protected readonly block = blockBySlug('stats-band');
  protected readonly code = STATS_BAND_BLOCK;
}
