/**
 * The locales the site is published in, and the rules for moving between them.
 *
 * English lives at the root and the others behind a path prefix — `/es/docs/introduction`,
 * `/uk/docs/introduction`. That shape is the only one a search engine can index three
 * times, which is the entire reason for translating a public documentation site. A
 * runtime toggle with one URL would be simpler and would leave the Spanish and Ukrainian
 * versions invisible to everyone who has not already found the English one.
 *
 * The prefix convention matches the one `@analogjs/router`'s own `provideI18n` reads —
 * the first path segment — so switching to it later would not move a single URL.
 */
export const LOCALES = ['en', 'es', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

/** English is served from the root, so it never appears in a path. */
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: 'English',
  es: 'Español',
  uk: 'Українська',
};

/** Short label for the switcher, where the full name does not fit. */
export const LOCALE_SHORT: Readonly<Record<Locale, string>> = {
  en: 'EN',
  es: 'ES',
  uk: 'UA',
};

/**
 * The BCP 47 tag for the `lang` attribute and `hreflang`.
 *
 * Ukrainian is `uk` in the standard. The site shows it as "UA" because that is what
 * readers recognise, but the markup has to carry the language tag rather than the country
 * one or assistive technology picks the wrong voice.
 */
export const LOCALE_TAGS: Readonly<Record<Locale, string>> = {
  en: 'en',
  es: 'es',
  uk: 'uk',
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** The locale a URL belongs to, taken from its first segment. */
export function localeFromPath(path: string): Locale {
  const [first] = path.split('?')[0].split('#')[0].split('/').filter(Boolean);

  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** The same page with no locale prefix, always starting with a slash. */
export function stripLocale(path: string): string {
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const segments = pathname.split('/').filter(Boolean);

  if (isLocale(segments[0])) {
    segments.shift();
  }

  return `/${segments.join('/')}${rest.join('')}`;
}

/** The same page in another locale. English has no prefix, so it round-trips cleanly. */
export function localizePath(path: string, locale: Locale): string {
  const bare = stripLocale(path);

  if (locale === DEFAULT_LOCALE) {
    return bare;
  }

  return bare === '/' ? `/${locale}` : `/${locale}${bare}`;
}
