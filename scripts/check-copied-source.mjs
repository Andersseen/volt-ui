#!/usr/bin/env node
/**
 * Compiles what the Blocks, Layouts and Patterns pages hand a visitor, in BOTH distribution modes, in
 * a workspace with none of this repository's context: no `volt` alias, no docs-app paths.
 *
 *   package  the source as shown in package mode; `@voltui/components` resolves to the built library
 *            (`dist/volt`, run `pnpm build:lib` first), the artifact `npm pack` ships.
 *   copy     the same source through the CLI-copy transform (packages/shared/lib/distribution.ts),
 *            beside the components copied by the CLI TARBALL (`npm pack` of cli/, extracted and run
 *            with node: the binary a consumer installs, not cli/bin from the workspace).
 *
 * The list of compositions is the generated manifest (packages/shared/lib/compositions.generated.ts),
 * which covers every catalog entry; a folder on disk that the manifest does not know fails the check,
 * so nothing is skipped silently. Before compiling, every file is checked for imports a consumer does
 * not have (scripts/lib/compositions.mjs): the `volt` alias, the websites' code, a sibling that is not
 * shipped, and in copy mode a component the install command does not copy or a package name left over.
 *
 * Third-party packages (ng-primitives, lumen-icons, …) resolve from this workspace here; that they are
 * declared and installable in a clean project is proven by scripts/check-consumer.mjs.
 *
 * Usage: node scripts/check-copied-source.mjs [--mode=package|copy]
 */
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sourceProblems } from './lib/compositions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist/copied-source');
const LIB = join(ROOT, 'dist/volt');
const APP = join(ROOT, 'apps/recipes/src/app');
const modeArg = process.argv.find(a => a.startsWith('--mode='))?.slice(7);
const MODES = modeArg ? [modeArg] : ['package', 'copy'];

const load = rel => import(pathToFileURL(join(ROOT, rel)).href);
const { toConsumerSource } = await load('apps/recipes/src/app/lib/snippets/consumer-source.ts');
const { COMPOSITIONS } = await load('packages/shared/lib/compositions.generated.ts');
const { VOLT_NAMES } = await load('packages/shared/lib/volt-names.generated.ts');
const { createDistribution } = await load('packages/shared/lib/distribution.ts');
const distribution = createDistribution(VOLT_NAMES);
const libraryNames = new Set([
  ...Object.keys(VOLT_NAMES.exportOwners),
  ...VOLT_NAMES.elements,
  ...VOLT_NAMES.attributes,
]);

if (MODES.includes('package') && !existsSync(join(LIB, 'package.json'))) {
  console.error('dist/volt is missing — run "pnpm build:lib" first.');
  process.exit(1);
}

// Nothing on disk is left out: every composition folder must be in the manifest.
const known = new Set(COMPOSITIONS.map(c => `${c.kind}/${c.folder}`));
const orphans = ['blocks', 'layouts', 'patterns'].flatMap(kind =>
  readdirSync(join(APP, kind), { withFileTypes: true })
    .filter(e => e.isDirectory() && !known.has(`${kind}/${e.name}`))
    .map(e => `${kind}/${e.name}`)
);
if (orphans.length) {
  console.error(
    `Composition folders with no catalog entry or page (run pnpm generate:compositions): ${orphans.join(', ')}`
  );
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
const problems = [];

/** The CLI as a consumer installs it: `npm pack` of cli/, extracted outside the repository. */
function cliFromTarball() {
  const dir = mkdtempSync(join(tmpdir(), 'volt-cli-tarball-'));
  const registry = join(ROOT, 'cli/registry');
  try {
    execFileSync('node', [join(ROOT, 'cli/generate-manifest.js')], { cwd: ROOT, stdio: 'ignore' });
    const packed = spawnSync('npm', ['pack', '--json', '--pack-destination', dir], {
      cwd: join(ROOT, 'cli'),
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: join(ROOT, '.npm-cache') },
    });
    if (packed.status !== 0) throw new Error(`npm pack failed:\n${packed.stderr}`);
    const [info] = JSON.parse(packed.stdout.slice(packed.stdout.indexOf('[')));
    execFileSync('tar', ['xzf', join(dir, info.filename), '-C', dir]);
    return { bin: join(dir, 'package/bin/volt'), version: info.version, dir };
  } finally {
    rmSync(registry, { recursive: true, force: true });
  }
}

let cli = null;
for (const mode of MODES) {
  const base = join(OUT, mode);
  const copiedFolders =
    mode === 'copy' ? [...new Set(COMPOSITIONS.flatMap(c => c.components))] : [];
  for (const c of COMPOSITIONS) {
    const dir = join(APP, c.kind, c.folder);
    for (const file of c.files) {
      const source = distribution.sourceFor(
        toConsumerSource(readFileSync(join(dir, file), 'utf8')),
        mode,
        '../ui'
      );
      problems.push(
        ...sourceProblems({
          file: `${mode}: ${c.id} ${file}`,
          source,
          mode,
          copied: c.components,
          siblings: c.files,
          libraryNames,
        })
      );
      const target = join(base, c.folder, file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, source);
    }
  }
  if (mode === 'copy') {
    cli ??= cliFromTarball();
    console.log(
      `Copying ${copiedFolders.length} components with the @voltui/cli ${cli.version} tarball…`
    );
    execFileSync('node', [cli.bin, 'add', ...copiedFolders, `--path=${join(base, 'ui')}`], {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  }
}
if (cli) rmSync(cli.dir, { recursive: true, force: true });

if (problems.length) {
  console.error(`Copyable source breaks the consumer rules:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}

let failed = false;
for (const mode of MODES) {
  const tsconfig = join(OUT, mode, 'tsconfig.json');
  writeFileSync(
    tsconfig,
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noImplicitOverride: true,
          skipLibCheck: true,
          isolatedModules: true,
          experimentalDecorators: true,
          importHelpers: true,
          target: 'ES2022',
          module: 'preserve',
          moduleResolution: 'bundler',
          noEmit: true,
          types: [],
          // The only mapping a consumer has: the package (package mode), or nothing at all (copy
          // mode, where every Volt import is a relative path into ./ui). No `volt`, no `src/…`.
          ...(mode === 'package' ? { paths: { '@voltui/components': [LIB] } } : {}),
          typeRoots: [],
        },
        angularCompilerOptions: {
          strictInjectionParameters: true,
          strictInputAccessModifiers: true,
          strictTemplates: true,
        },
        include: ['**/*.ts'],
      },
      null,
      2
    )
  );
  console.log(`▶ ${mode} mode: compiling ${COMPOSITIONS.length} blocks, layouts and patterns…`);
  try {
    execFileSync(join(ROOT, 'node_modules/.bin/ngc'), ['-p', tsconfig], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    console.log(`✔ every ${mode}-mode composition compiles`);
  } catch {
    console.error(
      `✖ ${mode}-mode copied source does not compile in a consumer workspace (${join(OUT, mode)})`
    );
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
