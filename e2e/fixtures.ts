import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, expect } from '@playwright/test';

/**
 * Docs-app e2e `test`: identical to Playwright's, except the Glossa message catalogs are
 * answered from the repo's test-only snapshot instead of the live endpoint.
 *
 * Why: the site fetches `https://glossa.andersseen.dev/i18n/volt-ui/<locale>.json` at runtime
 * (AGENTS.md "Site copy and translations"). Reaching it from a CI runner is slow and
 * occasionally drops, and when the catalog does not arrive the page renders no copy — every
 * heading/button assertion then times out, which looked like a broken release when nothing in
 * the code had changed. The suite checks the app, not Glossa's uptime.
 *
 * Not applied under `E2E_SERVER=wrangler`: there the worker fetches the catalog server-side
 * (the browser never sees that request), and that spec exists to exercise the real path.
 * A spec that needs its own response (a slow or failing catalog) registers `page.route` after
 * this runs, and Playwright matches the most recently registered route first.
 */
const FIXTURES = fileURLToPath(new URL('../packages/shared/i18n/__fixtures__', import.meta.url));
const catalogs = new Map(
  ['en', 'es', 'uk'].map(locale => [locale, readFileSync(join(FIXTURES, `${locale}.json`), 'utf8')])
);

export const test = base.extend<{ glossaCatalogs: void }>({
  glossaCatalogs: [
    async ({ page }, use) => {
      if (process.env['E2E_SERVER'] !== 'wrangler') {
        await page.route(/\/i18n\/volt-ui\/(en|es|uk)\.json$/, route => {
          const locale = /\/(en|es|uk)\.json$/.exec(route.request().url())![1];
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: catalogs.get(locale)!,
          });
        });
      }
      await use();
    },
    { auto: true },
  ],
});

export { expect };
