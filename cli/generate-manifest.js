#!/usr/bin/env node
/**
 * Builds the CLI registry manifest (`apps/web/public/manifest.json`, gitignored, packed into
 * `@voltui/cli` as `registry/manifest.json`).
 *
 * Every fact in it is read from the place that already owns it — nothing is restated here:
 *
 *   files, inter-component dependencies   the library source tree (packages/volt/src/lib)
 *   label, group, description              the Storybook guides via scripts/lib/component-catalog.mjs
 *   stability                              COMPONENT_STATUS.md (through the same catalog)
 *   npm packages a copy imports            the copied files' own import statements
 *   ranges for those packages              packages/volt/package.json (dependencies + peers)
 *   tested versions                        what this workspace has installed (the lockfile)
 *
 *   node cli/generate-manifest.js           write the manifest           (pnpm manifest)
 *   node cli/generate-manifest.js --check   write nothing; fail when the manifest cannot be built
 *                                           (a component without status or guide, an import the
 *                                           package does not declare) or when an existing manifest
 *                                           on disk is stale
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const LIB_DIR = path.join(ROOT, 'packages/volt/src/lib');
const COMPONENTS_DIR = path.join(LIB_DIR, 'components');
const LAYOUTS_DIR = path.join(LIB_DIR, 'layouts');
const QUARTZ_DIR = path.join(LIB_DIR, 'quartz');
const LIB_PACKAGE = path.join(ROOT, 'packages/volt/package.json');
const OUTPUT = path.join(ROOT, 'apps/web/public/manifest.json');

const { bareImports, packageName, isFrameworkPackage: isFramework } = require('./lib/imports');

// Lib-root helpers a component may import with a relative path (`../../utils`). Kept in sync with
// cli/lib/core.js, which copies them flat next to each component.
const { SHARED_LIB_FILES } = require('./lib/shared-files');

function sourceFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.test.ts'))
    .sort();
}

/**
 * Map a relative import path to a component/layout name if it points to another
 * Volt component. Handles both 'volt' alias imports and relative imports.
 */
function resolveInternalImport(importPath, currentName) {
  if (importPath === 'volt' || importPath.startsWith('volt/')) {
    const segments = importPath.split('/').filter(Boolean);
    return segments.length > 1 ? segments[1] : null;
  }
  const normalized = importPath.replace(/\\/g, '/');
  const match = normalized.match(/(?:components|layouts)\/([^/]+)(?:\/|$)/);
  const sibling = normalized.match(/^\.\.\/([^/.]+)(?:\/|$)/);
  const target = match?.[1] ?? sibling?.[1];
  return target && target !== currentName ? target : null;
}

function sharedFilesImportedBy(source) {
  return SHARED_LIB_FILES.filter(file => {
    const base = file.replace(/\.ts$/, '');
    return new RegExp(`from\\s+['"](?:\\.\\./)+${base}['"]`).test(source);
  });
}

function installedVersion(pkg) {
  for (const candidate of [
    path.join(ROOT, 'node_modules', pkg, 'package.json'),
    path.join(ROOT, 'packages/volt/node_modules', pkg, 'package.json'),
  ]) {
    if (fs.existsSync(candidate)) return JSON.parse(fs.readFileSync(candidate, 'utf-8')).version;
  }
  return null;
}

class ManifestError extends Error {}

/**
 * The npm packages a set of library files needs, from their imports (and the shared helpers they
 * pull in). Every non-framework package must be declared by the library's package.json, or a
 * consumer following the CLI would be told nothing about it.
 */
function packagesFor(files, declared, where) {
  const pkgs = new Set();
  const seen = new Set();
  const visit = rel => {
    if (seen.has(rel)) return;
    seen.add(rel);
    const source = fs.readFileSync(path.join(LIB_DIR, rel), 'utf-8');
    for (const pkg of bareImports(source)) {
      if (isFramework(pkg)) continue;
      if (!declared[pkg]) {
        throw new ManifestError(
          `${rel} (${where}) imports "${pkg}", which packages/volt/package.json does not declare. ` +
            'Declare it (dependencies or an optional peer) so the CLI can tell consumers to install it.'
        );
      }
      pkgs.add(pkg);
    }
    for (const shared of sharedFilesImportedBy(source)) visit(shared);
  };
  files.forEach(visit);
  return [...pkgs].sort();
}

async function loadCatalogByKey() {
  const { loadCatalog } = await import(
    pathToFileURL(path.join(ROOT, 'scripts/lib/component-catalog.mjs')).href
  );
  return new Map((await loadCatalog()).map(entry => [entry.key, entry]));
}

/** First sentence of the guide summary: what `volt list` prints next to a name. */
function shortDescription(summary) {
  return (summary.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? summary).trim();
}

async function buildManifest() {
  const libPackage = JSON.parse(fs.readFileSync(LIB_PACKAGE, 'utf-8'));
  const catalog = await loadCatalogByKey();
  const declared = { ...libPackage.peerDependencies, ...libPackage.dependencies };
  const optional = libPackage.peerDependenciesMeta || {};

  const scan = (dir, category) => {
    const out = {};
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const own = sourceFiles(path.join(dir, entry.name));
      if (own.length === 0) continue;
      const meta = catalog.get(entry.name);
      if (!meta) {
        throw new ManifestError(
          `"${entry.name}" has no guide in stories/_docs/component-guides.mjs or no row in ` +
            'COMPONENT_STATUS.md — see specs/GUARDRAILS.md ripple effects 6 and 7.'
        );
      }
      out[entry.name] = {
        category,
        group: meta.category,
        label: meta.title,
        description: shortDescription(meta.summary),
        stability: meta.status,
        files: own.map(f => path.posix.join(category, entry.name, f)),
        dependencies: [],
        packages: [],
      };
    }
    return out;
  };

  const components = {
    ...scan(COMPONENTS_DIR, 'components'),
    ...scan(LAYOUTS_DIR, 'layouts'),
  };
  const names = new Set(Object.keys(components));

  for (const [name, meta] of Object.entries(components)) {
    const deps = new Set();
    for (const file of meta.files) {
      const content = fs.readFileSync(path.join(LIB_DIR, file), 'utf-8');
      for (const [, importPath] of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const target = resolveInternalImport(importPath, name);
        if (target && names.has(target)) deps.add(target);
      }
    }
    meta.dependencies = [...deps].sort();
    meta.packages = packagesFor(meta.files, declared, name);
  }

  /*
   * Alternative headless backends. `components.<name>.files` stays the default (ng-primitives)
   * source; a component with a Quartz implementation gets `backends.quartz = { files, dependencies,
   * packages }`. A Quartz folder may import a pure helper that lives with the default component
   * (Toggle's `variants.ts`); that file is listed too, so a copy is self-contained.
   */
  const quartz = {};
  if (fs.existsSync(QUARTZ_DIR)) {
    for (const entry of fs.readdirSync(QUARTZ_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      if (!components[name]) {
        throw new ManifestError(
          `lib/quartz/${name} has no ng-primitives counterpart in lib/components/${name}.`
        );
      }
      const dir = path.join(QUARTZ_DIR, name);
      const own = sourceFiles(dir);
      const files = own.map(f => path.posix.join('quartz', name, f));
      const dependencies = new Set();
      for (const file of own) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        for (const [, importPath] of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
          const sameComponentFile = importPath.match(/^(?:\.\.\/)+components\/([^/]+)\/([^/]+)$/);
          if (sameComponentFile && sameComponentFile[1] === name) {
            const shared = path.posix.join('components', name, `${sameComponentFile[2]}.ts`);
            if (!files.includes(shared)) files.push(shared);
            continue;
          }
          const target = resolveInternalImport(importPath, name);
          if (target && names.has(target)) dependencies.add(target);
        }
      }
      quartz[name] = {
        files,
        dependencies: [...dependencies].sort(),
        packages: packagesFor(files, declared, `${name}, quartz`),
      };
      components[name].backends = { quartz: quartz[name] };
    }
  }

  // A copy brings its component dependencies along (sidebar → tooltip), so what it needs installed
  // is the union over that closure: the field answers "what must I install for this component".
  const closure = (name, backend, seen = new Set()) => {
    if (seen.has(name)) return seen;
    seen.add(name);
    const meta = components[name];
    const deps = backend ? (meta.backends?.[backend]?.dependencies ?? []) : meta.dependencies;
    deps.forEach(dep => closure(dep, backend, seen));
    return seen;
  };
  const union = (name, backend) =>
    [
      ...new Set(
        [...closure(name, backend)].flatMap(dep =>
          backend ? components[dep].backends[backend].packages : components[dep].packages
        )
      ),
    ].sort();
  const transitive = Object.fromEntries(
    Object.keys(components).map(name => [
      name,
      {
        packages: union(name),
        quartz: components[name].backends ? union(name, 'quartz') : null,
      },
    ])
  );
  for (const [name, { packages, quartz: q }] of Object.entries(transitive)) {
    components[name].packages = packages;
    if (q) components[name].backends.quartz.packages = q;
  }

  // Every package a copy can import, with the range the library declares and the version this
  // revision was built and tested with. One table, read from package.json, never typed twice.
  const used = new Set();
  for (const meta of Object.values(components)) {
    meta.packages.forEach(p => used.add(p));
    Object.values(meta.backends || {}).forEach(b => b.packages.forEach(p => used.add(p)));
  }
  const packages = {};
  for (const pkg of [...used].sort()) {
    const tested = installedVersion(pkg);
    if (!tested) {
      throw new ManifestError(`"${pkg}" is not installed in this workspace; run pnpm install.`);
    }
    packages[pkg] = {
      range: declared[pkg],
      tested,
      ...(libPackage.peerDependencies?.[pkg] ? { peer: true } : {}),
      ...(optional[pkg]?.optional ? { optional: true } : {}),
    };
  }
  const angular = Object.fromEntries(
    Object.entries(libPackage.peerDependencies || {}).filter(([pkg]) => pkg.startsWith('@angular/'))
  );

  return {
    version: libPackage.version,
    runtime: {
      // The Angular packages a copy needs are the consumer application's own; the CLI checks the
      // installed versions against these ranges and never installs or upgrades Angular.
      angular,
      packages,
    },
    // Published ranges of each backend's runtime packages, read from the library's own peer ranges.
    backends: {
      'ng-primitives': { default: true, packages: [] },
      quartz: {
        entryPoint: '@voltui/components/quartz',
        packages: ['@quartz-headless/core', '@quartz-headless/primitives'].map(
          pkg => `${pkg}@${libPackage.peerDependencies[pkg]}`
        ),
        components: Object.keys(quartz).sort(),
      },
    },
    components,
  };
}

const serialize = manifest => JSON.stringify(manifest, null, 2);

async function main() {
  const check = process.argv.includes('--check');
  let manifest;
  try {
    manifest = await buildManifest();
  } catch (err) {
    if (!(err instanceof ManifestError)) throw err;
    console.error(`[manifest] ${err.message}`);
    process.exit(1);
  }
  const output = serialize(manifest);
  if (!check) {
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, output);
    console.log(`Manifest written to ${OUTPUT}`);
    return;
  }
  const rel = path.relative(ROOT, OUTPUT);
  if (!fs.existsSync(OUTPUT)) {
    console.log(
      `[manifest] builds (${Object.keys(manifest.components).length} components); ${rel} is not generated yet`
    );
    return;
  }
  if (fs.readFileSync(OUTPUT, 'utf-8') !== output) {
    console.error(`[manifest] ${rel} is stale.\nRun \`pnpm manifest\` to regenerate it.`);
    process.exit(1);
  }
  console.log('[manifest] up to date');
}

module.exports = { buildManifest, serialize, bareImports, packageName, ManifestError, OUTPUT };

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
