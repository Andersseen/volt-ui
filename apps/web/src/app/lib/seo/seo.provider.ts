import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  inject,
} from '@angular/core';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { filter } from 'rxjs';
import { injectAppI18n, LOCALES } from '@shared/i18n/i18n';
import { breadcrumbJsonLd, homeJsonLd, type JsonLd } from './json-ld';
import { seoEntryFor, type SeoEntry } from './seo-catalog';
import { SeoService } from '@shared/seo/seo.service';
import { plainText } from '@shared/seo/paths';
import { absoluteUrl, barePath, localeOfPath, localizedPath, SITE_NAME } from './site';

/**
 * Keeps the search metadata in step with the router: after every navigation, the page's title,
 * description, social tags and structured data are rewritten for the page now on screen, in its
 * language. Everything is derived from the URL and the catalog (`seo-catalog.ts`), so there is
 * nothing for an individual page to remember to do.
 *
 * The navigation has finished by then, which includes Etyma activating the locale: `t()` already
 * speaks the language of the URL.
 */
export function provideSeo(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const router = inject(Router);
      const seo = inject(SeoService);
      const { t } = injectAppI18n();

      /** Keeps a page out of the index. */
      const keepOutOfIndex = (url: string) => {
        const path = url.split(/[?#]/)[0];
        const locale = localeOfPath(path);
        seo.apply({
          title: SITE_NAME,
          description: plainText(t('seo.home.description')),
          url: absoluteUrl(localizedPath(barePath(path), locale)),
          locale,
          locales: LOCALES,
          imageAlt: t('seo.imageAlt'),
          robots: 'noindex, follow',
        });
      };

      // A path no route claims: the router raises NG04002 and the shell renders with nothing in it.
      // Tell crawlers with a noindex. (The Cloudflare worker answers 200 whatever status the render
      // sets, so the meta tag is the signal that holds.)
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
          const url = absoluteUrl(localizedPath(bare, locale));

          if (!entry) {
            // Reached through a route, but not catalogued (a redirect source, for instance).
            keepOutOfIndex(event.urlAfterRedirects);
            return;
          }

          const { title, description } = describe(entry, t);
          seo.apply({
            title,
            description,
            url,
            locale,
            locales: LOCALES,
            imageAlt: t('seo.imageAlt'),
            jsonLd: structuredData(entry, bare, locale, title, description, t),
          });
        });
    }),
  ]);
}

type T = ReturnType<typeof injectAppI18n>['t'];

function nameOf(entry: Exclude<SeoEntry, { kind: 'page' }>, t: T): string {
  return entry.nameKey ? t(entry.nameKey) : entry.name;
}

/** Catalog blurbs written for a card ("Interactive buttons") are too short to be a search snippet. */
const MIN_DESCRIPTION_LENGTH = 70;

function componentDescription(catalog: string, name: string, t: T): string {
  const text = plainText(catalog);
  return text.length >= MIN_DESCRIPTION_LENGTH ? text : t('seo.component.description', { name });
}

function describe(entry: SeoEntry, t: T): { title: string; description: string } {
  switch (entry.kind) {
    case 'page':
      return { title: t(entry.titleKey), description: plainText(t(entry.descriptionKey)) };
    case 'component': {
      const name = nameOf(entry, t);
      return {
        title: t('seo.component.title', { name }),
        description: componentDescription(
          entry.descriptionKey ? t(entry.descriptionKey) : '',
          name,
          t
        ),
      };
    }
  }
}

function structuredData(
  entry: SeoEntry,
  bare: string,
  locale: string,
  _title: string,
  description: string,
  t: T
): JsonLd[] {
  if (entry.kind === 'page' && bare === '/') return homeJsonLd(description);

  // Breadcrumbs only where the header and the docs sidebar show the same hierarchy.
  if (entry.kind === 'component') {
    return [
      breadcrumbJsonLd([
        { name: SITE_NAME, path: localizedPath('/', locale) },
        { name: t('nav.components'), path: localizedPath('/docs/components', locale) },
        { name: nameOf(entry, t), path: localizedPath(bare, locale) },
      ]),
    ];
  }
  return [];
}
