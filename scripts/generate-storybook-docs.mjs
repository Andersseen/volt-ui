#!/usr/bin/env node
/**
 * Generates one Storybook docs page (`stories/components/<name>.mdx`) per public component.
 *
 * Storybook must not become a second source of truth, so a page is assembled from what the repo
 * already maintains:
 *
 *   API tables, variants      apps/web/src/app/lib/api-reference.generated.ts   (pnpm generate:api-reference)
 *   usage example             apps/web/src/app/lib/snippets/usage.ts            (the same code voltui.dev shows)
 *   group, docs link          apps/web/src/app/lib/component-metadata.ts
 *   status, keyboard, focus   COMPONENT_STATUS.md
 *   public component list     packages/volt/src/public-api.ts
 *
 * and the only new prose, which lives in `stories/_docs/component-guides.mjs`. The live examples
 * come from the hand-written `stories/components/<name>.stories.ts` the page is attached to.
 *
 * Usage: node scripts/generate-storybook-docs.mjs [--check]
 *   --check  write nothing; exit 1 if a committed page is stale, missing or orphaned.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { publicComponents } from './lib/public-components.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'stories/components');
const CHECK = process.argv.includes('--check');

// Node strips the TypeScript types of these data-only modules on import (Node >= 22.18).
const load = rel => import(pathToFileURL(join(ROOT, rel)).href);
const API = await load('apps/web/src/app/lib/api-reference.generated.ts');
const USAGE = await load('apps/web/src/app/lib/snippets/usage.ts');
const { COMPONENT_GROUPS } = await load('apps/web/src/app/lib/component-metadata.ts');
const { COMPONENT_GUIDES, GROUP_TITLES } = await load('stories/_docs/component-guides.mjs');

const upperSnake = name => name.replace(/-/g, '_').toUpperCase();

/** `COMPONENT_STATUS.md` is the one hand-maintained status table; read its rows rather than copy them. */
function statusRows() {
  const rows = new Map();
  for (const line of readFileSync(join(ROOT, 'COMPONENT_STATUS.md'), 'utf8').split('\n')) {
    const cells = line.split('|').map(c => c.trim());
    if (cells.length < 8 || !/^[a-z-]+$/.test(cells[1]) || cells[1] === 'component') continue;
    rows.set(cells[1], {
      status: cells[2],
      forms: cells[3],
      keyboard: cells[4],
      focus: cells[5],
    });
  }
  return rows;
}

const STATUS_COPY = {
  stable: 'Recommended for production use. The public API follows the 1.x compatibility promise.',
  beta: 'Usable and covered by tests, but it has not yet had a release of real-world use.',
  experimental: 'A preview whose API or behaviour may still change.',
};

function groupOfMetadata(name) {
  for (const group of COMPONENT_GROUPS) {
    if (group.components.some(c => c.name === name))
      return group.titleKey.replace('catalog.groups.', '');
  }
  return null;
}

function docsPath(name) {
  for (const group of COMPONENT_GROUPS) {
    const hit = group.components.find(c => c.name === name);
    if (hit) return hit.path;
  }
  return `/docs/components/${name}`;
}

/*
 * Tables are emitted as HTML: Storybook's MDX has no GFM tables without an extra remark plugin
 * dependency, and API types are full of `|`, `<` and `{`, which a JS string expression carries safely.
 */
const text = value =>
  `{${JSON.stringify(
    String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim()
  )}}`;
const code = value => (value === undefined || value === '' ? '' : `<code>${text(value)}</code>`);
/** Backtick spans in a COMPONENT_STATUS.md cell become <code>. */
const inline = value =>
  String(value ?? '')
    .split('`')
    .map((seg, i) => (i % 2 ? code(seg) : seg ? text(seg) : ''))
    .join('');

// One line: MDX ends an HTML block at a line break followed by a nested tag.
const table = (head, rows) => [
  `<table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`,
  '',
];

function importBlock(api) {
  const names = api.directives.map(d => d.className);
  const one = `import { ${names.join(', ')} } from '@voltui/components';`;
  return one.length <= 90
    ? one
    : `import {\n${names.map(n => `  ${n},`).join('\n')}\n} from '@voltui/components';`;
}

function apiSection(api) {
  const out = [];
  for (const d of api.directives) {
    out.push(`### ${d.className}`, '');
    if (d.selector) out.push(`Selector: ${code(d.selector)}`, '');
    if (d.inputs.length) {
      out.push(
        ...table(
          ['Input', 'Type', 'Default'],
          d.inputs.map(i => {
            const flags = [
              i.required ? 'required' : '',
              i.transform ? `transform: ${i.transform}` : '',
            ]
              .filter(Boolean)
              .join(', ');
            return [
              `${code(i.name)}${flags ? ` ${text(`(${flags})`)}` : ''}`,
              code(i.type),
              i.default !== undefined ? code(i.default) : '—',
            ];
          })
        )
      );
    }
    if (d.outputs.length) {
      out.push(
        ...table(
          ['Output', 'Emits'],
          d.outputs.map(o => [code(o.name), code(o.type)])
        )
      );
    }
    if (!d.inputs.length && !d.outputs.length) out.push('No inputs or outputs.', '');
  }
  if (api.variants?.length) {
    out.push('### Variants', '', 'Class-variance-authority options; the default is marked.', '');
    out.push(
      ...table(
        ['Variant', 'Options', 'Default'],
        api.variants.map(v => [
          code(v.name),
          v.options.map(o => code(o)).join(' '),
          v.default ? code(v.default) : '—',
        ])
      )
    );
  }
  return out;
}

function renderPage(name, status) {
  const guide = COMPONENT_GUIDES[name];
  const api = API[`${upperSnake(name)}_API`];
  const usage = USAGE[`${upperSnake(name)}_USAGE`];
  const label = guide.title;
  const groupTitle = GROUP_TITLES[guide.group];
  const lines = [
    '{/* Generated by scripts/generate-storybook-docs.mjs — do not hand-edit.',
    `   Prose lives in stories/_docs/component-guides.mjs; the stories in ${name}.stories.ts. */}`,
    "import { Meta, Primary, Controls, Stories } from '@storybook/addon-docs/blocks';",
    `import * as ${'ComponentStories'} from './${name}.stories';`,
    '',
    '<Meta of={ComponentStories} />',
    '',
    `# ${label}`,
    '',
    guide.summary,
    '',
    `**${status.status[0].toUpperCase()}${status.status.slice(1)}** · ${groupTitle} · [Guide on voltui.dev](https://voltui.dev${docsPath(name)})`,
    '',
    `> ${STATUS_COPY[status.status] ?? ''}`,
    '',
    '## When to use',
    '',
    ...guide.when.map(w => `- ${w}`),
    '',
    '## Installation',
    '',
    'Install the package and import the parts you use (the full example below also shows services and types):',
    '',
    '```bash',
    'npm install @voltui/components',
    '```',
    '',
    '```ts',
    importBlock(api),
    '```',
    '',
    `Or copy the source into your project and own it: \`npx @voltui/cli add ${name}\`.`,
    '',
    '## Basic usage',
    '',
    '<Primary />',
    '',
    '## Examples',
    '',
    '<Stories title="" includePrimary={false} />',
    '',
    '## Full example',
    '',
    'The same code as the [voltui.dev guide](https://voltui.dev' +
      docsPath(name) +
      '), as you would write it in an application:',
    '',
    '````ts',
    usage.trim(),
    '````',
    '',
    '## Accessibility',
    '',
    ...guide.a11y.map(a => `- ${a}`),
    '',
    ...table(
      ['Aspect', 'Behaviour'],
      [
        ['Keyboard', inline(status.keyboard)],
        ['Focus and overlays', inline(status.focus)],
        ['Forms', inline(status.forms)],
      ]
    ),
    'The Accessibility panel under each story runs axe-core against that story. It is a development aid, not a conformance claim.',
    '',
    '## API',
    '',
    ...apiSection(api),
    '## Playground',
    '',
    'Change the inputs of the first example. Output events appear in the Actions panel.',
    '',
    '<Controls />',
    '',
  ];
  return lines.join('\n');
}

const status = statusRows();
const problems = [];
const expected = new Map();

for (const name of publicComponents()) {
  const guide = COMPONENT_GUIDES[name];
  if (!guide) {
    problems.push(`${name}: no entry in stories/_docs/component-guides.mjs`);
    continue;
  }
  if (!GROUP_TITLES[guide.group]) problems.push(`${name}: unknown group "${guide.group}"`);
  const meta = groupOfMetadata(name);
  if (meta && meta !== guide.group) {
    problems.push(
      `${name}: guide group "${guide.group}" differs from component-metadata.ts group "${meta}"`
    );
  }
  if (!status.has(name)) problems.push(`${name}: no row in COMPONENT_STATUS.md`);
  if (!API[`${upperSnake(name)}_API`])
    problems.push(`${name}: no ${upperSnake(name)}_API in api-reference.generated.ts`);
  if (!USAGE[`${upperSnake(name)}_USAGE`])
    problems.push(`${name}: no ${upperSnake(name)}_USAGE in snippets/usage.ts`);
  if (problems.some(p => p.startsWith(`${name}:`))) continue;
  expected.set(`${name}.mdx`, renderPage(name, status.get(name)));
}
for (const name of Object.keys(COMPONENT_GUIDES)) {
  if (!publicComponents().includes(name))
    problems.push(`${name}: guide entry for a component that is not in public-api.ts`);
}

if (problems.length) {
  console.error('[storybook-docs] cannot generate:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}

if (CHECK) {
  const stale = [];
  for (const [file, text] of expected) {
    const path = join(OUT_DIR, file);
    if (!existsSync(path) || readFileSync(path, 'utf8') !== text) stale.push(file);
  }
  const orphans = existsSync(OUT_DIR)
    ? readdirSync(OUT_DIR).filter(f => f.endsWith('.mdx') && !expected.has(f))
    : [];
  if (stale.length || orphans.length) {
    if (stale.length) console.error(`[storybook-docs] stale or missing: ${stale.join(', ')}`);
    if (orphans.length)
      console.error(`[storybook-docs] orphaned pages (no public component): ${orphans.join(', ')}`);
    console.error('Run `pnpm generate:storybook-docs` and commit the result.');
    process.exit(1);
  }
  console.log(`[storybook-docs] ${expected.size} pages up to date`);
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [file, text] of expected) writeFileSync(join(OUT_DIR, file), text);
  console.log(`Wrote ${expected.size} component pages to ${OUT_DIR}`);
}
