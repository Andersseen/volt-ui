/**
 * Where the voltui.dev Markdown documentation lives and which languages it is written in.
 *
 * Shared by `vite.config.ts` (prerender routes) and the application, so it must not import Angular.
 * Each locale is an independently authored Markdown tree (`src/authoring/docs*`, resolved into
 * `src/content/docs*` by `pnpm docs:content`); Doqs matches translations by path. `fallback: 'none'`:
 * a page missing in a locale is not served in English under that locale's URL. Etyma owns the locale
 * prefix, `<html lang>`, canonical and hreflang (see app.config.ts).
 */
export const doqPaths = {
  contentDirectory: 'docs',
  basePath: '/docs',
  i18n: {
    defaultLocale: 'en',
    fallback: 'none',
    locales: [
      { id: 'en', label: 'English' },
      { id: 'es', label: 'Español', contentDirectory: 'docs-es' },
      { id: 'uk', label: 'Українська', contentDirectory: 'docs-uk' },
    ],
  },
} as const;
