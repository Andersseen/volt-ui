import { expect, test, type Locator, type Page } from '@playwright/test';

/** `voltTheme` on one element: the rest of the page stays, portalled overlays come along. */
const css = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

async function open(page: Page) {
  await page.goto('/themes.html#scope');
  await expect(page.locator('#island')).toBeVisible();
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
}

const expectIslandSurface = async (overlay: Locator) => {
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveAttribute('data-color', 'ember');
  await expect(overlay).toHaveAttribute('data-style', 'brutal');
  await expect(overlay).toHaveClass(/\bdark\b/);
  expect(await css(overlay, 'border-top-left-radius')).toBe('0px');
  // Dark Ember's raised surface, not the light Volt page around the portal.
  const [r, g, b] = (await overlay.evaluate(el => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.fillStyle = getComputedStyle(el).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  })) as number[];
  expect(r + g + b, 'a dark surface').toBeLessThan(240);
};

test.describe('voltTheme scope', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('themes the island and leaves its neighbours and the page alone', async ({ page }) => {
    const inside = page.locator('#inside button');
    const before = page.locator('#before button');
    const after = page.locator('#after button');

    expect(await css(inside, 'border-top-left-radius')).toBe('0px');
    expect(await css(inside, 'border-top-width')).toBe('2px');
    expect(await css(before, 'border-top-left-radius')).toBe('6px');
    expect(await css(before, 'background-color')).toBe(await css(after, 'background-color'));
    expect(await css(inside, 'background-color')).not.toBe(await css(before, 'background-color'));

    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    expect(await html.getAttribute('data-color')).toBeNull();

    // The compact density reaches the island only.
    expect(parseFloat(await css(inside, 'height'))).toBeLessThan(
      parseFloat(await css(before, 'height'))
    );
  });

  test('a light scope stays light inside a dark page', async ({ page }) => {
    await page.locator('#flip').click();
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const island = page.locator('#island');
    await expect(island).toHaveAttribute('data-mode', 'light');
    const lightness = await island.evaluate(el => {
      const context = document.createElement('canvas').getContext('2d')!;
      context.fillStyle = getComputedStyle(el).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1).data[0];
    });
    expect(lightness).toBeGreaterThan(200);
  });

  test('changes with its inputs', async ({ page }) => {
    await page.locator('#flip').click();
    await expect(page.locator('#island')).toHaveAttribute('data-style', 'soft');
    expect(await css(page.locator('#inside button'), 'border-top-left-radius')).toBe('14px');
  });

  test('popover, menu, select, tooltip and dialog keep the theme outside the scope', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open popover' }).click();
    await expectIslandSurface(page.locator('[data-scoped="popover"]'));
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expectIslandSurface(page.locator('[data-scoped="menu"]'));
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Hover tip' }).hover();
    const tip = page.locator('[data-scoped="tip"]');
    await expect(tip).toBeVisible();
    await expect(tip).toHaveAttribute('data-color', 'ember');
    await page.mouse.move(0, 0);

    await page.getByRole('combobox', { name: 'Scoped fruit' }).click();
    await expectIslandSurface(page.locator('[ngpSelectDropdown]'));
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expectIslandSurface(page.locator('[data-scoped="dialog"]'));
  });

  test('a portalled overlay really is outside the island', async ({ page }) => {
    await page.getByRole('button', { name: 'Open popover' }).click();
    const popover = page.locator('[data-scoped="popover"]');
    await expect(popover).toBeVisible();
    expect(await popover.evaluate(el => !!el.closest('#island'))).toBe(false);
  });
});

test.describe('consumer overrides', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('a class beats the tokens on the part that paints, in every style', async ({ page }) => {
    for (const style of ['sharp', 'soft', 'brutal', 'ghost', 'retro']) {
      await page.evaluate(s => (document.documentElement.dataset.style = s), style);
      const button = page.locator('#overrides button');
      expect(await css(button, 'height'), style).toBe('56px');
      expect(await css(button, 'border-top-left-radius'), style).toBe('0px');
      expect(await css(button, 'border-top-width'), style).toBe('4px');
      expect(await css(button, 'padding-left'), style).toBe('8px');

      const input = page.locator('#overrides input');
      expect(await css(input, 'height'), style).toBe('56px');
      expect(await css(input, 'border-top-width'), style).toBe('4px');
    }
  });
});
