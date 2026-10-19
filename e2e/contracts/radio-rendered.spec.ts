import { expect, test } from '@playwright/test';
import { load } from './helpers';

const COLORS = ['volt', 'ember', 'sage', 'dusk', 'glacier'] as const;
const STYLES = ['sharp', 'soft', 'brutal', 'ghost', 'retro'] as const;

test.describe('radio rendered theme states', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await load(page, 'radio');
    await page.addStyleTag({
      content:
        '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
  });

  test('preserves boundaries and indicators across official presets and custom themes', async ({
    page,
  }) => {
    const unchecked = page.getByRole('radio', { name: 'Free' });
    const selected = page.getByRole('radio', { name: 'Pro' });
    const disabled = page.getByRole('radio', { name: 'Legacy' });
    const selectedDisabled = page.getByRole('radio', { name: 'Fixed selection' });

    await expect(unchecked).toHaveAttribute('aria-checked', 'false');
    await expect(selected).toHaveAttribute('aria-checked', 'true');
    await expect(selectedDisabled).toHaveAttribute('aria-checked', 'true');
    await expect(selectedDisabled).toHaveAttribute('aria-disabled', 'true');
    await expect(unchecked).toHaveAccessibleName('Free');
    await expect(disabled).toHaveAccessibleName('Legacy');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(
      await selected.evaluate(
        radio => getComputedStyle(radio.querySelector('[ngpradioindicator]')!).display
      )
    ).toBe('flex');
    expect(
      await unchecked.evaluate(
        radio => getComputedStyle(radio.querySelector('[ngpradioindicator]')!).display
      )
    ).toBe('none');

    const results = await page.evaluate(
      async presets => {
        const root = document.documentElement;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true })!;
        function rgb(value: string): number[] {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          return Array.from(
            context.getImageData(0, 0, 1, 1).data.slice(0, 3),
            channel => channel / 255
          );
        }
        function luminance(color: number[]) {
          const linear = color.map(channel =>
            channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          );
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        }
        function contrast(a: number[], b: number[]) {
          const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
          return (values[0] + 0.05) / (values[1] + 0.05);
        }
        const failures: string[] = [];
        for (const preset of presets) {
          root.dataset.color = preset.color;
          root.dataset.style = preset.style;
          root.classList.toggle('dark', preset.dark);
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const radio = document.querySelector<HTMLElement>(
            'volt-radio-group[aria-label="Plan"] button[ngpradioitem]'
          )!;
          const style = getComputedStyle(radio);
          const background = getComputedStyle(document.body).backgroundColor;
          const boundary = contrast(rgb(style.borderTopColor), rgb(background));
          const ring = contrast(
            rgb(getComputedStyle(root).getPropertyValue('--ring')),
            rgb(background)
          );
          const name = `${preset.color}/${preset.dark ? 'dark' : 'light'}/${preset.style}`;
          if (boundary < 3)
            failures.push(`${name}: unchecked radio boundary ${boundary.toFixed(2)}:1`);
          if (ring < 3) failures.push(`${name}: focus indicator ${ring.toFixed(2)}:1`);
        }

        const custom = [
          {
            mode: 'light',
            tokens: {
              '--background': '#f8fafc',
              '--foreground': '#0f172a',
              '--surface': '#ffffff',
              '--surface-foreground': '#0f172a',
              '--muted': '#e2e8f0',
              '--muted-foreground': '#475569',
              '--input': '#64748b',
              '--ring': '#1d4ed8',
              '--primary': '#1d4ed8',
            },
          },
          {
            mode: 'dark',
            tokens: {
              '--background': '#0b1220',
              '--foreground': '#f8fafc',
              '--surface': '#111c2e',
              '--surface-foreground': '#f8fafc',
              '--muted': '#1e293b',
              '--muted-foreground': '#cbd5e1',
              '--input': '#94a3b8',
              '--ring': '#93c5fd',
              '--primary': '#60a5fa',
            },
          },
        ];
        for (const fixture of custom) {
          root.classList.toggle('dark', fixture.mode === 'dark');
          for (const [name, value] of Object.entries(fixture.tokens)) {
            root.style.setProperty(name, value);
          }
          const radio = document.querySelector<HTMLElement>(
            'volt-radio-group[aria-label="Plan"] button[ngpradioitem]'
          )!;
          const style = getComputedStyle(radio);
          const background = getComputedStyle(document.body).backgroundColor;
          const boundary = contrast(rgb(style.borderTopColor), rgb(background));
          const ring = contrast(
            rgb(getComputedStyle(root).getPropertyValue('--ring')),
            rgb(background)
          );
          if (boundary < 3) {
            failures.push(
              `custom ${fixture.mode}: unchecked radio boundary ${boundary.toFixed(2)}:1 (${style.borderTopColor} on ${background}; input ${getComputedStyle(root).getPropertyValue('--input')})`
            );
          }
          if (ring < 3)
            failures.push(`custom ${fixture.mode}: focus indicator ${ring.toFixed(2)}:1`);
        }
        return failures;
      },
      COLORS.flatMap(color =>
        [false, true].flatMap(dark => STYLES.map(style => ({ color, dark, style })))
      )
    );
    expect(results).toEqual([]);

    await page.locator('#before').focus();
    await page.keyboard.press('Tab');
    await expect(selected).toBeFocused();
    expect(await selected.evaluate(radio => radio.matches(':focus-visible'))).toBe(true);
    expect(await selected.evaluate(radio => getComputedStyle(radio).boxShadow)).not.toBe('none');

    const borderBeforeHover = await unchecked.evaluate(
      radio => getComputedStyle(radio).borderTopColor
    );
    await unchecked.hover();
    await expect
      .poll(() => unchecked.evaluate(radio => getComputedStyle(radio).borderTopColor))
      .not.toBe(borderBeforeHover);

    const disabledBorder = await disabled.evaluate(radio => getComputedStyle(radio).borderTopColor);
    const disabledBackground = await disabled.evaluate(
      radio => getComputedStyle(radio).backgroundColor
    );
    expect(await disabled.evaluate(radio => getComputedStyle(radio).cursor)).toBe('not-allowed');
    await disabled.hover();
    expect(await disabled.evaluate(radio => getComputedStyle(radio).borderTopColor)).toBe(
      disabledBorder
    );
    expect(await disabled.evaluate(radio => getComputedStyle(radio).backgroundColor)).toBe(
      disabledBackground
    );
  });
});
