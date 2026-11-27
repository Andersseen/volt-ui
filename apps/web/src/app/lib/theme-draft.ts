import type { PlainTranslationKey } from '@shared/i18n/i18n';
import {
  COLOR_PRESETS,
  STYLE_PRESETS,
  type ColorPreset,
  type StylePreset,
} from '@shared/lib/theme-presets';
import type { VoltThemeDensity } from 'volt';
import type { ColorToken, ModePalette } from './palette';
import { shippedPalette } from './shipped-palettes';

/**
 * The data behind the theme studio: token names, the editable field list, the starting
 * presets, and the pure functions that turn a draft into CSS.
 *
 * None of this is view logic, so it lives next to the palette maths rather than inside a
 * page component — which is what lets the studio page be a layout and nothing more.
 *
 * A draft keeps four things apart: the **palette** it started from (colours, per mode), the
 * **style** preset and **density** a consumer applies alongside it, and **shape overrides** — the
 * few style tokens the designer chose to set themselves. Only the palette and the overrides are
 * CSS; the style and density are configuration (`provideVoltTheme`).
 */

export type ThemeMode = 'light' | 'dark';
/** Every shipped palette is a starting point. */
export type PresetName = ColorPreset;

export const DENSITIES: readonly VoltThemeDensity[] = ['compact', 'comfortable', 'spacious'];

export type ShapeKey = 'radius' | 'borderWidth' | 'ringWidth' | 'shadowIntensity' | 'spacing';

/** A shape token the designer set, or `null` to keep the style preset's value. */
export type ShapeOverrides = Record<ShapeKey, number | null>;

export interface ShapeControl {
  readonly key: ShapeKey;
  readonly unit: 'px' | '%';
  readonly min: number;
  readonly max: number;
  readonly labelKey: PlainTranslationKey;
}

/** The structural controls the studio exposes, with the ranges the project format accepts. */
export const SHAPE_CONTROLS: readonly ShapeControl[] = [
  { key: 'radius', unit: 'px', min: 0, max: 24, labelKey: 'themeStudio.shape.radius' },
  { key: 'borderWidth', unit: 'px', min: 0, max: 4, labelKey: 'themeStudio.shape.border' },
  { key: 'ringWidth', unit: 'px', min: 1, max: 5, labelKey: 'themeStudio.shape.ring' },
  { key: 'shadowIntensity', unit: '%', min: 0, max: 24, labelKey: 'themeStudio.shape.shadow' },
  { key: 'spacing', unit: '%', min: 80, max: 125, labelKey: 'themeStudio.shape.spacing' },
];

export interface ThemeDraft {
  name: string;
  /** The shipped palette this draft started from: what "reset" goes back to. */
  palette: PresetName;
  style: StylePreset;
  density: VoltThemeDensity;
  shape: ShapeOverrides;
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

/**
 * The overrides a new draft starts with. They are the values the studio has always exported, so a
 * draft nobody touched still produces the same stylesheet.
 */
export const DEFAULT_SHAPE: ShapeOverrides = {
  radius: 6,
  borderWidth: 1,
  ringWidth: 2,
  shadowIntensity: 10,
  spacing: null,
};

/** Overrides that all defer to the style preset. */
export const NO_SHAPE_OVERRIDES: ShapeOverrides = {
  radius: null,
  borderWidth: null,
  ringWidth: null,
  shadowIntensity: null,
  spacing: null,
};

/** A starting draft: the shipped palette, as the hex values the colour fields edit. */
export function clonePreset(name: PresetName, themeName = 'custom-theme'): ThemeDraft {
  return {
    name: themeName,
    palette: name,
    style: 'sharp',
    density: 'comfortable',
    shape: { ...DEFAULT_SHAPE },
    ...shippedPalette(name),
  };
}

/** Longest theme name the library accepts (`voltCustomColor`). */
export const THEME_NAME_MAX = 48;

/**
 * The CSS identifier a typed name becomes: lowercase letters, digits and single hyphens, starting
 * with a letter — exactly what `voltCustomColor()` accepts.
 */
export function normalizeThemeName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const named = /^[a-z]/.test(slug) ? slug : slug ? `theme-${slug}` : '';
  return named.slice(0, THEME_NAME_MAX).replace(/-+$/, '') || 'custom-theme';
}

/** A name that would replace a shipped palette instead of adding one. */
export function isShippedPaletteName(name: string): boolean {
  return (COLOR_PRESETS as readonly string[]).includes(normalizeThemeName(name));
}

export function eventValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

export function indent(lines: string[]): string {
  return lines.map(line => `  ${line}`).join('\n');
}

/** Narrows an untyped `<volt-select>` value to a preset name. */
export function isPresetName(value: unknown): value is PresetName {
  return (COLOR_PRESETS as readonly unknown[]).includes(value);
}

export function isStylePreset(value: unknown): value is StylePreset {
  return (STYLE_PRESETS as readonly unknown[]).includes(value);
}

export function isDensity(value: unknown): value is VoltThemeDensity {
  return (DENSITIES as readonly unknown[]).includes(value);
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
 * The shape tokens a draft overrides. The preview and the exported stylesheet both come from here, so
 * what the studio shows is what an app gets. Surfaces take the chosen border; a control never drops
 * below 1px, because its outline is what makes it recognisable. A `null` override writes nothing, and
 * the style preset's value applies.
 */
export function shapeVars(theme: Pick<ThemeDraft, 'shape'>): Record<string, string> {
  const { radius, borderWidth, ringWidth, shadowIntensity, spacing } = theme.shape;
  const vars: Record<string, string> = {};

  if (radius !== null) {
    vars['--radius'] = `${radius}px`;
    vars['--volt-radius-pill'] = radius === 0 ? '0px' : '9999px';
  }
  if (borderWidth !== null) {
    vars['--border-width'] = `${borderWidth}px`;
    vars['--volt-control-border-width'] = `${Math.max(borderWidth, 1)}px`;
  }
  if (ringWidth !== null) {
    vars['--ring-width'] = `${ringWidth}px`;
    vars['--ring-offset-width'] = '2px';
  }
  if (shadowIntensity !== null) {
    const shadow = (geometry: string, divisor: number) =>
      `${geometry} rgb(0 0 0 / ${shadowIntensity / divisor})`;
    vars['--volt-shadow-sm'] = shadow('0 1px 2px 0', 400);
    vars['--volt-shadow'] = shadow('0 2px 8px 0', 300);
    vars['--volt-shadow-md'] = shadow('0 8px 20px 0', 260);
    vars['--volt-shadow-lg'] = shadow('0 18px 38px 0', 220);
    vars['--volt-shadow-xl'] = shadow('0 28px 56px 0', 180);
  }
  if (spacing !== null) {
    vars['--spacing-component'] = String(spacing / 100);
  }
  return vars;
}

function declarations(vars: Record<string, string>): string {
  return indent(Object.entries(vars).map(([name, value]) => `${name}: ${value};`));
}

/**
 * A stylesheet for an app that already imports Volt's tokens. The selectors are the ones a shipped
 * palette uses, so `data-color` on `<html>` and `voltTheme` scopes — light, dark and nested either
 * way — pick it up exactly like a shipped palette. `selectorName` lets the studio render its own
 * preview from this same stylesheet under a private name.
 */
export function themeCss(theme: ThemeDraft, selectorName = normalizeThemeName(theme.name)): string {
  const name = selectorName;
  const light = declarations({ ...paletteVars(theme.light), ...shapeVars(theme) });
  const dark = declarations(paletteVars(theme.dark));

  return [
    `:root[data-color='${name}'],\n[data-volt-theme][data-color='${name}'] {\n${light}\n}`,
    `.dark[data-color='${name}'],\n.dark [data-volt-theme][data-color='${name}']:not([data-mode='light']) {\n${dark}\n}`,
  ].join('\n\n');
}

/**
 * The TypeScript that makes the exported palette part of an app: the declared name, the theme at
 * bootstrap, and the first-paint script that may restore it. Plain Volt APIs, no studio code.
 */
export function themeIntegrationSnippet(theme: ThemeDraft): string {
  const name = normalizeThemeName(theme.name);
  const constant = name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return [
    `import { provideVoltTheme, voltCustomColor, voltThemeInitScript } from '@voltui/components';`,
    ``,
    `// The palette defined in ${name}.css (import it after @voltui/components/themes.css).`,
    `export const ${constant} = voltCustomColor('${name}');`,
    ``,
    `export const appConfig = {`,
    `  providers: [`,
    `    provideVoltTheme({ color: ${constant}, style: '${theme.style}', density: '${theme.density}' }),`,
    `  ],`,
    `};`,
    ``,
    `// Optional: restore a visitor's stored choice before first paint (inline it in <head>).`,
    `export const themeScript = voltThemeInitScript({`,
    `  defaults: { color: ${constant}, style: '${theme.style}', density: '${theme.density}' },`,
    `  customColors: [${constant}],`,
    `});`,
    ``,
  ].join('\n');
}
