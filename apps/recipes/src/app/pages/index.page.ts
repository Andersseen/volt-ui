import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltCard,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltNativeButton,
} from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { CatalogCard } from '../components/catalog-card';
import { entriesOf, FEATURED, listingPath, type CatalogKind } from '../lib/catalog';
import { docsUrl, SITE_NAME } from '../lib/site';

/**
 * Where a visitor lands: what the site is, the three ways in, and a handful of real entries.
 *
 * Every figure and card is read off the catalog, so the page cannot promise something the site
 * does not have. No new prose is written here — it reuses the gallery's published copy — until
 * the Recipes-specific Glossa keys exist (see `specs/plans/recipes-app.md`).
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    VoltNativeButton,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    CatalogCard,
  ],
  styles: `
    .stretched::after {
      content: '';
      position: absolute;
      inset: 0;
    }
  `,
  template: `
    <div class="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:py-16">
      <section class="max-w-3xl space-y-5">
        <h1 class="landing-display text-4xl font-bold sm:text-5xl">{{ siteName }}</h1>
        <p class="text-lg text-muted-foreground">{{ t('gallery.blocks.lede') }}</p>
        <div class="flex flex-wrap gap-3">
          <a voltButton [routerLink]="path('/blocks')">{{ t('gallery.blocks.browse') }}</a>
          <a voltButton variant="outline" [href]="docsHref()">{{ t('nav.docs') }}</a>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-3" [attr.aria-label]="t('gallery.sections')">
        @for (section of sections; track section.kind) {
          <volt-card
            class="group relative h-full transition-colors hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring"
          >
            <volt-card-header>
              <volt-card-title class="group-hover:text-primary">
                <a [routerLink]="path(section.path)" class="stretched focus-visible:outline-none">{{
                  section.title()
                }}</a>
              </volt-card-title>
              <volt-card-description>{{ section.blurb() }}</volt-card-description>
            </volt-card-header>
          </volt-card>
        }
      </section>

      <section class="space-y-5">
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (entry of featured; track entry.id) {
            <app-catalog-card [entry]="entry" />
          }
        </div>
      </section>
    </div>
  `,
})
export default class HomePage {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly siteName = SITE_NAME;
  protected readonly featured = FEATURED;
  protected readonly docsHref = computed(() =>
    docsUrl(this.translations.locale(), '/docs/introduction')
  );

  /** Recipes has no published title or description yet, so it shows its own entry names. */
  protected readonly sections: readonly {
    kind: CatalogKind;
    path: string;
    title: () => string;
    blurb: () => string;
  }[] = [
    {
      kind: 'blocks',
      path: listingPath('blocks'),
      title: () => this.t('gallery.blocks.title'),
      blurb: () => this.t('gallery.blocks.description'),
    },
    {
      kind: 'layouts',
      path: listingPath('layouts'),
      title: () => this.t('gallery.layouts.title'),
      blurb: () => this.t('gallery.layouts.description'),
    },
    {
      kind: 'recipes',
      path: listingPath('recipes'),
      title: () => 'Recipes',
      blurb: () =>
        entriesOf('recipes')
          .map(entry => entry.name)
          .join(' · '),
    },
  ];
}
