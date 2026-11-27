import {
  ALERT_TINT_ALPHA,
  ALERT_TINTS,
  CONTRAST_PAIRS,
  composite,
  contrastRatio,
  hexToLinearSrgb,
  hexToOklch,
  mixOklch,
  oklchToLinearSrgb,
  STYLE_PAIRS,
  type ContrastKind,
  type LinearRgb,
  type Oklch,
  type StyleKnobs,
} from '@shared/lib/contrast';
import type { ColorToken, ModePalette } from './palette';
import { inGamut } from './palette';
import type { ThemeDraft, ThemeMode } from './theme-draft';

/**
 * The Live Contrast Inspector's evaluation: the same pairs and maths `pnpm check:contrast` runs on
 * the shipped presets (`@shared/lib/contrast`), applied to the palette being edited, in both modes,
 * with the style the draft uses.
 *
 * This is a token-level check. It does not render anything, and passing it is not a WCAG
 * conformance claim; see the inspector's notes for what it cannot see.
 */

export type ContrastStatus = 'pass' | 'fail' | 'not-evaluated';

export interface ContrastResult {
  /** Stable across edits, so the list keeps its DOM (and focus) while ratios change. */
  readonly id: string;
  readonly mode: ThemeMode;
  /** CSS token names, without `--`. Derived names are explained in `DERIVED`. */
  readonly fg: string;
  readonly bg: string;
  readonly kind: ContrastKind;
  readonly min: number;
  /** Rounded to two decimals, as reported; `null` when not evaluated. */
  readonly ratio: number | null;
  readonly status: ContrastStatus;
  /** The UI that paints this pair, in English (the inspector shows a translated role too). */
  readonly label: string;
  /** The editable token to jump to: the foreground when it is one, else the colour under it. */
  readonly target: ColorToken | null;
  /** The token a correction would change, when one may be proposed. */
  readonly adjustable: ColorToken | null;
}

/** Tokens the library computes from the palette rather than reading one value. */
export const DERIVED: Readonly<Record<string, string>> = {
  'surface-elevated': 'surface (light) or surface mixed 8% towards foreground (dark)',
  track: 'foreground mixed 12% into background',
  card: 'surface tinted towards muted by the style',
  'painted-input': 'input leaned towards foreground by the style',
};

const TOKEN_FOR: Record<string, ColorToken> = {
  background: 'background',
  foreground: 'foreground',
  surface: 'surface',
  'surface-foreground': 'surfaceForeground',
  muted: 'muted',
  'muted-foreground': 'mutedForeground',
  border: 'border',
  input: 'input',
  ring: 'ring',
  primary: 'primary',
  'primary-foreground': 'primaryForeground',
  secondary: 'secondary',
  'secondary-foreground': 'secondaryForeground',
  success: 'success',
  'success-foreground': 'successForeground',
  warning: 'warning',
  'warning-foreground': 'warningForeground',
  error: 'error',
  'error-foreground': 'errorForeground',
  info: 'info',
  'info-foreground': 'infoForeground',
  // The studio edits one danger colour; the library paints with both roles.
  destructive: 'error',
  'destructive-foreground': 'errorForeground',
  // Derived roles jump to the colour they are made from.
  'surface-elevated': 'surface',
  track: 'foreground',
  card: 'surface',
  'painted-input': 'input',
};

/** The editable token behind a CSS token name, or `null`. */
export function editableToken(cssName: string): ColorToken | null {
  return TOKEN_FOR[cssName.replace(/\/\d+$/, '')] ?? null;
}

const DIRECT = new Set(Object.keys(TOKEN_FOR).filter(name => !(name in DERIVED)));

type Resolver = (name: string) => LinearRgb | null;

function resolver(palette: ModePalette, mode: ThemeMode, knobs: StyleKnobs): Resolver {
  const lch = (name: string): Oklch | null => {
    const token = TOKEN_FOR[name];
    return token ? hexToOklch(palette[token]) : null;
  };
  const mix = (a: string, b: string, weightA: number): LinearRgb | null => {
    const [first, second] = [lch(a), lch(b)];
    return first && second ? oklchToLinearSrgb(mixOklch(first, second, weightA)) : null;
  };

  return name => {
    if (DIRECT.has(name)) return hexToLinearSrgb(palette[TOKEN_FOR[name]]);
    switch (name) {
      case 'surface-elevated':
        return mode === 'light'
          ? hexToLinearSrgb(palette.surface)
          : mix('surface', 'foreground', 0.92);
      case 'track':
        return mix('foreground', 'background', 0.12);
      case 'card':
        return mix('surface', 'muted', 1 - knobs.surfaceTint / 100);
      case 'painted-input':
        return mix('input', 'foreground', 1 - knobs.borderEmphasis / 100);
      default:
        return null;
    }
  };
}

/** Every pair for both modes of `draft`, painted with `knobs` (the draft's style). */
export function evaluateContrast(draft: ThemeDraft, knobs: StyleKnobs): ContrastResult[] {
  const results: ContrastResult[] = [];

  for (const mode of ['light', 'dark'] as const) {
    const resolve = resolver(draft[mode], mode, knobs);
    const record = (
      id: string,
      fg: string,
      bg: string,
      min: number,
      kind: ContrastKind,
      label: string,
      colors: [LinearRgb | null, LinearRgb | null],
      adjust?: 'fg'
    ) => {
      const [fgColor, bgColor] = colors;
      const ratio = fgColor && bgColor ? contrastRatio(fgColor, bgColor) : null;
      const fgToken = editableToken(fg);
      results.push({
        id: `${mode}:${id}`,
        mode,
        fg,
        bg,
        kind,
        min,
        ratio: ratio === null ? null : Math.round(ratio * 100) / 100,
        status: ratio === null ? 'not-evaluated' : ratio >= min ? 'pass' : 'fail',
        label,
        target: fg in DERIVED ? editableToken(bg) : (fgToken ?? editableToken(bg)),
        adjustable: adjust === 'fg' && DIRECT.has(fg) ? fgToken : null,
      });
    };

    for (const pair of [...CONTRAST_PAIRS, ...STYLE_PAIRS]) {
      record(
        `${pair.fg}|${pair.bg}`,
        pair.fg,
        pair.bg,
        pair.min,
        pair.kind,
        pair.label,
        [resolve(pair.fg), resolve(pair.bg)],
        pair.adjust
      );
    }

    const page = resolve('background');
    const text = resolve('foreground');
    for (const tint of ALERT_TINTS) {
      const fill = resolve(tint);
      record(
        `foreground|${tint}/10`,
        'foreground',
        `${tint}/10`,
        4.5,
        'text',
        `text on ${tint} alert`,
        [text, fill && page ? composite(fill, ALERT_TINT_ALPHA, page) : null]
      );
    }
  }

  return results;
}

export interface ContrastSuggestion {
  readonly token: ColorToken;
  readonly mode: ThemeMode;
  readonly from: string;
  readonly to: string;
  /** The pair's ratio with the proposed colour, measured with the same maths. */
  readonly ratio: number;
}

/**
 * The smallest lightness change to `result`'s foreground, keeping its hue (and as much chroma as
 * the sRGB gamut allows), that clears the pair's threshold. `null` when the pair may not be
 * corrected this way or no lightness reaches the threshold.
 */
export function suggestCorrection(
  draft: ThemeDraft,
  knobs: StyleKnobs,
  result: ContrastResult
): ContrastSuggestion | null {
  if (result.status !== 'fail' || !result.adjustable) return null;
  const token = result.adjustable;
  const palette = draft[result.mode];
  const original = hexToOklch(palette[token]);
  if (!original) return null;

  const background = resolver(palette, result.mode, knobs)(result.bg);
  if (!background) return null;
  // A hair above the threshold, so rounding to 8-bit hex cannot land it back underneath.
  const target = result.min + 0.02;

  let best: { hex: string; ratio: number; delta: number } | null = null;
  for (const direction of [-1, 1]) {
    for (let step = 1; step <= 100; step++) {
      const l = original.l + direction * step * 0.01;
      if (l < 0 || l > 1) break;
      const hex = inGamut(l, original.c, original.h);
      const rgb = hexToLinearSrgb(hex);
      if (!rgb) break;
      const ratio = contrastRatio(rgb, background);
      if (ratio >= target) {
        if (!best || step < best.delta) best = { hex, ratio, delta: step };
        break;
      }
    }
  }
  if (!best) return null;
  return {
    token,
    mode: result.mode,
    from: palette[token],
    to: best.hex,
    ratio: Math.round(best.ratio * 100) / 100,
  };
}
