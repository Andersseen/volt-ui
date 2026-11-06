#!/usr/bin/env node
/**
 * WCAG 2.x contrast audit for every Volt theme preset.
 *
 * Volt's presets are a cross product of *color* (`data-color`) and *style*
 * (`data-style`). Style presets set no semantic color token, but two of their
 * knobs change a painted color: `--volt-border-emphasis` leans borders towards
 * the text, and `--volt-surface-tint` leans cards towards `--muted`. Both are
 * covered below with the values each style really ships, so the audit walks
 * 5 colors x 2 modes for the palette pairs, plus those pairs per style.
 *
 * This is a token analysis: it says which color pairs clear WCAG thresholds, not
 * that a rendered page is accessible. `e2e/contracts/theme-matrix.spec.ts` checks
 * the rendered gallery; neither replaces testing with assistive technology.
 *
 * Usage: node scripts/contrast-audit.mjs [--json]
 * Exit code: 1 if any pair fails its WCAG threshold, 0 otherwise.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const THEMES = join(ROOT, 'packages/volt/src/themes');

// ---------------------------------------------------------------------------
// oklch(L C H) -> linear sRGB, per the CSS Color 4 OKLab matrices.
// ---------------------------------------------------------------------------
function oklchToLinearSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [r, g, bl].map(v => quantize(Math.min(1, Math.max(0, v))));
}

// Browsers paint 8-bit sRGB, so a pair at 4.50:1 in exact maths can render at 4.47:1.
// Round-trip each channel through its 8-bit sRGB encoding to audit what is actually drawn.
function quantize(linear) {
  const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  const byte = Math.round(encoded * 255) / 255;
  return byte <= 0.04045 ? byte / 12.92 : ((byte + 0.055) / 1.055) ** 2.4;
}

// Relative luminance per WCAG: linear-light RGB, no extra gamma step needed
// since the OKLab matrices above already output linear-light values.
function relativeLuminance([r, g, b]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(rgbA, rgbB) {
  const [hi, lo] = [relativeLuminance(rgbA), relativeLuminance(rgbB)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const OKLCH_RE = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)$/;
const VAR_RE = /^var\(--([\w-]+)\)$/;
const MIX_RE = /^color-mix\(in oklch,\s*(.+?)(?:\s+([\d.]+)%)?,\s*(.+?)(?:\s+([\d.]+)%)?\)$/;

/** A token value as [L, C, H]: a literal, a `var()` of another token, or an oklch `color-mix()`. */
function toOklch(value, tokens) {
  const text = value?.trim();
  if (!text) return null;
  const literal = text.match(OKLCH_RE);
  if (literal) return [Number(literal[1]), Number(literal[2]), Number(literal[3])];
  const reference = text.match(VAR_RE);
  if (reference) return toOklch(tokens[`--${reference[1]}`], tokens);
  const mix = text.match(MIX_RE);
  if (!mix) return null;
  const [a, b] = [toOklch(mix[1], tokens), toOklch(mix[3], tokens)];
  if (!a || !b) return null;
  const weightA = mix[2] ? Number(mix[2]) / 100 : mix[4] ? 1 - Number(mix[4]) / 100 : 0.5;
  const hueGap = ((b[2] - a[2] + 540) % 360) - 180; // the shorter arc, as color-mix() takes it
  return [
    a[0] * weightA + b[0] * (1 - weightA),
    a[1] * weightA + b[1] * (1 - weightA),
    a[2] + hueGap * (1 - weightA),
  ];
}

function toRgb(value, tokens) {
  const lch = toOklch(value, tokens);
  return lch ? oklchToLinearSrgb(...lch) : null;
}

const encode = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const decode = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** `overlay` at `alpha` painted over `base`: browsers composite in encoded sRGB. */
function over(overlay, alpha, base) {
  return overlay.map((c, i) => decode(encode(c) * alpha + encode(base[i]) * (1 - alpha)));
}

// ---------------------------------------------------------------------------
// Minimal CSS custom-property extraction (no nesting, which our theme files
// never use, so a plain brace-matched pass is sufficient).
// ---------------------------------------------------------------------------
function parseBlocks(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    const vars = {};
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const key = decl.slice(0, i).trim();
      const value = decl.slice(i + 1).trim();
      if (key.startsWith('--')) vars[key] = value;
    }
    blocks.push({ selector, vars });
  }
  return blocks;
}

function collectTokens(color, dark) {
  const vars = {};
  const files = [join(THEMES, 'tokens.css'), join(THEMES, `colors/${color}.css`)];
  for (const file of files) {
    for (const { selector, vars: blockVars } of parseBlocks(readFileSync(file, 'utf8'))) {
      const isDarkSelector = selector.includes('.dark');
      if (isDarkSelector && !dark) continue;

      const targetsThisColor = selector.includes(`data-color='${color}'`);
      const targetsRootDefault = selector
        .split(',')
        .some(part => part.trim() === ':root' || part.trim() === '.dark');
      // Tailwind's `@theme` block and the style defaults hold no palette values.
      if (selector.startsWith('@')) continue;

      if (!targetsThisColor && !targetsRootDefault) continue;
      Object.assign(vars, blockVars);
    }
  }
  return vars;
}

// ---------------------------------------------------------------------------
// Pairs to check. Thresholds follow WCAG 2.x SC 1.4.3 (text, 4.5:1) and
// SC 1.4.11 (non-text UI components / focus indicators, 3:1).
// ---------------------------------------------------------------------------
const STYLE_FILES = ['soft', 'brutal', 'ghost', 'retro'];

/** The value a style sets for a knob, or the Sharp default from tokens.css. */
function styleKnobs(name) {
  const source = name ? `styles/${name}.css` : 'tokens.css';
  const css = readFileSync(join(THEMES, source), 'utf8');
  const read = key => Number(css.match(new RegExp(`${key}:\\s*([\\d.]+)%`))?.[1] ?? 0);
  return {
    name: name ?? 'sharp',
    borderEmphasis: read('--volt-border-emphasis'),
    surfaceTint: read('--volt-surface-tint'),
  };
}
const STYLE_KNOBS = [styleKnobs(null), ...STYLE_FILES.map(styleKnobs)];

/** Colors components paint that are not a single token: `[name, tokens => value]`, by style. */
function stylePaints(tokens, knobs) {
  return {
    '--card': `color-mix(in oklch, ${tokens['--surface']}, ${tokens['--muted']} ${knobs.surfaceTint}%)`,
    '--painted-input': `color-mix(in oklch, ${tokens['--input']}, ${tokens['--foreground']} ${knobs.borderEmphasis}%)`,
  };
}

const PAIRS = [
  ['foreground', 'background', 4.5, 'body text on page'],
  ['surface-foreground', 'surface', 4.5, 'text on card/popover surface'],
  ['muted-foreground', 'muted', 4.5, 'muted text on muted background'],
  ['muted-foreground', 'background', 4.5, 'muted text on page'],
  ['foreground', 'muted', 4.5, 'accent text on accent background'],
  ['primary-foreground', 'primary', 4.5, 'text on primary button'],
  ['primary', 'background', 4.5, 'primary text on page'],
  ['primary', 'surface', 4.5, 'primary text on card/popover surface'],
  ['secondary-foreground', 'secondary', 4.5, 'text on secondary button'],
  ['destructive-foreground', 'destructive', 4.5, 'text on destructive button'],
  ['success-foreground', 'success', 4.5, 'text on success surface'],
  ['warning-foreground', 'warning', 4.5, 'text on warning surface'],
  ['error-foreground', 'error', 4.5, 'text on error surface'],
  ['info-foreground', 'info', 4.5, 'text on info surface'],
  ['ring', 'background', 3, 'focus ring vs page (non-text UI, SC 1.4.11)'],
  ['ring', 'muted', 3, 'active/focus ring vs accent surface (non-text UI, SC 1.4.11)'],
  ['input', 'background', 3, 'form field border vs page (non-text UI, SC 1.4.11)'],
  // Status colours used as icon/border colour directly on the page (Alert icons, Input and
  // Textarea success/error borders). Warning is deliberately absent: `--warning` is a fill
  // colour below 3:1 on most light backgrounds and `--warning-foreground` fails on dusk, so no
  // warning token is safe as an icon colour — Alert's warning icon inherits the text colour.
  ['success', 'background', 3, 'success icon/border vs page (non-text UI, SC 1.4.11)'],
  ['info', 'background', 3, 'info icon vs page (non-text UI, SC 1.4.11)'],
  ['error', 'background', 3, 'error border vs page (non-text UI, SC 1.4.11)'],
  ['destructive', 'background', 3, 'destructive icon vs page (non-text UI, SC 1.4.11)'],
  // Raised surfaces: menus, popovers and dialogs carry the same text and focus as the page.
  ['surface-foreground', 'surface-elevated', 4.5, 'text on popover/dialog'],
  ['muted-foreground', 'surface-elevated', 4.5, 'muted text on popover/dialog'],
  ['muted-foreground', 'surface', 4.5, 'muted text on card'],
  ['ring', 'surface', 3, 'focus ring on card (non-text UI, SC 1.4.11)'],
  ['ring', 'surface-elevated', 3, 'focus ring in popover/dialog (non-text UI, SC 1.4.11)'],
  ['input', 'surface', 3, 'form field border on card (non-text UI, SC 1.4.11)'],
  ['input', 'surface-elevated', 3, 'form field border in dialog (non-text UI, SC 1.4.11)'],
  // Progress, Meter and Slider: the filled part has to stand apart from what is left.
  ['primary', 'track', 3, 'filled progress vs track (non-text UI, SC 1.4.11)'],
  ['track', 'primary', 3, 'track vs filled progress (non-text UI, SC 1.4.11)'],
  // Switch: the off track carries the thumb, the on track carries it too.
  ['background', 'input', 3, 'switch thumb on off track (non-text UI, SC 1.4.11)'],
  ['background', 'primary', 3, 'switch thumb on on track (non-text UI, SC 1.4.11)'],
  // Tooltip inverts the page.
  ['background', 'foreground', 4.5, 'tooltip text'],
  // Selected rows and pressed items paint the accent fill.
  ['primary', 'muted', 3, 'selected control on accent surface (non-text UI, SC 1.4.11)'],
  // Badge and alert fills that hold a status on a raised surface.
  ['success', 'surface', 3, 'success icon/border on card (non-text UI, SC 1.4.11)'],
  ['info', 'surface', 3, 'info icon on card (non-text UI, SC 1.4.11)'],
  ['error', 'surface', 3, 'error border on card (non-text UI, SC 1.4.11)'],
];

// Alert: text stays `text-foreground` on a 10% status tint of the page.
const TINTS = ['info', 'success', 'warning', 'destructive'];

// Painted per style: text on a card, and a form field on the page.
const STYLE_PAIRS = [
  ['surface-foreground', 'card', 4.5, 'text on styled card'],
  ['muted-foreground', 'card', 4.5, 'muted text on styled card'],
  ['ring', 'card', 3, 'focus ring on styled card (non-text UI, SC 1.4.11)'],
  ['painted-input', 'background', 3, 'styled form field border vs page (non-text UI, SC 1.4.11)'],
  ['painted-input', 'card', 3, 'styled form field border on card (non-text UI, SC 1.4.11)'],
];

const COLORS = readdirSync(join(THEMES, 'colors'))
  .filter(f => f.endsWith('.css'))
  .map(f => f.replace(/\.css$/, ''))
  .sort();

const results = [];
for (const color of COLORS) {
  for (const dark of [false, true]) {
    const tokens = collectTokens(color, dark);
    const record = (fg, bg, min, label, fgToken, bgToken, style) => {
      if (!fg || !bg) throw new Error(`Unresolved token in "${label}" for ${color}`);
      const ratio = contrastRatio(fg, bg);
      results.push({
        color,
        mode: dark ? 'dark' : 'light',
        style,
        label,
        fgToken,
        bgToken,
        ratio: Number(ratio.toFixed(2)),
        min,
        pass: ratio >= min,
      });
    };

    for (const [fgToken, bgToken, min, label] of PAIRS) {
      const fg = toRgb(tokens[`--${fgToken}`], tokens);
      const bg = toRgb(tokens[`--${bgToken}`], tokens);
      record(fg, bg, min, label, fgToken, bgToken);
    }

    const page = toRgb(tokens['--background'], tokens);
    for (const tint of TINTS) {
      const fill = over(toRgb(tokens[`--${tint}`], tokens), 0.1, page);
      const text = toRgb(tokens['--foreground'], tokens);
      record(text, fill, 4.5, `text on ${tint} alert`, 'foreground', `${tint}/10`);
    }

    for (const knobs of STYLE_KNOBS) {
      const painted = { ...tokens, ...stylePaints(tokens, knobs) };
      for (const [fgToken, bgToken, min, label] of STYLE_PAIRS) {
        const fg = toRgb(painted[`--${fgToken}`], painted);
        const bg = toRgb(painted[`--${bgToken}`], painted);
        record(fg, bg, min, label, fgToken, bgToken, knobs.name);
      }
    }
  }
}

const failures = results.filter(r => !r.pass);
const asJson = process.argv.includes('--json');

if (asJson) {
  console.log(
    JSON.stringify({ checked: results.length, failed: failures.length, results }, null, 2)
  );
} else {
  console.log(
    `Checked ${COLORS.length} colors x 2 modes: ${PAIRS.length} palette pairs, ${TINTS.length} alert tints, ${STYLE_PAIRS.length} pairs x ${STYLE_KNOBS.length} styles = ${results.length} checks`
  );
  console.log(`Failures: ${failures.length}\n`);

  const byGroup = new Map();
  for (const f of failures) {
    const key = `${f.color} / ${f.mode}`;
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key).push(f);
  }
  for (const [group, items] of byGroup) {
    console.log(`## ${group}`);
    for (const f of items) {
      console.log(
        `   ${String(f.ratio).padStart(5)}:1 (need ${f.min}:1)  ${f.label} (--${f.fgToken} on --${f.bgToken})${f.style ? ` [${f.style}]` : ''}`
      );
    }
    console.log();
  }

  if (failures.length === 0) {
    console.log('All preset color pairs meet their WCAG threshold.');
  }
}

process.exit(failures.length > 0 ? 1 : 0);
