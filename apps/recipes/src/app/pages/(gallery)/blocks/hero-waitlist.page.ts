import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroWaitlist } from '../../../blocks/hero-waitlist/hero-waitlist';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { HERO_WAITLIST_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-hero-waitlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, HeroWaitlist],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-hero-waitlist />
    </app-block-showcase>
  `,
})
export default class DocsBlockHeroWaitlist {
  protected readonly block = blockBySlug('hero-waitlist');
  protected readonly code = HERO_WAITLIST_BLOCK;
}
