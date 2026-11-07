import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

/**
 * "On this page": one active entry that follows the reading position, a click that lands the
 * heading below the sticky header and puts it in the URL, a hash that resolves on load, and an
 * active treatment that takes its shape from the style preset instead of forcing square corners.
 */
const toc = (page: Page) => page.getByRole('navigation', { name: 'On this page' });

async function setStyle(page: Page, style: string, dark = false): Promise<void> {
  await page.evaluate(
    ([s, d]) => {
      document.documentElement.setAttribute('data-style', s as string);
      document.documentElement.classList.toggle('dark', d as boolean);
    },
    [style, dark] as const
  );
}

test.describe('docs table of contents', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('one active entry, rounded like the preset, hover lighter than active, own focus ring', async ({
    page,
  }) => {
    await page.goto('/docs/components/navigation-menu');
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    const entries = toc(page).getByRole('button');
    await expect(entries.first()).toBeVisible();
    await expect(toc(page).locator('[aria-current="location"]')).toHaveCount(1);

    const radii: Record<string, string> = {};
    for (const style of ['sharp', 'soft', 'brutal', 'ghost', 'retro']) {
      await setStyle(page, style, style === 'soft');
      const active = toc(page).locator('[aria-current="location"]');
      const idle = toc(page).locator('button:not([aria-current])').first();
      const css = (el: typeof active, p: string) =>
        el.evaluate((e, prop) => getComputedStyle(e).getPropertyValue(prop), p);

      radii[style] = await css(active, 'border-top-left-radius');
      const activeBg = await css(active, 'background-color');
      expect(activeBg, `${style}: active entry has no surface`).not.toMatch(/, 0\)$|^transparent$/);

      await page.mouse.move(0, 0);
      const idleBg = await css(idle, 'background-color');
      await idle.hover();
      const hoverBg = await css(idle, 'background-color');
      expect(hoverBg, `${style}: hover does nothing`).not.toBe(idleBg);
      expect(hoverBg, `${style}: hover looks the same as active`).not.toBe(activeBg);
      await page.mouse.move(0, 0);
    }
    // The radius comes from the preset: the presets disagree, and the rounded ones are not 0.
    expect(new Set(Object.values(radii)).size).toBeGreaterThan(1);
    expect(parseFloat(radii['soft'])).toBeGreaterThan(0);

    const first = entries.first();
    await first.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(first).toBeFocused();
    expect(await first.evaluate(e => e.matches(':focus-visible'))).toBe(true);
    expect(await first.evaluate(e => getComputedStyle(e).boxShadow)).not.toBe('none');
  });

  test('a click lands the heading below the sticky header, marks it and updates the URL', async ({
    page,
  }) => {
    await page.goto('/docs/components/navigation-menu');
    const last = toc(page).getByRole('button').last();
    const name = (await last.textContent())!.trim();

    await last.click();

    await expect(last).toHaveAttribute('aria-current', 'location');
    await expect(toc(page).locator('[aria-current="location"]')).toHaveCount(1);
    await expect(page).toHaveURL(/#.+$/);
    const hash = new URL(page.url()).hash.slice(1);
    const heading = page.locator(`[id="${hash}"]`);
    await expect(heading).toHaveText(name);
    const header = await page.locator('header').first().boundingBox();
    const top = (await heading.boundingBox())!.y;
    expect(top).toBeGreaterThanOrEqual(header!.height - 1);
    // No focus theft: the clicked entry keeps focus, the page does not jump it elsewhere.
    await expect(last).toBeFocused();
  });

  test('scrolling moves the active entry; a #heading deep link resolves on load', async ({
    page,
  }) => {
    await page.goto('/docs/components/navigation-menu');
    const active = toc(page).locator('[aria-current="location"]');
    const initial = (await active.textContent())!.trim();
    await page.mouse.wheel(0, 2400);
    await expect.poll(async () => (await active.textContent())!.trim()).not.toBe(initial);
    await expect(active).toHaveCount(1);

    const target = toc(page).getByRole('button').nth(1);
    await target.click();
    const url = page.url();
    await page.goto('about:blank');
    await page.goto(url);
    const hash = new URL(url).hash.slice(1);
    await expect
      .poll(() => page.locator(`[id="${hash}"]`).evaluate(e => e.getBoundingClientRect().top))
      .toBeLessThan(200);
    await expect(toc(page).locator('[aria-current="location"]')).toHaveText(
      (await target.textContent())!.trim()
    );
  });

  test('localized headings are listed in the page language', async ({ page }) => {
    await page.goto('/es/docs/components/spinner');
    const nav = page.getByRole('navigation', { name: 'En esta página' });
    await expect(nav.getByRole('button', { name: 'Notas de uso' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Usage notes' })).toHaveCount(0);
  });
});
