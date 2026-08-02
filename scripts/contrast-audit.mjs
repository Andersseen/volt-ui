#!/usr/bin/env node
/**
 * WCAG 2.x contrast audit for every Volt theme preset.
 *
 * Volt's presets are a cross product of *color* (`data-color`) and *style*
 * (`data-style`), but style presets (sharp/soft/brutal/ghost/retro) only ever
 * set radius/shadow/spacing/font-weight tokens — never a color token. Verified
 * by grepping `projects/volt/src/themes/styles/*.css` for exact `--<token>:`
 * matches against the semantic color variable names; there are none. So the
 * meaningful contrast surface is 5 colors x 2 modes (light/dark) = 10
 * combinations, not the full 50 color x style x mode cross product.
 *
 * Usage: node scripts/contrast-audit.mjs [--json]
 * Exit code: 1 if any pair fails its WCAG threshold, 0 otherwise.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const THEMES = join(ROOT, 'projects/volt/src/themes');

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

  return [r, g, bl].map(v => Math.min(1, Math.max(0, v)));
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

const OKLCH_RE = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)/;
function toRgb(value) {
  const m = value && value.match(OKLCH_RE);
  return m ? oklchToLinearSrgb(Number(m[1]), Number(m[2]), Number(m[3])) : null;
}

// ---------------------------------------------------------------------------
// Minimal CSS custom-property extraction (no nesting, which our theme files
// never use, so a plain brace-matched pass is sufficient).
// ---------------------------------------------------------------------------
function parseBlocks(css) {
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
  const files = [join(THEMES, 'core.css'), join(THEMES, `colors/${color}.css`)];
  for (const file of files) {
    for (const { selector, vars: blockVars } of parseBlocks(readFileSync(file, 'utf8'))) {
      const isDarkSelector = selector.includes('.dark');
      if (isDarkSelector !== dark) continue;

      const targetsThisColor = selector.includes(`data-color='${color}'`);
      const targetsRootDefault = selector
        .split(',')
        .some(part => part.trim() === ':root' || part.trim() === '.dark');

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
const PAIRS = [
  ['foreground', 'background', 4.5, 'body text on page'],
  ['surface-foreground', 'surface', 4.5, 'text on card/popover surface'],
  ['muted-foreground', 'muted', 4.5, 'muted text on muted background'],
  ['muted-foreground', 'background', 4.5, 'muted text on page'],
  ['primary-foreground', 'primary', 4.5, 'text on primary button'],
  ['secondary-foreground', 'secondary', 4.5, 'text on secondary button'],
  ['destructive-foreground', 'destructive', 4.5, 'text on destructive button'],
  ['success-foreground', 'success', 4.5, 'text on success surface'],
  ['warning-foreground', 'warning', 4.5, 'text on warning surface'],
  ['error-foreground', 'error', 4.5, 'text on error surface'],
  ['info-foreground', 'info', 4.5, 'text on info surface'],
  ['ring', 'background', 3, 'focus ring vs page (non-text UI, SC 1.4.11)'],
  ['input', 'background', 3, 'form field border vs page (non-text UI, SC 1.4.11)'],
];

const COLORS = readdirSync(join(THEMES, 'colors'))
  .filter(f => f.endsWith('.css'))
  .map(f => f.replace(/\.css$/, ''))
  .sort();

const results = [];
for (const color of COLORS) {
  for (const dark of [false, true]) {
    const tokens = collectTokens(color, dark);
    for (const [fgToken, bgToken, min, label] of PAIRS) {
      const fg = toRgb(tokens[`--${fgToken}`]);
      const bg = toRgb(tokens[`--${bgToken}`]);
      if (!fg || !bg) continue; // token not defined for this preset — nothing to check
      const ratio = contrastRatio(fg, bg);
      results.push({
        color,
        mode: dark ? 'dark' : 'light',
        label,
        fgToken,
        bgToken,
        ratio: Number(ratio.toFixed(2)),
        min,
        pass: ratio >= min,
      });
    }
  }
}

const failures = results.filter(r => !r.pass);
const asJson = process.argv.includes('--json');

if (asJson) {
  console.log(JSON.stringify({ checked: results.length, failed: failures.length, results }, null, 2));
} else {
  console.log(
    `Checked ${COLORS.length} colors x 2 modes x ${PAIRS.length} pairs = ${results.length} checks`
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
        `   ${String(f.ratio).padStart(5)}:1 (need ${f.min}:1)  ${f.label} (--${f.fgToken} on --${f.bgToken})`
      );
    }
    console.log();
  }

  if (failures.length === 0) {
    console.log('All preset color pairs meet their WCAG threshold.');
  }
}

process.exit(failures.length > 0 ? 1 : 0);
