#!/usr/bin/env node
/**
 * v0.8 Phase 3: docs completeness sweep.
 *
 * Compares every export in packages/volt/src/public-api.ts against:
 *   - a source snippet export in apps/web/src/app/lib/snippets/index.ts (<NAME>_SNIPPET)
 *   - a usage snippet export in apps/web/src/app/lib/snippets/usage.ts (<NAME>_USAGE)
 *   - a documentation page, exactly one of:
 *       - a host page under apps/web/src/app/pages/**\/docs/**\/<name>.page.ts, or
 *       - a Doqs Markdown page apps/web/src/content/docs/components/<name>.md that exists in
 *         every published locale (docs, docs-es, docs-uk) and shows at least one live example:
 *         a `::demo[id]` or `::playground[id]` whose id is registered in
 *         apps/web/src/app/doqs/doq.config.ts.
 *     Both at once is a gap too: Doqs would answer the URL and the host page would be dead code.
 *
 * `theme` is a set of functions (provideVoltTheme/applyVoltTheme), not a
 * renderable widget — there is nothing to put in a "Preview" tab. It's
 * documented as a full prose guide instead
 * (apps/web/src/authoring/docs/themes.md, served by Doqs) and is exempt
 * from all three checks below, not just the demo-page one.
 *
 * Usage: node scripts/docs-completeness-check.mjs
 * Exit code: 1 if any non-exempt gap is found, 0 otherwise.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PUBLIC_API = join(ROOT, 'packages/volt/src/public-api.ts');
const SNIPPETS_INDEX = join(ROOT, 'apps/web/src/app/lib/snippets/index.ts');
const SNIPPETS_USAGE = join(ROOT, 'apps/web/src/app/lib/snippets/usage.ts');
const PAGES_ROOT = join(ROOT, 'apps/web/src/app/pages');
const CONTENT_ROOT = join(ROOT, 'apps/web/src/content');
const DOQ_LOCALE_DIRS = ['docs', 'docs-es', 'docs-uk'];
const DOQ_CONFIG = join(ROOT, 'apps/web/src/app/doqs/doq.config.ts');

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

/** Ids registered under `demos:` and `playgrounds:` in the Doqs configuration (quoted or bare keys). */
function registeredDoqIds() {
  const src = readFileSync(DOQ_CONFIG, 'utf8');
  const ids = new Set();
  for (const block of ['demos', 'playgrounds']) {
    const start = src.indexOf(`${block}: {`);
    if (start === -1) continue;
    let depth = 0;
    let end = start;
    for (let i = src.indexOf('{', start); i < src.length; i++) {
      if (src[i] === '{') depth++;
      if (src[i] === '}' && --depth === 0) {
        end = i;
        break;
      }
    }
    const body = src.slice(src.indexOf('{', start) + 1, end);
    // Keys at the first nesting level only.
    let level = 0;
    for (const line of body.split('\n')) {
      const key = level === 0 && line.match(/^\s*(?:'([\w-]+)'|([\w]+))\s*:/);
      if (key) ids.add(key[1] ?? key[2]);
      level += (line.match(/[{[(]/g) ?? []).length - (line.match(/[}\])]/g) ?? []).length;
    }
  }
  return ids;
}

/** Why the Doqs page for `name` is not a usable documentation page, or null when it is. */
function doqsPageProblem(name, ids) {
  const files = DOQ_LOCALE_DIRS.map(dir => join(CONTENT_ROOT, dir, 'components', `${name}.md`));
  const present = files.filter(file => statSync(file, { throwIfNoEntry: false }));
  if (present.length === 0) return 'none';
  if (present.length !== files.length) {
    return `components/${name}.md is missing in ${DOQ_LOCALE_DIRS.filter((_, i) => !present.includes(files[i])).join(', ')}`;
  }
  for (const file of files) {
    const used = [
      ...readFileSync(file, 'utf8').matchAll(/^::(?:demo|playground)\[([\w-]+)\]\s*$/gm),
    ].map(m => m[1]);
    if (!used.some(id => ids.has(id))) {
      return `${file.replace(ROOT + '/', '')} has no registered ::demo or ::playground`;
    }
    const unknown = used.filter(id => !ids.has(id));
    if (unknown.length) {
      return `${file.replace(ROOT + '/', '')} uses unregistered ${unknown.join(', ')}`;
    }
  }
  return null;
}

const components = extractComponents();
const doqIds = registeredDoqIds();
const snippetsIndexSrc = readFileSync(SNIPPETS_INDEX, 'utf8');
const snippetsUsageSrc = readFileSync(SNIPPETS_USAGE, 'utf8');
const allPageFiles = findAllPageFiles();

const gaps = [];

for (const name of components) {
  if (FULLY_EXEMPT.has(name)) continue;
  const upper = toUpperSnake(name);

  const hasSnippet = new RegExp(`\\b${upper}_SNIPPET\\b`).test(snippetsIndexSrc);
  if (!hasSnippet)
    gaps.push({ name, kind: 'snippet', detail: `${upper}_SNIPPET missing from snippets/index.ts` });

  const hasUsage = new RegExp(`\\b${upper}_USAGE\\b`).test(snippetsUsageSrc);
  if (!hasUsage)
    gaps.push({ name, kind: 'usage', detail: `${upper}_USAGE missing from snippets/usage.ts` });

  if (!DEMO_PAGE_EXEMPT.has(name)) {
    const hasPage = allPageFiles.some(f => f.endsWith(`/${name}.page.ts`));
    const doqs = doqsPageProblem(name, doqIds);
    if (doqs !== null && doqs !== 'none') {
      gaps.push({ name, kind: 'doqs-page', detail: doqs });
    } else if (hasPage && doqs === null) {
      gaps.push({
        name,
        kind: 'duplicate-page',
        detail: `${name}.page.ts and a Doqs page both exist; Doqs serves the URL, remove the host page`,
      });
    } else if (!hasPage && doqs === 'none') {
      gaps.push({
        name,
        kind: 'demo-page',
        detail: `no ${name}.page.ts under apps/web/src/app/pages and no Doqs page components/${name}.md`,
      });
    }
  }
}

// `voltButton` is the only attribute spelling. `<button volt-button>` is an inert attribute —
// the `volt-button` selector is element-only — so it renders an unstyled button.
const INERT_ATTRIBUTE = /<(?:button|a)\b[^>]*?\svolt-button(?=[\s>=])/g;
const SCAN_ROOTS = ['src', 'cli', '.agents', 'projects', 'README.md', 'VOLT_UI_PROMPT.md'];
const SCAN_EXT = /\.(ts|html|md|js|mjs)$/;
function scan(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return;
  if (stat.isDirectory()) {
    for (const e of readdirSync(path)) {
      if (e === 'node_modules' || e === 'dist' || e.startsWith('.angular')) continue;
      scan(join(path, e));
    }
  } else if (SCAN_EXT.test(path) && !path.endsWith('docs-completeness-check.mjs')) {
    const text = readFileSync(path, 'utf8');
    for (const m of text.matchAll(INERT_ATTRIBUTE)) {
      const line = text.slice(0, m.index).split('\n').length;
      gaps.push({
        name: path.replace(ROOT + '/', ''),
        kind: 'inert-attribute',
        detail: `line ${line}: <button volt-button> is inert, use voltButton`,
      });
    }
  }
}
for (const r of SCAN_ROOTS) scan(join(ROOT, r));

console.log(`Checked ${components.length} public-api exports.`);
console.log(`Gaps: ${gaps.length}\n`);
for (const g of gaps) {
  console.log(`  [${g.kind}] ${g.name}: ${g.detail}`);
}
if (gaps.length === 0) {
  console.log(
    'Every public-api export has a snippet, a usage example, and one documentation page — host or Doqs — (or is exempt).'
  );
}

process.exit(gaps.length > 0 ? 1 : 0);
