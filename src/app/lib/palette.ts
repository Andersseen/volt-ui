/**
 * Perceptual palette generation for the Theme Studio.
 *
 * Colors are built in OKLCH rather than HSL so that a fixed lightness step looks like a
 * fixed step to the eye across every hue — the same approach as
 * [Palette Crafter](https://palette-crafter.andersseen.dev), whose JSON export this
 * module can also import directly (see `paletteFromCrafterExport`).
 *
 * Everything here is pure and SSR-safe: no browser APIs, and generation is seeded so the
 * same seed always yields the same palette.
 */

export type ColorToken =
  | 'background'
  | 'foreground'
  | 'surface'
  | 'surfaceForeground'
  | 'muted'
  | 'mutedForeground'
  | 'border'
  | 'input'
  | 'ring'
  | 'primary'
  | 'primaryForeground'
  | 'secondary'
  | 'secondaryForeground'
  | 'success'
  | 'successForeground'
  | 'warning'
  | 'warningForeground'
  | 'error'
  | 'errorForeground'
  | 'info'
  | 'infoForeground';

export type ModePalette = Record<ColorToken, string>;

export type PaletteHarmony = 'analogous' | 'complementary' | 'triadic' | 'monochrome';

export const paletteHarmonies: PaletteHarmony[] = [
  'analogous',
  'complementary',
  'triadic',
  'monochrome',
];

export interface GeneratedPalette {
  light: ModePalette;
  dark: ModePalette;
  meta: {
    seed: string;
    harmony: PaletteHarmony;
    baseHue: number;
    secondaryHue: number;
  };
}

/* ------------------------------------------------------------------ *
 * Color space conversion (sRGB ⇄ OKLab ⇄ OKLCH)
 * Formulas from Björn Ottosson's OKLab derivation.
 * ------------------------------------------------------------------ */

interface Oklch {
  l: number;
  c: number;
  h: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map(c => c + c)
          .join('')
      : normalized;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const channel = (value: number) =>
    Math.round(clamp(value, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function hexToOklch(hex: string): Oklch {
  const [r8, g8, b8] = hexToRgb(hex);
  const r = srgbToLinear(r8 / 255);
  const g = srgbToLinear(g8 / 255);
  const b = srgbToLinear(b8 / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.sqrt(okA * okA + okB * okB);
  const hue = ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;
  return { l: okL, c: chroma, h: hue };
}

function oklchToHex({ l, c, h }: Oklch): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bb = c * Math.sin(hRad);

  const lp = l + 0.3963377774 * a + 0.2158037573 * bb;
  const mp = l - 0.1055613458 * a - 0.0638541728 * bb;
  const sp = l - 0.0894841775 * a - 1.291485548 * bb;

  const l3 = lp * lp * lp;
  const m3 = mp * mp * mp;
  const s3 = sp * sp * sp;

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return rgbToHex(
    linearToSrgb(clamp(r, 0, 1)) * 255,
    linearToSrgb(clamp(g, 0, 1)) * 255,
    linearToSrgb(clamp(b, 0, 1)) * 255
  );
}

/**
 * Build a color at a target lightness/chroma, reducing chroma until the result survives
 * the round trip back through sRGB. Without this, saturated hues at extreme lightness
 * clip to a flat, visibly different color.
 */
function inGamut(l: number, c: number, h: number): string {
  let chroma = c;
  for (let i = 0; i < 24; i++) {
    const hex = oklchToHex({ l, c: chroma, h });
    const back = hexToOklch(hex);
    if (Math.abs(back.c - chroma) < 0.006 || chroma <= 0.01) return hex;
    chroma -= 0.01;
  }
  return oklchToHex({ l, c: Math.max(chroma, 0), h });
}

/* ------------------------------------------------------------------ *
 * WCAG contrast
 * ------------------------------------------------------------------ */

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => srgbToLinear(c / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/** Pick whichever of white/near-black reads better on `background`. */
export function readableForeground(background: string, dark = '#101418'): string {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, dark) ? '#ffffff' : dark;
}

/* ------------------------------------------------------------------ *
 * Seeded randomness — same seed, same palette.
 * ------------------------------------------------------------------ */

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function secondaryHueFor(harmony: PaletteHarmony, baseHue: number): number {
  switch (harmony) {
    case 'complementary':
      return (baseHue + 180) % 360;
    case 'triadic':
      return (baseHue + 120) % 360;
    case 'monochrome':
      return baseHue;
    case 'analogous':
    default:
      return (baseHue + 30) % 360;
  }
}

/* ------------------------------------------------------------------ *
 * Palette generation
 * ------------------------------------------------------------------ */

/** Semantic hues stay recognisable (green = success) but get pulled slightly toward the
 *  brand hue so the status colors still read as part of one system. */
const statusHues = { success: 152, warning: 75, error: 25, info: 240 } as const;

/**
 * Mid lightness values sit at a crossover where neither white nor near-black text
 * reaches AA — an accent generated there is unusable no matter which foreground is
 * picked. Walk lightness away from that crossover, in whichever direction favors the
 * foreground that is already winning, until the pair clears the threshold.
 */
function accentWithContrast(
  lightness: number,
  chroma: number,
  hue: number,
  onDark: string,
  minRatio = 4.6
): string {
  let l = lightness;
  let color = inGamut(l, chroma, hue);
  // Lighter surfaces want dark text (so keep lightening); darker ones want white.
  const step = contrastRatio(color, '#ffffff') >= contrastRatio(color, onDark) ? -0.01 : 0.01;

  for (let i = 0; i < 45; i++) {
    if (contrastRatio(color, readableForeground(color, onDark)) >= minRatio) return color;
    l = clamp(l + step, 0.05, 0.98);
    color = inGamut(l, chroma, hue);
  }
  return color;
}

function tintTowards(hue: number, towards: number, amount: number): number {
  const delta = (((towards - hue + 540) % 360) - 180) * amount;
  return (hue + delta + 360) % 360;
}

function buildMode(
  mode: 'light' | 'dark',
  baseHue: number,
  secondaryHue: number,
  chroma: number
): ModePalette {
  const isLight = mode === 'light';
  // Neutrals keep a trace of the brand hue so backgrounds feel tinted, not grey.
  const neutralChroma = chroma * 0.12;

  const background = isLight
    ? inGamut(0.985, neutralChroma * 0.5, baseHue)
    : inGamut(0.17, neutralChroma * 0.7, baseHue);
  const foreground = isLight
    ? inGamut(0.24, neutralChroma, baseHue)
    : inGamut(0.965, neutralChroma * 0.4, baseHue);
  const surface = isLight ? inGamut(1, 0, baseHue) : inGamut(0.215, neutralChroma * 0.7, baseHue);
  const muted = isLight
    ? inGamut(0.955, neutralChroma, baseHue)
    : inGamut(0.265, neutralChroma * 0.8, baseHue);
  const mutedForeground = isLight
    ? inGamut(0.53, neutralChroma * 1.4, baseHue)
    : inGamut(0.72, neutralChroma * 1.2, baseHue);
  const border = isLight
    ? inGamut(0.9, neutralChroma * 1.2, baseHue)
    : inGamut(0.32, neutralChroma, baseHue);

  const onDark = isLight ? '#101418' : inGamut(0.16, neutralChroma, baseHue);

  const primary = isLight
    ? accentWithContrast(0.58, chroma, baseHue, onDark)
    : accentWithContrast(0.68, chroma * 0.92, baseHue, onDark);
  const secondary = isLight
    ? accentWithContrast(0.63, chroma * 0.78, secondaryHue, onDark)
    : accentWithContrast(0.72, chroma * 0.72, secondaryHue, onDark);

  const status = (hue: number) =>
    isLight
      ? accentWithContrast(0.62, chroma * 0.85, tintTowards(hue, baseHue, 0.08), onDark)
      : accentWithContrast(0.7, chroma * 0.8, tintTowards(hue, baseHue, 0.08), onDark);

  const success = status(statusHues.success);
  const warning = status(statusHues.warning);
  const error = status(statusHues.error);
  const info = status(statusHues.info);

  return {
    background,
    foreground,
    surface,
    surfaceForeground: foreground,
    muted,
    mutedForeground,
    border,
    input: border,
    ring: primary,
    primary,
    primaryForeground: readableForeground(primary, onDark),
    secondary,
    secondaryForeground: readableForeground(secondary, onDark),
    success,
    successForeground: readableForeground(success, onDark),
    warning,
    warningForeground: readableForeground(warning, onDark),
    error,
    errorForeground: readableForeground(error, onDark),
    info,
    infoForeground: readableForeground(info, onDark),
  };
}

export interface GeneratePaletteOptions {
  seed: string;
  harmony?: PaletteHarmony;
  /** Force a base hue (0–360) instead of deriving one from the seed. */
  baseHue?: number;
}

/**
 * Generate a full light + dark palette. Deterministic: the same seed and harmony always
 * produce the same colors.
 */
export function generatePalette({
  seed,
  harmony = 'analogous',
  baseHue,
}: GeneratePaletteOptions): GeneratedPalette {
  const random = mulberry32(hashSeed(seed));
  const hue = baseHue ?? Math.round(random() * 360);
  const secondaryHue = secondaryHueFor(harmony, hue);
  // Keep chroma in a band that stays inside sRGB for every hue while still feeling
  // saturated — beyond ~0.17 the yellows and greens clip hard.
  const chroma = 0.12 + random() * 0.05;

  return {
    light: buildMode('light', hue, secondaryHue, chroma),
    dark: buildMode('dark', hue, secondaryHue, chroma),
    meta: { seed, harmony, baseHue: hue, secondaryHue: Math.round(secondaryHue) },
  };
}

/** A fresh random seed. Only called from a click handler, so `Math.random` is fine. */
export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ *
 * Palette Crafter interop
 * ------------------------------------------------------------------ */

interface CrafterScale {
  DEFAULT?: string;
  foreground?: string;
  [shade: string]: string | undefined;
}

interface CrafterExport {
  theme?: {
    bg?: string;
    fg?: string;
    primary?: CrafterScale;
    secondary?: CrafterScale;
    status?: Record<string, CrafterScale | undefined>;
  };
  meta?: { mode?: string; baseHue?: number; harmony?: string; seed?: string };
}

export class PaletteImportError extends Error {}

const isHex = (value: unknown): value is string =>
  typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

/**
 * Map a [Palette Crafter](https://palette-crafter.andersseen.dev) JSON export onto Volt's
 * semantic tokens.
 *
 * Crafter exports one mode at a time plus 50–950 scales; the scales are what makes the
 * opposite mode derivable — the light palette reads from the pale end, the dark one from
 * the deep end, so a single export fills both of Volt's modes.
 */
export function paletteFromCrafterExport(raw: string): GeneratedPalette {
  let parsed: CrafterExport;
  try {
    parsed = JSON.parse(raw) as CrafterExport;
  } catch {
    throw new PaletteImportError('That is not valid JSON. Copy the JSON tab from Palette Crafter.');
  }

  const theme = parsed.theme;
  if (!theme?.primary || !isHex(theme.primary.DEFAULT)) {
    throw new PaletteImportError(
      'No palette found. Use the JSON export from Palette Crafter (it starts with {"theme": …).'
    );
  }

  const shade = (scale: CrafterScale | undefined, key: string, fallback: string): string => {
    const value = scale?.[key];
    return isHex(value) ? value.trim().toLowerCase() : fallback;
  };

  const primaryScale = theme.primary;
  const secondaryScale = theme.secondary ?? primaryScale;
  const status = theme.status ?? {};

  const primaryLight = shade(primaryScale, 'DEFAULT', '#4c5bc9');
  const primaryDark = shade(primaryScale, '400', primaryLight);
  const secondaryLight = shade(secondaryScale, 'DEFAULT', primaryLight);
  const secondaryDark = shade(secondaryScale, '400', secondaryLight);

  const statusColor = (name: string, mode: 'light' | 'dark', fallback: string): string =>
    shade(status[name], mode === 'light' ? 'DEFAULT' : '400', fallback);

  const bg = isHex(theme.bg) ? theme.bg.toLowerCase() : '#ffffff';
  const fg = isHex(theme.fg) ? theme.fg.toLowerCase() : '#101418';
  const fgOklch = hexToOklch(fg);
  const brandHue = hexToOklch(primaryLight).h;

  const light: ModePalette = {
    background: bg,
    foreground: fg,
    surface: shade(primaryScale, '50', bg),
    surfaceForeground: fg,
    muted: shade(primaryScale, '50', '#f4f5f9'),
    mutedForeground: inGamut(0.53, Math.min(fgOklch.c * 1.4, 0.04), brandHue),
    border: shade(primaryScale, '200', '#e2e5ee'),
    input: shade(primaryScale, '200', '#e2e5ee'),
    ring: primaryLight,
    primary: primaryLight,
    primaryForeground: shade(primaryScale, 'foreground', readableForeground(primaryLight)),
    secondary: secondaryLight,
    secondaryForeground: shade(secondaryScale, 'foreground', readableForeground(secondaryLight)),
    success: statusColor('success', 'light', '#0f9d58'),
    successForeground: readableForeground(statusColor('success', 'light', '#0f9d58')),
    warning: statusColor('warning', 'light', '#b4750d'),
    warningForeground: readableForeground(statusColor('warning', 'light', '#b4750d')),
    error: statusColor('danger', 'light', '#d13438'),
    errorForeground: readableForeground(statusColor('danger', 'light', '#d13438')),
    info: statusColor('info', 'light', '#1a73e8'),
    infoForeground: readableForeground(statusColor('info', 'light', '#1a73e8')),
  };

  const darkBackground = shade(primaryScale, '950', inGamut(0.17, 0.012, brandHue));
  const darkSurface = inGamut(hexToOklch(darkBackground).l + 0.04, 0.014, brandHue);

  const dark: ModePalette = {
    background: darkBackground,
    foreground: shade(primaryScale, '50', '#f5f7ff'),
    surface: darkSurface,
    surfaceForeground: shade(primaryScale, '50', '#f5f7ff'),
    muted: inGamut(hexToOklch(darkBackground).l + 0.09, 0.016, brandHue),
    mutedForeground: inGamut(0.72, 0.02, brandHue),
    border: inGamut(hexToOklch(darkBackground).l + 0.15, 0.018, brandHue),
    input: inGamut(hexToOklch(darkBackground).l + 0.15, 0.018, brandHue),
    ring: primaryDark,
    primary: primaryDark,
    primaryForeground: readableForeground(primaryDark, darkBackground),
    secondary: secondaryDark,
    secondaryForeground: readableForeground(secondaryDark, darkBackground),
    success: statusColor('success', 'dark', '#4ade80'),
    successForeground: readableForeground(
      statusColor('success', 'dark', '#4ade80'),
      darkBackground
    ),
    warning: statusColor('warning', 'dark', '#fbbf24'),
    warningForeground: readableForeground(
      statusColor('warning', 'dark', '#fbbf24'),
      darkBackground
    ),
    error: statusColor('danger', 'dark', '#f87171'),
    errorForeground: readableForeground(statusColor('danger', 'dark', '#f87171'), darkBackground),
    info: statusColor('info', 'dark', '#60a5fa'),
    infoForeground: readableForeground(statusColor('info', 'dark', '#60a5fa'), darkBackground),
  };

  return {
    light,
    dark,
    meta: {
      seed: parsed.meta?.seed ?? 'palette-crafter',
      harmony: (paletteHarmonies as string[]).includes(parsed.meta?.harmony ?? '')
        ? (parsed.meta?.harmony as PaletteHarmony)
        : 'analogous',
      baseHue: Math.round(parsed.meta?.baseHue ?? brandHue),
      secondaryHue: Math.round(hexToOklch(secondaryLight).h),
    },
  };
}

/** Deep link that reproduces a generated palette in Palette Crafter. */
export function crafterUrl(meta: GeneratedPalette['meta'], mode: 'light' | 'dark'): string {
  const params = new URLSearchParams({
    seed: meta.seed,
    mode,
    harmony: meta.harmony,
    baseHue: String(meta.baseHue),
    algorithm: 'v2',
  });
  return `https://palette-crafter.andersseen.dev/?${params.toString()}`;
}
