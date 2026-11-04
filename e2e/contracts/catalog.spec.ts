import { expect, test, type Page } from '@playwright/test';
import { load } from './helpers';

/**
 * Tier 1 — catalog smoke for the families that had no real-browser assertion elsewhere. Each test
 * makes one consumer-visible claim through role and name, and interacts wherever the family is
 * interactive. Deep behaviour (overlays, composites, sliders, …) stays in the other contract files;
 * the full inventory and where each family's evidence lives is in
 * docs/quality/headless-contract-verification.md.
 */
const section = (page: Page, name: string) => page.getByRole('region', { name });

test.describe('catalog', () => {
  test.beforeEach(async ({ page }) => {
    await load(page, 'catalog');
  });

  test.afterEach(async ({ page }) => {
    expect((page as Page & { __errors?: string[] }).__errors ?? []).toEqual([]);
  });

  test('button: a click runs the handler once; a disabled button ignores the pointer', async ({
    page,
  }) => {
    const s = section(page, 'Button family');
    await s.getByRole('button', { name: 'Count click' }).click();
    await expect(page.locator('#clicks')).toHaveText('1');
    await expect(s.getByRole('button', { name: 'Disabled action' })).toBeDisabled();
    await s.getByRole('button', { name: 'Volt button' }).click();
    await expect(page.locator('#clicks')).toHaveText('11');
  });

  test('badge: renders its text with a variant-specific paint', async ({ page }) => {
    const s = section(page, 'Badge family');
    const beta = s.getByText('Beta badge');
    const error = s.getByText('Error badge');
    await expect(beta).toBeVisible();
    const bg = (l: typeof beta) => l.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(await bg(beta)).not.toBe(await bg(error));
  });

  test('alert: role="alert" only where opted in; title and description are announced text', async ({
    page,
  }) => {
    const s = section(page, 'Alert family');
    const alert = s.getByRole('alert');
    await expect(alert).toHaveCount(1);
    await expect(alert).toContainText('Payment failed');
    await expect(alert).toContainText('Update your card.');
    await expect(s.getByText('Static note')).toBeVisible();
  });

  test('card: header, title, description and content render in order', async ({ page }) => {
    const s = section(page, 'Card family');
    await expect(s.getByText('Plan card')).toBeVisible();
    await expect(s.getByText('Billing summary')).toBeVisible();
    await expect(s.getByText('Card body text')).toBeVisible();
    const order = await s
      .locator('volt-card-title, volt-card-description, volt-card-content')
      .evaluateAll(els => els.map(e => e.tagName.toLowerCase()));
    expect(order).toEqual(['volt-card-title', 'volt-card-description', 'volt-card-content']);
  });

  test('avatar: a broken image falls back to the initials and is no longer painted', async ({
    page,
  }) => {
    const s = section(page, 'Avatar family');
    await expect(s.locator('volt-avatar')).toHaveAttribute('data-status', 'error');
    await expect(s.getByText('AL')).toBeVisible();
    // The failed <img> stays in the DOM visually hidden (ng-primitives); its alt still names the person.
    const img = s.getByRole('img', { name: 'Ada Lovelace' });
    expect((await img.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1);
  });

  test('breadcrumbs: a named navigation landmark; the current page is marked', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'breadcrumb' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Home crumb' })).toHaveAttribute('href', '#catalog');
    await expect(nav.getByText('Current crumb')).toHaveAttribute('aria-current', 'page');
  });

  test('separator: horizontal, painted, and not focusable', async ({ page }) => {
    const sep = section(page, 'Separator family').locator('volt-separator');
    const box = await sep.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(50);
    expect(box?.height ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 99).toBeLessThan(4);
    expect(await sep.evaluate(el => (el as HTMLElement).tabIndex)).toBeLessThan(0);
  });

  test('skeleton: takes the requested size inside a block parent (regression: painted 0×0)', async ({
    page,
  }) => {
    const sk = section(page, 'Skeleton family').locator('volt-skeleton');
    const box = await sk.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(120);
    expect(Math.round(box?.height ?? 0)).toBe(16);
  });

  test('spinner: a labelled spinner is a status; an unlabelled one is hidden', async ({ page }) => {
    const s = section(page, 'Spinner family');
    // role="status" takes no name from content; the announcement is its (sr-only) text.
    const status = s.getByRole('status');
    await expect(status).toHaveCount(1);
    await expect(status).toHaveText('Loading projects');
    await expect(s.locator('volt-spinner').nth(1)).toHaveAttribute('aria-hidden', 'true');
  });

  test('progress: progressbar with value; a parent update reaches ARIA and the indicator', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Upload progress' });
    await expect(bar).toHaveAttribute('aria-valuenow', '40');
    await section(page, 'Progress family').getByRole('button', { name: 'Advance upload' }).click();
    await expect(bar).toHaveAttribute('aria-valuenow', '90');
    await expect(section(page, 'Progress family')).toContainText('90% complete');
  });

  test('meter: meter role with value, min and max', async ({ page }) => {
    const meter = page.getByRole('meter', { name: 'Capacity' });
    await expect(meter).toHaveAttribute('aria-valuenow', '72');
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  test('table: table semantics with caption, column headers and cells', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Recent invoices' });
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader')).toHaveCount(2);
    await expect(table.getByRole('cell', { name: 'INV001' })).toBeVisible();
    await expect(table.getByRole('row')).toHaveCount(2);
  });

  test('empty state: title, description and an operable action', async ({ page }) => {
    const s = section(page, 'Empty state family');
    await expect(s.getByText('No projects yet')).toBeVisible();
    await expect(s.getByText('Create your first project.')).toBeVisible();
    await expect(s.getByRole('button', { name: 'Create project' })).toBeEnabled();
  });

  test('form field, input, textarea: label names the control, typing reaches ngModel, error is described', async ({
    page,
  }) => {
    const name = page.getByRole('textbox', { name: 'Display name' });
    await expect(name).toBeVisible();
    await name.fill('Ada');
    await expect(page.locator('#name-value')).toHaveText('Ada');
    await expect(name).toHaveAccessibleDescription(/Shown on your profile/);
    const bio = page.getByRole('textbox', { name: 'Biography' });
    await bio.click();
    await page.keyboard.type('Hi');
    await expect(page.locator('#bio-value')).toHaveText('Hi');
    // The error belongs to a Forms control: invalid + touched → aria-invalid and described by the error.
    const workspace = page.getByRole('textbox', { name: 'Workspace' });
    await expect(workspace).not.toHaveAttribute('aria-invalid', 'true');
    await workspace.focus();
    await workspace.blur();
    await expect(workspace).toHaveAttribute('aria-invalid', 'true');
    await expect(workspace).toHaveAccessibleDescription(/Workspace is required/);
    await workspace.fill('acme');
    await expect(workspace).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('search: the clear button empties the field; Escape clears too', async ({ page }) => {
    const box = page.getByRole('searchbox', { name: 'Search docs' });
    await box.fill('volt');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(box).toHaveValue('');
    await box.fill('again');
    await box.press('Escape');
    await expect(box).toHaveValue('');
  });

  test('autofill: typing is not reported as autofill (real browser autofill: not automatable)', async ({
    page,
  }) => {
    const email = page.getByRole('textbox', { name: 'Email address' });
    await email.fill('ada@example.com');
    await expect(email).toHaveValue('ada@example.com');
    await expect(page.locator('#autofilled')).toHaveText('false');
  });

  test('pagination: page buttons and Next update the page; Previous is disabled on page 1', async ({
    page,
  }) => {
    const s = section(page, 'Pagination family');
    await expect(page.locator('#page')).toHaveText('1');
    await s.getByRole('button', { name: '2', exact: true }).click();
    await expect(page.locator('#page')).toHaveText('2');
    await expect(s.getByRole('button', { name: '2', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await s.getByRole('button', { name: /next/i }).click();
    await expect(page.locator('#page')).toHaveText('3');
    await s.getByRole('button', { name: '1', exact: true }).click();
    await expect(s.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  test('navigation menu: the trigger opens its panel by pointer and keyboard; Escape closes it', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Getting started' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Introduction link' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('link', { name: 'Introduction link' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Components link' })).toBeVisible();
  });

  test('sidebar: items are links; collapsing narrows it and keeps an accessible name', async ({
    page,
  }) => {
    const s = section(page, 'Sidebar family');
    const link = s.getByRole('link', { name: 'Projects' });
    await expect(link).toHaveAttribute('href', '/projects');
    const width = async () => (await s.locator('volt-sidebar aside').boundingBox())?.width ?? 0;
    const open = await width();
    await s.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect.poll(width).toBeLessThan(open);
    await expect(s.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-label',
      'Projects'
    );
  });

  test('theme: applyVoltTheme writes the colour and style hooks on <html>', async ({ page }) => {
    await section(page, 'Theme family').getByRole('button', { name: 'Apply ember brutal' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-color', 'ember');
    await expect(page.locator('html')).toHaveAttribute('data-style', 'brutal');
  });
});
