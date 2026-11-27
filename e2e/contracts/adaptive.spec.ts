import { expect, test, type Page } from '@playwright/test';
import { TAB_SKIPS_BUTTONS } from './helpers';

/**
 * Plan 08 E.1 — a settings composition with long Spanish and Ukrainian labels
 * (`e2e/consumer/src/contracts/adaptive.ts`): Input, Textarea, Form Field, Select, Combobox,
 * navigation, a table, actions, and the same form in a Dialog and a Drawer.
 *
 * Measured separately, because they are different things:
 *  - **Reflow** (WCAG 1.4.10): a 320 CSS px viewport, which is what 1280 px at 400 % zoom lays out.
 *  - **200 % zoom, emulated**: CSS `zoom: 2` on `<html>` at 1280 px. It reflows like browser zoom
 *    in these engines, but it is not the browser's own zoom; manual zoom is recorded separately
 *    (docs/quality/manual-a11y-checklist.md).
 *  - **Forced colours** (Chromium only: the other engines cannot emulate it).
 * The table is two-dimensional content and may scroll inside its own region; nothing else may.
 */
const STYLES = ['sharp', 'soft', 'brutal', 'ghost', 'retro'] as const;

async function open(page: Page, width: number, theme: Record<string, string | boolean> = {}) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto('/contracts.html#adaptive');
  await expect(page.locator('#adaptive')).toBeVisible();
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  await page.evaluate(({ style, density, dark }) => {
    const root = document.documentElement;
    if (style) root.dataset['style'] = style as string;
    if (density) root.dataset['density'] = density as string;
    root.classList.toggle('dark', dark === true);
  }, theme);
}

/** Everything interactive or labelling that lies outside the viewport horizontally. */
async function offscreen(page: Page, region: string) {
  return page.evaluate(selector => {
    const width = document.documentElement.clientWidth;
    const targets = document.querySelectorAll(
      `${selector} :is(button, input, textarea, label, a, [role=combobox], [role=tab], h2, p)`
    );
    return [...targets]
      .filter(el => !el.closest('[data-region=table]'))
      .map(el => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && (box.right > width + 0.5 || box.left < -0.5))
      .map(
        ({ el, box }) =>
          `${(el.textContent || el.tagName).trim().slice(0, 40)} → ${Math.round(box.right)}px`
      );
  }, region);
}

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('reflow at 320 CSS px', () => {
  for (const style of STYLES) {
    for (const dark of [false, true]) {
      test(`${style}${dark ? ' dark' : ''}: page, dialog and drawer keep every control in view`, async ({
        page,
      }) => {
        await open(page, 320, { style, dark });
        expect(await pageOverflow(page)).toBe(0);
        expect(await offscreen(page, '#adaptive')).toEqual([]);

        await page.locator('#open-dialog').click();
        const dialog = page.locator('[data-region=dialog]');
        await expect(dialog).toBeVisible();
        expect(await offscreen(page, '[data-region=dialog]')).toEqual([]);
        // Taller than the viewport: it scrolls, and its last action is reachable.
        const close = dialog.getByRole('button', { name: 'Cerrar sin guardar' });
        await close.scrollIntoViewIfNeeded();
        await expect(close).toBeInViewport();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();

        await page.locator('#open-drawer').click();
        const drawer = page.locator('[data-region=drawer]');
        await expect(drawer).toBeVisible();
        expect(await offscreen(page, '[data-region=drawer]')).toEqual([]);
        await expect(drawer.getByRole('button', { name: 'Закрити панель' })).toBeInViewport();
      });
    }
  }

  for (const density of ['compact', 'comfortable', 'spacious']) {
    test(`density ${density} reflows too`, async ({ page }) => {
      await open(page, 320, { density });
      expect(await pageOverflow(page)).toBe(0);
      expect(await offscreen(page, '#adaptive')).toEqual([]);
    });
  }

  test('long labels wrap instead of being cut', async ({ page }) => {
    await open(page, 320);
    const save = page.getByRole('button', { name: 'Guardar y continuar con la configuración' });
    const fit = await save.evaluate(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines = new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
      return {
        lines,
        clippedX: el.scrollWidth > el.clientWidth + 1,
        clippedY: el.scrollHeight > el.clientHeight + 1,
      };
    });
    expect(fit).toEqual({ lines: 2, clippedX: false, clippedY: false });
    // A one-line button keeps exactly its control height.
    const one = await page.getByRole('button', { name: 'Cancelar' }).first().boundingBox();
    expect(one!.height).toBe(40);
  });
});

test.describe('200 % zoom, emulated with CSS zoom', () => {
  test('page, dialog and drawer stay within the viewport', async ({ page }) => {
    await open(page, 1280);
    await page.evaluate(() => (document.documentElement.style.zoom = '2'));
    expect(await pageOverflow(page)).toBe(0);
    expect(await offscreen(page, '#adaptive')).toEqual([]);

    await page.locator('#open-dialog').click();
    await expect(page.locator('[data-region=dialog]')).toBeVisible();
    expect(await offscreen(page, '[data-region=dialog]')).toEqual([]);
    await page.keyboard.press('Escape');

    await page.locator('#open-drawer').click();
    await expect(page.locator('[data-region=drawer]')).toBeVisible();
    expect(await offscreen(page, '[data-region=drawer]')).toEqual([]);
  });
});

test.describe('visible focus', () => {
  /** What the keyboard user sees on the focused element: an outline or a ring (box-shadow). */
  const indicator = (page: Page) =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      const ring =
        style.boxShadow !== 'none' &&
        !/^(rgba\(0, 0, 0, 0\) 0px 0px 0px 0px,? ?)+$/.test(style.boxShadow);
      return {
        name: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName,
        outline,
        ring,
      };
    });

  for (const forced of [false, true]) {
    test(`every control in the form shows focus${forced ? ' in forced colours' : ''}`, async ({
      page,
      browserName,
    }) => {
      test.skip(forced && browserName !== 'chromium', 'Only Chromium emulates forced colours.');
      test.skip(browserName === TAB_SKIPS_BUTTONS, 'Safari does not Tab to buttons by default');
      if (forced) await page.emulateMedia({ forcedColors: 'active' });
      await open(page, 1024);
      await page.locator('#adaptive [role=tab]').first().focus();
      const missing: string[] = [];
      for (let i = 0; i < 9; i++) {
        const seen = await indicator(page);
        // Forced colours removes box-shadow, so only an outline counts there.
        if (!(seen.outline || (!forced && seen.ring))) missing.push(seen.name);
        await page.keyboard.press('Tab');
      }
      expect(missing).toEqual([]);
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('overlays open without animating', async ({ page }) => {
    await open(page, 1024);
    await page.locator('#open-dialog').click();
    const dialog = page.locator('[data-region=dialog]');
    await expect(dialog).toBeVisible();
    const running = await dialog.evaluate(
      el =>
        el.getAnimations({ subtree: true }).filter(a => {
          const timing = a.effect?.getComputedTiming();
          return Number(timing?.duration ?? 0) > 1;
        }).length
    );
    expect(running).toBe(0);
  });
});
