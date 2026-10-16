import { describe, expect, it } from 'vitest';
import {
  COLOR_PRESETS,
  STYLE_PRESETS,
  presetStyle,
  readVars,
  shapeVars,
  swatch,
} from './theme-presets';

describe('theme presets', () => {
  it('reads the custom properties of the first matching rule only', () => {
    const css = `:root,\n:root[data-color='x'] { --primary: red; --ring: blue; }
      .dark[data-color='x'] { --primary: black; }`;

    expect(readVars(css, ":root[data-color='x']")).toEqual({
      '--primary': 'red',
      '--ring': 'blue',
    });
    expect(readVars(css, ".dark[data-color='x']")).toEqual({ '--primary': 'black' });
    expect(readVars(css, '.missing')).toEqual({});
  });

  it('reads every shipped color preset, in light and dark', () => {
    for (const color of COLOR_PRESETS) {
      expect(swatch(color)).toMatch(/^oklch\(/);
      expect(presetStyle(color, 'sharp', false)).toContain('--background:');
      expect(presetStyle(color, 'sharp', true)).not.toBe(presetStyle(color, 'sharp', false));
    }
  });

  it('reads every shipped style preset as shape-only variables', () => {
    for (const style of STYLE_PRESETS) {
      expect(shapeVars(style)).toContain('--radius:');
      expect(shapeVars(style)).not.toContain('--primary');
    }
  });

  it('lets the color win over the style when both are applied', () => {
    expect(presetStyle('ember', 'brutal', false)).toContain(`--primary: ${swatch('ember')}`);
    expect(presetStyle('ember', 'brutal', false)).toContain('--radius: 0');
  });
});
