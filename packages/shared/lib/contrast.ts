/**
 * The one WCAG 2.x contrast implementation in the repository, and the list of token pairs Volt's
 * components actually paint on top of each other.
 *
 * `scripts/contrast-audit.mjs` (`pnpm check:contrast`) runs it over the shipped presets; Theme Studio
 * runs it over the palette being edited. Both therefore agree on every ratio to the last digit.
 *
 * It is a token analysis. It says whether two colours clear a WCAG threshold, not that a rendered page
 * is accessible: rendered checks live in `e2e/contracts/theme-matrix.spec.ts`, and neither replaces a
 * manual review with assistive technology.
 *
 * No imports and erasable syntax only: Node scripts load this file through type stripping.
 */

/** Linear-light sRGB channels, 0–1. */
export type LinearRgb = readonly [number, number, number];

export interface Oklch {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/**
 * Browsers paint 8-bit sRGB, so a pair at 4.50:1 in exact maths can render at 4.47:1. Round-trip a
 * channel through its 8-bit encoding to measure what is actually drawn.
 */
export function quantize(linear: number): number {
  return srgbToLinear(Math.round(linearToSrgb(linear) * 255) / 255);
}

/** `oklch(L C H)` → linear sRGB (CSS Color 4 OKLab matrices), clipped to gamut and 8-bit quantized. */
export function oklchToLinearSrgb({ l: L, c: C, h: hDeg }: Oklch): LinearRgb {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    quantize(clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    quantize(clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    quantize(clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
  ];
}

const HEX = /^#([0-9a-f]{6})$/i;

/** `#rrggbb` → linear sRGB, or `null` for anything else. */
export function hexToLinearSrgb(hex: string): LinearRgb | null {
  const match = HEX.exec(hex.trim());
  if (!match) return null;
  const int = Number.parseInt(match[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].map(channel =>
    srgbToLinear(channel / 255)
  ) as unknown as LinearRgb;
}

/** Linear sRGB → OKLCH (Björn Ottosson's OKLab). */
export function linearSrgbToOklch([r, g, b]: LinearRgb): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: okL,
    c: Math.sqrt(okA * okA + okB * okB),
    h: ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360,
  };
}

/** `#rrggbb` → OKLCH, or `null`. */
export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToLinearSrgb(hex);
  return rgb ? linearSrgbToOklch(rgb) : null;
}

/** Linear sRGB → `#rrggbb`. */
export function linearSrgbToHex(rgb: LinearRgb): string {
  return `#${rgb
    .map(channel =>
      Math.round(clamp01(linearToSrgb(clamp01(channel))) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/**
 * `color-mix(in oklch, a <weightA>, b)`: components interpolated linearly, hue along the shorter arc,
 * as `color-mix()` takes it. Achromatic hues are not treated as powerless, which only matters for
 * mixes of two greys, where the chroma is ~0 either way.
 */
export function mixOklch(a: Oklch, b: Oklch, weightA: number): Oklch {
  const hueGap = ((b.h - a.h + 540) % 360) - 180;
  return {
    l: a.l * weightA + b.l * (1 - weightA),
    c: a.c * weightA + b.c * (1 - weightA),
    h: a.h + hueGap * (1 - weightA),
  };
}

/** `overlay` at `alpha` painted over `base`: browsers composite in encoded sRGB. */
export function composite(overlay: LinearRgb, alpha: number, base: LinearRgb): LinearRgb {
  return overlay.map((channel, i) =>
    srgbToLinear(linearToSrgb(channel) * alpha + linearToSrgb(base[i]) * (1 - alpha))
  ) as unknown as LinearRgb;
}

/** WCAG relative luminance of linear-light sRGB. */
export function relativeLuminance([r, g, b]: LinearRgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrastRatio(a: LinearRgb, b: LinearRgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Text needs 4.5:1 (SC 1.4.3); a control boundary, icon or focus indicator 3:1 (SC 1.4.11). */
export type ContrastKind = 'text' | 'non-text';

export interface ContrastPair {
  /** Token names without `--`. Derived names: `surface-elevated`, `track`, `card`, `painted-input`. */
  readonly fg: string;
  readonly bg: string;
  readonly min: number;
  readonly kind: ContrastKind;
  /** What a reader of the result needs to know: the UI that paints this pair. */
  readonly label: string;
  /**
   * Which side a correction should move, if any. Only a foreground or indicator is ever proposed for
   * change; a page or surface colour moves every pair that sits on it.
   */
  readonly adjust?: 'fg';
}

const text = (fg: string, bg: string, label: string, adjust?: 'fg'): ContrastPair => ({
  fg,
  bg,
  min: 4.5,
  kind: 'text',
  label,
  adjust,
});
const ui = (fg: string, bg: string, label: string, adjust?: 'fg'): ContrastPair => ({
  fg,
  bg,
  min: 3,
  kind: 'non-text',
  label: `${label} (non-text UI, SC 1.4.11)`,
  adjust,
});

/** Pairs every palette is checked for, in every mode. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  text('foreground', 'background', 'body text on page', 'fg'),
  text('surface-foreground', 'surface', 'text on card/popover surface', 'fg'),
  text('muted-foreground', 'muted', 'muted text on muted background', 'fg'),
  text('muted-foreground', 'background', 'muted text on page', 'fg'),
  text('foreground', 'muted', 'accent text on accent background', 'fg'),
  text('primary-foreground', 'primary', 'text on primary button', 'fg'),
  text('primary', 'background', 'primary text on page'),
  text('primary', 'surface', 'primary text on card/popover surface'),
  text('secondary-foreground', 'secondary', 'text on secondary button', 'fg'),
  text('destructive-foreground', 'destructive', 'text on destructive button', 'fg'),
  text('success-foreground', 'success', 'text on success surface', 'fg'),
  text('warning-foreground', 'warning', 'text on warning surface', 'fg'),
  text('error-foreground', 'error', 'text on error surface', 'fg'),
  text('info-foreground', 'info', 'text on info surface', 'fg'),
  ui('ring', 'background', 'focus ring vs page', 'fg'),
  ui('ring', 'muted', 'active/focus ring vs accent surface', 'fg'),
  ui('input', 'background', 'form field border vs page', 'fg'),
  // Status colours used as icon/border colour directly on the page (Alert icons, Input and
  // Textarea success/error borders). Warning is deliberately absent: `--warning` is a fill
  // colour below 3:1 on most light backgrounds and `--warning-foreground` fails on dusk, so no
  // warning token is safe as an icon colour — Alert's warning icon inherits the text colour.
  ui('success', 'background', 'success icon/border vs page'),
  ui('info', 'background', 'info icon vs page'),
  ui('error', 'background', 'error border vs page'),
  ui('destructive', 'background', 'destructive icon vs page'),
  // Raised surfaces: menus, popovers and dialogs carry the same text and focus as the page.
  text('surface-foreground', 'surface-elevated', 'text on popover/dialog', 'fg'),
  text('muted-foreground', 'surface-elevated', 'muted text on popover/dialog', 'fg'),
  text('muted-foreground', 'surface', 'muted text on card', 'fg'),
  ui('ring', 'surface', 'focus ring on card', 'fg'),
  ui('ring', 'surface-elevated', 'focus ring in popover/dialog', 'fg'),
  ui('input', 'surface', 'form field border on card', 'fg'),
  ui('input', 'surface-elevated', 'form field border in dialog', 'fg'),
  // Progress, Meter and Slider: the filled part has to stand apart from what is left.
  ui('primary', 'track', 'filled progress vs track'),
  ui('track', 'primary', 'track vs filled progress'),
  // Switch: the off track carries the thumb, the on track carries it too.
  ui('background', 'input', 'switch thumb on off track'),
  ui('background', 'primary', 'switch thumb on on track'),
  // Tooltip inverts the page.
  text('background', 'foreground', 'tooltip text'),
  // Selected rows and pressed items paint the accent fill.
  ui('primary', 'muted', 'selected control on accent surface'),
  // Badge and alert fills that hold a status on a raised surface.
  ui('success', 'surface', 'success icon/border on card'),
  ui('info', 'surface', 'info icon on card'),
  ui('error', 'surface', 'error border on card'),
];

/** Alert: text stays `text-foreground` on a 10% status tint of the page. */
export const ALERT_TINTS: readonly string[] = ['info', 'success', 'warning', 'destructive'];
export const ALERT_TINT_ALPHA = 0.1;

/** Painted per style: text on a card, and a form field on the page. */
export const STYLE_PAIRS: readonly ContrastPair[] = [
  text('surface-foreground', 'card', 'text on styled card', 'fg'),
  text('muted-foreground', 'card', 'muted text on styled card', 'fg'),
  ui('ring', 'card', 'focus ring on styled card', 'fg'),
  ui('painted-input', 'background', 'styled form field border vs page'),
  ui('painted-input', 'card', 'styled form field border on card'),
];

/** The two knobs of a style that change a painted colour, in percent. */
export interface StyleKnobs {
  readonly borderEmphasis: number;
  readonly surfaceTint: number;
}
