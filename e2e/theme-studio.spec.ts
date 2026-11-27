import { readFileSync } from 'node:fs';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './fixtures';

/** The project the consumer harness themes a real app with (e2e/contracts/theme-custom.spec.ts). */
const PROJECT_TEXT = readFileSync(
  new URL('./consumer/src/themes/acme.theme.json', import.meta.url),
  'utf8'
);
const PROJECT = JSON.parse(PROJECT_TEXT);

const hex = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.fillStyle = getComputedStyle(el).getPropertyValue(name);
    return context.fillStyle;
  }, property);
const css = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

/** Waits for hydration: a click before it lands on server-rendered markup with no listeners. */
async function ready(page: Page) {
  await expect(page.getByRole('toolbar', { name: 'Draft' })).toBeVisible();
  await expect(page.getByTestId('draft-state')).toHaveText(/No unsaved changes|Unsaved changes/);
  await page.waitForFunction(() => document.querySelector('style[data-theme-studio-preview]'));
  await page.waitForLoadState('networkidle');
}

test.describe('Theme studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-theme');
    await ready(page);
  });

  test('updates the generated theme while preserving the live preview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Design your system.' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Theme name' }).fill('Northern Lights');

    await expect(page.getByText(":root[data-color='northern-lights']")).toBeVisible();
    await expect(page.getByText('northern-lights.css', { exact: true }).first()).toBeVisible();

    await page.getByRole('switch', { name: 'Dark preview' }).click();
    await expect(page.getByRole('switch', { name: 'Dark preview' })).toBeChecked();
  });

  test('the exported stylesheet themes a page that knows nothing of the studio', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const primary = await page.getByLabel('Primary', { exact: true }).first().inputValue();
    await page.getByRole('button', { name: /copy/i }).first().click();
    const css = await page.evaluate(() => navigator.clipboard.readText());
    expect(css).toContain("[data-volt-theme][data-color='custom-theme']");

    await page.goto('/docs/components/button');
    // After hydration: the site's theme switcher writes <html> once it boots.
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    await page.addStyleTag({ content: css });
    await page.evaluate(() => {
      const root = document.documentElement;
      root.classList.remove('dark');
      root.dataset.color = 'custom-theme';
    });

    const button = page.getByRole('button', { name: 'Solid' }).first();
    const painted = await button.evaluate(el => {
      const style = getComputedStyle(el);
      const canvas = document.createElement('canvas').getContext('2d')!;
      canvas.fillStyle = style.backgroundColor;
      return { fill: canvas.fillStyle, radius: style.borderTopLeftRadius, shadow: style.boxShadow };
    });
    expect(painted.fill).toBe(primary);
    expect(painted.radius).toBe('6px');
    expect(painted.shadow).toMatch(/1px 2px/);
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

    await expect(page.getByRole('alert').filter({ hasText: 'No palette found' })).toBeVisible();
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

  test('a project opened in the studio paints the preview exactly as the exported app', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'Or paste the project JSON' }).fill(PROJECT_TEXT);
    await page.getByRole('button', { name: 'Open project' }).click();
    await page.getByText('Settings form').click();
    const preview = page.getByTestId('theme-preview');
    const save = preview.getByRole('button', { name: 'Save changes' });
    const input = preview.getByRole('textbox', { name: 'Workspace name' });

    // The values theme-custom.spec.ts measures in the consumer app built from the same export.
    for (const mode of ['light', 'dark'] as const) {
      if (mode === 'dark') await page.getByRole('switch', { name: 'Dark preview' }).click();
      await expect.poll(() => hex(save, 'background-color')).toBe(PROJECT[mode].primary);
      expect(await hex(save, 'color')).toBe(PROJECT[mode].primaryForeground);
      expect(await css(save, 'border-top-left-radius')).toBe(`${PROJECT.shape.radius}px`);
      expect(await css(save, 'border-top-width')).toBe(`${PROJECT.shape.borderWidth}px`);
      expect(await css(input, 'border-top-width')).toBe(`${PROJECT.shape.borderWidth}px`);
    }
    // Source order is what makes the export's overrides win over the style, as in an app.
    expect(
      await page.evaluate(() =>
        document.head.lastElementChild?.hasAttribute('data-theme-studio-preview')
      )
    ).toBe(true);
  });

  test('preview overlays carry the draft and leave the site theme alone', async ({ page }) => {
    const before = await page.evaluate(
      () => document.documentElement.outerHTML.match(/<html[^>]*>/)?.[0]
    );
    await page.getByText('Data and overlays').click();
    const preview = page.getByTestId('theme-preview');
    await preview.getByRole('button', { name: 'Actions for INV-1042' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit INV-1042' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('xpath=ancestor-or-self::*[@data-color][1]')).toHaveAttribute(
      'data-color',
      'studio-preview'
    );

    await dialog.getByRole('combobox', { name: 'Status' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(preview.getByRole('button', { name: 'Actions for INV-1042' })).toBeFocused();
    expect(
      await page.evaluate(() => document.documentElement.outerHTML.match(/<html[^>]*>/)?.[0])
    ).toBe(before);
  });

  test('the contrast inspector leads from a failure to its token and a reversible fix', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Dark' }).click();
    const dark = page.getByRole('tabpanel', { name: 'Dark' });
    await dark
      .getByRole('textbox', { name: 'Ring hex value' })
      .fill(await dark.getByRole('textbox', { name: 'Background hex value' }).inputValue());
    await page.getByRole('tab', { name: 'Light' }).click();

    const item = page.locator('[data-result="dark:ring|background"]');
    await expect(item).toContainText('Fail');
    await expect(item).toContainText('1:1, needs 3:1');
    await item.getByRole('button', { name: 'Edit token' }).click();
    await expect(page.getByRole('tab', { name: 'Dark' })).toHaveAttribute('aria-selected', 'true');
    await expect(dark.getByLabel('Ring', { exact: true })).toBeFocused();

    await item.getByRole('button', { name: /^Change --ring from/ }).click();
    await expect(item).toHaveCount(0);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.locator('[data-result="dark:ring|background"]')).toContainText('Fail');
  });

  test('keeps a saved theme and the draft across a reload, in this browser only', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'Theme name' }).fill('Reload Check');
    await page.getByRole('button', { name: 'Save theme' }).click();
    await expect(page.getByTestId('draft-state')).toHaveText(/No unsaved changes/);
    await page
      .getByRole('tabpanel', { name: 'Light' })
      .getByRole('textbox', { name: 'Primary hex value' })
      .fill('#7c3aed');
    await expect(page.getByTestId('draft-state')).toHaveText(/Unsaved changes/);

    await page.reload();
    await ready(page);
    await expect(page.getByRole('textbox', { name: 'Theme name' })).toHaveValue('reload-check');
    await expect(
      page
        .getByRole('tabpanel', { name: 'Light' })
        .getByRole('textbox', { name: 'Primary hex value' })
    ).toHaveValue('#7c3aed');
    await expect(page.getByTestId('draft-state')).toHaveText(/Unsaved changes/);
    await expect(page.getByRole('list', { name: 'Saved themes' })).toContainText('reload-check');
  });
});
