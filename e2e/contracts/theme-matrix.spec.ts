import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * What a palette or style changes is only real if the part that paints the control changes, so
 * these tests read computed styles from `e2e/consumer/themes.html` — real components from the built
 * package — rather than the value of a custom property.
 *
 * All 50 combinations of palette × style × mode run in one test per style, on one page load each,
 * which keeps this at five tests per engine instead of a new matrix in CI.
 */
const COLORS = ['volt', 'ember', 'sage', 'dusk', 'glacier'] as const;
const STYLES = ['sharp', 'soft', 'brutal', 'ghost', 'retro'] as const;
const MODES = ['light', 'dark'] as const;

type Style = (typeof STYLES)[number];

const part = (page: Page, name: string): Locator => page.locator(`[data-part="${name}"]`).first();
/** `volt-button` and `volt-input` wrap the element that paints. */
const control = (page: Page, name: string, selector: string): Locator =>
  part(page, name).locator(selector).first();

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/themes.html');
  await expect(page.locator('volt-card').first()).toBeVisible();
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  return errors;
}

async function theme(page: Page, color: string, style: string, mode: string) {
  await page.evaluate(
    ([c, s, m]) => {
      const root = document.documentElement;
      root.dataset.color = c;
      root.dataset.style = s;
      root.classList.toggle('dark', m === 'dark');
      root.style.colorScheme = m;
    },
    [color, style, mode]
  );
}

const css = (locator: Locator, ...properties: string[]) =>
  locator.evaluate(
    (el, names) =>
      Object.fromEntries(names.map(n => [n, getComputedStyle(el).getPropertyValue(n)])),
    properties
  );

/** The WCAG contrast of two computed CSS colours, resolved by painting them on a canvas. */
function contrastOf(page: Page, foreground: string, background: string) {
  return page.evaluate(
    ([fg, bg]) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const rgb = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      };
      const luminance = (color: string) => {
        const [r, g, b] = rgb(color).map(v => {
          const c = v / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    },
    [foreground, background]
  );
}

/**
 * The colours of the opaque, outer layers of a computed `box-shadow`. Tailwind lists its empty ring
 * layers first as transparent, and Retro's lit edge is inset.
 */
function solidLayers(shadow: string): string[] {
  return shadow
    .split(/,\s*(?=(?:rgba?|oklch|oklab|color|lab)\()/)
    .filter(layer => !layer.includes('inset') && !/rgba\(0, 0, 0, 0\)|\/ 0\)/.test(layer))
    .map(layer => layer.slice(0, layer.indexOf(')') + 1));
}

const paint = async (locator: Locator, property: string) =>
  (await css(locator, property))[property];

/** The computed signature of a style, measured on the parts that draw it. */
async function signature(page: Page) {
  const button = control(page, 'button-outline', 'button');
  const input = control(page, 'input', 'input');
  const card = part(page, 'card');
  return {
    button: await css(
      button,
      'height',
      'border-top-width',
      'border-top-left-radius',
      'box-shadow',
      'font-weight'
    ),
    input: await css(input, 'height', 'border-top-width', 'border-top-left-radius'),
    card: await css(
      card,
      'border-top-width',
      'border-top-left-radius',
      'box-shadow',
      'background-color'
    ),
    switch: await css(control(page, 'switch-on', 'button'), 'border-top-left-radius'),
    progress: await css(
      part(page, 'progress').locator('[ngpProgressTrack]'),
      'height',
      'border-top-width'
    ),
    separator: await css(part(page, 'accordion-item'), 'border-bottom-width'),
    formGap: await part(page, 'form-field')
      .locator('volt-label')
      .evaluate(el => {
        const next = el.nextElementSibling!;
        return next.getBoundingClientRect().top - el.getBoundingClientRect().bottom;
      }),
  };
}

test.describe('theme matrix', () => {
  for (const style of STYLES) {
    test(`${style}: every palette and mode paints legibly and fits`, async ({ page }) => {
      const errors = await open(page);

      for (const color of COLORS) {
        for (const mode of MODES) {
          const combo = `${color}/${style}/${mode}`;
          await theme(page, color, style, mode);

          // Any `calc()` a preset makes invalid falls back silently; a length proves it computed.
          const radius = await paint(part(page, 'card'), 'border-top-left-radius');
          expect(radius, combo).toMatch(/^\d+(\.\d+)?px$/);

          const button = control(page, 'button-solid', 'button');
          const { color: text, 'background-color': fill } = await css(
            button,
            'color',
            'background-color'
          );
          expect(await contrastOf(page, text, fill), `${combo} button text`).toBeGreaterThanOrEqual(
            4.5
          );

          const track = part(page, 'progress').locator('[ngpProgressTrack]');
          const bar = part(page, 'progress').locator('[ngpProgressIndicator]');
          const pending = await paint(track, 'background-color');
          const done = await paint(bar, 'background-color');
          expect(
            await contrastOf(page, done, pending),
            `${combo} progress fill vs track`
          ).toBeGreaterThanOrEqual(3);

          // A control that lost its outline is not recognisable as a control.
          const input = control(page, 'input', 'input');
          expect(
            parseFloat(await paint(input, 'border-top-width')),
            `${combo} input border`
          ).toBeGreaterThanOrEqual(1);

          // The page does not grow sideways under any combination.
          const overflow = await page.evaluate(() => {
            const main = document.querySelector('main')!;
            return main.scrollWidth - main.clientWidth;
          });
          expect(overflow, `${combo} horizontal overflow`).toBeLessThanOrEqual(0);

          // The switch thumb stays inside its track under every border width.
          const thumb = await control(page, 'switch-on', '[ngpSwitchThumb], span').boundingBox();
          const sw = await control(page, 'switch-on', 'button').boundingBox();
          expect(thumb!.x + thumb!.width, `${combo} switch thumb`).toBeLessThanOrEqual(
            sw!.x + sw!.width
          );
        }
      }

      expect(errors).toEqual([]);
    });
  }

  test('each style differs from every other on the parts that paint', async ({ page }) => {
    await open(page);
    const seen = new Map<Style, Awaited<ReturnType<typeof signature>>>();
    for (const style of STYLES) {
      await theme(page, 'volt', style, 'light');
      seen.set(style, await signature(page));
    }

    const at = (style: Style) => seen.get(style)!;
    for (const a of STYLES) {
      for (const b of STYLES) {
        if (a < b) expect(JSON.stringify(at(a)), `${a} vs ${b}`).not.toBe(JSON.stringify(at(b)));
      }
    }

    // The values each style promises, read from what is drawn.
    expect(at('brutal').card['border-top-left-radius']).toBe('0px');
    expect(at('brutal').switch['border-top-left-radius']).toBe('0px');
    expect(at('brutal').button['border-top-width']).toBe('2px');
    expect(at('brutal').button['box-shadow']).toContain('2px 2px 0px');
    expect(Number(at('brutal').button['font-weight'])).toBeGreaterThanOrEqual(700);

    expect(parseFloat(at('soft').card['border-top-left-radius'])).toBeGreaterThan(
      parseFloat(at('sharp').card['border-top-left-radius']) * 2
    );
    expect(parseFloat(at('soft').button.height)).toBeGreaterThan(
      parseFloat(at('sharp').button.height)
    );

    expect(at('ghost').card['border-top-width']).toBe('0px');
    expect(solidLayers(at('ghost').card['box-shadow'])).toEqual([]);
    expect(at('ghost').input['border-top-width']).toBe('1px');
    expect(at('ghost').card['background-color']).not.toBe(at('sharp').card['background-color']);

    expect(at('retro').button['box-shadow']).toContain('inset');
    expect(at('retro').input['border-top-width']).toBe('2px');
    expect(parseFloat(at('retro').progress.height)).toBeGreaterThan(
      parseFloat(at('sharp').progress.height)
    );
  });

  test('palettes differ in their neutrals, not only in primary', async ({ page }) => {
    await open(page);
    for (const mode of MODES) {
      const read: Record<string, string> = {};
      for (const color of COLORS) {
        await theme(page, color, 'sharp', mode);
        read[color] = JSON.stringify(
          await page.evaluate(() => {
            const body = getComputedStyle(document.body).backgroundColor;
            const card = getComputedStyle(document.querySelector('[data-part="card"]')!);
            return [body, card.backgroundColor, card.borderTopColor];
          })
        );
      }
      expect(new Set(Object.values(read)).size, mode).toBe(COLORS.length);
    }
  });

  test('Brutal and Retro keep a visible shadow in dark mode', async ({ page }) => {
    await open(page);
    for (const color of COLORS) {
      for (const style of ['brutal', 'retro']) {
        await theme(page, color, style, 'dark');
        const shadow = await paint(part(page, 'card'), 'box-shadow');
        const body = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
        const ink = solidLayers(shadow)[0];
        const ratio = await contrastOf(page, ink, body);
        expect(ratio, `${color}/${style} dark shadow`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

test.describe('states', () => {
  for (const style of STYLES) {
    test(`${style}: hover, press, focus and invalid are visible, and press moves no layout`, async ({
      page,
    }) => {
      await open(page);
      await theme(page, 'volt', style, 'light');

      const button = control(page, 'button-solid', 'button');
      const rest = await css(button, 'background-color', 'box-shadow', 'scale', 'translate');
      const before = (await part(page, 'button-outline').boundingBox())!;

      await button.hover();
      await expect
        .poll(async () => paint(button, 'background-color'))
        .not.toBe(rest['background-color']);

      await page.mouse.down();
      await expect.poll(async () => button.getAttribute('data-press')).not.toBeNull();
      const pressed = await css(button, 'scale', 'translate', 'box-shadow');
      expect(
        pressed['scale'] !== rest['scale'] || pressed['translate'] !== rest['translate'],
        'a press moves the button'
      ).toBe(true);
      const during = (await part(page, 'button-outline').boundingBox())!;
      expect(during.x, 'neighbours stay put').toBe(before.x);
      await page.mouse.up();
      await page.mouse.move(0, 0);

      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
      const ring = await paint(focused, 'box-shadow');
      expect(ring, 'focus paints a ring').toMatch(/\d+px/);
      expect(ring).not.toBe('none');

      const invalid = control(page, 'input-invalid', 'input');
      const valid = control(page, 'input', 'input');
      expect(await paint(invalid, 'border-top-color')).not.toBe(
        await paint(valid, 'border-top-color')
      );

      const on = await paint(control(page, 'toggle-on', 'button'), 'background-color');
      const off = await paint(control(page, 'toggle-off', 'button'), 'background-color');
      expect(on, 'selected differs from unselected').not.toBe(off);
    });
  }

  test('reduced motion: the Progress bar does not animate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const bar = part(page, 'progress').locator('[ngpProgressIndicator]');
    expect(await paint(bar, 'transition-property')).toBe('none');
  });
});

test.describe('density', () => {
  test('changes metrics, keeps pointer targets, and does not compound when nested', async ({
    page,
  }) => {
    await open(page);
    await theme(page, 'volt', 'sharp', 'light');
    const button = control(page, 'button-solid', 'button');
    const height = async () => parseFloat(await paint(button, 'height'));
    const comfortable = await height();

    await page.evaluate(() => (document.documentElement.dataset.density = 'compact'));
    const compact = await height();
    expect(compact).toBeLessThan(comfortable);

    await page.evaluate(() => (document.documentElement.dataset.density = 'spacious'));
    expect(await height()).toBeGreaterThan(comfortable);

    // A nested density replaces the outer factor: compact inside compact is still compact.
    await page.evaluate(() => {
      document.documentElement.dataset.density = 'compact';
      (document.querySelector('main') as HTMLElement).dataset.density = 'compact';
    });
    expect(await height()).toBe(compact);

    const small = parseFloat(await paint(control(page, 'button-sm', 'button'), 'height'));
    expect(small, 'WCAG 2.2 target size').toBeGreaterThanOrEqual(24);
  });
});
