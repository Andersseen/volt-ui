// Plan 01 phase C, through the real binary: explicit destinations, project and workspace
// resolution, package-manager detection, and the --install policy. Package managers are replaced
// by a recording fake on PATH (the real tarball install is exercised by scripts/check-consumer.mjs).
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';

const CLI = resolve(__dirname, '../bin/volt');
const project = require('../lib/project.js');

const FAKE_PM = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const log = process.env.FAKE_PM_LOG;
fs.appendFileSync(log, JSON.stringify({ pm: path.basename(process.argv[1]), cwd: process.cwd(), args: process.argv.slice(2) }) + '\\n');
if (process.env.FAKE_PM_FAIL) { console.error('fake failure'); process.exit(1); }
if (process.env.FAKE_PM_NOOP) process.exit(0);
const argv = process.argv.slice(2);
const ws = argv.indexOf('--workspace');
const pkgFile = path.join(process.cwd(), ws === -1 ? '' : argv[ws + 1], 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
for (const arg of argv) {
  const m = arg.match(/^(@?[^@]+)@(.+)$/);
  if (!m) continue;
  pkg.dependencies = { ...pkg.dependencies, [m[1]]: m[2] };
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
  const version = m[2].split('||')[0].trim().replace(/^[~^>=<]+/, '').split(' ')[0];
  const dir = path.join(process.cwd(), 'node_modules', m[1]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: m[1], version }));
}
`;

let root;
let fakeBin;
let log;

function write(file, content) {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
}

function installed(dir, pkg, version) {
  write(join(dir, 'node_modules', pkg, 'package.json'), { name: pkg, version });
}

function angularApp(dir, extra = {}) {
  write(join(dir, 'package.json'), {
    name: 'app',
    dependencies: { '@angular/core': '^22.0.0', '@angular/common': '^22.0.0' },
    ...extra,
  });
  mkdirSync(join(dir, 'src/app'), { recursive: true });
}

function volt(cwd, args, env = {}) {
  const result = spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      PATH: `${fakeBin}${delimiter}${process.env.PATH}`,
      FAKE_PM_LOG: log,
      ...env,
    },
  });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

const calls = () =>
  existsSync(log)
    ? readFileSync(log, 'utf-8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line))
    : [];

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), 'volt-dest-')));
  fakeBin = join(root, '.fake-bin');
  log = join(root, '.fake-pm.log');
  for (const pm of ['npm', 'pnpm', 'yarn', 'bun']) {
    write(join(fakeBin, pm), FAKE_PM);
    chmodSync(join(fakeBin, pm), 0o755);
  }
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('explicit destination', () => {
  it('accepts --path=<dir> and --path <dir>', () => {
    const app = join(root, 'app');
    angularApp(app);
    expect(volt(app, ['add', 'badge', '--path=./src/shared/ui']).status).toBe(0);
    expect(existsSync(join(app, 'src/shared/ui/badge/badge.ts'))).toBe(true);
    expect(volt(app, ['add', 'card', '--path', './src/other']).status).toBe(0);
    expect(existsSync(join(app, 'src/other/card/card.ts'))).toBe(true);
  });

  it('with --path, an unknown component fails before anything is written', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(app, ['add', 'button', 'buton', '--path=./src/app/ui']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('Component "buton" not found. Did you mean "button"?');
    expect(result.out).toContain('Nothing was written');
    expect(existsSync(join(app, 'src/app/ui'))).toBe(false);
  });

  it('keeps the v1 positional target and explains a bare name', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(app, ['add', 'badge', 'custom-ui']);
    expect(result.status).toBe(0);
    expect(result.out).toContain(
      '"custom-ui" is not a component, so it is used as the target directory'
    );
    expect(result.out).toContain('--path=custom-ui');
    expect(existsSync(join(app, 'custom-ui/badge/badge.ts'))).toBe(true);
  });

  it('points out a target that looks like a misspelt component', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(app, ['add', 'badge', 'dialg']);
    expect(result.out).toContain('If you meant the component "dialog"');
  });

  it('does not explain a target that is clearly a path', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(app, ['add', 'badge', './src/app/ui']);
    expect(result.status).toBe(0);
    expect(result.out).not.toContain('is not a component');
  });

  it('rejects arguments after a positional target instead of ignoring them', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(app, ['add', 'badge', './ui', 'card']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('Unexpected argument "card" after the target directory "./ui"');
    expect(result.out).toContain('volt add badge card --path=./ui');
    expect(existsSync(join(app, 'ui'))).toBe(false);
  });

  it('rejects a positional target together with --path, and extra init arguments', () => {
    const app = join(root, 'app');
    angularApp(app);
    expect(volt(app, ['add', 'badge', 'nope-dir', '--path=./ui']).out).toContain(
      'Component "nope-dir" not found'
    );
    expect(volt(app, ['init', './a', '--path=./b']).out).toContain('Both a target directory');
    expect(volt(app, ['init', './a', './b']).out).toContain('Unexpected argument(s): ./b');
    expect(volt(app, ['list', 'extra']).out).toContain('"volt list" takes no arguments');
    expect(existsSync(join(app, 'a'))).toBe(false);
  });

  it('rejects unknown flags before doing anything', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(app, ['add', 'badge', '--dryrun']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('Did you mean "--dry-run"?');
    expect(existsSync(join(app, 'src/app/ui'))).toBe(false);
  });
});

describe('project resolution', () => {
  it('from a nested directory, the default destination is the project src/app/ui', () => {
    const app = join(root, 'app');
    angularApp(app);
    const result = volt(join(app, 'src/app'), ['add', 'badge', '--base=ng-primitives']);
    expect(result.status).toBe(0);
    expect(existsSync(join(app, 'src/app/ui/badge/badge.ts'))).toBe(true);
    expect(existsSync(join(app, 'src/app/src'))).toBe(false);
    // volt.json lives beside package.json, wherever the command ran from.
    expect(JSON.parse(readFileSync(join(app, 'volt.json'), 'utf-8')).base).toBe('ng-primitives');
    expect(existsSync(join(app, 'src/app/volt.json'))).toBe(false);
  });

  it('an explicit relative --path is resolved against the current directory', () => {
    const app = join(root, 'app');
    angularApp(app);
    expect(volt(join(app, 'src/app'), ['add', 'badge', '--path=./ui']).status).toBe(0);
    expect(existsSync(join(app, 'src/app/ui/badge/badge.ts'))).toBe(true);
  });

  it('a target outside the cwd belongs to the package that contains it', () => {
    const here = join(root, 'tools');
    write(join(here, 'package.json'), { name: 'tools' });
    const app = join(root, 'app');
    angularApp(app);
    installed(app, '@angular/core', '22.2.0');
    installed(app, '@angular/common', '22.2.0');
    write(join(app, 'pnpm-lock.yaml'), '');
    const result = volt(here, ['add', 'badge', '--path=../app/src/app/ui', '--install']);
    expect(result.status, result.out).toBe(0);
    const [call] = calls();
    expect(call.pm).toBe('pnpm');
    expect(call.cwd).toBe(app);
    expect(existsSync(join(here, 'node_modules'))).toBe(false);
  });

  it('a workspace root without a destination asks which application', () => {
    write(join(root, 'package.json'), { name: 'mono', private: true });
    write(join(root, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n  - 'libs/*'\n");
    angularApp(join(root, 'apps/admin'));
    angularApp(join(root, 'apps/shop'));
    write(join(root, 'libs/util/package.json'), { name: 'util' });
    const result = volt(root, ['add', 'badge']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('is a workspace root, not an application');
    expect(result.out).toContain('apps/admin, apps/shop');
    expect(result.out).toContain('--path=apps/admin/src/app/ui');
    expect(existsSync(join(root, 'src'))).toBe(false);
  });

  it('a workspace package installs into itself with the root manager', () => {
    write(join(root, 'package.json'), { name: 'mono', private: true });
    write(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
    write(join(root, 'pnpm-lock.yaml'), '');
    const admin = join(root, 'apps/admin');
    angularApp(admin);
    angularApp(join(root, 'apps/shop'));
    installed(root, '@angular/core', '22.2.0');
    installed(root, '@angular/common', '22.2.0');
    const result = volt(root, ['add', 'badge', '--path=apps/admin/src/app/ui', '--install']);
    expect(result.status, result.out).toBe(0);
    const [call] = calls();
    expect(call).toMatchObject({ pm: 'pnpm', cwd: admin });
    expect(call.args[0]).toBe('add');
    expect(call.args).not.toContain('-w');
    expect(existsSync(join(admin, 'volt.json'))).toBe(false);
    expect(readdirSync(join(root, 'apps/shop'))).toEqual(['package.json', 'src']);
  });

  it('npm workspaces run the install at the root with --workspace', () => {
    write(join(root, 'package.json'), { name: 'mono', private: true, workspaces: ['apps/*'] });
    write(join(root, 'package-lock.json'), '{}');
    const admin = join(root, 'apps/admin');
    angularApp(admin);
    installed(root, '@angular/core', '22.2.0');
    installed(root, '@angular/common', '22.2.0');
    const result = volt(admin, ['add', 'badge', '--install']);
    expect(result.status, result.out).toBe(0);
    const [call] = calls();
    expect(call).toMatchObject({ pm: 'npm', cwd: root });
    expect(call.args.slice(-2)).toEqual(['--workspace', 'apps/admin']);
  });

  it.each([
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['pnpm-lock.yaml', 'pnpm'],
  ])('%s selects %s', (lockfile, manager) => {
    const app = join(root, 'app');
    angularApp(app);
    write(join(app, lockfile), '');
    const resolved = project.resolveProject({ cwd: app });
    expect(resolved.manager.name).toBe(manager);
  });

  it('a packageManager field beats lockfiles', () => {
    const app = join(root, 'app');
    angularApp(app, { packageManager: 'yarn@4.1.0' });
    write(join(app, 'package-lock.json'), '{}');
    expect(project.resolveProject({ cwd: app }).manager.name).toBe('yarn');
  });

  it('lockfiles of two managers are ambiguous: --install refuses before writing', () => {
    const app = join(root, 'app');
    angularApp(app);
    write(join(app, 'pnpm-lock.yaml'), '');
    write(join(app, 'package-lock.json'), '{}');
    const result = volt(app, ['add', 'badge', '--install']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('Cannot tell which package manager');
    expect(result.out).toContain('"packageManager"');
    expect(result.out).toContain('Nothing was written');
    expect(existsSync(join(app, 'src/app/ui'))).toBe(false);
    expect(calls()).toEqual([]);
    // Without --install the copy is fine; nothing needs the manager.
    expect(volt(app, ['add', 'badge']).status).toBe(0);
  });

  it('never installs into the Volt UI repository itself', () => {
    const repo = join(root, 'volt-ui');
    write(join(repo, 'package.json'), {
      name: 'volt-ui',
      dependencies: { '@angular/core': '^22.0.0' },
    });
    write(join(repo, 'packages/volt/src/public-api.ts'), '');
    installed(repo, '@angular/core', '22.2.0');
    const result = volt(repo, ['add', 'badge', '--path=e2e/fixture/ui', '--install']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('is the Volt UI repository itself');
    expect(calls()).toEqual([]);
    expect(existsSync(join(repo, 'e2e'))).toBe(false);
  });

  it('a destination with no package.json above it copies, but cannot install', () => {
    const bare = join(root, 'bare');
    mkdirSync(bare);
    expect(volt(bare, ['add', 'badge', '--path=./ui']).status).toBe(0);
    const result = volt(bare, ['add', 'card', '--path=./ui2', '--install']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('No package.json found');
    expect(existsSync(join(bare, 'ui2'))).toBe(false);
  });
});

describe('--install policy', () => {
  let app;
  beforeEach(() => {
    app = join(root, 'app');
    angularApp(app);
    write(join(app, 'pnpm-lock.yaml'), '');
    installed(app, '@angular/core', '22.2.4');
    installed(app, '@angular/common', '22.2.4');
  });

  it('installs only what the selected components import, once, with the library ranges', () => {
    const result = volt(app, ['add', 'card', 'badge', '--install']);
    expect(result.status, result.out).toBe(0);
    const all = calls();
    expect(all).toHaveLength(1);
    const specs = all[0].args.slice(1);
    // card + badge import cva, clsx and tailwind-merge — not ng-primitives.
    expect(specs.map(s => s.replace(/@[^@]*$/, '')).sort()).toEqual([
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ]);
    expect(specs).toContain('clsx@^2.0.0');
    expect(result.out).toContain('Runtime dependencies installed and verified');
  });

  it('keeps compatible installed versions and does not reinstall them', () => {
    installed(app, 'clsx', '2.1.1');
    installed(app, 'tailwind-merge', '3.4.0');
    const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf-8'));
    pkg.dependencies = { ...pkg.dependencies, clsx: '^2.1.0', 'tailwind-merge': '^3.0.0' };
    write(join(app, 'package.json'), pkg);
    const result = volt(app, ['add', 'card', '--install']);
    expect(result.status, result.out).toBe(0);
    expect(result.out).toContain('keep     clsx 2.1.1');
    expect(calls()).toEqual([]);
    expect(result.out).toContain('already installed in range');
  });

  it('declares a package that is only installed transitively, without upgrading it', () => {
    installed(app, 'clsx', '2.1.1'); // hoisted from some other dependency, not in package.json
    const result = volt(app, ['add', 'card', '--install']);
    expect(result.status, result.out).toBe(0);
    expect(result.out).toContain("declare  clsx ^2.0.0 (2.1.1 is only installed as another package's dependency)");
    expect(calls()[0].args).toContain('clsx@^2.0.0');
  });

  it('adds a missing Angular package at the app version, never a newer Angular', () => {
    // Sidebar imports @angular/router, which this app does not have.
    const result = volt(app, ['add', 'sidebar', '--install']);
    expect(result.status, result.out).toBe(0);
    const specs = calls()[0].args;
    expect(specs).toContain('@angular/router@~22.2.0');
    expect(specs.some(s => s.startsWith('@angular/core'))).toBe(false);
  });

  it('an incompatible installed version stops the operation before any write', () => {
    installed(app, 'clsx', '1.2.1');
    const result = volt(app, ['add', 'card', '--install']);
    expect(result.status).toBe(1);
    expect(result.out).toContain('clsx 1.2.1 is installed; Volt UI needs ^2.0.0');
    expect(result.out).toContain('Nothing was written');
    expect(existsSync(join(app, 'src/app/ui'))).toBe(false);
    expect(calls()).toEqual([]);
    expect(JSON.parse(readFileSync(join(app, 'node_modules/clsx/package.json'))).version).toBe(
      '1.2.1'
    );
  });

  it('an unsupported Angular is reported, never upgraded', () => {
    installed(app, '@angular/core', '20.3.0');
    const result = volt(app, ['add', 'card', '--install']);
    expect(result.status).toBe(1);
    expect(result.out).toContain(
      '@angular/core 20.3.0 is installed; Volt UI needs ^21.2.0 || ^22.0.0'
    );
    expect(calls()).toEqual([]);
  });

  it('without --install, an incompatible version is reported and nothing is changed', () => {
    installed(app, 'clsx', '1.2.1');
    const result = volt(app, ['add', 'card']);
    expect(result.status).toBe(0);
    expect(result.out).toContain('do not match what Volt UI needs');
    expect(calls()).toEqual([]);
  });

  it('a failing package manager is reported with the manual command; files stay', () => {
    const result = volt(app, ['add', 'card', '--install'], { FAKE_PM_FAIL: '1' });
    expect(result.status).toBe(1);
    expect(result.out).toContain('installing runtime dependencies failed');
    expect(result.out).toMatch(/pnpm add .*clsx@\^2\.0\.0/);
    expect(result.out).not.toContain('Runtime dependencies installed');
    expect(existsSync(join(app, 'src/app/ui/card/card.ts'))).toBe(true);
  });

  it('a package manager that exits 0 without installing is not reported as success', () => {
    const result = volt(app, ['add', 'card', '--install'], { FAKE_PM_NOOP: '1' });
    expect(result.status).toBe(1);
    expect(result.out).toContain('still do not resolve inside the required range');
    expect(result.out).not.toContain('Runtime dependencies installed');
  });

  it('--dry-run --install reports the command and runs nothing', () => {
    const result = volt(app, ['add', 'card', '--install', '--dry-run']);
    expect(result.status).toBe(0);
    expect(result.out).toContain('Runtime dependencies would be installed: pnpm add');
    expect(calls()).toEqual([]);
    expect(existsSync(join(app, 'src/app/ui'))).toBe(false);
  });

  it('a declared but not yet installed dependency is installed, not re-declared', () => {
    write(join(app, 'package.json'), {
      name: 'app',
      dependencies: {
        '@angular/core': '^22.0.0',
        '@angular/common': '^22.0.0',
        clsx: '^2.1.0',
        'tailwind-merge': '^3.0.0',
      },
    });
    const result = volt(app, ['add', 'card', '--install'], { FAKE_PM_NOOP: '1' });
    expect(calls()[0].args).toEqual(['install']);
    expect(result.out).toContain('install  clsx (declared ^2.1.0, not installed yet)');
  });
});
