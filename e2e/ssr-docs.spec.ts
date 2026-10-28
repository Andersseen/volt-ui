import { expect, test } from '@playwright/test';
import { COMPONENTS } from '../src/app/lib/component-metadata';

/**
 * SSR → hydration for the docs site's landing page and its component pages.
 *
 * Meaningful against the real worker (`E2E_SERVER=wrangler`), where `window is not defined` and
 * hydration mismatches show up; the Vite dev server renders on the client only and would pass
 * for the wrong reason. The suite skips itself otherwise. (Blocks, layouts and recipes are
 * covered by e2e/recipes/ssr-gallery.spec.ts, against the Recipes worker.)
 *
 *   pnpm build && E2E_SERVER=wrangler E2E_PORT=8799 playwright test e2e/ssr-docs.spec.ts
 */
test.skip(process.env['E2E_SERVER'] !== 'wrangler', 'needs the built worker (E2E_SERVER=wrangler)');

const ROUTES = ['/', '/docs/introduction', '/docs/components', ...COMPONENTS.map(c => c.path)];

const HYDRATION_PROBLEM = /NG0500|NG0501|NG0502|NG0503|NG0504|NG0505|NG0506|hydrat/i;

for (const route of ROUTES) {
  test(`${route} server-renders and hydrates cleanly`, async ({ page, request }) => {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('<h1');
    expect(html).not.toContain('window is not defined');

    const problems: string[] = [];
    page.on('pageerror', error => problems.push(`pageerror: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error' || HYDRATION_PROBLEM.test(message.text())) {
        problems.push(`${message.type()}: ${message.text()}`);
      }
    });

    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(problems).toEqual([]);
  });
}
