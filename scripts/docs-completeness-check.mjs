#!/usr/bin/env node
/**
 * v0.8 Phase 3: docs completeness sweep.
 *
 * Compares every export in projects/volt/src/public-api.ts against:
 *   - a source snippet export in src/app/lib/snippets/index.ts (<NAME>_SNIPPET)
 *   - a usage snippet export in src/app/lib/snippets/usage.ts (<NAME>_USAGE)
 *   - a demo page under src/app/pages/**\/docs/**\/<name>.page.ts
 *
 * `theme` is a set of functions (provideVoltTheme/applyVoltTheme), not a
 * renderable widget — there is nothing to put in a "Preview" tab. It's
 * documented as a full prose guide instead
 * (src/app/pages/(getting-started)/docs/themes.page.ts) and is exempt
 * from all three checks below, not just the demo-page one.
 *
 * Usage: node scripts/docs-completeness-check.mjs
 * Exit code: 1 if any non-exempt gap is found, 0 otherwise.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PUBLIC_API = join(ROOT, 'projects/volt/src/public-api.ts');
const SNIPPETS_INDEX = join(ROOT, 'src/app/lib/snippets/index.ts');
const SNIPPETS_USAGE = join(ROOT, 'src/app/lib/snippets/usage.ts');
const PAGES_ROOT = join(ROOT, 'src/app/pages');

const FULLY_EXEMPT = new Set(['theme']);
const DEMO_PAGE_EXEMPT = new Set(['theme']);

function toUpperSnake(kebab) {
  return kebab.replace(/-/g, '_').toUpperCase();
}

function extractComponents() {
  const src = readFileSync(PUBLIC_API, 'utf8');
  const names = [];
  const re = /export \* from '\.\/lib\/(?:components|layouts)\/([\w-]+)'/g;
  let m;
  while ((m = re.exec(src))) names.push(m[1]);
  return names;
}

function findAllPageFiles() {
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.page.ts')) files.push(full);
    }
  }
  walk(PAGES_ROOT);
  return files;
}

const components = extractComponents();
const snippetsIndexSrc = readFileSync(SNIPPETS_INDEX, 'utf8');
const snippetsUsageSrc = readFileSync(SNIPPETS_USAGE, 'utf8');
const allPageFiles = findAllPageFiles();

const gaps = [];

for (const name of components) {
  if (FULLY_EXEMPT.has(name)) continue;
  const upper = toUpperSnake(name);

  const hasSnippet = new RegExp(`\\b${upper}_SNIPPET\\b`).test(snippetsIndexSrc);
  if (!hasSnippet) gaps.push({ name, kind: 'snippet', detail: `${upper}_SNIPPET missing from snippets/index.ts` });

  const hasUsage = new RegExp(`\\b${upper}_USAGE\\b`).test(snippetsUsageSrc);
  if (!hasUsage) gaps.push({ name, kind: 'usage', detail: `${upper}_USAGE missing from snippets/usage.ts` });

  if (!DEMO_PAGE_EXEMPT.has(name)) {
    const hasPage = allPageFiles.some(f => f.endsWith(`/${name}.page.ts`));
    if (!hasPage) gaps.push({ name, kind: 'demo-page', detail: `no ${name}.page.ts found under src/app/pages` });
  }
}

console.log(`Checked ${components.length} public-api exports.`);
console.log(`Gaps: ${gaps.length}\n`);
for (const g of gaps) {
  console.log(`  [${g.kind}] ${g.name}: ${g.detail}`);
}
if (gaps.length === 0) {
  console.log('Every public-api export has a snippet, a usage example, and a demo page (or is exempt).');
}

process.exit(gaps.length > 0 ? 1 : 0);
