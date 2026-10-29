import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '@shared/components/reveal';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { MOTION } from '@shared/lib/motion';
import { CATALOG, entriesOf } from '../../lib/catalog';

interface Stat {
  readonly value: number;
  readonly labelKey: PlainTranslationKey;
}

/** Every figure is counted off the catalog, so the strip cannot promise what the site lacks. */
const STATS: readonly Stat[] = [
  { value: entriesOf('blocks').length, labelKey: 'gallery.blocks.title' },
  { value: entriesOf('layouts').length, labelKey: 'gallery.layouts.title' },
  { value: entriesOf('recipes').length, labelKey: 'recipes.title' },
  {
    value: new Set(CATALOG.flatMap(entry => entry.atoms.map(atom => atom.name))).size,
    labelKey: 'recipes.home.statComponents',
  },
];

/** The size of the catalog, in four numbers. */
@Component({
  selector: 'app-home-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  template: `
    <section class="border-b border-border/60">
      <dl class="mx-auto grid max-w-7xl grid-cols-2 divide-border/60 sm:grid-cols-4 sm:divide-x">
        @for (stat of stats; track stat.labelKey; let i = $index) {
          <div [appReveal]="i * stagger" class="flex flex-col-reverse px-4 py-9 sm:px-6">
            <dt class="mt-2 text-sm text-muted-foreground">{{ t(stat.labelKey) }}</dt>
            <dd class="landing-display text-4xl font-bold tabular-nums sm:text-5xl">
              {{ stat.value }}
            </dd>
          </div>
        }
      </dl>
    </section>
  `,
})
export class HomeStats {
  protected readonly t = injectAppI18n().t;
  protected readonly stats = STATS;
  protected readonly stagger = MOTION.stagger;
}
