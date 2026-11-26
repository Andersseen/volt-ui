#!/usr/bin/env node
/**
 * Volt UI as a consumer gets it: real tarballs, a project outside this repository, nothing borrowed
 * from the workspace.
 *
 *   1. pack   @voltui/components, @voltui/cli and @voltui/agent with `npm pack` (scripts/lib/pack.mjs)
 *   2. app    an Angular CLI project in the OS temp dir — its own package.json, lockfile, tsconfig
 *             (strict, strictTemplates, strictInjectionParameters, zoneless) — installs the tarballs
 *             with npm; no workspace node_modules, alias, symlink, NODE_PATH or Analog plugin
 *   3. cli    the INSTALLED `volt` binary: help, errors, dry-run, init (repeated over an edited
 *             barrel), add from a nested directory, repeated add, multi-add in both orders, --path,
 *             --base=quartz, the whole catalog with --install; `add --track` and `volt diff` against
 *             the installed reference and a second "newer" copy of the installed CLI, offline,
 *             proving the target tree (bytes, modes, mtimes) is identical after every diff
 *   4. build  the fixture app (e2e/consumer-tarball) in package mode and through the package → copy
 *             transform against the copied source, both prerendered on the server and hydrated;
 *             every example of scripts/check-examples.mjs and the full catalog in both modes, with
 *             the consumer's own ngc
 *   4b. recipes  every Recipes composition in package and CLI-copy mode: first WITHOUT the npm
 *             packages the pages list (must fail on them), then with exactly those installed; then
 *             four compositions as a disposable app (settings form, app shell, data table, marketing
 *             block with its data file) in both modes, prerendered and hydrated, with one copied
 *             component customised and `volt diff` reporting exactly that file
 *   5. isolation  a second project with only the CLI: `volt add card` without --install must FAIL to
 *             build (clsx is missing — proof nothing resolves from the workspace); `--install` adds
 *             exactly what card imports and the build passes
 *   6. agent  the installed @voltui/agent writes the Claude Code skills
 *   7. bundle production JS/CSS of a one-button app and of the fixture, raw and gzip, against
 *             specs/v2/bundle-baseline.json (regression > 10 % and > 2 KiB gzip fails)
 *   8. browser  Playwright on both builds: tokens and Tailwind paint, theme switch, form field
 *             wiring, dialog keyboard/focus/ARIA, hydration without warnings, unique ids; and on the
 *             onboarding apps: validation, save and failure, sort/filter, theme paint, the customisation
 *
 *   node scripts/check-consumer.mjs                    Angular 21.2.0 (the declared minimum), Chromium
 *   node scripts/check-consumer.mjs --angular=22       latest 22.x
 *   --project=firefox --project=webkit                 more browsers (repeatable)
 *   --no-build   reuse dist/volt     --keep   keep the temp project     --update-baseline
 *
 * Writes dist/consumer-report.json: versions installed, where each package resolved from, sizes.
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { packAll } from './lib/pack.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const angular = args.find(a => a.startsWith('--angular='))?.slice(10) ?? '21.2.0';
const keep = args.includes('--keep');
const noBuild = args.includes('--no-build');
const updateBaseline = args.includes('--update-baseline');
const projects = args.filter(a => a.startsWith('--project='));
const ngRange = /^\d+$/.test(angular) ? `^${angular}.0.0` : /^\d+\.\d+$/.test(angular) ? `~${angular}.0` : angular;
const PORT = Number(process.env.CONSUMER_PORT ?? 5600);
const FIXTURE = join(ROOT, 'e2e/consumer-tarball');
const BASELINE = join(ROOT, 'specs/v2/bundle-baseline.json');

// A consumer's environment: nothing pnpm or this workspace injects into child processes.
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !/^(npm_|pnpm_|NODE_PATH$|INIT_CWD$|PNPM_)/i.test(key)
  )
);
env.npm_config_cache = join(ROOT, '.npm-cache');
env.npm_config_fund = 'false';
env.npm_config_audit = 'false';

const work = realpathSync(mkdtempSync(join(tmpdir(), `volt-consumer-${angular}-`)));
const servers = [];
const report = { angular: { requested: ngRange }, steps: [], resolution: {}, sizes: {} };
let finished = false;

process.on('exit', () => {
  servers.forEach(s => s.kill());
  rmSync(join(ROOT, 'cli/registry'), { recursive: true, force: true });
  if (!keep) rmSync(work, { recursive: true, force: true });
  else console.log(`\n  kept ${work}`);
  if (!finished) console.error('\n✖ check-consumer did not complete');
});

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function step(label) {
  console.log(`\n▶ ${label}`);
  report.steps.push(label);
}

function exec(command, cmdArgs, { cwd, expectStatus = 0, quiet = false } = {}) {
  if (!quiet) console.log(`  $ ${command} ${cmdArgs.join(' ')}  (in ${relative(work, cwd) || '.'})`);
  const result = spawnSync(command, cmdArgs, { cwd, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const out = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (expectStatus !== null && result.status !== expectStatus) {
    console.error(out);
    fail(`${command} ${cmdArgs.join(' ')} exited ${result.status}, expected ${expectStatus}`);
  }
  return { status: result.status, out };
}

function assert(condition, message) {
  if (!condition) fail(message);
  console.log(`  ✔ ${message}`);
}

const json = file => JSON.parse(readFileSync(file, 'utf8'));
const write = (file, content) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
};

function tree(dir) {
  const out = {};
  const walk = d => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else out[relative(dir, full)] = readFileSync(full, 'utf8');
    }
  };
  walk(dir);
  return out;
}

// ---- 1. tarballs -----------------------------------------------------------------------------
const tarballDir = join(work, 'tarballs');
mkdirSync(tarballDir);
let tarballs;
try {
  tarballs = packAll({ root: ROOT, dest: tarballDir, build: !noBuild, env: { ...process.env } });
} catch (error) {
  fail(error.message);
}
report.tarballs = Object.fromEntries(
  Object.entries(tarballs).map(([k, t]) => [k, { name: t.name, version: t.version, files: t.files, bytes: t.size }])
);

const angularDeps = Object.fromEntries(
  [
    '@angular/cdk',
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/forms',
    '@angular/platform-browser',
    '@angular/platform-server',
    '@angular/router',
    '@angular/ssr',
  ].map(p => [p, ngRange])
);
const toolDeps = {
  '@angular/build': ngRange,
  '@angular/cli': ngRange,
  '@angular/compiler-cli': ngRange,
  '@tailwindcss/postcss': '^4.0.0',
  postcss: '^8.4.0',
  tailwindcss: '^4.0.0',
};

function npmInstall(cwd) {
  exec('npx', ['--yes', 'npm@11', 'install', '--no-audit', '--no-fund'], { cwd });
}

// ---- 2. the consumer application ---------------------------------------------------------------
step(`create the consumer outside the repository (${work}) with Angular ${ngRange}`);
const app = join(work, 'app');
write(join(app, 'package.json'), {
  name: 'volt-consumer',
  private: true,
  type: 'module',
  dependencies: {
    ...angularDeps,
    '@voltui/components': `file:${tarballs.components.file}`,
    rxjs: '^7.8.0',
    tslib: '^2.6.0',
  },
  devDependencies: {
    ...toolDeps,
    '@voltui/cli': `file:${tarballs.cli.file}`,
    '@voltui/agent': `file:${tarballs.agent.file}`,
  },
});
npmInstall(app);
assert(existsSync(join(app, 'package-lock.json')), 'the consumer has its own lockfile');

function resolution(dir, pkg) {
  const file = join(dir, 'node_modules', pkg, 'package.json');
  if (!existsSync(file)) return null;
  return { version: json(file).version, path: realpathSync(dirname(file)) };
}
for (const pkg of [
  '@angular/core',
  '@angular/build',
  'typescript',
  'tailwindcss',
  '@voltui/components',
  '@voltui/cli',
  '@voltui/agent',
  'ng-primitives',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
]) {
  const r = resolution(app, pkg);
  report.resolution[pkg] = r;
  if (r && r.path.startsWith(ROOT)) fail(`${pkg} resolves inside the repository (${r.path})`);
}
report.angular.installed = report.resolution['@angular/core']?.version;
console.log(
  `  installed @angular/core ${report.angular.installed}, @voltui/components ${report.resolution['@voltui/components'].version}`
);
assert(
  Object.values(report.resolution).every(r => !r || !r.path.startsWith(ROOT)),
  'every package resolves from the consumer’s own node_modules'
);

// ---- 3. the installed CLI ----------------------------------------------------------------------
const volt = join(app, 'node_modules/.bin/volt');
const voltIn = (cwd, cmdArgs, expectStatus = 0) => exec(volt, cmdArgs, { cwd, expectStatus });
const manifest = json(join(ROOT, 'apps/web/public/manifest.json'));
const allComponents = Object.keys(manifest.components).sort();

step('the installed volt binary');
assert(realpathSync(volt).startsWith(join(app, 'node_modules')), 'volt is the binary from the CLI tarball');
assert(voltIn(app, ['--help']).out.includes('--path=<dir>'), 'help documents --path');
const listed = JSON.parse(voltIn(app, ['list', '--json']).out);
assert(listed.length === allComponents.length, `volt list --json lists the ${allComponents.length} components`);
let r = voltIn(app, ['add', 'nope'], 1);
assert(/Component "nope" not found/.test(r.out) && !existsSync(join(app, 'src')), 'an unknown component fails before any write');
r = voltIn(app, ['add', 'button', '--bogus'], 1);
assert(/Unknown option "--bogus"/.test(r.out), 'an unknown option is an error');
r = voltIn(app, ['add', 'dialog', '--dry-run']);
assert(/Dry run/.test(r.out) && !existsSync(join(app, 'src')), '--dry-run writes nothing');

const ui = join(app, 'src/app/ui');
voltIn(app, ['init']);
assert(existsSync(join(ui, 'index.ts')), 'volt init creates src/app/ui/index.ts');
appendFileSync(join(ui, 'index.ts'), '\n// our own export\nexport const CUSTOM = 1;\n');
const barrel = readFileSync(join(ui, 'index.ts'), 'utf8');
voltIn(app, ['init']);
assert(readFileSync(join(ui, 'index.ts'), 'utf8') === barrel, 'a second init keeps the edited barrel byte for byte');

mkdirSync(join(app, 'src/app/feature'), { recursive: true });
voltIn(join(app, 'src/app/feature'), ['add', 'button']);
assert(existsSync(join(ui, 'button/button.ts')), 'add from a nested directory writes to the project’s src/app/ui');
r = voltIn(app, ['add', 'button']);
assert(/reused/.test(r.out), 'a repeated add reuses identical files');
voltIn(app, ['add', 'tooltip', 'sidebar', '--path=src/order-a']);
voltIn(app, ['add', 'sidebar', 'tooltip', '--path', 'src/order-b']);
const a = tree(join(app, 'src/order-a'));
const b = tree(join(app, 'src/order-b'));
const barrelless = t => Object.fromEntries(Object.entries(t).filter(([k]) => k !== 'index.ts'));
assert(
  JSON.stringify(barrelless(a)) === JSON.stringify(barrelless(b)) && a['tooltip/tooltip.ts'],
  'tooltip+sidebar and sidebar+tooltip copy the same files (--path=, --path <dir>)'
);
r = voltIn(app, ['list', '--base=quartz', '--json']);
assert(JSON.parse(r.out).length === manifest.backends.quartz.components.length, 'list --base=quartz lists the Quartz components');
r = voltIn(app, ['add', 'checkbox', '--base=quartz', '--path=src/quartz', '--dry-run']);
assert(/@quartz-headless\/primitives/.test(r.out) && !/ng-primitives \^/.test(r.out), 'a Quartz copy needs Quartz, not ng-primitives');

step('provenance and volt diff with the installed binary (read-only, offline)');
{
  const tracked = join(app, 'src/tracked');
  // A fingerprint of every entry under a directory: bytes, mode, size and mtime, symlinks not followed.
  const fingerprint = dir => {
    const out = {};
    const walk = d => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        const st = statSync(full);
        if (entry.isDirectory()) {
          out[`${relative(dir, full)}/`] = st.mode;
          walk(full);
        } else {
          out[relative(dir, full)] = `${createHash('sha256').update(readFileSync(full)).digest('hex')}:${st.mode}:${st.mtimeMs}`;
        }
      }
    };
    walk(dir);
    return JSON.stringify(out);
  };
  const noNetwork = join(work, 'no-network.cjs');
  write(
    noNetwork,
    `const block = name => () => { throw new Error('network used: ' + name); };
for (const m of ['net', 'tls', 'http', 'https', 'dns']) {
  const mod = require(m);
  for (const k of ['connect', 'createConnection', 'request', 'get', 'lookup', 'resolve']) if (typeof mod[k] === 'function') mod[k] = block(m + '.' + k);
}
globalThis.fetch = block('fetch');
`
  );
  const diffRun = (bin, cmdArgs) => {
    const result = spawnSync(bin, ['diff', ...cmdArgs], {
      cwd: app,
      env: { ...env, NODE_OPTIONS: `--require ${noNetwork}` },
      encoding: 'utf8',
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  };

  r = voltIn(app, ['add', 'button', 'card', '--track', '--path=src/tracked', '--dry-run']);
  assert(!existsSync(tracked), 'add --track --dry-run writes nothing, no record');
  voltIn(app, ['add', 'button', 'card', '--track', '--path=src/tracked']);
  const record = json(join(tracked, '.volt-ui.json'));
  assert(
    record.schemaVersion === 1 && record.files['utils.ts'].owners.join() === 'button,card' &&
      !readFileSync(join(tracked, '.volt-ui.json'), 'utf8').includes(work),
    '.volt-ui.json: schema 1, shared helper owned by both components, no absolute paths'
  );

  let before = fingerprint(tracked);
  let d = diffRun(volt, ['button', '--path=src/tracked', '--json']);
  let report = JSON.parse(d.stdout);
  assert(
    d.status === 0 && report.provenance.status === 'tracked' && report.files.every(f => f.status === 'unchanged'),
    'volt diff on an untouched tracked copy: exit 0, every file unchanged (offline)'
  );
  appendFileSync(join(tracked, 'button/variants.ts'), '\n// local tweak\n');
  before = fingerprint(tracked);
  d = diffRun(volt, ['button', '--path=src/tracked', '--json']);
  report = JSON.parse(d.stdout);
  assert(
    d.status === 1 && report.files.find(f => f.path === 'button/variants.ts').status === 'local-changed',
    'a local edit: exit 1, local-changed'
  );
  assert(fingerprint(tracked) === before, 'the target tree is identical after volt diff');

  // "Another CLI version": a copy of the installed package whose reference changed.
  const nextCli = join(work, 'cli-next');
  cpSync(join(app, 'node_modules/@voltui/cli'), nextCli, { recursive: true, dereference: true });
  const nextPkg = json(join(nextCli, 'package.json'));
  write(join(nextCli, 'package.json'), { ...nextPkg, version: '99.0.0' });
  const buttonSrc = join(nextCli, 'registry/src/lib/components/button/button.ts');
  writeFileSync(buttonSrc, `// upstream fix\n${readFileSync(buttonSrc, 'utf8')}`);
  const nextVolt = join(nextCli, 'bin/volt');
  d = diffRun(nextVolt, ['button', '--path=src/tracked', '--json']);
  report = JSON.parse(d.stdout);
  const statusOf = p => report.files.find(f => f.path === p).status;
  assert(
    d.status === 1 && report.reference.cli === '99.0.0' &&
      statusOf('button/button.ts') === 'reference-changed' && statusOf('button/variants.ts') === 'local-changed',
    'a newer CLI: reference-changed and local-changed told apart by the record'
  );
  d = diffRun(nextVolt, ['button', '--path=src/tracked']);
  assert(/^\+\/\/ upstream fix$/m.test(d.stdout) && /Nothing was changed/.test(d.stdout), 'text mode prints the unified local → reference diff');
  assert(fingerprint(tracked) === before, 'still identical after the newer CLI compared it');

  // Untracked v1 copies are still comparable.
  voltIn(app, ['add', 'button', '--path=src/untracked']);
  assert(!existsSync(join(app, 'src/untracked/.volt-ui.json')), 'add without --track writes no record');
  d = diffRun(nextVolt, ['button', '--path=src/untracked', '--json']);
  report = JSON.parse(d.stdout);
  assert(
    d.status === 1 && report.provenance.status === 'untracked' && statusOf('button/button.ts') === 'unknown-origin',
    'an untracked copy compares with unknown origin'
  );

  writeFileSync(join(tracked, '.volt-ui.json'), '{ corrupt');
  before = fingerprint(tracked);
  d = diffRun(volt, ['button', '--path=src/tracked', '--json']);
  assert(d.status === 2 && JSON.parse(d.stdout).error && fingerprint(tracked) === before, 'a corrupt record: exit 2, JSON error, nothing changed');
  r = voltIn(app, ['add', 'badge', '--path=src/tracked'], 1);
  assert(/\.volt-ui\.json/.test(r.out) && fingerprint(tracked) === before, 'add refuses a corrupt record before writing');
  rmSync(nextCli, { recursive: true, force: true });
}

step('the whole catalog, with --install');
r = voltIn(app, ['add', ...allComponents, '--install']);
const declared = json(join(app, 'package.json')).dependencies;
for (const pkg of ['ng-primitives', 'class-variance-authority', 'clsx', 'tailwind-merge', '@floating-ui/dom']) {
  assert(!!declared[pkg], `--install declared ${pkg} (${declared[pkg]})`);
}
assert(!declared['@quartz-headless/core'], 'the default catalog never asks for Quartz');
assert(readFileSync(join(ui, 'index.ts'), 'utf8').includes('export const CUSTOM = 1;'), 'the barrel keeps its own export after adding the catalog');
r = voltIn(app, ['add', 'card', '--install']);
assert(/already installed in range|nothing to install/i.test(r.out), 'a second --install keeps what is installed');

// ---- 4. builds ---------------------------------------------------------------------------------
step('build the fixture in package and CLI-copy mode, prerendered and hydrated');
const load = rel => import(pathToFileURL(join(ROOT, rel)).href);
const { VOLT_NAMES } = await load('packages/shared/lib/volt-names.generated.ts');
const { createDistribution } = await load('packages/shared/lib/distribution.ts');
const distribution = createDistribution(VOLT_NAMES);

for (const mode of ['pkg', 'copy']) {
  const src = join(app, `src-${mode}`);
  for (const file of ['app.ts', 'main.ts', 'main.server.ts', 'index.html', 'styles.css']) {
    const text = readFileSync(join(FIXTURE, file), 'utf8');
    write(join(src, file), mode === 'copy' && file.endsWith('.ts') ? distribution.toCopyMode(text) : text);
  }
}
const used = [
  ...new Set(
    ['app.ts', 'main.ts'].flatMap(file =>
      distribution.componentsUsed(readFileSync(join(FIXTURE, file), 'utf8'))
    )
  ),
];
voltIn(app, ['add', ...used, '--path=src-copy/ui']);
write(join(app, 'src-min/main.ts'), readFileSync(join(FIXTURE, 'minimal.ts'), 'utf8'));
write(join(app, 'src-min/index.html'), readFileSync(join(FIXTURE, 'index.html'), 'utf8'));
write(join(app, 'src-min/styles.css'), readFileSync(join(FIXTURE, 'styles.css'), 'utf8'));

const compilerOptions = {
  strict: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  skipLibCheck: false,
  isolatedModules: true,
  importHelpers: true,
  target: 'ES2022',
  module: 'ES2022',
  moduleResolution: 'bundler',
  lib: ['ES2022', 'dom'],
  types: [],
};
const angularCompilerOptions = {
  strictTemplates: true,
  strictInjectionParameters: true,
  strictInputAccessModifiers: true,
  extendedDiagnostics: { defaultCategory: 'error' },
};
const project = (name, ssr) => {
  write(join(app, `tsconfig.${name}.json`), {
    compilerOptions,
    angularCompilerOptions,
    files: [`src-${name}/main.ts`, ...(ssr ? [`src-${name}/main.server.ts`] : [])],
  });
  return {
    projectType: 'application',
    root: '',
    sourceRoot: `src-${name}`,
    architect: {
      build: {
        builder: '@angular/build:application',
        options: {
          outputPath: `dist/${name}`,
          browser: `src-${name}/main.ts`,
          ...(ssr
            ? {
                server: `src-${name}/main.server.ts`,
                // Prerendered at build time: the root route is rendered on the server.
                outputMode: 'static',
              }
            : {}),
          index: `src-${name}/index.html`,
          tsConfig: `tsconfig.${name}.json`,
          styles: [`src-${name}/styles.css`],
          outputHashing: 'none',
        },
        configurations: { production: { optimization: true } },
        defaultConfiguration: 'production',
      },
    },
  };
};
write(join(app, '.postcssrc.json'), { plugins: { '@tailwindcss/postcss': {} } });
write(join(app, 'angular.json'), {
  $schema: './node_modules/@angular/cli/lib/config/schema.json',
  version: 1,
  cli: { analytics: false },
  projects: { pkg: project('pkg', true), copy: project('copy', true), min: project('min', false) },
});
const ng = join(app, 'node_modules/.bin/ng');
for (const name of ['pkg', 'copy', 'min']) exec(ng, ['build', name], { cwd: app });
for (const name of ['pkg', 'copy']) {
  const html = readFileSync(join(app, `dist/${name}/browser/index.html`), 'utf8');
  assert(html.includes('ngh=') && /<input[^>]*type="email"/.test(html), `${name}: server-rendered HTML with hydration annotations`);
}

step('every copyable example and the full catalog, compiled with the consumer’s ngc');
exec('node', [join(ROOT, 'scripts/check-examples.mjs'), '--emit', join(app, 'examples')], { cwd: ROOT });
voltIn(app, ['add', ...allComponents, '--path=examples/copy/ui']);
const directives = [
  ...new Set(
    Object.values((await load('apps/web/src/server/routes/mcp/api.generated.ts')).COMPONENT_API).flatMap(api =>
      [...api.directives.map(d => d.className), ...api.imports.filter(name => /^Ngp\w*Render$/.test(name))]
    )
  ),
].sort();
const catalog = `import { Component } from '@angular/core';
import { ${directives.join(', ')} } from '@voltui/components';

/** Every directive and component of the package in one standalone component. */
@Component({ selector: 'app-catalog', template: '', imports: [${directives.join(', ')}] })
export class Catalog {}
`;
write(join(app, 'examples/package/catalog.ts'), catalog);
write(join(app, 'examples/copy/catalog.ts'), distribution.toCopyMode(catalog, './ui'));
for (const mode of ['package', 'copy']) {
  write(join(app, `examples/${mode}/tsconfig.json`), {
    compilerOptions: { ...compilerOptions, noEmit: true, module: 'preserve' },
    // The documented host imports every directive on purpose: only that one check is relaxed.
    angularCompilerOptions: {
      ...angularCompilerOptions,
      extendedDiagnostics: { defaultCategory: 'error', checks: { unusedStandaloneImports: 'suppress' } },
    },
    include: ['**/*.ts'],
  });
  exec(join(app, 'node_modules/.bin/ngc'), ['-p', join(app, `examples/${mode}/tsconfig.json`)], { cwd: app });
  const count = readdirSync(join(app, `examples/${mode}/complete`)).length + readdirSync(join(app, `examples/${mode}/partial`)).length;
  assert(true, `${mode}: ${count} examples and the ${directives.length}-directive catalog compile (strict templates)`);
}
report.examples = json(join(app, 'examples/inventory.json'));

// ---- 4b. Recipes compositions ----------------------------------------------------------------------
step('Recipes compositions in package and CLI-copy mode, with only the dependencies the pages list');
const { COMPOSITIONS } = await load('packages/shared/lib/compositions.generated.ts');
const { toConsumerSource } = await load('apps/recipes/src/app/lib/snippets/consumer-source.ts');
const rootDeps = json(join(ROOT, 'package.json')).dependencies;
const compositionPackages = [...new Set(COMPOSITIONS.flatMap(c => c.packages))].sort();
const compositionComponents = [...new Set(COMPOSITIONS.flatMap(c => c.components))].sort();
const writeComposition = (c, dir, mode) => {
  for (const file of c.files) {
    const source = toConsumerSource(
      readFileSync(join(ROOT, 'apps/recipes/src/app', c.kind, c.folder, file), 'utf8')
    );
    write(join(dir, c.folder, file), distribution.sourceFor(source, mode, '../ui'));
  }
};
for (const mode of ['package', 'copy']) {
  for (const c of COMPOSITIONS) writeComposition(c, join(app, 'compositions', mode), mode);
  write(join(app, `compositions/${mode}/tsconfig.json`), {
    compilerOptions: { ...compilerOptions, noEmit: true, module: 'preserve' },
    angularCompilerOptions,
    include: ['**/*.ts'],
  });
}
voltIn(app, ['add', ...compositionComponents, '--path=compositions/copy/ui']);
const ngcBin = join(app, 'node_modules/.bin/ngc');
// Negative proof first: nothing the pages do not list resolves from the workspace.
r = exec(ngcBin, ['-p', join(app, 'compositions/package/tsconfig.json')], { cwd: app, expectStatus: null, quiet: true });
assert(
  r.status !== 0 && compositionPackages.every(pkg => r.out.includes(pkg)),
  `before installing ${compositionPackages.join(', ')} (what the pages list) the compositions do not compile`
);
// Then exactly what the pages tell a consumer to install.
exec(
  'npx',
  ['--yes', 'npm@11', 'install', '--no-audit', '--no-fund', ...compositionPackages.map(pkg => (rootDeps[pkg] ? `${pkg}@${rootDeps[pkg]}` : pkg))],
  { cwd: app }
);
for (const mode of ['package', 'copy']) {
  exec(ngcBin, ['-p', join(app, `compositions/${mode}/tsconfig.json`)], { cwd: app });
  assert(true, `${mode}: all ${COMPOSITIONS.length} blocks, layouts and patterns compile (strict templates)`);
}
report.compositions = { count: COMPOSITIONS.length, packages: compositionPackages, components: compositionComponents.length };

step('onboarding: four compositions as an app, both modes, prerendered and hydrated, one copy customised');
const ONBOARDING = join(ROOT, 'e2e/consumer-onboarding');
const onboardingIds = ['recipes/settings-form', 'recipes/data-table', 'layouts/admin-dashboard', 'blocks/contact-map'];
const onboarding = onboardingIds.map(id => {
  const found = COMPOSITIONS.find(c => c.id === id);
  if (!found) fail(`onboarding composition ${id} is not in the manifest`);
  return found;
});
for (const [name, mode] of [['onb-pkg', 'package'], ['onb-copy', 'copy']]) {
  const src = join(app, `src-${name}`);
  for (const file of ['app.ts', 'main.ts', 'main.server.ts']) {
    const text = readFileSync(join(ONBOARDING, file), 'utf8');
    write(join(src, file), mode === 'copy' ? distribution.toCopyMode(text) : text);
  }
  for (const file of ['index.html', 'styles.css']) write(join(src, file), readFileSync(join(FIXTURE, file), 'utf8'));
  for (const c of onboarding) writeComposition(c, src, mode);
}
const onboardingComponents = [
  ...new Set([
    ...onboarding.flatMap(c => c.components),
    ...['main.ts', 'main.server.ts'].flatMap(f => distribution.componentsUsed(readFileSync(join(ONBOARDING, f), 'utf8'))),
  ]),
];
voltIn(app, ['add', ...onboardingComponents, '--path=src-onb-copy/ui', '--track']);
// A consumer customises a copied component: the build must keep it, and volt diff must see it.
const variantsFile = join(app, 'src-onb-copy/ui/button/variants.ts');
const variants = readFileSync(variantsFile, 'utf8');
const customised = variants.replace("bg-primary text-primary-foreground", 'onboarding-custom bg-primary text-primary-foreground');
assert(customised !== variants, 'customised the copied Button (ui/button/variants.ts)');
writeFileSync(variantsFile, customised);
r = exec(volt, ['diff', 'button', '--path=src-onb-copy/ui', '--json'], { cwd: app, expectStatus: 1, quiet: true });
const onbDiff = JSON.parse(r.out.slice(r.out.indexOf('{')));
assert(
  onbDiff.files.find(f => f.path === 'button/variants.ts')?.status === 'local-changed' &&
    onbDiff.files.filter(f => f.path !== 'button/variants.ts').every(f => f.status === 'unchanged'),
  'volt diff reports exactly the customised file as local-changed'
);
write(join(app, 'angular.json'), {
  $schema: './node_modules/@angular/cli/lib/config/schema.json',
  version: 1,
  cli: { analytics: false },
  projects: {
    pkg: project('pkg', true),
    copy: project('copy', true),
    min: project('min', false),
    'onb-pkg': project('onb-pkg', true),
    'onb-copy': project('onb-copy', true),
  },
});
for (const name of ['onb-pkg', 'onb-copy']) {
  exec(ng, ['build', name], { cwd: app });
  const html = readFileSync(join(app, `dist/${name}/browser/index.html`), 'utf8');
  assert(html.includes('ngh=') && html.includes('Save changes') && html.includes('Recent orders'), `${name}: server-rendered with hydration annotations`);
}
report.onboarding = { compositions: onboardingIds, components: onboardingComponents, customised: 'button/variants.ts' };

// ---- 5. isolation ------------------------------------------------------------------------------
step('isolation: a project with only the CLI');
const iso = join(work, 'isolated');
write(join(iso, 'package.json'), {
  name: 'volt-isolated',
  private: true,
  type: 'module',
  dependencies: { ...angularDeps, rxjs: '^7.8.0', tslib: '^2.6.0' },
  devDependencies: { ...toolDeps, '@voltui/cli': `file:${tarballs.cli.file}` },
});
npmInstall(iso);
const isoVolt = join(iso, 'node_modules/.bin/volt');
exec(isoVolt, ['add', 'card'], { cwd: iso });
write(
  join(iso, 'src/main.ts'),
  `import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { UiCard, UiCardContent } from './app/ui/card';

@Component({ selector: 'app-root', imports: [UiCard, UiCardContent], template: '<ui-card><ui-card-content>Hi</ui-card-content></ui-card>' })
class App {}
bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }).catch(e => console.error(e));
`
);
write(join(iso, 'src/index.html'), '<!doctype html><html><body><app-root></app-root></body></html>');
write(join(iso, 'tsconfig.json'), { compilerOptions, angularCompilerOptions, files: ['src/main.ts'] });
write(join(iso, 'angular.json'), {
  version: 1,
  cli: { analytics: false },
  projects: {
    iso: {
      projectType: 'application',
      root: '',
      sourceRoot: 'src',
      architect: {
        build: {
          builder: '@angular/build:application',
          options: { outputPath: 'dist', browser: 'src/main.ts', index: 'src/index.html', tsConfig: 'tsconfig.json' },
        },
      },
    },
  },
});
const isoNg = join(iso, 'node_modules/.bin/ng');
r = exec(isoNg, ['build'], { cwd: iso, expectStatus: null });
assert(
  r.status !== 0 && /clsx|tailwind-merge/.test(r.out),
  'without --install the build FAILS on the missing clsx/tailwind-merge: nothing leaks in from the workspace'
);
report.isolation = { withoutInstall: r.out.split('\n').filter(l => /clsx|tailwind-merge/.test(l)).slice(0, 3) };
const before = json(join(iso, 'package.json'));
r = exec(isoVolt, ['add', 'card', '--install'], { cwd: iso });
const after = json(join(iso, 'package.json'));
const added = Object.keys(after.dependencies).filter(k => !before.dependencies[k]).sort();
assert(
  JSON.stringify(added) === JSON.stringify(['clsx', 'tailwind-merge']),
  `--install added exactly what card imports: ${added.join(', ')} (${added.map(k => after.dependencies[k]).join(', ')})`
);
const unchanged = field =>
  Object.entries(before[field]).every(([name, range]) => after[field][name] === range) &&
  Object.keys(after[field]).length === Object.keys(before[field]).length + (field === 'dependencies' ? added.length : 0);
assert(unchanged('dependencies') && unchanged('devDependencies'), 'no unrelated declaration was rewritten (Angular untouched)');
exec(isoNg, ['build'], { cwd: iso });
assert(true, 'with the installed dependencies the isolated project builds');
report.isolation.added = Object.fromEntries(added.map(k => [k, after.dependencies[k]]));

// ---- 6. agent ----------------------------------------------------------------------------------
step('the installed @voltui/agent');
const agentHome = join(work, 'agent-project');
mkdirSync(agentHome);
exec(join(app, 'node_modules/.bin/volt-ui-agent'), ['claude', '--yes'], { cwd: agentHome });
const skill = join(agentHome, '.claude/skills/volt-ui-distribution/SKILL.md');
assert(existsSync(skill) && readFileSync(skill, 'utf8').includes('--path'), 'the agent installs the distribution skill, which documents --path');

// ---- 7. bundle ---------------------------------------------------------------------------------
step('bundle sizes (production, browser output)');
function measure(dir, ext) {
  const files = readdirSync(dir).filter(f => f.endsWith(ext) && statSync(join(dir, f)).isFile());
  const text = files.map(f => readFileSync(join(dir, f))).reduce((a, b) => Buffer.concat([a, b]), Buffer.alloc(0));
  return { raw: text.length, gzip: gzipSync(text).length };
}
report.sizes = {
  minimal: { js: measure(join(app, 'dist/min/browser'), '.js'), css: measure(join(app, 'dist/min/browser'), '.css') },
  composition: { js: measure(join(app, 'dist/pkg/browser'), '.js'), css: measure(join(app, 'dist/pkg/browser'), '.css') },
};
const kib = n => `${(n / 1024).toFixed(1)} KiB`;
for (const [name, s] of Object.entries(report.sizes)) {
  console.log(
    `  ${name.padEnd(12)} JS ${kib(s.js.raw).padStart(10)} raw ${kib(s.js.gzip).padStart(9)} gzip   CSS ${kib(s.css.raw).padStart(9)} raw ${kib(s.css.gzip).padStart(8)} gzip`
  );
}
const versionKey = report.angular.installed.split('.').slice(0, 2).join('.');
const baseline = existsSync(BASELINE) ? json(BASELINE) : {};
const reference = baseline[versionKey];
if (reference && !updateBaseline) {
  const regressions = [];
  for (const [artifact, kinds] of Object.entries(report.sizes)) {
    for (const [kind, now] of Object.entries(kinds)) {
      const was = reference.sizes[artifact]?.[kind];
      if (!was) continue;
      const delta = now.gzip - was.gzip;
      const pct = (delta / was.gzip) * 100;
      console.log(`  ${artifact} ${kind}: ${delta >= 0 ? '+' : ''}${delta} B gzip (${pct.toFixed(1)} %) vs ${reference.measured}`);
      if (pct > 10 && delta > 2048) regressions.push(`${artifact} ${kind} +${kib(delta)} gzip (+${pct.toFixed(1)} %)`);
    }
  }
  if (regressions.length) {
    fail(
      `bundle regression over 10 % and 2 KiB gzip: ${regressions.join('; ')}.\n  Investigate; if intended, explain it in the PR and re-run with --update-baseline.`
    );
  }
} else {
  baseline[versionKey] = {
    measured: new Date().toISOString().slice(0, 10),
    angular: report.angular.installed,
    components: tarballs.components.version,
    sizes: report.sizes,
  };
  write(BASELINE, baseline);
  console.log(`  ${reference ? 'updated' : 'recorded'} the Angular ${versionKey} baseline in ${relative(ROOT, BASELINE)}`);
}

// ---- 8. browser --------------------------------------------------------------------------------
step('serve both builds and run the browser checks');
const urls = [];
['pkg', 'copy'].forEach((name, i) => {
  servers.push(
    spawn('node', [join(ROOT, 'scripts/serve-static.mjs'), join(app, `dist/${name}/browser`), String(PORT + i)], {
      stdio: 'ignore',
    })
  );
  urls.push({ name: name === 'pkg' ? 'package (@voltui/components)' : 'CLI copy (volt add)', url: `http://127.0.0.1:${PORT + i}/` });
});
for (const { url } of urls) {
  for (const deadline = Date.now() + 15_000; ; ) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {
      /* not listening yet */
    }
    if (Date.now() > deadline) fail(`${url} did not start`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
const playwright = spawnSync(
  'pnpm',
  ['exec', 'playwright', 'test', '-c', 'playwright.consumer-tarball.config.ts', ...(projects.length ? projects : ['--project=chromium'])],
  { cwd: ROOT, stdio: 'inherit', env: { ...process.env, E2E_CONSUMER_APPS: JSON.stringify(urls) } }
);
if (playwright.status !== 0) fail('the browser checks failed against the consumer builds');

const onboardingUrls = [];
['onb-pkg', 'onb-copy'].forEach((name, i) => {
  const port = PORT + 2 + i;
  servers.push(
    spawn('node', [join(ROOT, 'scripts/serve-static.mjs'), join(app, `dist/${name}/browser`), String(port)], {
      stdio: 'ignore',
    })
  );
  onboardingUrls.push({
    name: name === 'onb-pkg' ? 'onboarding, package' : 'onboarding, CLI copy (customised)',
    url: `http://127.0.0.1:${port}/`,
    customised: name === 'onb-copy',
  });
});
for (const { url } of onboardingUrls) {
  for (const deadline = Date.now() + 15_000; ; ) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {
      /* not listening yet */
    }
    if (Date.now() > deadline) fail(`${url} did not start`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
const onboardingRun = spawnSync(
  'pnpm',
  ['exec', 'playwright', 'test', '-c', 'playwright.consumer-onboarding.config.ts', ...(projects.length ? projects : ['--project=chromium'])],
  { cwd: ROOT, stdio: 'inherit', env: { ...process.env, E2E_ONBOARDING_APPS: JSON.stringify(onboardingUrls) } }
);
if (onboardingRun.status !== 0) fail('the onboarding browser checks failed');

write(join(ROOT, 'dist/consumer-report.json'), report);
finished = true;
console.log(
  `\n✔ Angular ${report.angular.installed}: packed tarballs install, the installed CLI copies, both modes build strictly with SSR and hydration, examples compile, isolation holds, browsers pass.\n  Report: dist/consumer-report.json`
);
// The static servers are child processes that keep Node's event loop alive: exit explicitly (the
// exit handler stops them and removes the temp project), or the run never ends.
process.exit(0);
