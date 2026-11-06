import { expect, test, type Locator } from '@playwright/test';

/**
 * The gallery of `e2e/consumer/src/themes`, through the CLI's source transform: copied components
 * must paint the same as the package, because they read the same tokens. The numbers are the ones
 * `e2e/contracts/theme-matrix.spec.ts` proves for the npm path.
 */
const css = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

test('copied components follow every style and mode', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/themes.html');
  const card = page.locator('[data-part="card"]');
  await expect(card).toBeVisible();
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });

  const button = page.locator('[data-part="button-outline"] button');
  const input = page.locator('[data-part="input"] input');
  const track = page.locator('[data-part="progress"] [ngpProgressTrack]');

  const expected = {
    sharp: { radius: '6px', border: '1px', input: '1px', card: '1px' },
    brutal: { radius: '0px', border: '2px', input: '2px', card: '2px' },
    ghost: { radius: '8px', border: '1px', input: '1px', card: '0px' },
  };

  for (const [style, values] of Object.entries(expected)) {
    for (const dark of [false, true]) {
      await page.evaluate(
        ([s, d]) => {
          document.documentElement.dataset.color = 'sage';
          document.documentElement.dataset.style = s as string;
          document.documentElement.classList.toggle('dark', d as boolean);
        },
        [style, dark]
      );
      expect(await css(button, 'border-top-left-radius'), style).toBe(values.radius);
      expect(await css(button, 'border-top-width'), style).toBe(values.border);
      expect(await css(input, 'border-top-width'), style).toBe(values.input);
      expect(await css(card, 'border-top-width'), style).toBe(values.card);
      expect(await css(track, 'background-color'), style).not.toBe('rgba(0, 0, 0, 0)');
    }
  }

  // A hash change alone would not boot the fixture again.
  await page.goto('about:blank');
  await page.goto('/themes.html#scope');
  await expect(page.locator('#island')).toHaveAttribute('data-color', 'ember');
  await page.getByRole('button', { name: 'Open popover' }).click();
  await expect(page.locator('[data-scoped="popover"]')).toHaveAttribute('data-style', 'brutal');
  expect(errors).toEqual([]);
});
