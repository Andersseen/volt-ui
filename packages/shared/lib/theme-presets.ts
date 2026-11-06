import type { VoltThemeColor, VoltThemeStyle } from 'volt';

/**
 * The names of the shipped presets, for pickers. Their values live in the library's stylesheets;
 * anything that has to show a preset renders it with `voltTheme`.
 */
export const COLOR_PRESETS = [
  'volt',
  'ember',
  'sage',
  'dusk',
  'glacier',
] as const satisfies readonly VoltThemeColor[];
export const STYLE_PRESETS = [
  'sharp',
  'soft',
  'brutal',
  'ghost',
  'retro',
] as const satisfies readonly VoltThemeStyle[];

export type ColorPreset = (typeof COLOR_PRESETS)[number];
export type StylePreset = (typeof STYLE_PRESETS)[number];
