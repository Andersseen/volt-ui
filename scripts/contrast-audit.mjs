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

const {
  ALERT_TINTS,
  ALERT_TINT_ALPHA,
  CONTRAST_PAIRS,
  STYLE_PAIRS: STYLE_PAIR_LIST,
  composite,
  contrastRatio,
  mixOklch,
  oklchToLinearSrgb,
} = await import(
  // The same maths and pairs Theme Studio checks a palette with: packages/shared/lib/contrast.ts.
  new URL('../packages/shared/lib/contrast.ts', import.meta.url).href
);

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
  const mixed = mixOklch({ l: a[0], c: a[1], h: a[2] }, { l: b[0], c: b[1], h: b[2] }, weightA);
  return [mixed.l, mixed.c, mixed.h];
}

function toRgb(value, tokens) {
  const lch = toOklch(value, tokens);
  return lch ? oklchToLinearSrgb({ l: lch[0], c: lch[1], h: lch[2] }) : null;
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
// Pairs to check, from packages/shared/lib/contrast.ts. Thresholds follow WCAG 2.x
// SC 1.4.3 (text, 4.5:1) and SC 1.4.11 (non-text UI components / focus indicators, 3:1).
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

const asTuples = pairs => pairs.map(pair => [pair.fg, pair.bg, pair.min, pair.label]);
const PAIRS = asTuples(CONTRAST_PAIRS);
const TINTS = ALERT_TINTS;
const STYLE_PAIRS = asTuples(STYLE_PAIR_LIST);

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
      const fill = composite(toRgb(tokens[`--${tint}`], tokens), ALERT_TINT_ALPHA, page);
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
