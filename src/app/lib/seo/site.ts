import { I18N_PROJECT } from '../../i18n/project';

/**
 * The one place the public identity of the site is written down.
 *
 * Canonical URLs, Open Graph, structured data, the sitemap and `llms.txt` all read these, so
 * the production origin appears once in the code. `src/app/lib/seo/seo.spec.ts` fails if the
 * previous origin comes back anywhere in the repository's own sources.
 *
 * Keep this module free of Angular imports: the build-time generators (`scripts/generate-seo-files.mjs`)
 * load it outside the framework.
 */
export const SITE_NAME = 'Volt UI';
export const SITE_ORIGIN = 'https://voltui.dev';

export const GITHUB_URL = 'https://github.com/Andersseen/volt-ui';
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

/** 1200 × 630, served from `public/`. */
export const SOCIAL_IMAGE = { path: '/og.png', width: 1200, height: 630 } as const;

export const NPM_PACKAGES = [
  {
    name: '@voltui/components',
    url: 'https://www.npmjs.com/package/@voltui/components',
    purpose: 'The Angular component library (package mode).',
  },
  {
    name: '@voltui/cli',
    url: 'https://www.npmjs.com/package/@voltui/cli',
    purpose: 'Copies component source into your project (copy-and-own mode).',
  },
  {
    name: '@voltui/agent',
    url: 'https://www.npmjs.com/package/@voltui/agent',
    purpose: 'Installs the Volt UI skill and MCP server config for AI coding agents.',
  },
] as const;

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

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}
