#!/usr/bin/env node
/**
 * Proves the published package works for a given Angular major, the way a consumer gets it:
 *
 *   1. build the library and `npm pack` the real tarball (no workspace alias, no symlink);
 *   2. create a project in the OS temp directory — outside this repository — with that Angular
 *      major, and install the tarball into it (peer dependencies are resolved by npm, exactly as
 *      for a user: an `ERESOLVE` here is the finding, not an inconvenience);
 *   3. compile it with that major's own `ng build` (the package ships partially compiled code, so
 *      the linker of that major must accept it);
 *   4. serve the build and run the browser component contracts (`e2e/contracts`) against it.
 *
 *   node scripts/check-angular-compat.mjs 22               one major
 *   node scripts/check-angular-compat.mjs 21 --keep         keep the temp project for inspection
 *   node scripts/check-angular-compat.mjs 22 --no-build     reuse dist/volt
 *   node scripts/check-angular-compat.mjs 22 --ignore-peers install with --legacy-peer-deps (evidence only:
 *                                                             shows whether the code works where the
 *                                                             declared peer range says it should not)
 *   node scripts/check-angular-compat.mjs 22 --project=firefox   pass-through to Playwright
 *
 * The install uses npm 11: npm 10.9's resolver crashes (`edgesOut` of null) on @angular/build's optional
 * peers (jsdom → canvas) before it reports anything about this package.
 *
 * The range installed is `^<major>.0.0`, so a major whose latest release the package does not yet
 * support shows up as a failure rather than being silently skipped.
 */
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const major = args.find(a => /^\d+$/.test(a));
const keep = args.includes('--keep');
const noBuild = args.includes('--no-build');
const ignorePeers = args.includes('--ignore-peers');
const passThrough = args.filter(a => a.startsWith('--project') || a.startsWith('--grep'));
if (!major) {
  console.error('usage: check-angular-compat.mjs <angular-major> [--keep] [--no-build]');
  process.exit(2);
}

const PORT = Number(process.env.COMPAT_PORT ?? 5300 + Number(major));
const npmCache = join(ROOT, '.npm-cache');

function run(label, command, cmdArgs, options = {}) {
  console.log(`\n▶ ${label}\n  $ ${command} ${cmdArgs.join(' ')}`);
  const result = spawnSync(command, cmdArgs, {
    stdio: 'inherit',
    env: { ...process.env, npm_config_cache: npmCache },
    ...options,
  });
  if (result.status !== 0) {
    console.error(`\n✖ Angular ${major}: "${label}" failed (exit ${result.status}).`);
    process.exit(1);
  }
}

// 1. the tarball
if (!noBuild || !existsSync(join(ROOT, 'dist/volt/package.json'))) {
  run('build the library', 'pnpm', ['build:lib'], { cwd: ROOT });
}
const work = mkdtempSync(join(tmpdir(), `volt-compat-${major}-`));
run('pack the library', 'npm', ['pack', '--pack-destination', work], {
  cwd: join(ROOT, 'dist/volt'),
  stdio: ['ignore', 'ignore', 'inherit'],
});
const lib = JSON.parse(readFileSync(join(ROOT, 'dist/volt/package.json'), 'utf8'));
const tarball = join(work, `voltui-components-${lib.version}.tgz`);

// 2. the consumer project
const app = join(work, 'app');
mkdirSync(join(app, 'src'), { recursive: true });
const range = `^${major}.0.0`;
writeFileSync(
  join(app, 'package.json'),
  JSON.stringify(
    {
      name: `volt-compat-${major}`,
      private: true,
      type: 'module',
      dependencies: {
        '@angular/common': range,
        '@angular/compiler': range,
        '@angular/core': range,
        '@angular/forms': range,
        '@angular/platform-browser': range,
        '@angular/router': range,
        // A peer the app installs at its own Angular major (`npm install @voltui/components
        // @angular/cdk`): left to npm it picks the newest CDK, which an older core cannot run.
        '@angular/cdk': range,
        '@voltui/components': `file:${tarball}`,
        rxjs: '^7.8.0',
        tslib: '^2.6.0',
      },
      devDependencies: {
        '@angular/build': range,
        '@angular/cli': range,
        '@angular/compiler-cli': range,
        '@tailwindcss/postcss': '^4.0.0',
        postcss: '^8.4.0',
        tailwindcss: '^4.0.0',
      },
    },
    null,
    2
  )
);
run(
  `install Angular ${range} and the packed tarball`,
  'npx',
  [
    '--yes',
    'npm@11',
    'install',
    '--no-audit',
    '--no-fund',
    ...(ignorePeers ? ['--legacy-peer-deps'] : []),
  ],
  {
    cwd: app,
  }
);

// 3. the app: the same fixtures the repository's own browser contracts use
const fixtures = join(ROOT, 'e2e/consumer/src/contracts');
for (const file of ['fixtures.ts', 'host.ts']) cpSync(join(fixtures, file), join(app, 'src', file));
cpSync(join(ROOT, 'e2e/consumer/contracts.html'), join(app, 'src/contracts.html'));
writeFileSync(
  join(app, 'src/main.ts'),
  `import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ContractsHost } from './host';

bootstrapApplication(ContractsHost, { providers: [provideZonelessChangeDetection()] }).catch(e =>
  console.error(e)
);
`
);
// The same stylesheet the repository's consumer fixture uses: geometry and visible state need CSS.
cpSync(join(ROOT, 'e2e/consumer/src/styles.css'), join(app, 'src/styles.css'));
writeFileSync(
  join(app, '.postcssrc.json'),
  JSON.stringify({ plugins: { '@tailwindcss/postcss': {} } }, null, 2)
);
writeFileSync(
  join(app, 'tsconfig.json'),
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
        experimentalDecorators: false,
        isolatedModules: true,
        importHelpers: true,
        lib: ['ES2022', 'dom'],
      },
      angularCompilerOptions: { strictTemplates: true, strictInjectionParameters: true },
      files: ['src/main.ts'],
    },
    null,
    2
  )
);
writeFileSync(
  join(app, 'angular.json'),
  JSON.stringify(
    {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      cli: { analytics: false },
      projects: {
        app: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                outputPath: 'dist',
                browser: 'src/main.ts',
                index: { input: 'src/contracts.html', output: 'contracts.html' },
                tsConfig: 'tsconfig.json',
                styles: ['src/styles.css'],
                outputHashing: 'none',
              },
            },
          },
        },
      },
    },
    null,
    2
  )
);

const installed = JSON.parse(
  readFileSync(join(app, 'node_modules/@angular/core/package.json'), 'utf8')
);
console.log(
  `\n  installed @angular/core ${installed.version} with @voltui/components ${lib.version}`
);

run(
  'compile with that major’s ng build (strict templates)',
  join(app, 'node_modules/.bin/ng'),
  ['build'],
  {
    cwd: app,
  }
);

// 4. serve it and run the contracts
const server = spawn(
  'node',
  [join(ROOT, 'scripts/serve-static.mjs'), join(app, 'dist/browser'), String(PORT)],
  {
    stdio: 'inherit',
  }
);
const stop = () => server.kill();
process.on('exit', stop);
await new Promise(resolve => setTimeout(resolve, 800));

const playwright = spawnSync(
  'pnpm',
  [
    'exec',
    'playwright',
    'test',
    '-c',
    'playwright.contracts.config.ts',
    '--project=chromium',
    ...passThrough,
  ],
  {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, E2E_CONTRACTS_URL: `http://127.0.0.1:${PORT}` },
  }
);
stop();

if (!keep) {
  spawnSync('rm', ['-rf', work]);
} else {
  console.log(`\n  kept ${work}`);
}
if (playwright.status !== 0) {
  console.error(`\n✖ Angular ${major}: the browser contracts failed against the packed package.`);
  process.exit(1);
}
console.log(
  `\n✔ Angular ${installed.version}: install, strict AOT build and browser contracts pass with the packed package.`
);
