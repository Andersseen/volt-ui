/**
 * Where the Recipes documentation lives and which languages it is written in.
 *
 * Shared by `vite.config.ts` (prerender routes) and the application, so it must not import Angular.
 * Each locale is an independently authored Markdown tree; Doqs matches translations by slug.
 * Etyma owns the locale prefix, `<html lang>`, canonical and hreflang (see app.config.ts).
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
