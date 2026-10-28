import { expect, test } from '@playwright/test';
import { BLOCKS } from '../../apps/recipes/src/app/lib/blocks-metadata';
import { LAYOUTS } from '../../apps/recipes/src/app/lib/layouts-metadata';
import { RECIPES } from '../../apps/recipes/src/app/lib/recipes-metadata';

/**
 * SSR → hydration → interaction for every Block and Layout.
 *
 * Meaningful against the real worker (`E2E_SERVER=wrangler`), which is where `window is not
 * defined` and hydration mismatches show up; the Vite dev server renders on the client only
 * and would pass for the wrong reason. The suite skips itself otherwise.
 *
 *   pnpm build && E2E_APP=recipes E2E_SERVER=wrangler E2E_PORT=8798 playwright test -c playwright.recipes.config.ts e2e/recipes/ssr-gallery.spec.ts
 */
test.skip(process.env['E2E_SERVER'] !== 'wrangler', 'needs the built worker (E2E_SERVER=wrangler)');

const ROUTES = [
  '/',
  '/blocks',
  '/layouts',
  '/recipes',
  ...BLOCKS.map(block => block.path),
  ...LAYOUTS.map(layout => layout.path),
  ...RECIPES.map(recipe => recipe.path),
];

const HYDRATION_PROBLEM = /NG0500|NG0501|NG0502|NG0503|NG0504|NG0505|NG0506|hydrat/i;

for (const route of ROUTES) {
  test(`${route} server-renders and hydrates cleanly`, async ({ page, request }) => {
    // The server's own HTML, before any script runs.
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
    // Hydration finishes asynchronously after load; give event replay and stable-state a beat.
    await page.waitForLoadState('networkidle');

    expect(problems).toEqual([]);
  });
}

test('pricing block responds to interaction after hydration', async ({ page }) => {
  await page.goto('/blocks/pricing');
  await page.waitForLoadState('networkidle');

  const billing = page.getByRole('switch', { name: 'Bill annually' });
  await expect(billing).toHaveAttribute('aria-checked', 'true');
  await page.getByText('Monthly', { exact: true }).click();
  await expect(billing).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByText('$24', { exact: true })).toBeVisible();
});
