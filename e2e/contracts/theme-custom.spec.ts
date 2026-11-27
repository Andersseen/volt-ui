import { readFileSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * A palette exported by Theme Studio (`e2e/consumer/src/themes/acme.css`, from `acme.theme.json`)
 * and declared with `voltCustomColor`, measured in the browser: the exported stylesheet itself, not
 * the studio's preview. Built-in and custom palettes nest either way, in either mode; density, a
 * style chosen beside the palette, portalled overlays, the whole page and the first-paint script.
 */
const project = JSON.parse(
  readFileSync(new URL('../consumer/src/themes/acme.theme.json', import.meta.url), 'utf8')
);

const css = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

/** A computed colour as `#rrggbb`, whatever syntax the engine reports it in. */
const hex = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.fillStyle = getComputedStyle(el).getPropertyValue(name);
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
  }, property);

/** Within one 8-bit step per channel: engines round colour conversions differently. */
const near = (actual: string, expected: string) => {
  const channels = (value: string) => [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
  const [a, e] = [channels(actual), channels(expected)];
  return a.every((c, i) => Math.abs(c - e[i]) <= 1);
};

async function open(page: Page) {
  await page.goto('/themes.html#custom');
  await expect(page.locator('#custom-light')).toBeVisible();
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
}

const button = (page: Page, scope: string) => page.locator(`#${scope} > volt-button button`);

test.describe('custom palette from Theme Studio', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('paints a light and a dark scope from the exported stylesheet', async ({ page }) => {
    const light = button(page, 'custom-light');
    expect(near(await hex(light, 'background-color'), project.light.primary)).toBe(true);
    expect(near(await hex(light, 'color'), project.light.primaryForeground)).toBe(true);
    // Shape overrides travel with the palette.
    expect(await css(light, 'border-top-left-radius')).toBe(`${project.shape.radius}px`);

    const dark = button(page, 'custom-dark');
    expect(near(await hex(dark, 'background-color'), project.dark.primary)).toBe(true);
    expect(near(await hex(dark, 'color'), project.dark.primaryForeground)).toBe(true);
    await expect(page.locator('#custom-dark')).toHaveClass(/\bdark\b/);

    // The page outside the scopes keeps the default palette.
    expect(
      near(await hex(button(page, 'outside'), 'background-color'), project.light.primary)
    ).toBe(false);
    expect(await page.locator('html').getAttribute('data-color')).toBeNull();
  });

  test('nests both ways with the built-in palettes', async ({ page }) => {
    // A light custom scope inside a dark built-in one.
    const nestedCustom = button(page, 'nested-custom-light');
    expect(near(await hex(nestedCustom, 'background-color'), project.light.primary)).toBe(true);
    await expect(page.locator('#nested-custom-light')).toHaveAttribute('data-mode', 'light');

    // A light built-in scope inside a dark custom one paints exactly like a top-level one.
    expect(await hex(button(page, 'nested-builtin-light'), 'background-color')).toBe(
      await hex(button(page, 'ref-sage'), 'background-color')
    );
  });

  test('takes density and a style from the app, the palette from the export', async ({ page }) => {
    const regular = parseFloat(await css(button(page, 'custom-light'), 'height'));
    const compact = parseFloat(await css(button(page, 'custom-compact'), 'height'));
    expect(compact).toBeLessThan(regular);

    // The export overrides radius and border; the rest of Brutal (offset ink shadow) still applies.
    const brutal = button(page, 'custom-brutal');
    expect(near(await hex(brutal, 'background-color'), project.light.primary)).toBe(true);
    expect(await css(brutal, 'border-top-left-radius')).toBe(`${project.shape.radius}px`);
  });

  test('carries the custom palette into portalled overlays', async ({ page }) => {
    await page.getByRole('button', { name: 'Open custom dialog' }).click();
    const dialog = page.locator('[data-scoped="custom-dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-color', 'acme');
    await expect(dialog).toHaveClass(/\bdark\b/);
    expect(near(await hex(dialog, '--primary'), project.dark.primary)).toBe(true);

    await page.getByRole('combobox', { name: 'Custom fruit' }).click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(listbox.locator('xpath=ancestor-or-self::*[@data-color][1]')).toHaveAttribute(
      'data-color',
      'acme'
    );
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('themes the whole page through applyVoltTheme', async ({ page }) => {
    await page.locator('#apply-root').click();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-color', 'acme');
    await expect(html).toHaveAttribute('data-density', 'compact');
    expect(
      near(await hex(button(page, 'outside'), 'background-color'), project.light.primary)
    ).toBe(true);
  });

  test('restores a stored custom palette before first paint, and ignores a tampered one', async ({
    page,
  }) => {
    await page.locator('#persist').click();
    const restored = await page.evaluate(() => {
      const root = document.documentElement;
      root.removeAttribute('data-color');
      root.classList.remove('dark');
      new Function((globalThis as { voltCustomThemeScript?: string }).voltCustomThemeScript!)();
      return [root.getAttribute('data-color'), root.classList.contains('dark')];
    });
    expect(restored).toEqual(['acme', true]);

    const tampered = await page.evaluate(() => {
      const root = document.documentElement;
      root.removeAttribute('data-color');
      localStorage.setItem('volt-theme', JSON.stringify({ color: "acme'],body{" }));
      new Function((globalThis as { voltCustomThemeScript?: string }).voltCustomThemeScript!)();
      return root.getAttribute('data-color');
    });
    expect(tampered).toBeNull();
  });
});
