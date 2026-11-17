import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/**
 * The Doqs documentation region of voltui.dev (apps/web/src/app/doqs).
 *
 * Doqs owns the pages that have a Markdown file; every other /docs URL stays a host page. These
 * tests hold that boundary from the reader's side: the site's one documentation shell and one `<main>` per page, Etyma
 * still owning the language and the head, real Volt components in the playgrounds, and the Select
 * list reachable inside the expanded preview. They run against the dev server and the built
 * worker alike (`E2E_SERVER=wrangler`).
 */

const MIGRATED = [
  '/docs/introduction',
  '/docs/themes',
  '/docs/customization',
  '/docs/components/form-field',
  '/docs/components/input',
  '/docs/components/checkbox',
  '/docs/components/select',
];
const LOCALES = ['', '/es', '/uk'];
const HOST_OWNED = ['/docs/components/button', '/docs/versioning', '/es/docs/components/button'];

const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

async function axeViolations(page: Page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (...a: unknown[]) => Promise<any> } }).axe;
    const result = await axe.run(document.querySelector('main'), {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return (result.violations as { id: string; nodes: { target: string[] }[] }[]).map(
      v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`
    );
  });
}

const playground = (page: Page) => page.locator('doq-playground');

/** Interaction before hydration lands on the server-rendered DOM, which has no listeners yet. */
async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test.describe('Doqs owns the migrated pages', () => {
  for (const locale of LOCALES) {
    for (const path of MIGRATED) {
      test(`${locale}${path} renders one Doqs article inside the site shell`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${locale}${path}`);

        await expect(page.locator('main')).toHaveCount(1);
        await expect(page.locator('h1')).toHaveCount(1);
        // The site's own documentation shell frames the page: one sidebar listing host and
        // Markdown pages alike, not a Doqs sidebar that only knows the Markdown ones.
        await expect(page.locator('app-docs-page-shell')).toHaveCount(1);
        await expect(page.locator('app-docs-page-shell doq-docs')).toHaveCount(1);
        await expect(page.locator('.doq-sidebar, .doq-toc')).toHaveCount(0);
        await expect(page.locator('header').first()).toBeVisible();
        await expect(page.locator('footer').first()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.lang)).toBe(
          locale.slice(1) || 'en'
        );
        expect(errors).toEqual([]);
      });
    }
  }

  for (const path of HOST_OWNED) {
    test(`${path} stays a host page`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('app-docs-page-shell')).toHaveCount(1);
      await expect(page.locator('[class^="doq-"]')).toHaveCount(0);
      await expect(page.locator('main')).toHaveCount(1);
    });
  }

  test('the bare /docs still redirects to the introduction', async ({ page, browserName }) => {
    // Pre-existing on main @ ab6dd05, not caused by Doqs: in Firefox the client keeps /docs and renders
    // the empty components layout after hydrating the server's redirect. Reproduced on a clean main
    // checkout; tracked in specs/plans/v1.8.md, "Findings outside this scope".
    test.fixme(browserName === 'firefox', 'pre-existing host redirect defect in Firefox');
    await open(page, '/docs');
    await expect(page).toHaveURL(/\/docs\/introduction$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Introduction' })).toBeVisible();
  });
});

test.describe('navigation across the boundary', () => {
  test('the header language switch localizes a Doqs page in place', async ({ page }) => {
    await open(page, '/docs/components/input');
    await page.getByTestId('language-trigger').click();
    await page.getByTestId('language-option-es').click();

    await expect(page).toHaveURL(/\/es\/docs\/components\/input$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Input y formularios');
    await expect(playground(page).locator('legend').first()).toHaveText(/Entradas/i);
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('es');
  });

  test('host and Doqs pages link to each other, and Back/Forward restore each one', async ({
    page,
  }) => {
    await open(page, '/docs/components/button');
    await page.locator('app-docs-page-shell aside').getByRole('link', { name: 'Checkbox' }).click();
    await expect(page).toHaveURL(/\/docs\/components\/checkbox$/);
    await expect(page.locator('doq-docs')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Checkbox');
    await page.waitForLoadState('networkidle');

    await page.locator('app-docs-page-shell aside').getByRole('link', { name: 'Select' }).click();
    await expect(page).toHaveURL(/\/docs\/components\/select$/);

    await page.waitForLoadState('networkidle');

    await page.goBack();
    await expect(page).toHaveURL(/\/docs\/components\/checkbox$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Checkbox');
    await page.waitForLoadState('networkidle');
    await page.goBack();
    await expect(page).toHaveURL(/\/docs\/components\/button$/);
    await expect(page.locator('doq-docs')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Checkbox');
    await expect(page.locator('main')).toHaveCount(1);
  });

  test('a Markdown page keeps the whole documentation sidebar and pager', async ({ page }) => {
    await open(page, '/docs/customization');
    const sidebar = page.locator('app-docs-page-shell aside').first();
    for (const name of ['Introduction', 'Versioning & Stability', 'Agent Skills', 'MCP Server']) {
      await expect(sidebar.getByRole('link', { name, exact: true })).toBeVisible();
    }
    // The pager follows the site's order across the boundary: Customization → Versioning (host).
    await page
      .locator('app-docs-pager')
      .getByRole('link', { name: /Versioning/ })
      .click();
    await expect(page).toHaveURL(/\/docs\/versioning$/);
    await expect(page.locator('doq-docs')).toHaveCount(0);
  });

  test('the outline links to the headings of the page', async ({ page }) => {
    await open(page, '/docs/components/select');
    // The site shell's outline, the same one host pages show (e2e/docs-toc.spec.ts).
    await page
      .getByRole('navigation', { name: 'On this page' })
      .getByRole('button', { name: 'Forms and accessibility' })
      .click();
    await expect(page).toHaveURL(/#forms-and-accessibility$/);
    await expect(page.getByRole('heading', { name: 'Forms and accessibility' })).toBeInViewport();
  });
});

test.describe('playgrounds drive the real components', () => {
  test('Input: typing is logged, inputs reach the native control', async ({ page }) => {
    await open(page, '/docs/components/input');
    const pg = playground(page);
    const input = pg.getByRole('textbox', { name: 'Email' });
    await input.fill('ada@example.com');
    await expect(pg.locator('.doq-pg-event-list li').first()).toContainText('valueChange');
    await expect(pg.locator('p', { hasText: 'Value:' })).toContainText('ada@example.com');

    await pg.getByRole('checkbox', { name: 'disabled' }).check();
    await expect(input).toBeDisabled();
    await expect(pg.locator('code', { hasText: '[disabled]="true"' })).toBeVisible();
  });

  test('Checkbox: the mixed state resolves to checked and both outputs are logged', async ({
    page,
  }) => {
    await open(page, '/docs/components/checkbox');
    const pg = playground(page);
    await pg.getByRole('checkbox', { name: 'indeterminate' }).check();
    const box = pg.getByRole('checkbox', { name: 'Email me about releases' });
    await expect(box).toHaveAttribute('aria-checked', 'mixed');

    await box.press('Space');
    await expect(box).toHaveAttribute('aria-checked', 'true');
    const events = pg.locator('.doq-pg-event-list');
    await expect(events).toContainText('checkedChange');
    await expect(events).toContainText('indeterminateChange');
  });

  test('Form Field: the error appears on leaving the field and is wired to the control', async ({
    page,
  }) => {
    await open(page, '/docs/components/form-field');
    const pg = playground(page);
    const input = pg.getByRole('textbox', { name: 'Work email' });
    await input.focus();
    await input.blur();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(pg.getByRole('alert')).toHaveText('Enter a valid email address.');
    await expect(input).toHaveAccessibleDescription(/Enter a valid email address\./);

    await input.fill('ada@example.com');
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(pg.getByRole('alert')).toHaveCount(0);
    const described = (await input.getAttribute('aria-describedby'))?.split(/\s+/) ?? [];
    for (const id of described) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  });

  test('Select: keyboard selection inline, and a hit-testable list in the expanded preview', async ({
    page,
  }) => {
    await open(page, '/docs/components/select');
    const pg = playground(page);
    const trigger = pg.getByRole('combobox', { name: 'Plan' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Team' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await pg.getByRole('button', { name: 'Expand' }).click();
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox', { name: 'Plan' }).click();
    const option = page.getByRole('option', { name: 'Enterprise' });
    await expect(option).toBeVisible();
    const box = (await option.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('[role="option"]')?.textContent?.trim(),
      [box.x + box.width / 2, box.y + box.height / 2]
    );
    expect(hit).toBe('Enterprise');
    await option.click();
    await expect(dialog.locator('p', { hasText: 'Value:' })).toContainText('enterprise');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(pg.getByRole('button', { name: 'Expand' })).toBeFocused();
  });
});

test.describe('accessibility of the Doqs region (axe, WCAG 2.2 A/AA)', () => {
  for (const [mode, cookie] of [
    ['light', '1.volt.sharp.light.comfortable'],
    ['dark', '1.volt.sharp.dark.comfortable'],
    ['ember brutal dark', '1.ember.brutal.dark.compact'],
  ] as const) {
    test(`migrated pages have no violations in <main> (${mode})`, async ({
      page,
      context,
      baseURL,
    }) => {
      await context.addCookies([{ name: 'volt-theme', value: cookie, url: baseURL! }]);
      for (const path of MIGRATED) {
        await open(page, path);
        await page.addStyleTag({
          content: '*{transition:none!important;animation:none!important}',
        });
        expect(await axeViolations(page), path).toEqual([]);
      }
    });
  }
});
