import { expect, test, type Locator, type Page } from '@playwright/test';
import { load, paint, style } from './helpers';

/**
 * Navigation Menu presentation, Date Picker pointer/range behaviour, and the Spinner and Empty State
 * stability bar — measured in real engines against the packed package. Computed styles and
 * behaviour, never pixels: each assertion says what must differ or hold, not which colour it is.
 * Screenshots are attached to the report as evidence only.
 */

const VARIANTS = ['subtle', 'pill', 'underline', 'outline'] as const;
const THEMES = [
  ['volt', 'sharp', false],
  ['dusk', 'soft', true],
  ['sage', 'brutal', true],
  ['glacier', 'ghost', false],
  ['ember', 'retro', true],
] as const;

async function noTransitions(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '*, *::before, *::after { transition: none !important; animation-play-state: paused; }',
  });
}

async function applyTheme(page: Page, color: string, styleName: string, dark: boolean) {
  await page.evaluate(
    ([c, s, d]) => {
      const root = document.documentElement;
      root.setAttribute('data-color', c as string);
      root.setAttribute('data-style', s as string);
      root.classList.toggle('dark', d as boolean);
    },
    [color, styleName, dark] as const
  );
}

function after(locator: Locator, property: string): Promise<string> {
  return locator.evaluate(
    (el, prop) => getComputedStyle(el, '::after').getPropertyValue(prop),
    property
  );
}

/**
 * Luminance contrast between an element's background (composited over `surface`) and the surface
 * itself. Colours are resolved by the engine through a canvas, so oklch/oklab and alpha all work.
 */
async function contrastOver(el: Locator, surface: Locator): Promise<number> {
  return el.evaluate(
    (node, surfaceNode) => {
      const ctx = document.createElement('canvas').getContext('2d')!;
      const rgba = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#000';
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      const base = rgba(getComputedStyle(surfaceNode as Element).backgroundColor);
      const top = rgba(getComputedStyle(node).backgroundColor);
      const a = top[3] / 255;
      const mixed = [0, 1, 2].map(i => top[i] * a + base[i] * (1 - a));
      const lum = (c: number[]) =>
        c
          .map(v => v / 255)
          .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const [l1, l2] = [lum(mixed), lum(base.slice(0, 3))].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    },
    await surface.elementHandle()
  );
}

test.describe('navigation menu variants', () => {
  for (const variant of VARIANTS) {
    test(`${variant}: the current page is visibly marked, and stays marked on hover and focus`, async ({
      page,
    }, info) => {
      await load(page, `nav-variants?variant=${variant}`);
      await noTransitions(page);
      const nav = page.getByRole('navigation', { name: 'Primary' });
      await expect(nav).toHaveAttribute('data-variant', variant);

      const current = nav.getByRole('link', { name: 'Docs' });
      const other = nav.getByRole('link', { name: 'Home' });
      await expect(current).toHaveAttribute('aria-current', 'page');
      await expect(other).not.toHaveAttribute('aria-current');

      const mark = async (l: Locator) => `${await paint(l)}|${await after(l, 'background-color')}`;
      const activeRest = await mark(current);
      expect(activeRest, 'active and inactive paint identically').not.toBe(await mark(other));

      // Hovering the active item must not make it look like any other hovered item.
      await other.hover();
      const otherHovered = await mark(other);
      await current.hover();
      expect(await mark(current), 'active + hover looks like plain hover').not.toBe(otherHovered);
      await page.mouse.move(0, 0);

      // The active item never changes size: switching the current page leaves the bar where it was.
      const before = await nav.boundingBox();
      const width = (await current.boundingBox())!.width;
      await page.locator('#move-current').click();
      await expect(current).not.toHaveAttribute('aria-current');
      await expect(other).toHaveAttribute('aria-current', 'page');
      expect((await current.boundingBox())!.width).toBeCloseTo(width, 0);
      expect((await nav.boundingBox())!.width).toBeCloseTo(before!.width, 0);

      // Focus-visible has its own ring on top of whatever marks the destination.
      await other.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(other).toBeFocused();
      expect(await style(other, 'box-shadow')).not.toBe('none');

      await info.attach(`nav-${variant}`, {
        body: await nav.screenshot(),
        contentType: 'image/png',
      });
    });
  }

  test('an open submenu is an interaction state, the same in every variant, never aria-current', async ({
    page,
  }) => {
    const opened: string[] = [];
    for (const variant of VARIANTS) {
      await load(page, `nav-variants?variant=${variant}`);
      await noTransitions(page);
      const trigger = page.getByRole('button', { name: 'Products' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible();
      await expect(trigger).not.toHaveAttribute('aria-current');
      await page.mouse.move(0, 0);
      opened.push(await style(trigger, 'background-color'));

      await page.keyboard.press('Escape');
      await expect(page.getByRole('link', { name: 'Analytics' })).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    expect(new Set(opened).size, `open state differs between variants: ${opened}`).toBe(1);
  });

  test('repeated open/close leaves exactly one panel and no stale content', async ({ page }) => {
    await load(page, 'nav-variants?variant=pill');
    const trigger = page.getByRole('button', { name: 'Products' });
    await trigger.focus();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Enter');
      await expect(page.locator('volt-navigation-menu-content')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(page.locator('volt-navigation-menu-content')).toHaveCount(0);
    }
    await expect(trigger).toBeFocused();
  });

  test('a disabled link is announced, not actionable, and has no pointer affordance', async ({
    page,
  }) => {
    await load(page, 'nav-variants?variant=outline');
    const beta = page.getByRole('link', { name: 'Beta' });
    await expect(beta).toHaveAttribute('aria-disabled', 'true');
    expect(await style(beta, 'pointer-events')).toBe('none');
    expect(Number(await style(beta, 'opacity'))).toBeLessThan(1);
  });

  test('contained layout: a self-sized surface that never exceeds the viewport', async ({
    page,
  }, info) => {
    await load(page, 'nav-variants?variant=pill&layout=contained');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toHaveAttribute('data-layout', 'contained');
    expect(await style(nav, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
    expect(await style(nav, 'border-top-style')).toBe('solid');

    const list = nav.locator('volt-navigation-menu-list');
    const [navBox, listBox] = [await nav.boundingBox(), await list.boundingBox()];
    // Hugs its items (plus its own padding/border), instead of stretching across the row.
    expect(navBox!.width - listBox!.width).toBeLessThan(24);

    await page.setViewportSize({ width: 320, height: 640 });
    const narrow = await nav.boundingBox();
    expect(narrow!.x).toBeGreaterThanOrEqual(0);
    expect(narrow!.x + narrow!.width).toBeLessThanOrEqual(320);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320
    );

    // The submenu still opens from the keyboard and is not clipped by the scrolling surface.
    const trigger = nav.getByRole('button', { name: 'Products' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const panel = page.locator('volt-navigation-menu-content');
    await expect(panel).toBeVisible();
    const panelBox = await panel.boundingBox();
    expect(panelBox!.y).toBeGreaterThanOrEqual(narrow!.y + narrow!.height - 1);
    await info.attach('nav-contained-320', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });

  test('every variant keeps the active mark across the five reference themes', async ({
    page,
  }, info) => {
    for (const [color, styleName, dark] of THEMES) {
      for (const variant of VARIANTS) {
        await load(page, `nav-variants?variant=${variant}`);
        await noTransitions(page);
        await applyTheme(page, color, styleName, dark);
        const nav = page.getByRole('navigation', { name: 'Primary' });
        const docs = nav.getByRole('link', { name: 'Docs' });
        const home = nav.getByRole('link', { name: 'Home' });
        const a = `${await paint(docs)}|${await after(docs, 'background-color')}`;
        const b = `${await paint(home)}|${await after(home, 'background-color')}`;
        expect(a, `${variant} in ${color}/${styleName}/${dark ? 'dark' : 'light'}`).not.toBe(b);
      }
      await info.attach(`nav-underline-${color}-${styleName}`, {
        body: await page.getByRole('navigation', { name: 'Primary' }).screenshot(),
        contentType: 'image/png',
      });
    }
  });
});

test.describe('date picker pointer and visual behaviour', () => {
  test('enabled days and month controls show a pointer; labels and disabled days do not', async ({
    page,
  }) => {
    await load(page, 'date-picker');
    const days = page.locator('volt-date-picker-date-button:not([data-outside-month])');
    const enabled = days.nth(2);
    const disabled = page.locator('volt-date-picker-date-button[data-disabled]').first();

    expect(await style(enabled, 'cursor')).toBe('pointer');
    expect(await style(enabled, 'user-select')).toBe('none');
    expect(await style(page.locator('volt-date-picker-next-month'), 'cursor')).toBe('pointer');
    expect(await style(page.locator('volt-date-picker-previous-month'), 'cursor')).toBe('pointer');
    expect(await style(page.locator('volt-date-picker-label'), 'cursor')).toBe('auto');

    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(await style(disabled, 'cursor')).not.toBe('pointer');
    expect(await style(disabled, 'pointer-events')).toBe('none');
  });

  test('days carry a full-date accessible name; month controls show a focus ring', async ({
    page,
  }) => {
    await load(page, 'date-picker');
    await expect(page.getByRole('button', { name: 'Wednesday, July 15, 2026' })).toHaveAttribute(
      'data-selected'
    );
    const previous = page.getByRole('button', { name: 'Previous month' });
    const next = page.getByRole('button', { name: 'Next month' });
    await previous.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(previous).toBeFocused();
    expect(await style(previous, 'box-shadow')).not.toBe(await style(next, 'box-shadow'));
  });

  test('selected stays distinct from hover in every reference theme', async ({ page }, info) => {
    await load(page, 'date-picker');
    await noTransitions(page);
    const days = page.locator('volt-date-picker-date-button:not([data-outside-month])');
    const selected = page.locator('volt-date-picker-date-button[data-selected]');
    for (const [color, styleName, dark] of THEMES) {
      await applyTheme(page, color, styleName, dark);
      await days.nth(3).hover();
      const hovered = await paint(days.nth(3));
      await page.mouse.move(0, 0);
      expect(await paint(selected), `${color}/${styleName}`).not.toBe(hovered);
      // Hover must be visible on the calendar's own surface (popover), in dark palettes too.
      await days.nth(3).hover();
      const picker = page.locator('volt-date-picker');
      expect(
        await contrastOver(days.nth(3), picker),
        `hover ${color}/${styleName}`
      ).toBeGreaterThan(1.08);
      await page.mouse.move(0, 0);
      await info.attach(`date-picker-${color}-${styleName}`, {
        body: await page.locator('volt-date-picker').screenshot(),
        contentType: 'image/png',
      });
    }
  });
});

test.describe('date range picker', () => {
  test('opens on the month of an outside start date, with the range marked', async ({ page }) => {
    await load(page, 'date-range');
    await expect(page.locator('volt-date-picker-label')).toHaveText('March 2031');
    const day = (n: number) => page.getByRole('button', { name: new RegExp(`March ${n}, 2031`) });
    await expect(day(10)).toHaveAttribute('data-range-start');
    await expect(day(13)).toHaveAttribute('data-range-end');
    await expect(day(11)).toHaveAttribute('data-range-between');
    expect(await paint(day(11))).not.toBe(await paint(day(14)));
  });

  test('the range body is visible on the calendar surface in every reference theme', async ({
    page,
  }) => {
    await load(page, 'date-range');
    await noTransitions(page);
    const picker = page.locator('volt-date-range-picker');
    const between = page.locator('volt-date-picker-date-button[data-range-between]').first();
    for (const [color, styleName, dark] of THEMES) {
      await applyTheme(page, color, styleName, dark);
      expect(await contrastOver(between, picker), `${color}/${styleName}`).toBeGreaterThan(1.08);
    }
  });

  test('pointer and keyboard selections, constraints and blocked days', async ({ page }) => {
    await load(page, 'date-range');
    const day = (n: number) => page.getByRole('button', { name: new RegExp(`March ${n}, 2031`) });

    await day(5).click();
    await day(8).click();
    await expect(page.locator('#range')).toHaveText('5..8');
    await expect(day(6)).toHaveAttribute('data-range-between');

    // Before min, and the blocked day: announced, not selectable.
    await expect(day(2)).toHaveAttribute('aria-disabled', 'true');
    await expect(day(20)).toHaveAttribute('aria-disabled', 'true');
    expect(await style(day(20), 'pointer-events')).toBe('none');

    // Keys go where focus is, as for a person: each Enter waits for focus to have moved.
    await day(22).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#range')).toHaveText(/^22\.\./);
    await page.keyboard.press('ArrowRight');
    await expect(day(23)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(day(24)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#range')).toHaveText('22..24');
  });
});

test.describe('spinner', () => {
  test('decorative by default, one polite status when labelled, sizes differ in paint', async ({
    page,
  }) => {
    await load(page, 'feedback-stable');
    await expect(page.getByRole('status')).toHaveCount(1);
    await expect(page.getByRole('status')).toHaveText('Loading results');
    await expect(page.getByTestId('sm')).toHaveAttribute('aria-hidden', 'true');

    const sizes = await Promise.all(
      ['sm', 'md', 'lg'].map(async id => (await page.getByTestId(id).boundingBox())!.width)
    );
    expect(sizes[0]).toBeLessThan(sizes[1]);
    expect(sizes[1]).toBeLessThan(sizes[2]);

    // Painted in the surrounding text colour.
    const arc = page.getByTestId('md').locator('svg');
    expect(await style(arc, 'stroke')).toBe(await style(page.getByTestId('md'), 'color'));
    expect(await style(arc, 'animation-name')).not.toBe('none');
  });

  test('keeps turning, more slowly, under reduced motion', async ({ page }) => {
    await load(page, 'feedback-stable');
    const svg = page.getByTestId('md').locator('svg');
    const normal = await style(svg, 'animation-duration');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await style(svg, 'animation-duration');
    expect(await style(svg, 'animation-name')).not.toBe('none');
    expect(parseFloat(reduced)).toBeGreaterThan(parseFloat(normal));
  });

  test('inside a disabled button it inherits the button state and stays hidden', async ({
    page,
  }) => {
    await load(page, 'feedback-stable');
    const button = page.getByTestId('busy-button');
    await expect(button).toHaveAccessibleName('Saving…');
    expect(await style(button.locator('volt-spinner'), 'color')).toBe(await style(button, 'color'));
  });
});

test.describe('empty state', () => {
  test('content, not a notification: no role, no live region; actions in tab order', async ({
    page,
  }) => {
    await load(page, 'feedback-stable');
    const full = page.getByTestId('full');
    await expect(full).not.toHaveAttribute('role');
    await expect(full).not.toHaveAttribute('aria-live');
    await expect(full.getByRole('heading')).toHaveCount(0);

    const create = full.getByRole('button', { name: 'Create project' });
    const importButton = full.getByRole('button', { name: 'Import' });
    await create.focus();
    await page.keyboard.press('Tab');
    await expect(importButton).toBeFocused();
    expect(await style(importButton, 'box-shadow')).not.toBe('none');
  });

  // 200% and 400% zoom of a 1280px window are 640 and 320 CSS pixels; 320 is also a small phone.
  for (const [width, label] of [
    [320, '320px phone, 400% zoom'],
    [640, '200% zoom'],
  ] as const) {
    test(`long unbroken text wraps without overflow (${label})`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 800 });
      await load(page, 'feedback-stable');
      for (const id of ['full', 'long', 'title-only']) {
        const state = page.getByTestId(id);
        const overflow = await state.evaluate(el =>
          [el, ...el.querySelectorAll('*')].some(e => e.scrollWidth > e.clientWidth + 1)
        );
        expect(overflow, `${id} overflows`).toBe(false);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      ).toBeLessThanOrEqual(0);
      await info.attach(`empty-state-${width}`, {
        body: await page.getByTestId('long').screenshot(),
        contentType: 'image/png',
      });
    });
  }
});
