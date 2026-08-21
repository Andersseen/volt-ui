import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import en from './en.json';
import es from './es.json';
import uk from './uk.json';
import { LOCALE_TAGS, localeFromPath, localizePath } from './locales';

/**
 * Every key in the English dictionary, as a dotted path.
 *
 * This is what makes the whole thing safe: `t('nav.dcos')` does not compile. A typo in a
 * translation key is otherwise invisible until someone loads the page in the one language
 * where it matters, which on a site with three of them is most of the time.
 */
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Paths<typeof en>;

/** Values substituted into `{placeholder}` slots. */
export type TranslationParams = Readonly<Record<string, string | number>>;

const DICTIONARIES = { en, es, uk } as const;

/**
 * Translations, as signals.
 *
 * The dictionaries are imported rather than fetched, which is the decision everything else
 * follows from. They end up in the bundle, so the server renders the right language on the
 * first pass with no loader, no request waterfall and no flash of English before the
 * translation arrives — and the same code runs on the client with nothing to hydrate
 * differently. Three small JSON files are worth far less than the machinery to fetch them
 * at the right moment.
 *
 * Reading `t` in a template subscribes that template to `locale`, so switching language
 * updates every string on screen without a reload.
 */
@Injectable({ providedIn: 'root' })
export class Translations {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  /**
   * The locale is read from the URL, never stored.
   *
   * It is the URL that decides, so there is one source of truth and a link someone was
   * sent opens in the language it was written in. A remembered preference that overrode
   * the path would mean `/es/docs` could render in English, which is the one thing a
   * localised URL must never do.
   */
  readonly locale = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => localeFromPath(this.router.url))
    ),
    { initialValue: localeFromPath(this.router.url) }
  );

  private readonly dictionary = computed(() => DICTIONARIES[this.locale()]);

  constructor() {
    // The document language has to follow the content, or a screen reader announces
    // Spanish with an English voice and a browser offers to translate a page that is
    // already translated.
    effect(() => {
      this.document.documentElement.lang = LOCALE_TAGS[this.locale()];
    });
  }

  /**
   * The same path in the active locale, for every `routerLink` in the chrome.
   *
   * Without it a visitor on `/es/docs` who clicks "Components" lands on the English page,
   * because the link is absolute and knows nothing about where it was clicked from.
   */
  readonly path = (to: string): string => localizePath(to, this.locale());

  /**
   * An arrow rather than a method so a template can hold it directly — and so the read of
   * `locale()` inside happens during that template's evaluation, which is what makes the
   * component re-render when the language changes.
   */
  readonly t = (key: TranslationKey, params?: TranslationParams): string => {
    const value = lookup(this.dictionary(), key) ?? lookup(en, key);

    if (value === undefined) {
      // Loud in development, harmless in production: showing the key beats showing
      // nothing, and it names the thing that is missing.
      return key;
    }

    return params ? interpolate(value, params) : value;
  };
}

function lookup(dictionary: object, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      dictionary
    );

  return typeof value === 'string' ? value : undefined;
}

function interpolate(value: string, params: TranslationParams): string {
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}
