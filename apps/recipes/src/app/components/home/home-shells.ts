import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';
import { LandingSectionHeader } from '@shared/components/section-header';
import { Reveal } from '@shared/components/reveal';
import { injectAppI18n } from '@shared/i18n/i18n';
import { MOTION } from '@shared/lib/motion';
import { entriesOf, listingPath } from '../../lib/catalog';
import { CatalogCard } from '../catalog-card';

/**
 * Layouts and recipes together: the frame of an application, and what happens inside it over time.
 * A sample of each, with the way to the full listing, rather than every entry as a wall of cards.
 */
@Component({
  selector: 'app-home-shells',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LmnArrowRightIcon,
    VoltNativeButton,
    LandingSectionHeader,
    Reveal,
    CatalogCard,
  ],
  template: `
    <section class="border-y border-border/60 bg-muted/20">
      <div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <app-landing-section-header
          [eyebrow]="t('recipes.home.shellsEyebrow')"
          [title]="t('recipes.home.shellsTitle')"
          [lede]="t('recipes.home.shellsLede')"
        />

        @for (group of groups; track group.path) {
          <div class="mt-12">
            <div class="flex flex-wrap items-baseline justify-between gap-3">
              <h3 class="text-xl font-semibold tracking-tight">{{ t(group.titleKey) }}</h3>
              <a voltButton variant="ghost" class="group" [routerLink]="path(group.path)">
                {{ t(group.browseKey) }}
                <lmn-arrow-right
                  [size]="16"
                  class="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </a>
            </div>
            <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (entry of group.entries; track entry.id; let i = $index) {
                <app-catalog-card [appReveal]="i * stagger" [entry]="entry" />
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class HomeShells {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
  protected readonly stagger = MOTION.stagger;

  protected readonly groups = [
    {
      path: listingPath('recipes'),
      titleKey: 'recipes.title',
      browseKey: 'recipes.browse',
      entries: entriesOf('recipes').slice(0, 3),
    },
    {
      path: listingPath('layouts'),
      titleKey: 'gallery.layouts.title',
      browseKey: 'gallery.layouts.browse',
      entries: entriesOf('layouts').slice(0, 3),
    },
  ] as const;
}
