import { expect, test } from '../fixtures';
import { CATALOG, listingPath, CATALOG_KINDS } from '../../apps/recipes/src/app/lib/catalog';

/**
 * Every route Recipes publishes renders its page, its live preview and its source. Driven by the
 * catalog, so a new entry is covered the moment it exists.
 */
test.describe('catalog routes', () => {
  test('home links to every section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Volt UI Recipes' })).toBeVisible();
    for (const kind of CATALOG_KINDS) {
      await expect(page.locator(`main a[href="${listingPath(kind)}"]`).first()).toBeVisible();
    }
  });

  for (const kind of CATALOG_KINDS) {
    test(`${listingPath(kind)} lists every ${kind} entry with a working link`, async ({ page }) => {
      await page.goto(listingPath(kind));
      for (const entry of CATALOG.filter(e => e.kind === kind)) {
        await expect(
          page.locator(`main a[href="${entry.path}"]`).first(),
          entry.path
        ).toBeVisible();
      }
    });
  }

  for (const entry of CATALOG) {
    test(`${entry.path} renders a live preview and copyable source`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      const response = await page.goto(entry.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

      // The source is on the page, and copying it is one click away.
      await expect(page.getByRole('button', { name: /copy/i }).first()).toBeVisible();
      // Related components leave for the docs site, on its own origin.
      if (entry.atoms.length > 0) {
        const first = entry.atoms[0];
        await expect(page.getByRole('link', { name: first.name }).first()).toHaveAttribute(
          'href',
          `https://voltui.dev${first.path}`
        );
      }
      expect(errors).toEqual([]);
    });
  }
});

test.describe('head and origin', () => {
  test('a block page is canonical on the Recipes origin, never on voltui.dev', async ({ page }) => {
    await page.goto('/blocks/pricing');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/blocks/pricing'
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://recipes.voltui.dev/blocks/pricing'
    );
  });

  test('a localised page keeps its language and its own canonical', async ({ page }) => {
    await page.goto('/es/blocks/pricing');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/es/blocks/pricing'
    );
  });
});

test.describe('theme', () => {
  test('keeps the chosen dark mode while navigating between sections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page
      .locator('header')
      .getByRole('navigation')
      .first()
      .getByRole('link', { name: 'Layouts' })
      .click();
    await expect(page).toHaveURL(/\/layouts$/);
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
