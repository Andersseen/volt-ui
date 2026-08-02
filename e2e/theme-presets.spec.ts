import { test, expect, type Page } from '@playwright/test';

/**
 * v0.8 Phase 1 requirement: "Verify every component respects .dark +
 * data-color/data-style — one e2e that cycles a representative page through
 * presets and asserts key computed styles change."
 *
 * This drives the real header controls (not a raw `data-*` attribute
 * override) so it also exercises the theme-switcher UI itself, and it reads
 * computed styles off a live rendered button — the same signal a human
 * would notice as "the theme didn't change" if the CSS pipeline regresses
 * (e.g. the docs app's styles.css silently drifting from the token source
 * in projects/volt/src/themes/, which is exactly what happened before v0.8).
 */

const COLOR_OPTIONS = ['Ember', 'Sage', 'Dusk', 'Glacier'] as const;
const STYLE_OPTIONS = ['Soft', 'Brutal', 'Ghost', 'Retro'] as const;

function colorTrigger(page: Page) {
  return page.locator('button[ngpSelect]').first();
}

function styleTrigger(page: Page) {
  return page.locator('button[ngpSelect]').nth(1);
}

/** Open a volt-select trigger and pick an option, waiting out the portal's
 * open/close transition so the next interaction doesn't race a stale DOM. */
async function selectOption(page: Page, trigger: ReturnType<typeof colorTrigger>, name: string) {
  await trigger.click();
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await listbox.getByRole('option', { name }).click();
  await expect(listbox).toBeHidden();
}

async function readTokens(page: Page) {
  return page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      dataColor: document.documentElement.getAttribute('data-color'),
      dataStyle: document.documentElement.getAttribute('data-style'),
      isDark: document.documentElement.classList.contains('dark'),
      primary: style.getPropertyValue('--primary').trim(),
      radius: style.getPropertyValue('--radius').trim(),
      background: style.getPropertyValue('--background').trim(),
    };
  });
}

test.describe('Theme preset cycling', () => {
  test.beforeEach(async ({ page }) => {
    // Desktop viewport: the color/style pickers are hidden below the lg/xl
    // breakpoints in the header (see src/app/components/theme-switcher.ts).
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/button');
    await expect(page.getByRole('button', { name: 'Solid' })).toBeVisible();
  });

  test('cycling data-color changes computed color tokens on a live page', async ({ page }) => {
    const baseline = await readTokens(page);
    expect(baseline.dataColor).toBe('volt');

    let previousPrimary = baseline.primary;
    for (const color of COLOR_OPTIONS) {
      await selectOption(page, colorTrigger(page), color);

      const tokens = await readTokens(page);
      expect(tokens.dataColor).toBe(color.toLowerCase());
      // Each preset has a distinct hue, so --primary must differ from the
      // previous preset's value — this is what would fail silently if the
      // docs app's stylesheet stopped tracking the library's theme source.
      expect(tokens.primary).not.toBe(previousPrimary);
      previousPrimary = tokens.primary;
    }
  });

  test('cycling data-style changes computed shape/radius tokens', async ({ page }) => {
    let previousRadius = (await readTokens(page)).radius;
    for (const style of STYLE_OPTIONS) {
      await selectOption(page, styleTrigger(page), style);

      const tokens = await readTokens(page);
      expect(tokens.dataStyle).toBe(style.toLowerCase());
      expect(tokens.radius).not.toBe(previousRadius);
      previousRadius = tokens.radius;
    }

    // Brutal is the sharp-corner preset — pin the concrete value so this
    // test also catches a wrong preset being wired up, not just "changed".
    // (Already selected last in the loop above when STYLE_OPTIONS ends in
    // 'Retro' it would not be; re-select explicitly for a stable assertion.)
    await selectOption(page, styleTrigger(page), 'Brutal');
    // Custom properties report their raw authored value, not a resolved
    // length — brutal.css literally writes `--radius: 0;` (no unit).
    expect((await readTokens(page)).radius).toBe('0');
  });

  test('toggling dark mode flips the .dark class and background token', async ({ page }) => {
    const light = await readTokens(page);
    expect(light.isDark).toBe(false);

    await page.getByRole('button', { name: 'Toggle dark mode' }).click();

    const dark = await readTokens(page);
    expect(dark.isDark).toBe(true);
    expect(dark.background).not.toBe(light.background);
  });
});
