import { DOCUMENT } from '@angular/common';
import { effect, inject, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { LOCALES, LOCALE_TAGS, localizePath, stripLocale, DEFAULT_LOCALE } from './locales';
import { Translations } from './translations';

/**
 * Starts the translation layer and keeps the document's language metadata truthful.
 *
 * This exists as an initializer rather than living inside the service because both things
 * it does are site-wide contracts. `Translations` is `providedIn: 'root'`, so it is only
 * constructed when something injects it — leaving `<html lang>` and the alternate links
 * to whichever component happened to ask for a translation first, and wrong on any page
 * that happened not to.
 */
export function provideI18n(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const translations = inject(Translations);
    const document = inject(DOCUMENT);

    effect(() => {
      const locale = translations.locale();

      // A screen reader picks its voice from this, and a browser decides whether to offer
      // a translation of a page that is already translated.
      document.documentElement.lang = LOCALE_TAGS[locale];

      writeAlternates(document, stripLocale(currentPath(document)));
    });
  });
}

function currentPath(document: Document): string {
  return document.location?.pathname ?? '/';
}

/**
 * Rewrites the `hreflang` set for the page currently on screen.
 *
 * Search engines need every translation of a page to point at every other one, including
 * itself, or they treat the three as unrelated pages competing for the same content. The
 * links are rewritten on navigation rather than written once, because a single-page app
 * changes page without ever reloading the head.
 *
 * The hrefs are paths rather than absolute URLs so the same markup is correct on the
 * production domain, on a preview deployment and on localhost, none of which the client
 * can know reliably at render time.
 */
function writeAlternates(document: Document, barePath: string): void {
  for (const stale of Array.from(document.querySelectorAll('link[data-i18n-alternate]'))) {
    stale.remove();
  }

  const head = document.head;

  for (const locale of LOCALES) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', LOCALE_TAGS[locale]);
    link.setAttribute('href', localizePath(barePath, locale));
    link.setAttribute('data-i18n-alternate', '');
    head.appendChild(link);
  }

  // The fallback for any language the site is not published in.
  const fallback = document.createElement('link');
  fallback.setAttribute('rel', 'alternate');
  fallback.setAttribute('hreflang', 'x-default');
  fallback.setAttribute('href', localizePath(barePath, DEFAULT_LOCALE));
  fallback.setAttribute('data-i18n-alternate', '');
  head.appendChild(fallback);
}
