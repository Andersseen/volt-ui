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

export { OG_LOCALES, barePath, localeOfPath, localizedPath } from '@shared/seo/paths';

export const SITE_IDENTITY_VALUE = {
  name: SITE_NAME,
  origin: SITE_ORIGIN,
  socialImage: SOCIAL_IMAGE,
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}
