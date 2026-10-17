import type { VoltThemeColor, VoltThemeStyle } from 'volt';

/** Mirrors `VoltThemeColor` / `VoltThemeStyle`; the `satisfies` clauses fail to compile if the library adds or drops a preset. */
export const COLORS = [
  'volt',
  'ember',
  'sage',
  'dusk',
  'glacier',
] as const satisfies readonly VoltThemeColor[];
export const STYLES = [
  'sharp',
  'soft',
  'brutal',
  'ghost',
  'retro',
] as const satisfies readonly VoltThemeStyle[];
export const APPEARANCES = ['light', 'dark'] as const;
