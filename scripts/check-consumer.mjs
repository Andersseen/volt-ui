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
 *             --base=quartz, the whole catalog with --install
 *   4. build  the fixture app (e2e/consumer-tarball) in package mode and through the package → copy
 *             transform against the copied source, both prerendered on the server and hydrated;
 *             every example of scripts/check-examples.mjs and the full catalog in both modes, with
 *             the consumer's own ngc
 *   5. isolation  a second project with only the CLI: `volt add card` without --install must FAIL to
 *             build (clsx is missing — proof nothing resolves from the workspace); `--install` adds
 *             exactly what card imports and the build passes
 *   6. agent  the installed @voltui/agent writes the Claude Code skills
 *   7. bundle production JS/CSS of a one-button app and of the fixture, raw and gzip, against
 *             specs/v2/bundle-baseline.json (regression > 10 % and > 2 KiB gzip fails)
 *   8. browser  Playwright on both builds: tokens and Tailwind paint, theme switch, form field
 *             wiring, dialog keyboard/focus/ARIA, hydration without warnings, unique ids
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

write(join(ROOT, 'dist/consumer-report.json'), report);
finished = true;
console.log(
  `\n✔ Angular ${report.angular.installed}: packed tarballs install, the installed CLI copies, both modes build strictly with SSR and hydration, examples compile, isolation holds, browsers pass.\n  Report: dist/consumer-report.json`
);
