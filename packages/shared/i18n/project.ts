/**
 * The three facts every i18n consumer needs: which locales exist, which one is the source,
 * and where each catalog lives. Read by the runtime (`i18n.ts`), and by `vite.config.ts` for
 * contract generation and build-time catalog validation, so the three cannot drift apart.
 *
 * Keep this module free of imports: Vite loads it before anything is built.
 */
export const I18N_PROJECT = {
  locales: ['en', 'es', 'uk'],
  sourceLocale: 'en',
  // Translation content is owned by Glossa, not this repo (AGENTS.md "Site copy and translations").
  remote: 'https://glossa.andersseen.dev/i18n/volt-ui/{locale}.json',
} as const;

export const catalogUrl = (locale: string): string =>
  I18N_PROJECT.remote.replace('{locale}', encodeURIComponent(locale));
