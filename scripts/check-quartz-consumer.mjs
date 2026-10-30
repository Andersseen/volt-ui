#!/usr/bin/env node
/**
 * Proves the Quartz backend (`@voltui/components/quartz`) works for a consumer, from the real
 * packed tarball, and that the two headless engines stay isolated from each other.
 *
 *   1. build + `npm pack` the library (no workspace alias, no symlink);
 *   2. outside the repository, install that tarball with a given Angular version and the published
 *      Quartz packages (`@quartz-headless/{core,primitives}`, never a Git ref or workspace path);
 *   3. build apps from the same template — `./backend` re-exports Checkbox/Switch/Toggle from
 *      `@voltui/components` in one and from `@voltui/components/quartz` in the other — with strict
 *      AOT, strict templates, zoneless, prerendered (SSR) and hydrated;
 *   4. isolation: the default bundle must not contain Quartz and the Quartz bundle must not contain
 *      ng-primitives; the incremental bundle size of each is reported;
 *   5. the same two engines through the CLI copy-and-own path (`volt add … [--base=quartz]`, one
 *      project root each), compiled with the same strictness and held to the same isolation rule;
 *   6. serve all four and run `e2e/quartz-consumer/browser.spec.ts` (Forms, keyboard, focus-visible,
 *      hydration, computed paint parity) in Chromium, Firefox and WebKit.
 *
 *   node scripts/check-quartz-consumer.mjs 21            latest Angular 21.x
 *   node scripts/check-quartz-consumer.mjs 21.2.0         exact version (the declared minimum)
 *   node scripts/check-quartz-consumer.mjs 22 --keep      keep the temp project
 *   --no-build        reuse dist/volt        --project=chromium   pass-through to Playwright
 *   --quartz=0.16.0   the published Quartz version to install (default: the one this repo pins)
 *
 * Quartz 0.16.0 declares `@angular/*: ^21.0.0` peers. On Angular 22 the install therefore needs
 * `--legacy-peer-deps`; the script tries a strict install first and reports the peer gap rather
 * than hiding it (set `--strict-peers` to make the gap a failure).
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const version = args.find(a => /^\d+(\.\d+){0,2}$/.test(a));
const keep = args.includes('--keep');
const noBuild = args.includes('--no-build');
const strictPeers = args.includes('--strict-peers');
const passThrough = args.filter(a => a.startsWith('--project') || a.startsWith('--grep'));
const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const quartzVersion =
  args.find(a => a.startsWith('--quartz='))?.slice(9) ??
  rootPkg.devDependencies['@quartz-headless/primitives'];
if (!version) {
  console.error('usage: check-quartz-consumer.mjs <angular-version> [--keep] [--no-build]');
  process.exit(2);
}
const major = version.split('.')[0];
const range =
  version.split('.').length === 3 ? version : `^${version}.0`.replace(/^\^(\d+)\.0$/, '^$1.0.0');
const PORT = Number(process.env.QUARTZ_CONSUMER_PORT ?? 5400 + Number(major));
const npmCache = join(ROOT, '.npm-cache');
const env = { ...process.env, npm_config_cache: npmCache };

function run(label, command, cmdArgs, options = {}) {
  console.log(`\n▶ ${label}\n  $ ${command} ${cmdArgs.join(' ')}`);
  const result = spawnSync(command, cmdArgs, { stdio: 'inherit', env, ...options });
  if (result.status !== 0) {
    console.error(`\n✖ Angular ${version}: "${label}" failed (exit ${result.status}).`);
    process.exit(1);
  }
  return result;
}
const fail = message => {
  console.error(`\n✖ ${message}`);
  process.exit(1);
};

// 1. the tarball (and the CLI manifest the copy variants read; it is generated, not committed)
run('generate the CLI manifest', 'node', [join(ROOT, 'cli/generate-manifest.js')], { cwd: ROOT });
if (!noBuild || !existsSync(join(ROOT, 'dist/volt/package.json'))) {
  run('build the library', 'pnpm', ['build:lib'], { cwd: ROOT });
}
const work = mkdtempSync(join(tmpdir(), `volt-quartz-${major}-`));
run('pack the library', 'npm', ['pack', '--pack-destination', work], {
  cwd: join(ROOT, 'dist/volt'),
  stdio: ['ignore', 'ignore', 'inherit'],
});
const lib = JSON.parse(readFileSync(join(ROOT, 'dist/volt/package.json'), 'utf8'));
const tarball = join(work, `voltui-components-${lib.version}.tgz`);

// 2. the consumer project
const app = join(work, 'app');
mkdirSync(app, { recursive: true });
const ng = range;
const dependencies = {
  '@angular/cdk': ng,
  '@angular/common': ng,
  '@angular/compiler': ng,
  '@angular/core': ng,
  '@angular/forms': ng,
  '@angular/platform-browser': ng,
  '@angular/platform-server': ng,
  '@angular/router': ng,
  '@angular/ssr': ng,
  '@voltui/components': `file:${tarball}`,
  '@quartz-headless/core': quartzVersion,
  '@quartz-headless/primitives': quartzVersion,
  rxjs: '^7.8.0',
  tslib: '^2.6.0',
  // What the CLI-copied sources import (the copy variants are built in the same project).
  'ng-primitives': rootPkg.dependencies['ng-primitives'],
  'class-variance-authority': '^0.7.0',
  clsx: '^2.0.0',
  'tailwind-merge': '^3.0.0',
};
writeFileSync(
  join(app, 'package.json'),
  JSON.stringify(
    {
      name: `volt-quartz-${major}`,
      private: true,
      type: 'module',
      dependencies,
      devDependencies: {
        '@angular/build': ng,
        '@angular/cli': ng,
        '@angular/compiler-cli': ng,
        '@tailwindcss/postcss': '^4.0.0',
        postcss: '^8.4.0',
        tailwindcss: '^4.0.0',
      },
    },
    null,
    2
  )
);
const install = (extra = []) =>
  spawnSync('npx', ['--yes', 'npm@11', 'install', '--no-audit', '--no-fund', ...extra], {
    cwd: app,
    env,
    encoding: 'utf8',
  });
let peerGap = null;
console.log(`\n▶ install Angular ${range}, the packed tarball and Quartz ${quartzVersion}`);
let result = install();
if (result.status !== 0) {
  peerGap = `${result.stderr}`
    .split('\n')
    .filter(l => /peer|ERESOLVE|Found:|Could not/.test(l))
    .slice(0, 8)
    .join('\n');
  console.warn(
    `\n⚠ strict peer resolution failed — the PEER GAP for Angular ${version}:\n${peerGap}`
  );
  if (strictPeers) fail('--strict-peers: peer ranges do not admit this Angular version.');
  console.warn('  retrying with --legacy-peer-deps (evidence of runtime behaviour only)');
  result = install(['--legacy-peer-deps']);
  if (result.status !== 0) {
    console.error(result.stderr);
    fail('install failed even with --legacy-peer-deps');
  }
}

// 3. two apps from one template
const template = join(ROOT, 'e2e/quartz-consumer');
const BACKENDS = {
  primitives: `export { VoltCheckbox, VoltSwitch, VoltToggle } from '@voltui/components';\n`,
  quartz: `export { VoltCheckbox, VoltSwitch, VoltToggle } from '@voltui/components/quartz';\n`,
  // The CLI copies are renamed (`ui-*` / `Ui*`); the demo is run through the CLI's own transform.
  'primitives-copy': `export { UiCheckbox, UiSwitch, UiToggle } from './ui';\n`,
  'quartz-copy': `export { UiCheckbox, UiSwitch, UiToggle } from './ui';\n`,
};
const require = createRequire(import.meta.url);
const { transformContent } = require(join(ROOT, 'cli/lib/core.js'));
const projects = {};
for (const [name, backend] of Object.entries(BACKENDS)) {
  const src = join(app, `src-${name}`);
  mkdirSync(src, { recursive: true });
  const copy = name.endsWith('-copy');
  for (const file of ['demo.ts', 'main.ts', 'main.server.ts', 'index.html', 'styles.css']) {
    if (copy && file === 'demo.ts') {
      writeFileSync(join(src, file), transformContent(readFileSync(join(template, file), 'utf8')));
    } else {
      cpSync(join(template, file), join(src, file));
    }
  }
  writeFileSync(join(src, 'backend.ts'), backend);
  if (copy) {
    // A project root of its own per copy, so each has its own volt.json — as a consumer would.
    const root = join(app, `cli-${name}`);
    mkdirSync(root, { recursive: true });
    writeFileSync(join(root, 'package.json'), '{"name":"copy","private":true}');
    const base = name.startsWith('quartz') ? ['--base=quartz'] : [];
    const cli = join(ROOT, 'cli/bin/volt');
    run(`volt init (${name})`, 'node', [cli, 'init', join(src, 'ui'), ...base], { cwd: root });
    run(
      `volt add checkbox switch toggle (${name})`,
      'node',
      [cli, 'add', 'checkbox', 'switch', 'toggle', join(src, 'ui'), ...base],
      { cwd: root }
    );
    if (
      name.startsWith('quartz') &&
      JSON.parse(readFileSync(join(root, 'volt.json'), 'utf8')).base !== 'quartz'
    ) {
      fail('volt.json did not record the quartz base');
    }
  }
  writeFileSync(join(src, 'routes.txt'), '/\n');
  writeFileSync(
    join(app, `tsconfig.${name}.json`),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noImplicitOverride: true,
          noImplicitReturns: true,
          target: 'ES2022',
          module: 'ES2022',
          moduleResolution: 'bundler',
          skipLibCheck: false,
          isolatedModules: true,
          importHelpers: true,
          lib: ['ES2022', 'dom'],
          types: [],
        },
        angularCompilerOptions: {
          strictTemplates: true,
          strictInjectionParameters: true,
          strictInputAccessModifiers: true,
          extendedDiagnostics: { defaultCategory: 'error' },
        },
        files: [`src-${name}/main.ts`, `src-${name}/main.server.ts`],
      },
      null,
      2
    )
  );
  projects[name] = {
    projectType: 'application',
    root: '',
    sourceRoot: `src-${name}`,
    architect: {
      build: {
        builder: '@angular/build:application',
        options: {
          outputPath: `dist/${name}`,
          browser: `src-${name}/main.ts`,
          server: `src-${name}/main.server.ts`,
          outputMode: 'static',
          prerender: { routesFile: `src-${name}/routes.txt`, discoverRoutes: false },
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
}
writeFileSync(
  join(app, '.postcssrc.json'),
  JSON.stringify({ plugins: { '@tailwindcss/postcss': {} } })
);
writeFileSync(
  join(app, 'angular.json'),
  JSON.stringify(
    {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      cli: { analytics: false },
      projects,
    },
    null,
    2
  )
);
const installed = id =>
  JSON.parse(readFileSync(join(app, 'node_modules', id, 'package.json'), 'utf8')).version;
console.log(
  `\n  installed @angular/core ${installed('@angular/core')}, @voltui/components ${lib.version}, ` +
    `@quartz-headless/primitives ${installed('@quartz-headless/primitives')}`
);
const angularVersion = installed('@angular/core');
for (const name of Object.keys(BACKENDS)) {
  run(
    `strict AOT production build + prerender: ${name}`,
    join(app, 'node_modules/.bin/ng'),
    ['build', name],
    {
      cwd: app,
    }
  );
}

// 4. isolation + size
const jsOf = dir => {
  const out = [];
  const walk = d => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.js')) out.push(p);
    }
  };
  walk(dir);
  return out;
};
const measure = name => {
  const files = jsOf(join(app, 'dist', name, 'browser'));
  const text = files.map(f => readFileSync(f, 'utf8')).join('\n');
  return { text, raw: Buffer.byteLength(text), gzip: gzipSync(text).length };
};
const sizes = Object.fromEntries(Object.keys(BACKENDS).map(name => [name, measure(name)]));
const MARKERS = {
  quartz: [/@quartz-headless/, /data-qz-state/, /qzCheckbox|qzSwitch|qzToggle/],
  primitives: [
    /ngpCheckbox|ngpSwitch|ngpToggle/,
    /ng-primitives/,
    /NgpCheckbox|NgpSwitch|NgpToggle/,
    /data-hover|ngpInteractions/,
  ],
};
const leaks = [];
for (const [name, size] of Object.entries(sizes)) {
  const isQuartz = name.startsWith('quartz');
  // A bundle must not contain the OTHER engine…
  for (const re of MARKERS[isQuartz ? 'primitives' : 'quartz']) {
    if (re.test(size.text)) leaks.push(`${name} bundle contains the other engine (${re})`);
  }
  // …and must contain its own, so the greps above can fail (positive controls).
  const own = isQuartz ? /data-qz-state/ : /ngpCheckbox/;
  if (!own.test(size.text))
    leaks.push(`positive control failed: ${name} bundle lacks its own engine`);
}
const kb = n => `${(n / 1024).toFixed(1)} kB`;
console.log(`\n  bundle (browser JS: the three components + Forms + Angular):`);
for (const [name, size] of Object.entries(sizes)) {
  console.log(
    `    ${name.padEnd(16)}: ${kb(size.raw).padStart(9)} raw, ${kb(size.gzip).padStart(9)} gzip`
  );
}
const delta = (a, b) =>
  `${kb(sizes[a].raw - sizes[b].raw)} raw, ${kb(sizes[a].gzip - sizes[b].gzip)} gzip`;
console.log(`    delta package  (quartz − primitives)     : ${delta('quartz', 'primitives')}`);
console.log(
  `    delta CLI copy (quartz − primitives)     : ${delta('quartz-copy', 'primitives-copy')}`
);
writeFileSync(
  join(work, 'bundle.json'),
  JSON.stringify(
    {
      angular: installed('@angular/core'),
      quartz: installed('@quartz-headless/primitives'),
      sizes: Object.fromEntries(
        Object.entries(sizes).map(([k, v]) => [k, { raw: v.raw, gzip: v.gzip }])
      ),
      peerGap: Boolean(peerGap),
    },
    null,
    2
  )
);
if (leaks.length) fail(`engine isolation broken:\n  - ${leaks.join('\n  - ')}`);
console.log('  ✔ isolation: no bundle contains the other headless engine (package and CLI copy)');

// 5. serve both and run the browser contract
const servers = Object.keys(BACKENDS).map((name, i) =>
  spawn(
    'node',
    [join(ROOT, 'scripts/serve-static.mjs'), join(app, 'dist', name, 'browser'), String(PORT + i)],
    {
      stdio: 'inherit',
    }
  )
);
const stop = () => servers.forEach(s => s.kill());
process.on('exit', stop);
await new Promise(resolve => setTimeout(resolve, 800));
const playwright = spawnSync(
  'pnpm',
  [
    'exec',
    'playwright',
    'test',
    '-c',
    'playwright.quartz-consumer.config.ts',
    ...(passThrough.length ? passThrough : []),
  ],
  {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_PRIMITIVES_URL: `http://127.0.0.1:${PORT}/`,
      E2E_QUARTZ_URL: `http://127.0.0.1:${PORT + 1}/`,
      E2E_PRIMITIVES_COPY_URL: `http://127.0.0.1:${PORT + 2}/`,
      E2E_QUARTZ_COPY_URL: `http://127.0.0.1:${PORT + 3}/`,
    },
  }
);
stop();
if (!keep) spawnSync('rm', ['-rf', work]);
else console.log(`\n  kept ${work}`);
if (playwright.status !== 0)
  fail(`Angular ${version}: the browser contract failed against the packed package.`);
console.log(
  `\n✔ Angular ${angularVersion}: install, strict AOT, SSR prerender, hydration, isolation and browser contract pass` +
    (peerGap ? ' (WITH --legacy-peer-deps: Quartz peers do not admit this Angular major)' : '') +
    '.'
);
