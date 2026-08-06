import { test, expect } from '@playwright/test';

test.describe('Theme studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-theme');
  });

  test('updates the generated theme while preserving the live preview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Design your system.' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Theme name' }).fill('Northern Lights');

    await expect(page.getByText(":root[data-color='northern-lights']")).toBeVisible();
    await expect(page.getByRole('heading', { name: 'northern-lights' })).toBeVisible();

    await page.getByRole('switch', { name: 'Dark preview' }).click();
    await expect(page.getByRole('switch', { name: 'Dark preview' })).toBeChecked();
  });

  test('generates a new palette on demand and feeds it to the preview', async ({ page }) => {
    const primary = page.getByLabel('Primary', { exact: true }).first();
    const before = await primary.inputValue();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(primary).not.toHaveValue(before);

    // The generated color has to reach the exported CSS, not just the swatch input.
    const generated = await primary.inputValue();
    await expect(page.getByText(`--primary: ${generated};`)).toBeVisible();
    await expect(page.getByText(/seed \w+ · hue \d+°/)).toBeVisible();
  });

  test('imports a Palette Crafter export and links back to the tool', async ({ page }) => {
    const crafterExport = JSON.stringify({
      theme: {
        bg: '#f9fafd',
        fg: '#151822',
        primary: { '400': '#899dff', '950': '#181e55', DEFAULT: '#4c5bc9', foreground: '#ffffff' },
        secondary: { '400': '#ba8af6', DEFAULT: '#8154b5', foreground: '#ffffff' },
        status: {
          info: { DEFAULT: '#0c68c2' },
          success: { DEFAULT: '#007f38' },
          warning: { DEFAULT: '#896100' },
          danger: { DEFAULT: '#be2323' },
        },
      },
      meta: { mode: 'light', baseHue: 273, harmony: 'analogous', seed: 'palette-crafter-home' },
    });

    await page.getByRole('button', { name: 'Import from Palette Crafter' }).click();
    await page.getByRole('textbox', { name: /Paste the JSON export/ }).fill(crafterExport);
    await page.getByRole('button', { name: 'Apply palette' }).click();

    await expect(page.getByLabel('Primary', { exact: true }).first()).toHaveValue('#4c5bc9');
    await expect(page.getByText('--primary: #4c5bc9;')).toBeVisible();

    // The whole point of the integration is the link back — assert it survives.
    const link = page.getByRole('link', { name: /Palette Crafter/ }).first();
    await expect(link).toHaveAttribute(
      'href',
      /^https:\/\/palette-crafter\.andersseen\.dev\/\?.*seed=palette-crafter-home/
    );
  });

  test('rejects a paste that is not a Palette Crafter export', async ({ page }) => {
    await page.getByRole('button', { name: 'Import from Palette Crafter' }).click();
    await page.getByRole('textbox', { name: /Paste the JSON export/ }).fill('{ "nope": true }');
    await page.getByRole('button', { name: 'Apply palette' }).click();

    await expect(page.getByRole('alert')).toContainText('No palette found');
  });

  test('keeps the preview panel pinned while the editor scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    const panel = page.getByRole('heading', { name: 'Live preview' });
    await expect(panel).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1200));
    // An overflow:hidden ancestor silently disables position:sticky, which is exactly
    // how this panel used to scroll away.
    await expect(panel).toBeInViewport();
  });

  test('fits the editor and preview within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
    await expect(page.getByRole('heading', { name: 'Live preview' })).toBeVisible();
  });
});
