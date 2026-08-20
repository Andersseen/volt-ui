import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSpotlight } from '../../../../blocks/hero-spotlight/hero-spotlight';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { HERO_SPOTLIGHT_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroSpotlight],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-spotlight />
    </app-block-showcase>
  `,
})
export default class DocsBlockHero {
  protected readonly block = blockBySlug('hero');
  protected readonly code = HERO_SPOTLIGHT_BLOCK;
}
