import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  inject,
} from '@angular/core';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { filter } from 'rxjs';
import { injectAppI18n, LOCALES } from '@shared/i18n/i18n';
import { plainText } from '@shared/seo/paths';
import { SeoService } from '@shared/seo/seo.service';
import { entryForPath, listingPath, type CatalogEntry, type CatalogKind } from '../catalog';
import { breadcrumbJsonLd, homeJsonLd, type JsonLd } from './json-ld';
import { DOC_PAGES } from './docs-pages';
import { seoEntryFor, type SeoEntry } from './seo-catalog';
import { absoluteUrl, barePath, localeOfPath, localizedPath, SITE_NAME } from '../site';

/**
 * Keeps the search metadata in step with the router: after every navigation, the page's title,
 * description, social tags and structured data are rewritten for the page now on screen, in its
 * language, on the Recipes origin. Everything is derived from the URL and the catalog.
 *
 * `@etyma/analog` owns `<html lang>`, the canonical link and `hreflang` (see `app.config.ts`).
 */
export function provideSeo(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const router = inject(Router);
      const seo = inject(SeoService);
      const { t } = injectAppI18n();

      const keepOutOfIndex = (url: string) => {
        const path = url.split(/[?#]/)[0];
        const locale = localeOfPath(path);
        seo.apply({
          title: SITE_NAME,
          description: homeDescription(t),
          url: absoluteUrl(localizedPath(barePath(path), locale)),
          locale,
          locales: LOCALES,
          imageAlt: homeTitle(t),
          robots: 'noindex, follow',
        });
      };

      // A path no route claims: the router raises NG04002 and the shell renders with nothing in it.
      router.events
        .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
        .subscribe(event => {
          keepOutOfIndex(event.url);
        });

      router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(event => {
          const path = event.urlAfterRedirects.split(/[?#]/)[0];
          const locale = localeOfPath(path);
          const bare = barePath(path);
          const entry = seoEntryFor(bare);

          if (!entry) {
            keepOutOfIndex(event.urlAfterRedirects);
            return;
          }

          const { title, description } = describe(entry, t, locale);
          seo.apply({
            title,
            description,
            url: absoluteUrl(localizedPath(bare, locale)),
            locale,
            locales: LOCALES,
            imageAlt: homeTitle(t),
            jsonLd: structuredData(entry, locale, t),
          });
        });
    }),
  ]);
}

type T = ReturnType<typeof injectAppI18n>['t'];

/** The home page's own lede: what the site publishes and what every example comes with. */
function homeDescription(t: T): string {
  return t('recipes.home.lede');
}

/** `Volt UI Recipes — Whole screens, built from Volt UI`: the name alone says nothing to a searcher. */
function homeTitle(t: T): string {
  return `${SITE_NAME} — ${t('recipes.home.title').replace(/[.。]$/, '')}`;
}

function nameOf(entry: CatalogEntry, t: T): string {
  return t(entry.nameKey);
}

const titled = (name: string): string => `${name} — ${SITE_NAME}`;

function describe(entry: SeoEntry, t: T, locale: string): { title: string; description: string } {
  switch (entry.kind) {
    case 'doc': {
      const page = DOC_PAGES.find(candidate => candidate.slug === entry.slug);
      return {
        title: titled(page?.titles[locale] ?? page?.titles['en'] ?? entry.slug),
        description: page?.descriptions[locale] ?? page?.descriptions['en'] ?? homeDescription(t),
      };
    }
    case 'home':
      return { title: homeTitle(t), description: homeDescription(t) };
    case 'listing':
      switch (entry.section) {
        case 'blocks':
          return {
            title: t('seo.blocks.title'),
            description: plainText(t('seo.blocks.description')),
          };
        case 'layouts':
          // The one-line description alone is too short to be a search snippet; the source note finishes it.
          return {
            title: titled(t('gallery.layouts.title')),
            description: `${t('gallery.layouts.description')} ${t('gallery.layoutSourceNote')}`,
          };
        case 'recipes':
          return {
            title: titled(t('recipes.title')),
            description: t('recipes.description'),
          };
      }
    // falls through: the switch above is exhaustive
    case 'entry': {
      const catalogEntry = entryForPath(entry.path);
      const name = catalogEntry ? nameOf(catalogEntry, t) : '';
      const kind = catalogEntry?.kind;
      return {
        title: t(`seo.${singular(kind)}.title`, { name }),
        description: t(`seo.${singular(kind)}.description`, { name }),
      };
    }
  }
}

function singular(kind: CatalogKind | undefined): 'block' | 'layout' | 'recipe' {
  return kind === 'blocks' ? 'block' : kind === 'layouts' ? 'layout' : 'recipe';
}

function structuredData(entry: SeoEntry, locale: string, t: T): JsonLd[] {
  if (entry.kind === 'home') return homeJsonLd(homeDescription(t));
  if (entry.kind === 'doc') {
    const page = DOC_PAGES.find(candidate => candidate.slug === entry.slug);
    return [
      breadcrumbJsonLd(
        [
          { name: SITE_NAME, path: localizedPath('/', locale) },
          { name: t('nav.docs'), path: localizedPath('/docs', locale) },
          {
            name: page?.titles[locale] ?? page?.titles['en'] ?? entry.slug,
            path: localizedPath(entry.path, locale),
          },
        ],
        absoluteUrl
      ),
    ];
  }
  if (entry.kind !== 'entry') return [];

  const catalogEntry = entryForPath(entry.path);
  if (!catalogEntry) return [];

  const section =
    catalogEntry.kind === 'blocks'
      ? t('gallery.blocks.title')
      : catalogEntry.kind === 'layouts'
        ? t('gallery.layouts.title')
        : t('recipes.title');

  return [
    breadcrumbJsonLd(
      [
        { name: SITE_NAME, path: localizedPath('/', locale) },
        { name: section, path: localizedPath(listingPath(catalogEntry.kind), locale) },
        { name: nameOf(catalogEntry, t), path: localizedPath(entry.path, locale) },
      ],
      absoluteUrl
    ),
  ];
}
