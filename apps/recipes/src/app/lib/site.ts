import { absoluteUrlOn } from '@shared/seo/paths';

export { OG_LOCALES, barePath, localeOfPath, localizedPath } from '@shared/seo/paths';

/**
 * The one place the public identity of Volt UI Recipes is written down.
 *
 * Canonical URLs, Open Graph, structured data and the sitemap all read these, so the Recipes
 * origin appears once in the code. It is deliberately a different origin from the docs site:
 * a Recipes page is never canonical on `voltui.dev`, and vice versa.
 *
 * Keep this module free of Angular imports: the build-time generators load it outside the
 * framework.
 */
export const SITE_NAME = 'Volt UI Recipes';
export const SITE_ORIGIN = 'https://recipes.voltui.dev';

/** The component library and its documentation: the parent product. */
export const DOCS_ORIGIN = 'https://voltui.dev';

export const GITHUB_URL = 'https://github.com/Andersseen/volt-ui';

/** 1200 × 630, served from this app's `public/`. */
export const SOCIAL_IMAGE = { path: '/og.png', width: 1200, height: 630 } as const;

export const SITE_IDENTITY_VALUE = {
  name: SITE_NAME,
  origin: SITE_ORIGIN,
  socialImage: SOCIAL_IMAGE,
} as const;

export const absoluteUrl = (path: string): string => absoluteUrlOn(SITE_ORIGIN, path);

/**
 * A page on the Volt UI docs site, in the visitor's language. Component documentation lives
 * there, so every "built from" link leaves this origin for `voltui.dev` — an absolute URL,
 * because a relative one would resolve against Recipes.
 */
export function docsUrl(locale: string, path: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${DOCS_ORIGIN}${prefix}${path === '/' && prefix !== '' ? '' : path}`;
}
