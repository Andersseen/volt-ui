import type { PlainTranslationKey } from '@shared/i18n/i18n';
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
  /** Translation keys, resolved where the field is rendered. */
  labelKey: PlainTranslationKey;
  descriptionKey: PlainTranslationKey;
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
  {
    key: 'background',
    labelKey: 'themeStudio.tokens.fields.background.label',
    descriptionKey: 'themeStudio.tokens.fields.background.description',
  },
  {
    key: 'foreground',
    labelKey: 'themeStudio.tokens.fields.foreground.label',
    descriptionKey: 'themeStudio.tokens.fields.foreground.description',
  },
  {
    key: 'surface',
    labelKey: 'themeStudio.tokens.fields.surface.label',
    descriptionKey: 'themeStudio.tokens.fields.surface.description',
  },
  {
    key: 'surfaceForeground',
    labelKey: 'themeStudio.tokens.fields.surfaceForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.surfaceForeground.description',
  },
  {
    key: 'muted',
    labelKey: 'themeStudio.tokens.fields.muted.label',
    descriptionKey: 'themeStudio.tokens.fields.muted.description',
  },
  {
    key: 'mutedForeground',
    labelKey: 'themeStudio.tokens.fields.mutedForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.mutedForeground.description',
  },
  {
    key: 'border',
    labelKey: 'themeStudio.tokens.fields.border.label',
    descriptionKey: 'themeStudio.tokens.fields.border.description',
  },
  {
    key: 'input',
    labelKey: 'themeStudio.tokens.fields.input.label',
    descriptionKey: 'themeStudio.tokens.fields.input.description',
  },
  {
    key: 'primary',
    labelKey: 'themeStudio.tokens.fields.primary.label',
    descriptionKey: 'themeStudio.tokens.fields.primary.description',
  },
  {
    key: 'primaryForeground',
    labelKey: 'themeStudio.tokens.fields.primaryForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.primaryForeground.description',
  },
  {
    key: 'secondary',
    labelKey: 'themeStudio.tokens.fields.secondary.label',
    descriptionKey: 'themeStudio.tokens.fields.secondary.description',
  },
  {
    key: 'secondaryForeground',
    labelKey: 'themeStudio.tokens.fields.secondaryForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.secondaryForeground.description',
  },
  {
    key: 'success',
    labelKey: 'themeStudio.tokens.fields.success.label',
    descriptionKey: 'themeStudio.tokens.fields.success.description',
  },
  {
    key: 'successForeground',
    labelKey: 'themeStudio.tokens.fields.successForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.successForeground.description',
  },
  {
    key: 'warning',
    labelKey: 'themeStudio.tokens.fields.warning.label',
    descriptionKey: 'themeStudio.tokens.fields.warning.description',
  },
  {
    key: 'warningForeground',
    labelKey: 'themeStudio.tokens.fields.warningForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.warningForeground.description',
  },
  {
    key: 'error',
    labelKey: 'themeStudio.tokens.fields.error.label',
    descriptionKey: 'themeStudio.tokens.fields.error.description',
  },
  {
    key: 'errorForeground',
    labelKey: 'themeStudio.tokens.fields.errorForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.errorForeground.description',
  },
  {
    key: 'info',
    labelKey: 'themeStudio.tokens.fields.info.label',
    descriptionKey: 'themeStudio.tokens.fields.info.description',
  },
  {
    key: 'infoForeground',
    labelKey: 'themeStudio.tokens.fields.infoForeground.label',
    descriptionKey: 'themeStudio.tokens.fields.infoForeground.description',
  },
  // Last, so every other row pairs a color with the text that sits on it.
  {
    key: 'ring',
    labelKey: 'themeStudio.tokens.fields.ring.label',
    descriptionKey: 'themeStudio.tokens.fields.ring.description',
  },
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
