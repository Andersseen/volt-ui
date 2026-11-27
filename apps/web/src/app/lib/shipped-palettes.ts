import duskColor from '../../../../../packages/volt/src/themes/colors/dusk.css?raw';
import emberColor from '../../../../../packages/volt/src/themes/colors/ember.css?raw';
import glacierColor from '../../../../../packages/volt/src/themes/colors/glacier.css?raw';
import sageColor from '../../../../../packages/volt/src/themes/colors/sage.css?raw';
import brutalStyle from '../../../../../packages/volt/src/themes/styles/brutal.css?raw';
import ghostStyle from '../../../../../packages/volt/src/themes/styles/ghost.css?raw';
import retroStyle from '../../../../../packages/volt/src/themes/styles/retro.css?raw';
import softStyle from '../../../../../packages/volt/src/themes/styles/soft.css?raw';
import tokens from '../../../../../packages/volt/src/themes/tokens.css?raw';
import type { StyleKnobs } from '@shared/lib/contrast';
import type { ColorPreset, StylePreset } from '@shared/lib/theme-presets';
import { oklchToHex, type ColorToken, type ModePalette } from './palette';

/**
 * The studio's starting points, read from the stylesheets the library ships rather than copied, so
 * a palette or style change cannot leave the studio offering an old one. The colour fields edit hex.
 *
 * Volt's own palette and the Sharp style are the defaults, so they live in `tokens.css`.
 */
const COLOR_SOURCES: Record<ColorPreset, string> = {
  volt: tokens,
  ember: emberColor,
  sage: sageColor,
  dusk: duskColor,
  glacier: glacierColor,
};

const STYLE_SOURCES: Record<StylePreset, string> = {
  sharp: tokens,
  soft: softStyle,
  brutal: brutalStyle,
  ghost: ghostStyle,
  retro: retroStyle,
};

const TOKENS: Record<ColorToken, string> = {
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

/** Every rule of a stylesheet, comments removed. The theme files never nest rules. */
function rules(css: string): { selector: string; body: string }[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => ({
    selector: match[1].trim(),
    body: match[2],
  }));
}

/** The declarations of the rule whose selector list targets `attribute='name'`, light or dark. */
function ruleFor(css: string, attribute: string, name: string, dark: boolean): string {
  const rule = rules(css).find(
    ({ selector }) =>
      selector.includes(`[${attribute}='${name}']`) && selector.includes('.dark') === dark
  );
  if (!rule) {
    throw new Error(`No ${dark ? 'dark' : 'light'} rule for [${attribute}='${name}']`);
  }
  return rule.body;
}

function readPalette(rule: string): ModePalette {
  const read = (token: string): string => {
    const match = rule.match(new RegExp(`--${token}: oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`));
    if (!match) {
      throw new Error(`Palette token --${token} is not a literal oklch() value`);
    }
    return oklchToHex({ l: Number(match[1]), c: Number(match[2]), h: Number(match[3]) });
  };

  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [key, read(token)])
  ) as ModePalette;
}

/** The light and dark values of a shipped palette, as hex. */
export function shippedPalette(name: ColorPreset): { light: ModePalette; dark: ModePalette } {
  const source = COLOR_SOURCES[name];
  return {
    light: readPalette(ruleFor(source, 'data-color', name, false)),
    dark: readPalette(ruleFor(source, 'data-color', name, true)),
  };
}

/** What a shipped style sets for the shape controls the studio exposes, in the studio's units. */
export interface ShippedStyleShape {
  /** px */
  readonly radius: number;
  /** px, surfaces */
  readonly borderWidth: number;
  /** px */
  readonly ringWidth: number;
  /** `--spacing-component`, as a percentage */
  readonly spacing: number;
  readonly knobs: StyleKnobs;
}

export function shippedStyle(name: StylePreset): ShippedStyleShape {
  const rule = ruleFor(STYLE_SOURCES[name], 'data-style', name, false);
  const value = (token: string): string => {
    const match = rule.match(new RegExp(`${token}:\\s*([^;]+);`));
    if (!match) throw new Error(`Style ${name} does not set ${token}`);
    return match[1].trim();
  };
  const length = (token: string): number => {
    const raw = value(token);
    const number = Number.parseFloat(raw);
    return raw.endsWith('rem') ? number * 16 : number;
  };
  const percent = (token: string): number => Number.parseFloat(value(token));

  return {
    radius: length('--radius'),
    borderWidth: length('--border-width'),
    ringWidth: length('--ring-width'),
    spacing: Math.round(Number.parseFloat(value('--spacing-component')) * 100),
    knobs: {
      borderEmphasis: percent('--volt-border-emphasis'),
      surfaceTint: percent('--volt-surface-tint'),
    },
  };
}
