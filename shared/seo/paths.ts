import { I18N_PROJECT } from '../i18n/project';

/**
 * Locale-aware URL arithmetic shared by both applications.
 *
 * Pure functions with no Angular imports, so the build-time generators can load them outside
 * the framework. Origin-specific pieces (`absoluteUrl`, the site name) live with each app's own
 * `site.ts`; nothing here knows which domain it runs on.
 */
const LOCALES: readonly string[] = I18N_PROJECT.locales;
const SOURCE_LOCALE: string = I18N_PROJECT.sourceLocale;

/** `og:locale` wants a language_TERRITORY code. */
export const OG_LOCALES: Readonly<Record<string, string>> = {
  en: 'en_US',
  es: 'es_ES',
  uk: 'uk_UA',
};

/** The locale a URL path is written in. The source locale has no prefix (Etyma redirects `/en/...`). */
export function localeOfPath(path: string): string {
  const first = path.split('/')[1];
  return first !== SOURCE_LOCALE && LOCALES.includes(first) ? first : SOURCE_LOCALE;
}

/** A path without its locale prefix, a trailing slash, a query or a fragment. `/es/docs/` → `/docs`. */
export function barePath(path: string): string {
  const pathname = path.split(/[?#]/)[0];
  const locale = localeOfPath(pathname);
  const stripped = locale === SOURCE_LOCALE ? pathname : pathname.slice(locale.length + 1);
  const trimmed = stripped.length > 1 ? stripped.replace(/\/+$/, '') : stripped;
  return trimmed === '' ? '/' : trimmed;
}

/** The path of a bare route in a locale: `('/docs', 'es')` → `/es/docs`, `('/', 'uk')` → `/uk`. */
export function localizedPath(bare: string, locale: string): string {
  if (locale === SOURCE_LOCALE) return bare;
  return bare === '/' ? `/${locale}` : `/${locale}${bare}`;
}

/** The `**bold**`, `` `code` `` and `[text](url)` marks the sites' prose keys may carry. */
export function plainText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** An absolute URL on a given origin. Each app binds its own origin; this never picks one. */
export function absoluteUrlOn(origin: string, path: string): string {
  return `${origin}${path}`;
}
