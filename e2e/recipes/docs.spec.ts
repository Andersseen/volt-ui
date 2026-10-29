import { expect, test } from '../fixtures';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Read from the Markdown files, as the site does (`import.meta.glob` is Vite-only, not Playwright's). */
const CONTENT = join(process.cwd(), 'apps/recipes/src/content');
const dirOf = (locale: string) => join(CONTENT, locale === 'en' ? 'docs' : `docs-${locale}`);
const DOC_PAGES = readdirSync(dirOf('en'))
  .filter(file => file.endsWith('.md'))
  .map(file => {
    const slug = file.replace(/\.md$/, '');
    const titles = Object.fromEntries(
      ['en', 'es', 'uk'].map(locale => [
        locale,
        readFileSync(join(dirOf(locale), file), 'utf8')
          .match(/^title:\s*(.+)$/m)![1]
          .trim(),
      ])
    ) as Record<'en' | 'es' | 'uk', string>;
    return { slug, path: `/docs/${slug}`, titles };
  });

/**
 * The documentation region (Doqs, https://github.com/Andersseen/doqs): Markdown pages in three
 * languages, inside the site's own header, footer and theme.
 */
test.describe('documentation', () => {
  for (const [locale, prefix] of [
    ['en', ''],
    ['es', '/es'],
    ['uk', '/uk'],
  ] as const) {
    for (const page of DOC_PAGES) {
      test(`${prefix}${page.path} renders in ${locale}`, async ({ page: browser }) => {
        const errors: string[] = [];
        browser.on('pageerror', error => errors.push(error.message));

        const response = await browser.goto(`${prefix}${page.path}`);
        expect(response?.status()).toBe(200);
        await expect(browser.locator('html')).toHaveAttribute('lang', locale);
        await expect(browser.getByRole('heading', { level: 1 })).toHaveText(page.titles[locale]);
        // One main landmark, and it is the site's, not Doqs's.
        await expect(browser.locator('main')).toHaveCount(1);
        expect(errors).toEqual([]);
      });
    }
  }

  test('the header leads to the docs and keeps them lit', async ({ page }) => {
    await page.goto('/');
    await page
      .locator('header')
      .getByRole('navigation')
      .first()
      .getByRole('link', { name: 'Docs' })
      .click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(
      page.locator('header').getByRole('navigation').first().getByRole('link', { name: 'Docs' })
    ).toHaveAttribute('aria-current', 'page');
  });

  test('the header is the only language control, and it moves a guide between languages', async ({
    page,
  }) => {
    await page.goto('/docs/copying-a-recipe');
    // Doqs ships a selector of its own; Etyma owns the locale, so only the header's is shown.
    await expect(page.locator('doq-locale-switcher').first()).toBeHidden();
    await expect(page.getByTestId('language-trigger')).toHaveCount(1);

    await page.getByTestId('language-trigger').click();
    await page.getByTestId('language-option-es').click();
    await expect(page).toHaveURL(/\/es\/docs\/copying-a-recipe$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    // Doqs's own interface text comes from the same Glossa catalog as the rest of the site.
    await expect(page.getByText('En esta página').first()).toBeVisible();
  });

  test('a live recipe renders inside a guide', async ({ page }) => {
    await page.goto('/docs/blocks-layouts-recipes');
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('an unknown docs URL is kept out of the index', async ({ page }) => {
    await page.goto('/docs/does-not-exist');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('a doc page is canonical on the Recipes origin in its own language', async ({ page }) => {
    await page.goto('/es/docs/copying-a-recipe');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/es/docs/copying-a-recipe'
    );
  });
});
