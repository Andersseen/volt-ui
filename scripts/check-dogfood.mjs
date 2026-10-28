#!/usr/bin/env node
/**
 * Dogfood gate: voltui.dev is Volt's showcase, so where Volt already owns a responsibility the
 * site must use the public API instead of rebuilding it. See AGENTS.md "Docs site rules".
 *
 *   node scripts/check-dogfood.mjs            gate + verify the usage inventory is current
 *   node scripts/check-dogfood.mjs --write    rewrite specs/dogfood-inventory.md
 *   node scripts/check-dogfood.mjs --check    inventory only (used by pnpm check:generated)
 *
 * The rules are deliberately narrow — each looks for a *copy* of something Volt ships, not for
 * every use of native HTML:
 *
 *   primitive-bypass   a site file imports `ng-primitives/*` (Volt wraps every primitive it uses)
 *   raw-button         a `<button>` in a template without a Volt directive/component
 *   button-like-link   an `<a>` styled like a button (rounded + padding/background/border)
 *   duplicated-atom    a hand-styled card: a `bg-card text-card-foreground` div, or an `<a>`
 *                      that is a bordered rounded tile (use `<a><volt-card>` instead)
 *
 * Scans both applications (`src/app` and `apps/recipes/src/app`) and the components they share
 * (`shared/components`).
 *
 * Not scanned: spec files, generated files, and `{blocks,layouts}` plus
 * `lib/snippets` in either app — those are source the site *displays* for consumers to copy, and the
 * live demo inside a code panel is an exhibit of the snippet beside it.
 *
 * An exception goes in EXCEPTIONS with the reason. It names a file and a distinctive substring
 * of the offending tag, so one justified tag cannot hide a second, unjustified one.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Every place site code lives: the docs app, the Recipes app and what they share. */
const APPS = [
  join(ROOT, 'src/app'),
  join(ROOT, 'apps/recipes/src/app'),
  join(ROOT, 'shared/components'),
];
const INVENTORY = join(ROOT, 'specs/dogfood-inventory.md');

/** @type {{ rule: string; file: string; match: string; reason: string }[]} */
const EXCEPTIONS = [
  {
    rule: 'raw-button',
    file: 'src/app/components/theme-studio/theme-studio-setup.ts',
    match: 'store.toggleImport()',
    reason:
      'An inline text affordance inside a sentence-sized row; voltButton variant="link" would add the button box model (h-10, px-4) to what is a running-text link.',
  },
];

const SKIP_DIRS = new Set(['blocks', 'layouts']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (
        APPS.some(
          app => full === join(app, 'lib', 'snippets') || (dir === app && SKIP_DIRS.has(name))
        )
      )
        continue;
      walk(full, out);
    } else if (
      name.endsWith('.ts') &&
      !name.endsWith('.spec.ts') &&
      !name.endsWith('.generated.ts')
    ) {
      out.push(full);
    }
  }
  return out;
}

const VOLT_ATTR = /\b(volt[A-Z]\w*|\[volt[A-Z]\w*\])/;
const BUTTON_LIKE = /\brounded(-(sm|md|full))?\b/;
const BOX = /\b(px-\d|py-\d|p-\d|bg-\w|border\b|hover:bg-)/;

/** Opening tags of `name`, including multi-line ones. */
function tags(source, name) {
  const found = [];
  const re = new RegExp(`<${name}(\\s[^>]*?)?>`, 'gs');
  for (let m; (m = re.exec(source));) {
    found.push({ text: m[0], index: m.index });
  }
  return found;
}

/** Blanks comments (keeping newlines) so prose that mentions `<button>` is not read as markup. */
const stripComments = src =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));

const lineOf = (source, index) => source.slice(0, index).split('\n').length;

function check() {
  const violations = [];
  const used = [];
  for (const file of APPS.flatMap(app => walk(app))) {
    const rel = relative(ROOT, file);
    const source = stripComments(readFileSync(file, 'utf8'));
    const add = (rule, index, detail, text = '') => {
      const excepted = EXCEPTIONS.some(
        e => e.rule === rule && e.file === rel && text.includes(e.match)
      );
      if (!excepted) violations.push({ rule, rel, line: lineOf(source, index), detail });
    };

    for (const m of source.matchAll(/^import[^;]*from\s+'(ng-primitives[^']*)'/gms)) {
      add('primitive-bypass', m.index, `imports ${m[1]}`);
    }
    for (const t of tags(source, 'button')) {
      if (!VOLT_ATTR.test(t.text))
        add('raw-button', t.index, 'button without a Volt directive', t.text);
    }
    for (const t of tags(source, 'a')) {
      if (!VOLT_ATTR.test(t.text) && BUTTON_LIKE.test(t.text) && BOX.test(t.text)) {
        add('button-like-link', t.index, 'anchor styled like a button', t.text);
      }
    }
    for (const t of tags(source, 'a')) {
      if (
        !VOLT_ATTR.test(t.text) &&
        /\brounded-(lg|xl)\b/.test(t.text) &&
        /\bborder\b/.test(t.text)
      ) {
        add('duplicated-atom', t.index, 'anchor styled as a card tile (wrap a volt-card)', t.text);
      }
    }
    for (const t of tags(source, 'div')) {
      if (/\bbg-card\b(?!\/)/.test(t.text) && /\btext-card-foreground\b/.test(t.text)) {
        add('duplicated-atom', t.index, 'hand-styled card (use volt-card)', t.text);
      }
    }

    // Only a real import counts: the metadata catalogs name atoms as strings, which is not use.
    for (const imp of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'volt'/g)) {
      for (const m of imp[1].matchAll(/\bVolt[A-Z]\w*/g)) used.push({ symbol: m[0], rel });
    }
  }
  return { violations, used };
}

/** Where a file sits in the product, for the usage inventory. */
function surface(rel) {
  if (/^src\/app\/pages\/\(components-docs\)/.test(rel)) return 'docs-demo';
  if (rel.startsWith('apps/recipes/src/app/recipes/')) return 'docs-demo';
  if (rel === 'src/app/components/component-preview.ts') return 'docs-demo';
  if (rel.startsWith('src/app/components/docs/')) return 'application';
  return 'application';
}

function inventory(used) {
  const libIndex = readFileSync(join(ROOT, 'projects/volt/src/public-api.ts'), 'utf8');
  const components = [...libIndex.matchAll(/lib\/components\/([\w-]+)/g)].map(m => m[1]);
  const bySymbol = new Map();
  for (const { symbol, rel } of used) {
    const set = bySymbol.get(symbol) ?? new Set();
    set.add(rel);
    bySymbol.set(symbol, set);
  }
  const camel = name =>
    name
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('');
  const rows = [];
  for (const name of [...new Set(components)].sort()) {
    const prefix = `Volt${camel(name)}`;
    const files = new Set();
    for (const [symbol, set] of bySymbol) {
      if (symbol === prefix || symbol.startsWith(prefix)) set.forEach(f => files.add(f));
    }
    const app = [...files].filter(f => surface(f) === 'application').sort();
    const demo = [...files].filter(f => surface(f) === 'docs-demo');
    const status = app.length ? 'dogfooded' : demo.length ? 'docs/demo only' : 'not used';
    rows.push({ name, status, app, demoCount: demo.length });
  }
  return rows;
}

function render(rows) {
  const lines = [
    '# Dogfood inventory',
    '',
    'Where voltui.dev and recipes.voltui.dev themselves use each Volt atom. Generated by `pnpm generate:dogfood` — do not edit.',
    '',
    '- **dogfooded** — used by the real application (shell, landing, docs chrome, theme studio, tooling).',
    '- **docs/demo only** — appears only on component demo pages and recipes.',
    '- **not used** — no site usage; a candidate only if the site has that responsibility.',
    '',
    'Real application use is stronger evidence than a Storybook story or a demo page; it is not a',
    'reason to put an atom on the site that the site has no use for.',
    '',
    '| Component | Status | Application files |',
    '| --- | --- | --- |',
  ];
  for (const r of rows) {
    const files = r.app.length
      ? r.app
          .map(f => f.replace('apps/recipes/src/app/', 'recipes:').replace('src/app/', ''))
          .join(', ')
      : '—';
    lines.push(`| ${r.name} | ${r.status} | ${files} |`);
  }
  lines.push('');
  return lines.join('\n');
}

const args = new Set(process.argv.slice(2));
const { violations, used } = check();
// The table is committed through prettier (lint-staged), so generate it already formatted.
const rendered = await format(render(inventory(used)), {
  ...((await resolveConfig(INVENTORY)) ?? {}),
  filepath: INVENTORY,
});

if (args.has('--write')) {
  writeFileSync(INVENTORY, rendered);
  console.log(`wrote ${relative(ROOT, INVENTORY)}`);
  process.exit(0);
}

let failed = false;
if (!args.has('--check')) {
  if (violations.length) {
    failed = true;
    console.error(
      `check:dogfood — ${violations.length} place(s) rebuild what Volt already provides:\n`
    );
    for (const v of violations) console.error(`  ${v.rel}:${v.line}  [${v.rule}] ${v.detail}`);
    console.error(
      '\nUse the Volt atom (or fix/extend the library first). If native HTML is genuinely right,\nadd a narrow EXCEPTION with the reason in scripts/check-dogfood.mjs.'
    );
  } else {
    console.log('check:dogfood — the site uses Volt for every responsibility it owns.');
  }
}

let current = '';
try {
  current = readFileSync(INVENTORY, 'utf8');
} catch {
  /* missing */
}
if (current !== rendered) {
  failed = true;
  console.error('specs/dogfood-inventory.md is out of date → pnpm generate:dogfood');
}
process.exit(failed ? 1 : 0);
