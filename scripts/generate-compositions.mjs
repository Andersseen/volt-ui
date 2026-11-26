#!/usr/bin/env node
/**
 * Writes packages/shared/lib/compositions.generated.ts: every Recipes composition (block, layout,
 * pattern) and what a consumer needs to use it, derived from the source the page shows.
 *
 *   node scripts/generate-compositions.mjs          write
 *   node scripts/generate-compositions.mjs --check  write nothing; exit 1 if the committed file is stale
 *
 * For each entry of the Recipes catalog (apps/recipes/src/app/lib/catalog.ts) it finds the page
 * (`pages/(gallery)/<kind>/<slug>.page.ts`), the composition folder the page renders, and the
 * snippet the page displays and copies. It FAILS — it never skips an entry — when:
 *   - an entry has no page, or the page renders no composition from `src/app/<kind>/<folder>/`;
 *   - the source the page displays is not the composition it renders (preview ≠ copy);
 *   - a composition imports anything a consumer does not have: the app (`@shared/*`, a relative
 *     path outside its folder), a docs-only service, or a sibling file it does not ship;
 *   - the catalog lists a Volt component the source does not import (the "built from" list would
 *     advertise a dependency that is not there).
 * Components and npm packages are read off the source with the transform the site and the MCP use
 * (packages/shared/lib/distribution.ts), so instructions cannot drift from the code.
 *
 * Consumed by the MCP server (`find_compositions`), scripts/check-copied-source.mjs and
 * scripts/check-consumer.mjs. Recipes pages compute the same facts from the code they display.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'packages/shared/lib/compositions.generated.ts');
const APP = join(ROOT, 'apps/recipes/src/app');
const CHECK = process.argv.includes('--check');

const load = rel => import(pathToFileURL(join(ROOT, rel)).href);
const { toConsumerSource, externalPackages, importSpecifiers } = await load(
  'apps/recipes/src/app/lib/snippets/consumer-source.ts'
);
const { VOLT_NAMES } = await load('packages/shared/lib/volt-names.generated.ts');
const { createDistribution } = await load('packages/shared/lib/distribution.ts');
const distribution = createDistribution(VOLT_NAMES);

const vite = await createServer({
  root: ROOT,
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
  resolve: { alias: { '@shared': join(ROOT, 'packages/shared') } },
  server: { middlewareMode: true, hmr: false, watch: null },
});
let catalog;
let site;
try {
  catalog = await vite.ssrLoadModule('/apps/recipes/src/app/lib/catalog.ts');
  site = await vite.ssrLoadModule('/apps/recipes/src/app/lib/site.ts');
} finally {
  await vite.close();
}

const SNIPPET_MODULE = { blocks: 'blocks', layouts: 'layouts', patterns: 'recipes' };
const read = file => readFileSync(file, 'utf8');

/** `{ CONST_NAME: '<folder>/<file>.ts' }` for one lib/snippets module, from its `?raw` imports. */
function snippetFiles(kind) {
  const source = read(join(APP, 'lib/snippets', `${SNIPPET_MODULE[kind]}.ts`));
  const raw = Object.fromEntries(
    [...source.matchAll(/import (\w+) from '\.\.\/\.\.\/[a-z]+\/([^']+)\?raw';/g)].map(m => [
      m[1],
      m[2],
    ])
  );
  const out = {};
  for (const m of source.matchAll(/export const (\w+) = (?:toConsumerSource\()?(\w+)\)?;/g)) {
    if (raw[m[2]]) out[m[1]] = raw[m[2]];
  }
  return out;
}

const problems = [];
const entries = [];
const snippets = Object.fromEntries(
  ['blocks', 'layouts', 'patterns'].map(kind => [kind, snippetFiles(kind)])
);

for (const entry of catalog.CATALOG) {
  const where = `${entry.id} (${entry.path})`;
  const page = join(APP, 'pages/(gallery)', entry.kind, `${entry.slug}.page.ts`);
  if (!existsSync(page)) {
    problems.push(`${where}: no page at ${page.slice(ROOT.length + 1)}`);
    continue;
  }
  const pageSource = read(page);
  const rendered = [
    ...pageSource.matchAll(new RegExp(`from '\\.\\./\\.\\./\\.\\./${entry.kind}/([\\w-]+)/([\\w.-]+)'`, 'g')),
  ];
  const folders = [...new Set(rendered.map(m => m[1]))];
  if (folders.length !== 1) {
    problems.push(
      `${where}: the page must render exactly one composition from src/app/${entry.kind}/<folder>/ (found ${folders.length ? folders.join(', ') : 'none'})`
    );
    continue;
  }
  const folder = folders[0];
  const dir = join(APP, entry.kind, folder);

  // What the page displays (and so what the copy button copies) must be the rendered folder.
  const displayed = [
    ...pageSource.matchAll(/import \{([^}]+)\} from '\.\.\/\.\.\/\.\.\/lib\/snippets\/\w+'/g),
  ]
    .flatMap(m => m[1].split(',').map(s => s.trim()))
    .filter(Boolean)
    .map(name => snippets[entry.kind][name]);
  if (!displayed.length || displayed.some(file => !file)) {
    problems.push(`${where}: the page does not display its source from lib/snippets`);
    continue;
  }
  const off = displayed.filter(file => !file.startsWith(`${folder}/`));
  if (off.length) {
    problems.push(`${where}: renders ${folder}/ but displays ${off.join(', ')}`);
    continue;
  }

  const files = readdirSync(dir)
    .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
    .sort((a, b) => (a === `${folder}.ts` ? -1 : b === `${folder}.ts` ? 1 : a.localeCompare(b)));
  if (files[0] !== `${folder}.ts`) {
    problems.push(`${where}: ${entry.kind}/${folder}/${folder}.ts is missing`);
    continue;
  }
  const missingFromPage = files.filter(f => !displayed.includes(`${folder}/${f}`));
  if (missingFromPage.length) {
    problems.push(`${where}: ships ${missingFromPage.join(', ')} but the page does not show it`);
  }

  const consumer = files.map(f => ({ name: f, source: toConsumerSource(read(join(dir, f))) }));
  for (const { name, source } of consumer) {
    for (const spec of importSpecifiers(source)) {
      if (spec.startsWith('./')) {
        const sibling = `${spec.slice(2)}.ts`;
        if (!files.includes(sibling)) problems.push(`${where}: ${name} imports ${spec}, which is not shipped beside it`);
      } else if (spec.startsWith('.') || spec.startsWith('@shared') || spec === 'volt' || /apps\//.test(spec)) {
        problems.push(`${where}: ${name} imports "${spec}", which a consumer does not have`);
      }
    }
  }

  const components = [...new Set(consumer.flatMap(f => distribution.componentsUsed(f.source)))];
  const packages = [
    ...new Set(consumer.flatMap(f => externalPackages(f.source))),
  ].filter(p => p !== '@voltui/components' && !p.startsWith('@angular/') && p !== 'rxjs');
  // The catalog names building blocks by class (VoltButton links to the Button page); what a consumer
  // installs is the component folder, so the two are compared at that level.
  const declared = entry.atoms.map(atom => atom.name);
  for (const name of declared) {
    const owner = VOLT_NAMES.exportOwners[name];
    if (!owner) problems.push(`${where}: catalog lists ${name}, which Volt UI does not export`);
    else if (!components.includes(owner)) {
      problems.push(
        `${where}: catalog lists ${name} as a building block, but the source imports nothing from "${owner}"`
      );
    }
  }

  entries.push({
    id: entry.id,
    kind: entry.kind,
    slug: entry.slug,
    group: entry.groupId ?? null,
    url: `${site.SITE_ORIGIN}${entry.path}`,
    folder,
    files,
    components,
    packages,
    atoms: declared,
  });
}

if (problems.length) {
  console.error(`Recipes compositions are not consistent with their pages:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}

const body = `// Generated by scripts/generate-compositions.mjs from the Recipes catalog and the source each page
// shows — do not hand-edit. Components and packages are read off the source; the build fails when a
// page, its preview and its copyable source disagree.

export type CompositionKind = 'blocks' | 'layouts' | 'patterns';

export interface CompositionManifestEntry {
  /** Stable catalog id, e.g. \`blocks/hero\`. */
  readonly id: string;
  readonly kind: CompositionKind;
  readonly slug: string;
  /** The listing group (block category, layout category); null for patterns. */
  readonly group: string | null;
  /** The page on recipes.voltui.dev: live preview, source in both modes, install commands. */
  readonly url: string;
  /** Folder name under src/app/<kind>/ in Volt UI Recipes; the copy keeps the same file names. */
  readonly folder: string;
  /** Files to copy together, main file first. */
  readonly files: readonly string[];
  /** CLI component folders the source imports (\`volt add …\`), in order of first use. */
  readonly components: readonly string[];
  /** npm packages besides Angular, rxjs and Volt UI that the source imports. */
  readonly packages: readonly string[];
  /** The Volt classes the catalog names as building blocks. */
  readonly atoms: readonly string[];
}

export const COMPOSITIONS: readonly CompositionManifestEntry[] = ${JSON.stringify(entries, null, 2)};
`;

const prettier = await import('prettier');
const formatted = await prettier.format(body, {
  ...(await prettier.resolveConfig(OUT)),
  filepath: OUT,
});

if (CHECK) {
  const current = existsSync(OUT) ? read(OUT) : '';
  if (current !== formatted) {
    console.error('packages/shared/lib/compositions.generated.ts is stale.');
    process.exit(1);
  }
  console.log(`compositions.generated.ts is current (${entries.length} compositions).`);
} else {
  writeFileSync(OUT, formatted);
  console.log(`Wrote ${OUT.slice(ROOT.length + 1)} (${entries.length} compositions).`);
}
