import type { ColorToken, ModePalette } from './palette';

/**
 * The data behind the theme studio: token names, the editable field list, the starting
 * presets, and the pure functions that turn a draft into CSS.
 *
 * None of this is view logic, so it lives next to the palette maths rather than inside a
 * page component — which is what lets the studio page be a layout and nothing more.
 */

export type ThemeMode = 'light' | 'dark';
export type PresetName = 'glacier' | 'sage' | 'ember';

export interface ThemeDraft {
  name: string;
  radius: number;
  borderWidth: number;
  ringWidth: number;
  shadowIntensity: number;
  light: ModePalette;
  dark: ModePalette;
}

export interface ColorField {
  key: ColorToken;
  label: string;
  description: string;
}

export const tokenNames: Record<ColorToken, string> = {
  background: 'background',
  foreground: 'foreground',
  surface: 'surface',
  surfaceForeground: 'surface-foreground',
  muted: 'muted',
  mutedForeground: 'muted-foreground',
  border: 'border',
  input: 'input',
  ring: 'ring',
  primary: 'primary',
  primaryForeground: 'primary-foreground',
  secondary: 'secondary',
  secondaryForeground: 'secondary-foreground',
  success: 'success',
  successForeground: 'success-foreground',
  warning: 'warning',
  warningForeground: 'warning-foreground',
  error: 'error',
  errorForeground: 'error-foreground',
  info: 'info',
  infoForeground: 'info-foreground',
};

export const colorFields: ColorField[] = [
  { key: 'background', label: 'Background', description: 'Page canvas' },
  { key: 'foreground', label: 'Foreground', description: 'Main text' },
  { key: 'surface', label: 'Surface', description: 'Cards and panels' },
  { key: 'surfaceForeground', label: 'Surface text', description: 'Text on surfaces' },
  { key: 'muted', label: 'Muted', description: 'Subtle fills' },
  { key: 'mutedForeground', label: 'Muted text', description: 'Secondary text' },
  { key: 'border', label: 'Border', description: 'Lines and outlines' },
  { key: 'input', label: 'Input', description: 'Form borders' },
  { key: 'ring', label: 'Ring', description: 'Focus color' },
  { key: 'primary', label: 'Primary', description: 'Main action' },
  { key: 'primaryForeground', label: 'Primary text', description: 'Text on primary' },
  { key: 'secondary', label: 'Secondary', description: 'Secondary action' },
  { key: 'secondaryForeground', label: 'Secondary text', description: 'Text on secondary' },
  { key: 'success', label: 'Success', description: 'Positive state' },
  { key: 'successForeground', label: 'Success text', description: 'Text on success' },
  { key: 'warning', label: 'Warning', description: 'Caution state' },
  { key: 'warningForeground', label: 'Warning text', description: 'Text on warning' },
  { key: 'error', label: 'Error', description: 'Error state' },
  { key: 'errorForeground', label: 'Error text', description: 'Text on error' },
  { key: 'info', label: 'Info', description: 'Informational state' },
  { key: 'infoForeground', label: 'Info text', description: 'Text on info' },
];

export const presets: Record<PresetName, Omit<ThemeDraft, 'name'>> = {
  glacier: {
    radius: 6,
    borderWidth: 1,
    ringWidth: 2,
    shadowIntensity: 10,
    light: {
      background: '#f7fbff',
      foreground: '#172938',
      surface: '#f7fbff',
      surfaceForeground: '#172938',
      muted: '#eef6fb',
      mutedForeground: '#647888',
      border: '#d4e6ef',
      input: '#d4e6ef',
      ring: '#1896d4',
      primary: '#1896d4',
      primaryForeground: '#ffffff',
      secondary: '#32b7cf',
      secondaryForeground: '#ffffff',
      success: '#2bb891',
      successForeground: '#ffffff',
      warning: '#d9b03d',
      warningForeground: '#172938',
      error: '#d64c7a',
      errorForeground: '#ffffff',
      info: '#268ee8',
      infoForeground: '#ffffff',
    },
    dark: {
      background: '#031014',
      foreground: '#effcff',
      surface: '#071c22',
      surfaceForeground: '#effcff',
      muted: '#102a32',
      mutedForeground: '#9bb8c3',
      border: '#17323b',
      input: '#17323b',
      ring: '#28aee8',
      primary: '#28aee8',
      primaryForeground: '#ffffff',
      secondary: '#4dc4d7',
      secondaryForeground: '#ffffff',
      success: '#2cb68e',
      successForeground: '#ffffff',
      warning: '#caa43c',
      warningForeground: '#ffffff',
      error: '#dc5d86',
      errorForeground: '#ffffff',
      info: '#3aa5f2',
      infoForeground: '#ffffff',
    },
  },
  sage: {
    radius: 16,
    borderWidth: 1,
    ringWidth: 2,
    shadowIntensity: 8,
    light: {
      background: '#f7fbf8',
      foreground: '#21352d',
      surface: '#f7fbf8',
      surfaceForeground: '#21352d',
      muted: '#eef5ef',
      mutedForeground: '#667a70',
      border: '#d8e5dc',
      input: '#d8e5dc',
      ring: '#299b69',
      primary: '#299b69',
      primaryForeground: '#ffffff',
      secondary: '#35a5a0',
      secondaryForeground: '#ffffff',
      success: '#1f7d55',
      successForeground: '#ffffff',
      warning: '#c8a13d',
      warningForeground: '#21352d',
      error: '#c84f48',
      errorForeground: '#ffffff',
      info: '#3d87c8',
      infoForeground: '#ffffff',
    },
    dark: {
      background: '#06100c',
      foreground: '#eff8f2',
      surface: '#0d1b15',
      surfaceForeground: '#eff8f2',
      muted: '#16261e',
      mutedForeground: '#99aea3',
      border: '#1d3026',
      input: '#1d3026',
      ring: '#2fa66f',
      primary: '#2fa66f',
      primaryForeground: '#ffffff',
      secondary: '#37aaa4',
      secondaryForeground: '#ffffff',
      success: '#329a68',
      successForeground: '#ffffff',
      warning: '#c19d38',
      warningForeground: '#ffffff',
      error: '#d35b52',
      errorForeground: '#ffffff',
      info: '#3b8bcf',
      infoForeground: '#ffffff',
    },
  },
  ember: {
    radius: 6,
    borderWidth: 1,
    ringWidth: 2,
    shadowIntensity: 12,
    light: {
      background: '#fff9f0',
      foreground: '#3d2719',
      surface: '#fff9f0',
      surfaceForeground: '#3d2719',
      muted: '#f8ead8',
      mutedForeground: '#896c55',
      border: '#edd7bf',
      input: '#edd7bf',
      ring: '#e44e2e',
      primary: '#e44e2e',
      primaryForeground: '#ffffff',
      secondary: '#d89522',
      secondaryForeground: '#3d2719',
      success: '#50ad49',
      successForeground: '#ffffff',
      warning: '#d89522',
      warningForeground: '#3d2719',
      error: '#d9362b',
      errorForeground: '#ffffff',
      info: '#417ed4',
      infoForeground: '#ffffff',
    },
    dark: {
      background: '#140c07',
      foreground: '#fff2df',
      surface: '#21140c',
      surfaceForeground: '#fff2df',
      muted: '#332114',
      mutedForeground: '#c69c77',
      border: '#3a2819',
      input: '#3a2819',
      ring: '#f05b35',
      primary: '#f05b35',
      primaryForeground: '#ffffff',
      secondary: '#d99824',
      secondaryForeground: '#2a1a10',
      success: '#58b34f',
      successForeground: '#ffffff',
      warning: '#d99824',
      warningForeground: '#ffffff',
      error: '#e34a3d',
      errorForeground: '#ffffff',
      info: '#4b88df',
      infoForeground: '#ffffff',
    },
  },
};

export function clonePreset(name: PresetName, themeName = 'custom-theme'): ThemeDraft {
  return structuredClone({ name: themeName, ...presets[name] });
}

export function normalizeThemeName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom-theme'
  );
}

export function eventValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

export function indent(lines: string[]): string {
  return lines.map(line => `  ${line}`).join('\n');
}

/** Narrows an untyped `<volt-select>` value to a preset name. */
export function isPresetName(value: unknown): value is PresetName {
  return value === 'glacier' || value === 'sage' || value === 'ember';
}

/** The `--token: value;` inline style map the live preview is rendered with. */
export function paletteStyleVars(palette: ModePalette): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokenNames).map(([key, tokenName]) => [
      `--${tokenName}`,
      palette[key as ColorToken],
    ])
  );
}

/** The same tokens as declaration lines, for the exported stylesheet. */
export function paletteCssLines(palette: ModePalette): string[] {
  return Object.entries(tokenNames).map(
    ([key, tokenName]) => `--${tokenName}: ${palette[key as ColorToken]};`
  );
}
