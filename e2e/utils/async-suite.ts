import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __async: {
      calls: string[];
      manual: boolean;
      resolve(query: string): void;
      reject(query: string): void;
    };
    __marker?: string;
  }
}

/**
 * Remote Combobox + native Breadcrumb/Button links, shared by the npm-package fixture and the
 * copy-and-own fixture. The two render the same source (the CLI one after its own transform), so
 * a difference between them is a CLI bug.
 *
 * Everything is found by role and accessible name. The backend is `window.__async`: in `?manual`
 * mode a request stays pending until the test settles it, in any order.
 */
export function defineAsyncSuite(label: string, entry: string): void {
  test.describe(`${label}: server-side Combobox`, () => {
    let errors: string[];

    test.beforeEach(({ page }) => {
      errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => {
        if (m.type() === 'error') errors.push(m.text());
      });
    });

    test.afterEach(() => {
      expect(errors, 'runtime errors').toEqual([]);
    });

    const open = async (page: Page, query = '') => {
      await page.goto(`${entry}${query}`);
      await expect(page.getByRole('heading', { level: 1, name: 'Project settings' })).toBeVisible();
    };
    const owner = (page: Page) => page.getByRole('combobox', { name: 'Owner' });
    const status = (page: Page) => page.getByRole('status');
    const calls = (page: Page) => page.evaluate(() => window.__async.calls);
    const settle = (page: Page, query: string) =>
      page.evaluate(q => window.__async.resolve(q), query);

    test('types → queryChange → loading → results → keyboard select → closes with the label', async ({
      page,
    }) => {
      await open(page);
      await owner(page).click();
      await owner(page).fill('a');

      // The query event fired once for what was typed, and the loading row is announced.
      await expect.poll(() => calls(page)).toEqual(['a']);
      await expect(status(page)).toHaveText('2 results available.');
      await expect(page.getByRole('option')).toHaveText(['Alice', 'Charlie']);

      await owner(page).press('ArrowDown');
      await owner(page).press('Enter');

      await expect(owner(page)).toHaveValue('Charlie');
      await expect(page.getByRole('listbox')).toBeHidden();
      // Selecting echoes the label into the input; that must not start another search.
      await page.waitForTimeout(150);
      expect(await calls(page)).toEqual(['a']);
    });

    test('renders server results as supplied (an alias match is not hidden by its label)', async ({
      page,
    }) => {
      await open(page);
      await owner(page).click();
      await owner(page).fill('robert');

      await expect(page.getByRole('option')).toHaveText(['Bob']);
    });

    test('shows loading while a request is pending, and the latest response wins', async ({
      page,
    }) => {
      await open(page, '?manual');
      await owner(page).click();
      await owner(page).fill('a');
      await owner(page).fill('al');
      await owner(page).fill('ali');

      await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
      await expect(status(page)).toHaveText('Searching…');
      expect(await calls(page)).toEqual(['a', 'al', 'ali']);

      // "ali" answers first, then the stale "a" and "al" arrive with bigger lists.
      await settle(page, 'ali');
      await expect(page.getByRole('option')).toHaveText(['Alice']);
      await settle(page, 'a');
      await settle(page, 'al');
      await page.waitForTimeout(100);

      await expect(page.getByRole('option')).toHaveText(['Alice']);
      await expect(page.getByRole('listbox')).not.toHaveAttribute('aria-busy', 'true');
    });

    test('says so for zero results, and recovers from an error with Retry', async ({ page }) => {
      await open(page);
      await owner(page).click();
      await owner(page).fill('zzz');
      await expect(status(page)).toHaveText('No matches for zzz');

      await owner(page).fill('boom');
      await expect(page.getByRole('alert')).toContainText('Search failed: Directory down');

      await owner(page).fill('bo');
      await expect(page.getByRole('alert')).toBeHidden();
      await expect(page.getByRole('option')).toHaveText(['Bob']);
    });

    test('keeps the selection when you reopen, search again and press Escape', async ({ page }) => {
      await open(page);
      await owner(page).click();
      await owner(page).fill('ali');
      await page.getByRole('option', { name: 'Alice' }).click();
      await expect(owner(page)).toHaveValue('Alice');

      // Reopen and search for somebody else without choosing them.
      await owner(page).click();
      await owner(page).fill('bo');
      await expect(page.getByRole('option')).toHaveText(['Bob']);
      await owner(page).press('Escape');

      await expect(page.getByRole('listbox')).toBeHidden();
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByTestId('saved')).toHaveText('Saved owner Alice');
    });

    test('integrates with a form: required until chosen, then the object is the value', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Choose an owner.')).toBeVisible();
      await expect(page.getByTestId('saved')).toHaveText('');
      await expect(owner(page)).toHaveAttribute('aria-invalid', 'true');

      await owner(page).click();
      await owner(page).fill('chu');
      await page.getByRole('option', { name: 'Charlie' }).click();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByTestId('saved')).toHaveText('Saved owner Charlie');
      await expect(owner(page)).not.toHaveAttribute('aria-invalid', 'true');
    });

    test('is not operable while disabled', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: 'Toggle owner field' }).click();

      await expect(owner(page)).toBeDisabled();
      await expect(page.getByRole('listbox')).toHaveCount(0);

      await page.getByRole('button', { name: 'Toggle owner field' }).click();
      await expect(owner(page)).toBeEnabled();
    });
  });

  test.describe(`${label}: Angular Router with native Volt links`, () => {
    const crumbs = (page: Page) => page.getByRole('navigation', { name: 'breadcrumb' });

    test.beforeEach(async ({ page }) => {
      await page.goto(entry);
      await expect(page.getByRole('heading', { level: 1, name: 'Project settings' })).toBeVisible();
      await page.evaluate(() => (window.__marker = 'still-the-same-document'));
    });

    test('generates real hrefs: plain, router with query + fragment, array commands, wrapper', async ({
      page,
    }) => {
      const nav = crumbs(page);
      await expect(nav.getByRole('link', { name: 'Plain' })).toHaveAttribute('href', '/plain');
      await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
        'href',
        '/projects?tab=owners#list'
      );
      await expect(nav.getByRole('link', { name: 'Atlas' })).toHaveAttribute(
        'href',
        '/projects/atlas'
      );
      await expect(nav.getByRole('link', { name: 'Wrapper' })).toHaveAttribute('href', '/wrapper');
      await expect(page.getByRole('link', { name: 'Open Atlas' })).toHaveAttribute(
        'href',
        '/projects/atlas'
      );
    });

    test('navigates without a page load, with the keyboard, and marks the current page', async ({
      page,
    }) => {
      const projects = crumbs(page).getByRole('link', { name: 'Projects' });
      await projects.focus();
      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/projects\?tab=owners#list$/);
      await expect(projects).toHaveAttribute('aria-current', 'page');
      expect(await page.evaluate(() => window.__marker)).toBe('still-the-same-document');

      await page.getByRole('link', { name: 'Open Atlas' }).click();
      await expect(page).toHaveURL(/\/projects\/atlas$/);
      await expect(crumbs(page).getByRole('link', { name: 'Atlas' })).toHaveAttribute(
        'aria-current',
        'page'
      );
      expect(await page.evaluate(() => window.__marker)).toBe('still-the-same-document');
    });

    test('styles the anchor itself: one element, link role, no nested button', async ({ page }) => {
      const link = crumbs(page).getByRole('link', { name: 'Projects' });
      expect(await link.evaluate(el => el.tagName)).toBe('A');
      await expect(page.getByRole('link').locator('button')).toHaveCount(0);
      // The native directive and the wrapper share one look.
      const nativeColor = await crumbs(page)
        .getByRole('link', { name: 'Plain' })
        .evaluate(el => getComputedStyle(el).transitionProperty);
      const wrapperColor = await crumbs(page)
        .getByRole('link', { name: 'Wrapper' })
        .evaluate(el => getComputedStyle(el).transitionProperty);
      expect(nativeColor).toBe(wrapperColor);
    });
  });
}
