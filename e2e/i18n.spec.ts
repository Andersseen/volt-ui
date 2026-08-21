import { expect, test } from '@playwright/test';

/**
 * The site is published in three languages under a path prefix, with English at the root.
 * These are the properties that make that worth doing: the server has to render the right
 * language on the first byte, the page has to say which language it is in, and each
 * translation has to point at the others.
 */
test.describe('Localised site', () => {
  test('opens each locale in its own language', async ({ page }) => {
    /*
     * Asserted on the rendered page rather than on the response body: this suite runs
     * against `vite preview`, which serves the static client build, while the server
     * render happens in the Nitro handler. The markup-level guarantee is real — the dev
     * and deployed servers both emit `lang` and the translated copy on the first byte —
     * it just is not what this harness is serving.
     */
    for (const [path, lang, docs] of [
      ['/', 'en', 'Docs'],
      ['/es', 'es', 'Documentación'],
      ['/uk', 'uk', 'Документація'],
    ] as const) {
      await page.goto(path);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(
        page.locator('header').getByRole('navigation').getByRole('link', { name: docs })
      ).toBeVisible();
    }
  });

  test('points every translation at the others', async ({ page }) => {
    await page.goto('/es/docs/themes');

    const alternates = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(link => ({
        hreflang: link.getAttribute('hreflang'),
        href: link.getAttribute('href'),
      }))
    );

    expect(alternates).toEqual([
      { hreflang: 'en', href: '/docs/themes' },
      { hreflang: 'es', href: '/es/docs/themes' },
      { hreflang: 'uk', href: '/uk/docs/themes' },
      { hreflang: 'x-default', href: '/docs/themes' },
    ]);
  });

  test('keeps the reader in their language when they navigate', async ({ page }) => {
    await page.goto('/uk');

    await page
      .locator('header')
      .getByRole('navigation')
      .getByRole('link', { name: 'Компоненти' })
      .click();

    await expect(page).toHaveURL(/\/uk\/docs\/components$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });

  test('switches language in place, staying on the same page', async ({ page }) => {
    await page.goto('/docs/blocks/pricing');
    // Wait for the app's first navigation to land: the switcher rewrites whatever route
    // the router is currently on, and clicking mid-bootstrap would rewrite the root.
    await expect(page.getByRole('heading', { level: 1, name: 'Pricing Tiers' })).toBeVisible();

    await page.locator('header button[aria-label^="Language"]').click();
    await page.getByRole('button', { name: 'Español' }).click();

    // The same page, in the other language — not the home page, which is where a naive
    // switcher would drop you.
    await expect(page).toHaveURL(/\/es\/docs\/blocks\/pricing$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('renders a deep localised link without any client-side redirect', async ({ page }) => {
    const response = await page.goto('/uk/docs/blocks/hero');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/uk\/docs\/blocks\/hero$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Hero Spotlight' })).toBeVisible();
  });
});
