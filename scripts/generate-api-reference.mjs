#!/usr/bin/env node
/**
 * v0.8 Phase 3: generates a per-component API reference (inputs, outputs,
 * CVA variants) from the actual library source, instead of hand-writing 41
 * tables that would drift the moment a component's inputs change.
 *
 * Parses two API shapes found in this codebase:
 *   - signal-based: `readonly x = input<T>(default)` / `model<T>(default)` /
 *     `output<T>()`, with or without an explicit generic.
 *   - hostDirectives-based: lightweight directives (dialog, drawer, popover,
 *     tooltip, dropdown-menu, ...) that re-expose an ng-primitives
 *     directive's inputs/outputs under a renamed public name via
 *     `hostDirectives: [{ directive: NgpX, inputs: [...], outputs: [...] }]`.
 *
 * This is regex/bracket-depth parsing, not a real TS AST — it covers this
 * codebase's actual conventions (verified against all 41 components) but
 * is not a general-purpose Angular source parser. Re-run this whenever a
 * component's public input/output surface changes.
 *
 * Usage: node scripts/generate-api-reference.mjs
 * Writes: src/app/lib/api-reference.generated.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COMP_ROOT = join(ROOT, 'projects/volt/src/lib/components');
const LAYOUT_ROOT = join(ROOT, 'projects/volt/src/lib/layouts');
const OUT_FILE = join(ROOT, 'src/app/lib/api-reference.generated.ts');

// Components with no renderable directive (documented as a prose guide
// instead of a Preview+Code demo page — see themes.page.ts).
const EXEMPT = new Set(['theme']);

function listComponentDirs(root) {
  return readdirSync(root).filter(name => statSync(join(root, name)).isDirectory());
}

function listSourceFiles(dir) {
  return readdirSync(dir).filter(
    f => f.endsWith('.ts') && !f.endsWith('.spec.ts') && f !== 'index.ts' && f !== 'variants.ts'
  );
}

function extractSelectorAndClass(src) {
  const selMatch = src.match(/selector:\s*'([^']+)'/);
  const classMatch = src.match(/export class (\w+)/);
  return { selector: selMatch?.[1] ?? null, className: classMatch?.[1] ?? null };
}

function extractParenBody(str, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') {
      depth--;
      if (depth === 0) return { body: str.slice(openIdx + 1, i), end: i };
    }
  }
  return { body: str.slice(openIdx + 1), end: str.length };
}

function inferTypeFromLiteral(raw) {
  if (raw === undefined) return 'unknown';
  const v = raw.trim();
  if (v === 'true' || v === 'false') return 'boolean';
  if (/^-?\d+(\.\d+)?$/.test(v)) return 'number';
  if (/^['"`]/.test(v)) return 'string';
  if (v.startsWith('[')) return 'array';
  if (v.startsWith('{')) return 'object';
  if (v === 'null') return 'null';
  return 'unknown';
}

function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of str) {
    if ('[{('.includes(ch)) depth++;
    if (']})'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

// Like splitTopLevel, but also tracks angle-bracket depth — needed for
// splitting a raw generic string (e.g. from `input<T, U>`), which can
// itself contain commas nested inside a function type
// (`(a: unknown, b: unknown) => boolean`) or a nested generic (`Map<K, V>`).
function splitGenericTopLevel(str) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '=' && str[i + 1] === '>') {
      current += '=>';
      i++; // the arrow's '>' is not a generic close
      continue;
    }
    if ('[{(<'.includes(ch)) depth++;
    if (']})>'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function extractSignals(src) {
  const inputs = [];
  const outputs = [];
  const declRe = /readonly\s+(\w+)\s*=\s*(input|model|output)(\.required)?\s*(<|\()/g;
  let m;
  while ((m = declRe.exec(src))) {
    const [, name, kind, required, opener] = m;
    let cursor = m.index + m[0].length - 1;
    let generic;
    if (opener === '<') {
      let depth = 0;
      const start = cursor + 1;
      for (let i = cursor; i < src.length; i++) {
        if (src[i] === '=' && src[i + 1] === '>') {
          i++; // skip the arrow token's '>' — it is not a generic close
          continue;
        }
        if (src[i] === '<') depth++;
        else if (src[i] === '>') {
          depth--;
          if (depth === 0) {
            generic = src.slice(start, i);
            cursor = i + 1;
            break;
          }
        }
      }
      while (src[cursor] !== '(' && cursor < src.length) cursor++;
    }
    const { body } = extractParenBody(src, cursor);
    const args = splitTopLevel(body).map(s => s.trim());
    const [defaultRaw, optionsRaw] = args;
    const transformMatch = optionsRaw?.match(/transform:\s*(\w+)/);
    const type = generic ? splitGenericTopLevel(generic)[0].trim() : inferTypeFromLiteral(defaultRaw);

    if (kind === 'input') {
      inputs.push({
        name,
        type,
        required: !!required,
        default: defaultRaw || undefined,
        transform: transformMatch?.[1],
      });
    } else if (kind === 'model') {
      inputs.push({ name, type, required: !!required, default: defaultRaw || undefined });
      outputs.push({ name: `${name}Change`, type });
    } else if (kind === 'output') {
      outputs.push({ name, type: generic?.trim() || 'void' });
    }
  }
  return { inputs, outputs };
}

function extractBracketed(str, key) {
  const idx = str.indexOf(`${key}:`);
  if (idx === -1) return null;
  const openIdx = str.indexOf('[', idx);
  if (openIdx === -1) return null;
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '[') depth++;
    else if (str[i] === ']') {
      depth--;
      if (depth === 0) return str.slice(openIdx + 1, i);
    }
  }
  return null;
}

function extractHostDirectiveIO(src) {
  const inputs = [];
  const outputs = [];
  const hostDirectivesBody = extractBracketed(src, 'hostDirectives');
  if (!hostDirectivesBody) return { inputs, outputs };

  for (const entry of splitTopLevel(hostDirectivesBody)) {
    if (!entry.includes('directive:')) continue;
    const inputsRaw = extractBracketed(entry, 'inputs');
    const outputsRaw = extractBracketed(entry, 'outputs');
    if (inputsRaw) {
      for (const raw of splitTopLevel(inputsRaw)) {
        const clean = raw.trim().replace(/^'|'$/g, '');
        if (!clean) continue;
        const [internal, publicName] = clean.split(':').map(s => s.trim());
        inputs.push({ name: publicName || internal, type: 'unknown' });
      }
    }
    if (outputsRaw) {
      for (const raw of splitTopLevel(outputsRaw)) {
        const clean = raw.trim().replace(/^'|'$/g, '');
        if (!clean) continue;
        const [internal, publicName] = clean.split(':').map(s => s.trim());
        outputs.push({ name: publicName || internal, type: 'unknown' });
      }
    }
  }
  return { inputs, outputs };
}

function extractVariants(src) {
  if (!src) return null;
  const variantsBlockMatch = src.match(/variants:\s*\{([\s\S]*?)\n\s*\},\s*\n\s*defaultVariants/);
  if (!variantsBlockMatch) return null;
  const block = variantsBlockMatch[1];
  const variants = {};
  const groupRe = /(\w+):\s*\{([^}]*)\}/g;
  let gm;
  while ((gm = groupRe.exec(block))) {
    const [, key, body] = gm;
    const opts = [...body.matchAll(/(\w[\w-]*)\s*:/g)].map(x => x[1]);
    variants[key] = opts;
  }
  const defaultsMatch = src.match(/defaultVariants:\s*\{([^}]*)\}/);
  const defaults = {};
  if (defaultsMatch) {
    for (const m of defaultsMatch[1].matchAll(/(\w+):\s*'([^']*)'/g)) defaults[m[1]] = m[2];
  }
  return { variants, defaults };
}

function dedupeByName(entries) {
  const seen = new Map();
  for (const e of entries) if (!seen.has(e.name)) seen.set(e.name, e);
  return [...seen.values()];
}

function processComponentDir(dirPath) {
  const files = listSourceFiles(dirPath);
  const directives = [];
  for (const file of files) {
    const src = readFileSync(join(dirPath, file), 'utf8');
    if (!src.includes('@Component(') && !src.includes('@Directive(')) continue;
    const { selector, className } = extractSelectorAndClass(src);
    if (!className) continue;
    const signals = extractSignals(src);
    const hostIO = extractHostDirectiveIO(src);
    const inputs = dedupeByName([...signals.inputs, ...hostIO.inputs]);
    const outputs = dedupeByName([...signals.outputs, ...hostIO.outputs]);
    if (inputs.length === 0 && outputs.length === 0) continue; // nothing to document
    directives.push({ className, selector, inputs, outputs });
  }
  let variantsSrc = null;
  try {
    variantsSrc = readFileSync(join(dirPath, 'variants.ts'), 'utf8');
  } catch {
    /* no variants.ts — not every component uses CVA */
  }
  const variants = extractVariants(variantsSrc);
  return { directives, variants };
}

function toUpperSnake(kebab) {
  return kebab.replace(/-/g, '_').toUpperCase();
}

function tsString(value) {
  return value === undefined ? undefined : JSON.stringify(value);
}

function renderDirective(d) {
  const inputs = d.inputs
    .map(
      i =>
        `      { name: ${tsString(i.name)}, type: ${tsString(i.type)}` +
        (i.default !== undefined ? `, default: ${tsString(i.default)}` : '') +
        (i.required ? `, required: true` : '') +
        (i.transform ? `, transform: ${tsString(i.transform)}` : '') +
        ` }`
    )
    .join(',\n');
  const outputs = d.outputs
    .map(o => `      { name: ${tsString(o.name)}, type: ${tsString(o.type)} }`)
    .join(',\n');
  return `    {
      className: ${tsString(d.className)},
      selector: ${tsString(d.selector)},
      inputs: [
${inputs}
      ],
      outputs: [
${outputs}
      ],
    }`;
}

function renderVariants(v) {
  if (!v) return 'undefined';
  const groups = Object.entries(v.variants)
    .map(
      ([key, options]) =>
        `    { name: ${tsString(key)}, options: [${options.map(tsString).join(', ')}], default: ${tsString(
          v.defaults[key]
        )} }`
    )
    .join(',\n');
  return `[\n${groups}\n  ]`;
}

const componentNames = [
  ...listComponentDirs(COMP_ROOT).map(name => ({ name, root: COMP_ROOT })),
  ...listComponentDirs(LAYOUT_ROOT).map(name => ({ name, root: LAYOUT_ROOT })),
].filter(({ name }) => !EXEMPT.has(name));

const entries = [];
for (const { name, root } of componentNames) {
  const { directives, variants } = processComponentDir(join(root, name));
  if (directives.length === 0) continue;
  const constName = `${toUpperSnake(name)}_API`;
  entries.push(`export const ${constName}: ComponentApi = {
  directives: [
${directives.map(renderDirective).join(',\n')}
  ],
  variants: ${renderVariants(variants)},
};`);
}

const header = `// Generated by scripts/generate-api-reference.mjs — do not hand-edit.
// Re-run \`node scripts/generate-api-reference.mjs\` after changing a
// component's inputs/outputs/variants, then re-check this diff into git
// (this file is committed, not regenerated on every build).

export interface ApiInputInfo {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  transform?: string;
}

export interface ApiOutputInfo {
  name: string;
  type: string;
}

export interface ApiDirectiveInfo {
  className: string;
  selector: string | null;
  inputs: ApiInputInfo[];
  outputs: ApiOutputInfo[];
}

export interface ApiVariantGroup {
  name: string;
  options: string[];
  default?: string;
}

export interface ComponentApi {
  directives: ApiDirectiveInfo[];
  variants?: ApiVariantGroup[];
}

`;

writeFileSync(OUT_FILE, header + entries.join('\n\n') + '\n');
console.log(`Wrote ${entries.length} component API entries to ${OUT_FILE}`);
