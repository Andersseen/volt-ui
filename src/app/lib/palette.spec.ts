import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  crafterUrl,
  generatePalette,
  hexToRgb,
  PaletteImportError,
  paletteFromCrafterExport,
  randomSeed,
  rgbToHex,
  type ColorToken,
  type ModePalette,
} from './palette';

const hex = /^#[0-9a-f]{6}$/;

const tokens: ColorToken[] = [
  'background',
  'foreground',
  'surface',
  'surfaceForeground',
  'muted',
  'mutedForeground',
  'border',
  'input',
  'ring',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'success',
  'successForeground',
  'warning',
  'warningForeground',
  'error',
  'errorForeground',
  'info',
  'infoForeground',
];

/** Every pairing a reader actually has to read text against. */
const textPairs: [ColorToken, ColorToken][] = [
  ['foreground', 'background'],
  ['surfaceForeground', 'surface'],
  ['primaryForeground', 'primary'],
  ['secondaryForeground', 'secondary'],
  ['successForeground', 'success'],
  ['warningForeground', 'warning'],
  ['errorForeground', 'error'],
  ['infoForeground', 'info'],
];

function expectComplete(palette: ModePalette): void {
  for (const token of tokens) {
    expect(palette[token], `${token} missing`).toMatch(hex);
  }
}

describe('color conversion', () => {
  it('round-trips hex through rgb', () => {
    expect(rgbToHex(...hexToRgb('#4c5bc9'))).toBe('#4c5bc9');
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
  });

  it('computes known WCAG contrast ratios', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // Ratio is order-independent.
    expect(contrastRatio('#4c5bc9', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#4c5bc9'), 5);
  });
});

describe('generatePalette', () => {
  it('is deterministic for a given seed and harmony', () => {
    const a = generatePalette({ seed: 'volt', harmony: 'analogous' });
    const b = generatePalette({ seed: 'volt', harmony: 'analogous' });
    expect(a).toEqual(b);
  });

  it('produces different palettes for different seeds', () => {
    const a = generatePalette({ seed: 'volt' });
    const b = generatePalette({ seed: 'ember' });
    expect(a.light.primary).not.toBe(b.light.primary);
  });

  it('fills every token of both modes with a valid hex color', () => {
    const { light, dark } = generatePalette({ seed: 'coverage' });
    expectComplete(light);
    expectComplete(dark);
  });

  it('keeps readable text contrast on every surface it generates', () => {
    // Sweep many seeds: a generator that only works for a lucky hue is not usable.
    for (let i = 0; i < 40; i++) {
      const palette = generatePalette({ seed: `seed-${i}` });
      for (const mode of ['light', 'dark'] as const) {
        for (const [fg, bg] of textPairs) {
          const ratio = contrastRatio(palette[mode][fg], palette[mode][bg]);
          expect(
            ratio,
            `${mode}/${fg} on ${bg} (seed-${i}) was ${ratio.toFixed(2)}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('places light backgrounds light and dark backgrounds dark', () => {
    const { light, dark } = generatePalette({ seed: 'modes' });
    expect(contrastRatio(light.background, '#ffffff')).toBeLessThan(1.5);
    expect(contrastRatio(dark.background, '#000000')).toBeLessThan(3);
  });

  it('derives the secondary hue from the chosen harmony', () => {
    const base = { seed: 'harmony', baseHue: 200 } as const;
    expect(generatePalette({ ...base, harmony: 'complementary' }).meta.secondaryHue).toBe(20);
    expect(generatePalette({ ...base, harmony: 'triadic' }).meta.secondaryHue).toBe(320);
    expect(generatePalette({ ...base, harmony: 'analogous' }).meta.secondaryHue).toBe(230);
    expect(generatePalette({ ...base, harmony: 'monochrome' }).meta.secondaryHue).toBe(200);
  });

  it('honors an explicit base hue', () => {
    expect(generatePalette({ seed: 'x', baseHue: 273 }).meta.baseHue).toBe(273);
  });

  it('generates usable seeds', () => {
    expect(randomSeed()).toMatch(/^[a-z0-9]+$/);
    expect(randomSeed()).not.toBe(randomSeed());
  });
});

/** Trimmed copy of a real export from palette-crafter.andersseen.dev. */
const crafterExport = JSON.stringify({
  theme: {
    bg: '#f9fafd',
    fg: '#151822',
    primary: {
      '50': '#f2f5ff',
      '200': '#cdd7ff',
      '400': '#899dff',
      '950': '#181e55',
      DEFAULT: '#4c5bc9',
      foreground: '#ffffff',
    },
    secondary: { '400': '#ba8af6', DEFAULT: '#8154b5', foreground: '#ffffff' },
    status: {
      info: { '400': '#60a8ff', DEFAULT: '#0c68c2', foreground: '#ffffff' },
      success: { '400': '#54bf71', DEFAULT: '#007f38', foreground: '#ffffff' },
      warning: { '400': '#ca9d4c', DEFAULT: '#896100', foreground: '#ffffff' },
      danger: { '400': '#f87171', DEFAULT: '#be2323', foreground: '#ffffff' },
    },
  },
  meta: { mode: 'light', baseHue: 273, harmony: 'analogous', seed: 'palette-crafter-home' },
});

describe('paletteFromCrafterExport', () => {
  it('maps the export onto Volt tokens', () => {
    const { light, dark, meta } = paletteFromCrafterExport(crafterExport);

    expect(light.background).toBe('#f9fafd');
    expect(light.foreground).toBe('#151822');
    expect(light.primary).toBe('#4c5bc9');
    expect(light.primaryForeground).toBe('#ffffff');
    expect(light.secondary).toBe('#8154b5');
    expect(light.error).toBe('#be2323');
    expect(light.info).toBe('#0c68c2');

    // The opposite mode comes from the pale/deep ends of the same scales.
    expect(dark.primary).toBe('#899dff');
    expect(dark.background).toBe('#181e55');
    expect(meta.seed).toBe('palette-crafter-home');
    expect(meta.baseHue).toBe(273);
  });

  it('produces a complete, readable palette in both modes', () => {
    const { light, dark } = paletteFromCrafterExport(crafterExport);
    expectComplete(light);
    expectComplete(dark);

    for (const [fg, bg] of textPairs) {
      expect(contrastRatio(light[fg], light[bg]), `light ${fg}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark[fg], dark[bg]), `dark ${fg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('rejects input that is not a Palette Crafter export', () => {
    expect(() => paletteFromCrafterExport('not json')).toThrow(PaletteImportError);
    expect(() => paletteFromCrafterExport('{}')).toThrow(PaletteImportError);
    expect(() => paletteFromCrafterExport('{"theme":{"primary":{}}}')).toThrow(PaletteImportError);
  });
});

describe('crafterUrl', () => {
  it('builds a link that reproduces the palette in Palette Crafter', () => {
    const url = crafterUrl(
      { seed: 'volt', harmony: 'triadic', baseHue: 273, secondaryHue: 33 },
      'dark'
    );
    expect(url).toContain('https://palette-crafter.andersseen.dev/?');
    expect(url).toContain('seed=volt');
    expect(url).toContain('harmony=triadic');
    expect(url).toContain('baseHue=273');
    expect(url).toContain('mode=dark');
  });
});
