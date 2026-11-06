import type { PlainTranslationKey } from '@shared/i18n/i18n';
import type { ColorToken, ModePalette } from './palette';
import { shippedPalette } from './shipped-palettes';

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

const SHAPES: Record<
  PresetName,
  Pick<ThemeDraft, 'radius' | 'borderWidth' | 'ringWidth' | 'shadowIntensity'>
> = {
  glacier: { radius: 6, borderWidth: 1, ringWidth: 2, shadowIntensity: 10 },
  sage: { radius: 16, borderWidth: 1, ringWidth: 2, shadowIntensity: 8 },
  ember: { radius: 6, borderWidth: 1, ringWidth: 2, shadowIntensity: 12 },
};

/** A starting draft: the shipped palette, as the hex values the colour fields edit. */
export function clonePreset(name: PresetName, themeName = 'custom-theme'): ThemeDraft {
  return { name: themeName, ...SHAPES[name], ...shippedPalette(name) };
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

/** Every palette token of one mode, as the custom properties the library reads. */
export function paletteVars(palette: ModePalette): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(tokenNames).map(([key, tokenName]) => [
        `--${tokenName}`,
        palette[key as ColorToken],
      ])
    ),
    // The studio edits one danger colour; the library paints with both roles.
    '--destructive': palette.error,
    '--destructive-foreground': palette.errorForeground,
  };
}

/**
 * The shape tokens a draft sets. The preview and the exported stylesheet both come from here, so
 * what the studio shows is what an app gets. Surfaces take the chosen border; a control never drops
 * below 1px, because its outline is what makes it recognisable.
 */
export function shapeVars(theme: ThemeDraft): Record<string, string> {
  const shadow = (geometry: string, divisor: number) =>
    `${geometry} rgb(0 0 0 / ${theme.shadowIntensity / divisor})`;

  return {
    '--radius': `${theme.radius}px`,
    '--volt-radius-pill': theme.radius === 0 ? '0px' : '9999px',
    '--border-width': `${theme.borderWidth}px`,
    '--volt-control-border-width': `${Math.max(theme.borderWidth, 1)}px`,
    '--ring-width': `${theme.ringWidth}px`,
    '--ring-offset-width': '2px',
    '--volt-shadow-sm': shadow('0 1px 2px 0', 400),
    '--volt-shadow': shadow('0 2px 8px 0', 300),
    '--volt-shadow-md': shadow('0 8px 20px 0', 260),
    '--volt-shadow-lg': shadow('0 18px 38px 0', 220),
    '--volt-shadow-xl': shadow('0 28px 56px 0', 180),
  };
}

function declarations(vars: Record<string, string>): string {
  return indent(Object.entries(vars).map(([name, value]) => `${name}: ${value};`));
}

/**
 * A stylesheet for an app that already imports Volt's tokens. The selectors are the ones a shipped
 * palette uses, so `data-color` and `voltTheme` both pick it up.
 */
export function themeCss(theme: ThemeDraft): string {
  const name = normalizeThemeName(theme.name);
  const light = declarations({ ...paletteVars(theme.light), ...shapeVars(theme) });
  const dark = declarations(paletteVars(theme.dark));

  return [
    `:root[data-color='${name}'],\n[data-volt-theme][data-color='${name}'] {\n${light}\n}`,
    `.dark[data-color='${name}'],\n.dark [data-volt-theme][data-color='${name}']:not([data-mode='light']) {\n${dark}\n}`,
  ].join('\n\n');
}
