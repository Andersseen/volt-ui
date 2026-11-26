// `volt add --track` and `volt diff`, driven through the real binary in throwaway consumer projects.
//
// A second CLI with a different reference is assembled the way the published package is laid out
// (bin/, lib/, package.json, registry/manifest.json, registry/src/lib) outside the repository, so it
// reads its own registry — exactly what running another @voltui/cli version does.
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const core = require('../lib/core.js');
const provenance = require('../lib/provenance.js');
const { unifiedDiff } = require('../lib/unified-diff.js');
const { classify } = require('../lib/diff.js');

const REPO = resolve(__dirname, '../..');
const CLI = resolve(__dirname, '../bin/volt');
const RECORD = '.volt-ui.json';
const BUTTON_TS = 'button/button.ts';

/** Every entry under root: file bytes hashed, plus mode, size and mtime — symlinks not followed. */
function fingerprint(root) {
  const out = {};
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const key = relative(root, full);
      const st = lstatSync(full);
      const meta = `${st.mode}:${st.size}:${st.mtimeMs}`;
      if (entry.isSymbolicLink()) out[key] = `link:${meta}`;
      else if (entry.isDirectory()) {
        out[`${key}/`] = `dir:${st.mode}`;
        walk(full);
      } else {
        out[key] = `${createHash('sha256').update(readFileSync(full)).digest('hex')}:${meta}`;
      }
    }
  };
  walk(root);
  return out;
}

/** Builds a CLI with the published layout; `mutate(registryLib, manifest, pkg)` changes it. */
function buildCli(dir, mutate = () => {}) {
  cpSync(join(REPO, 'cli/bin'), join(dir, 'bin'), { recursive: true });
  cpSync(join(REPO, 'cli/lib'), join(dir, 'lib'), { recursive: true });
  const pkg = JSON.parse(readFileSync(join(REPO, 'cli/package.json'), 'utf-8'));
  const manifest = JSON.parse(readFileSync(join(REPO, 'apps/web/public/manifest.json'), 'utf-8'));
  const lib = join(dir, 'registry/src/lib');
  cpSync(join(REPO, 'packages/volt/src/lib'), lib, {
    recursive: true,
    filter: source => !source.endsWith('.spec.ts'),
  });
  mutate(lib, manifest, pkg);
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  writeFileSync(join(dir, 'registry/manifest.json'), JSON.stringify(manifest, null, 2));
  return join(dir, 'bin/volt');
}

function run(bin, cwd, args, env = {}) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...env },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

let clis;
let current; // same reference as the repository, packaged layout
let next; // a "newer" reference: button.ts and utils.ts changed, a file added, one removed

beforeAll(() => {
  clis = mkdtempSync(join(tmpdir(), 'volt-diff-clis-'));
  current = buildCli(join(clis, 'current'));
  next = buildCli(join(clis, 'next'), (lib, manifest, pkg) => {
    pkg.version = '9.9.0';
    manifest.version = '9.9.1';
    const button = join(lib, 'components/button/button.ts');
    writeFileSync(button, `// reference fix\n${readFileSync(button, 'utf-8')}`);
    const utils = join(lib, 'utils.ts');
    writeFileSync(utils, `${readFileSync(utils, 'utf-8')}\n// reference utils change\n`);
    // badge gains a file, card loses one.
    writeFileSync(join(lib, 'components/badge/extra.ts'), 'export const EXTRA = 1;\n');
    manifest.components.badge.files.push('components/badge/extra.ts');
    manifest.components.card.files = manifest.components.card.files.filter(
      file => !file.endsWith('card/index.ts')
    );
  });
}, 60_000);

afterAll(() => {
  rmSync(clis, { recursive: true, force: true });
});

describe('volt add --track and volt diff', () => {
  let project;
  let ui;
  const diff = (args, bin = current, env = {}) => run(bin, project, ['diff', ...args], env);
  const diffJson = (args, bin = current, env = {}) => {
    const result = diff([...args, '--json'], bin, env);
    return { ...result, report: JSON.parse(result.stdout) };
  };
  const statusOf = (report, path) => report.files.find(f => f.path === path)?.status;
  const record = () => JSON.parse(readFileSync(join(ui, RECORD), 'utf-8'));

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'volt-diff-'));
    writeFileSync(
      join(project, 'package.json'),
      JSON.stringify({ name: 'consumer', dependencies: { '@angular/core': '^22.0.0' } })
    );
    ui = join(project, 'src/app/ui');
  });

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
  });

  describe('provenance record', () => {
    it('is not written without --track, and untracked copies keep working', () => {
      expect(run(current, project, ['add', 'button']).status).toBe(0);
      expect(existsSync(join(ui, RECORD))).toBe(false);
      const { status, report } = diffJson(['button']);
      expect(status).toBe(0);
      expect(report.provenance.status).toBe('untracked');
      expect(report.files.every(f => f.status === 'matches-reference')).toBe(true);
    });

    it('--track records hashes, owners and versions — no source, no absolute paths', () => {
      const result = run(current, project, ['add', 'button', 'card', '--track']);
      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/volt diff button card/);
      const text = readFileSync(join(ui, RECORD), 'utf-8');
      const rec = JSON.parse(text);
      expect(rec.schemaVersion).toBe(1);
      expect(rec.base).toBe('ng-primitives');
      expect(Object.keys(rec)).toEqual(['schemaVersion', 'base', 'files']);
      expect(text).not.toContain(project);
      expect(text).not.toContain(tmpdir());
      expect(text).not.toMatch(/@Component|import \{/);
      expect(rec.files['utils.ts'].owners).toEqual(['button', 'card']);
      expect(rec.files[BUTTON_TS].owners).toEqual(['button']);
      for (const [rel, entry] of Object.entries(rec.files)) {
        const onDisk = readFileSync(join(ui, rel), 'utf-8');
        expect(entry.sha256).toBe(createHash('sha256').update(onDisk).digest('hex'));
        expect(entry.source).toEqual({
          cli: JSON.parse(readFileSync(join(REPO, 'cli/package.json'), 'utf-8')).version,
          registry: core.getLocalManifest().version,
          transform: core.TRANSFORM_VERSION,
        });
      }
      // The barrel is the consumer's file, not a tracked copy.
      expect(rec.files['index.ts']).toBeUndefined();
      // Sorted keys: the same operation always writes the same bytes.
      expect(Object.keys(rec.files)).toEqual(Object.keys(rec.files).sort());
    });

    it('--dry-run --track creates nothing', () => {
      const result = run(current, project, ['add', 'button', '--track', '--dry-run']);
      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/Provenance: create/);
      expect(existsSync(project + '/src')).toBe(false);
    });

    it('--dry-run does not update an existing record', () => {
      run(current, project, ['add', 'button', '--track']);
      const before = fingerprint(project);
      expect(run(current, project, ['add', 'card', '--dry-run']).status).toBe(0);
      expect(fingerprint(project)).toEqual(before);
    });

    it('a later add keeps an existing record coherent without --track, owners merged', () => {
      run(current, project, ['add', 'button', '--track']);
      expect(record().files['utils.ts'].owners).toEqual(['button']);
      expect(run(current, project, ['add', 'card']).status).toBe(0);
      const rec = record();
      expect(rec.files['utils.ts'].owners).toEqual(['button', 'card']);
      expect(rec.files['card/card.ts']).toBeDefined();
      expect(rec.files[BUTTON_TS]).toBeDefined();
    });

    it('a rejected add (local edit) leaves files and record untouched; the edit never becomes a baseline', () => {
      run(current, project, ['add', 'button', '--track']);
      writeFileSync(join(ui, BUTTON_TS), '// mine\n', { flag: 'a' });
      const before = fingerprint(project);
      const result = run(current, project, ['add', 'button', 'card']);
      expect(result.status).toBe(1);
      expect(fingerprint(project)).toEqual(before);
    });

    it('--force replaces the edited file, and the baseline is the reference again', () => {
      run(current, project, ['add', 'button', '--track']);
      const original = record().files[BUTTON_TS].sha256;
      writeFileSync(join(ui, BUTTON_TS), '// mine\n', { flag: 'a' });
      expect(run(current, project, ['add', 'button', '--force']).status).toBe(0);
      expect(record().files[BUTTON_TS].sha256).toBe(original);
    });

    it('a newer CLI refuses to re-copy over a reference change, and keeps the record', () => {
      run(current, project, ['add', 'button', 'badge', '--track']);
      const before = fingerprint(project);
      // utils.ts changed in "next": an untouched local copy still differs from the new reference.
      expect(run(next, project, ['add', 'badge']).status).toBe(1);
      expect(fingerprint(project)).toEqual(before);
    });

    it('a newer CLI with --force updates the baselines it re-copies and keeps the rest', () => {
      run(current, project, ['add', 'button', 'badge', '--track']);
      const old = record();
      expect(run(next, project, ['add', 'badge', '--force']).status).toBe(0);
      const rec = record();
      expect(rec.files['badge/extra.ts'].source.cli).toBe('9.9.0');
      // Same bytes as before: the original provenance is kept.
      expect(rec.files['badge/badge.ts']).toEqual(old.files['badge/badge.ts']);
      expect(rec.files['utils.ts'].source.cli).toBe('9.9.0');
      expect(rec.files['utils.ts'].owners).toEqual(['badge', 'button']);
      expect(rec.files[BUTTON_TS]).toEqual(old.files[BUTTON_TS]);
    });

    it.each([
      ['not JSON', '{ nope'],
      ['an unsupported schema', JSON.stringify({ schemaVersion: 2, base: 'ng-primitives', files: {} })],
      ['a path outside the directory', JSON.stringify({ schemaVersion: 1, base: 'ng-primitives', files: { '../x.ts': { sha256: 'a'.repeat(64), owners: ['button'], source: { cli: null, registry: null, transform: 1 } } } })],
      ['an unknown field', JSON.stringify({ schemaVersion: 1, base: 'ng-primitives', files: {}, extra: 1 })],
    ])('an add refuses %s before writing anything', (_label, content) => {
      run(current, project, ['add', 'badge']);
      writeFileSync(join(ui, RECORD), content);
      const before = fingerprint(project);
      for (const args of [['add', 'button'], ['add', 'button', '--track'], ['add', 'button', '--dry-run']]) {
        const result = run(current, project, args);
        expect(result.status).toBe(1);
        expect(result.stderr).toMatch(/\.volt-ui\.json/);
        expect(fingerprint(project)).toEqual(before);
      }
    });

    it('the copied application does not need the record', () => {
      run(current, project, ['add', 'button', '--track']);
      unlinkSync(join(ui, RECORD));
      expect(run(current, project, ['add', 'card']).status).toBe(0);
      expect(existsSync(join(ui, RECORD))).toBe(false);
      expect(diffJson(['button']).report.provenance.status).toBe('untracked');
    });
  });

  describe('classification', () => {
    it('separates local and reference changes with a baseline', () => {
      run(current, project, ['add', 'button', 'card', 'badge', '--track']);
      // local edit to a file the reference did not change
      writeFileSync(join(ui, 'button/variants.ts'), '// local\n', { flag: 'a' });
      // local edit to a file the reference also changed
      writeFileSync(join(ui, 'utils.ts'), '// local utils\n', { flag: 'a' });

      const { status, report } = diffJson(['button', 'card', 'badge'], next);
      expect(status).toBe(1);
      expect(report.referenceVersion).toBe('9.9.1');
      expect(report.reference.cli).toBe('9.9.0');
      expect(report.provenance.status).toBe('tracked');
      expect(statusOf(report, BUTTON_TS)).toBe('reference-changed');
      expect(statusOf(report, 'button/variants.ts')).toBe('local-changed');
      expect(statusOf(report, 'utils.ts')).toBe('both-changed');
      expect(statusOf(report, 'button/index.ts')).toBe('unchanged');
      expect(statusOf(report, 'badge/extra.ts')).toBe('missing');
      expect(statusOf(report, 'card/index.ts')).toBe('reference-removed');
      const utils = report.files.find(f => f.path === 'utils.ts');
      expect(utils.kind).toBe('shared');
      expect(utils.owners).toEqual(['badge', 'button', 'card']);
    });

    it('matches-reference when the local copy already has the reference change', () => {
      run(current, project, ['add', 'button', '--track']);
      const nextButton = readFileSync(join(clis, 'next/registry/src/lib/components/button/button.ts'), 'utf-8');
      writeFileSync(join(ui, BUTTON_TS), core.transformContent(nextButton));
      const { report } = diffJson(['button'], next);
      expect(statusOf(report, BUTTON_TS)).toBe('matches-reference');
      expect(report.files.find(f => f.path === BUTTON_TS).diff).toBeNull();
    });

    it('without a record every difference is unknown-origin, never "reference changed"', () => {
      run(current, project, ['add', 'button']);
      writeFileSync(join(ui, 'button/variants.ts'), '// local\n', { flag: 'a' });
      const { status, report } = diffJson(['button'], next);
      expect(status).toBe(1);
      expect(report.provenance).toEqual({ status: 'untracked', file: null });
      expect(statusOf(report, BUTTON_TS)).toBe('unknown-origin');
      expect(statusOf(report, 'button/variants.ts')).toBe('unknown-origin');
      expect(statusOf(report, 'button/index.ts')).toBe('matches-reference');
      const text = diff(['button'], next).stdout;
      expect(text).toMatch(/Provenance: unknown/);
      expect(text).not.toMatch(/reference-changed/);
    });

    it('a record that lists only some files is partial', () => {
      run(current, project, ['add', 'button', '--track']);
      run(current, project, ['add', 'badge', '--path=src/app/other']);
      cpSync(join(project, 'src/app/other/badge'), join(ui, 'badge'), { recursive: true });
      const { report } = diffJson(['button', 'badge']);
      expect(report.provenance.status).toBe('partial');
      expect(report.files.find(f => f.path === 'badge/badge.ts').notes.join()).toMatch(/not listed/);
    });

    it('notes a different transform version', () => {
      run(current, project, ['add', 'button', '--track']);
      const rec = record();
      rec.files[BUTTON_TS].source.transform = core.TRANSFORM_VERSION + 1;
      writeFileSync(join(ui, RECORD), JSON.stringify(rec));
      const { report } = diffJson(['button']);
      expect(report.files.find(f => f.path === BUTTON_TS).notes.join()).toMatch(/transform v/);
    });

    it('the classification table', () => {
      expect(classify({ local: 'a', reference: 'a', baseline: 'a' })).toBe('unchanged');
      expect(classify({ local: 'a', reference: 'b', baseline: 'a' })).toBe('reference-changed');
      expect(classify({ local: 'b', reference: 'a', baseline: 'a' })).toBe('local-changed');
      expect(classify({ local: 'b', reference: 'b', baseline: 'a' })).toBe('matches-reference');
      expect(classify({ local: 'b', reference: 'c', baseline: 'a' })).toBe('both-changed');
      expect(classify({ local: null, reference: 'a', baseline: 'a' })).toBe('missing');
      expect(classify({ local: 'a', reference: 'b', baseline: null })).toBe('unknown-origin');
      expect(classify({ local: 'a', reference: 'a', baseline: null })).toBe('matches-reference');
      expect(classify({ local: 'a', reference: null, baseline: 'a' })).toBe('reference-removed');
    });
  });

  describe('output contract', () => {
    it('--json: stdout is only JSON, deterministic; exit 0 same, 1 different', () => {
      run(current, project, ['add', 'button', '--track']);
      const first = diff(['button', '--json']);
      expect(first.status).toBe(0);
      expect(first.stderr).toBe('');
      expect(first.stdout).toBe(diff(['button', '--json']).stdout);
      const report = JSON.parse(first.stdout);
      expect(Object.keys(report)).toEqual([
        'schemaVersion',
        'referenceVersion',
        'reference',
        'component',
        'components',
        'dependencies',
        'target',
        'provenance',
        'differences',
        'summary',
        'files',
      ]);
      expect(report.component).toBe('button');
      expect(report.target).toBe('./src/app/ui');
      expect(report.differences).toBe(false);

      writeFileSync(join(ui, BUTTON_TS), '// mine\n', { flag: 'a' });
      const second = diffJson(['button']);
      expect(second.status).toBe(1);
      const file = second.report.files.find(f => f.path === BUTTON_TS);
      expect(file.diff).toMatch(/^--- a\/button\/button\.ts/m);
      expect(file.diff).toMatch(/^-\/\/ mine$/m);
    });

    it('the unified diff is local → reference and applies with git apply', () => {
      run(current, project, ['add', 'button']);
      writeFileSync(join(ui, BUTTON_TS), readFileSync(join(ui, BUTTON_TS), 'utf-8').replace('cn(', 'cn( '));
      const file = diffJson(['button'], next).report.files.find(f => f.path === BUTTON_TS);
      const git = spawnSync('git', ['--version']);
      if (git.status !== 0) return; // git is optional for volt diff; this check uses it when present
      const work = mkdtempSync(join(tmpdir(), 'volt-diff-apply-'));
      try {
        mkdirSync(join(work, 'button'));
        cpSync(join(ui, BUTTON_TS), join(work, BUTTON_TS));
        writeFileSync(join(work, 'patch.diff'), file.diff);
        const applied = spawnSync('git', ['apply', 'patch.diff'], { cwd: work, encoding: 'utf-8' });
        expect(applied.stderr).toBe('');
        const nextButton = readFileSync(join(clis, 'next/registry/src/lib/components/button/button.ts'), 'utf-8');
        expect(readFileSync(join(work, BUTTON_TS), 'utf-8')).toBe(core.transformContent(nextButton));
      } finally {
        rmSync(work, { recursive: true, force: true });
      }
    });

    it.each([
      ['no component', [], 'NO_COMPONENTS'],
      ['an unknown component', ['buton'], 'UNKNOWN_COMPONENT'],
      ['an unknown option', ['button', '--force'], 'INVALID_ARGUMENTS'],
      ['a missing target', ['button', '--path=nowhere'], 'TARGET_MISSING'],
    ])('%s exits 2 with a JSON error on stdout', (_label, args, code) => {
      run(current, project, ['add', 'badge']);
      const before = fingerprint(project);
      const result = diff([...args, '--json']);
      expect(result.status).toBe(2);
      expect(JSON.parse(result.stdout).error.code).toBe(code);
      expect(result.stderr).not.toBe('');
      expect(fingerprint(project)).toEqual(before);
      expect(existsSync(join(project, 'nowhere'))).toBe(false);
    });

    it('text mode explains statuses and that nothing was changed', () => {
      run(current, project, ['add', 'button', '--track']);
      const result = diff(['button'], next);
      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(/not the latest on npm/);
      expect(result.stdout).toMatch(/Nothing was changed/);
      expect(result.stdout).toMatch(/--force/);
    });
  });

  describe('read-only and containment', () => {
    it('never changes a byte, mode or mtime, in any state or error', () => {
      run(current, project, ['add', 'button', 'card', 'badge', '--track']);
      writeFileSync(join(ui, 'utils.ts'), '// local\n', { flag: 'a' });
      unlinkSync(join(ui, 'button/index.ts'));
      const cases = [
        [['button'], current],
        [['button', 'card', 'badge', '--json'], next],
        [['badge'], next],
        [['nope'], current],
        [['button', '--base=quartz'], current],
      ];
      const before = fingerprint(project);
      for (const [args, bin] of cases) diff(args, bin);
      writeFileSync(join(ui, RECORD), '{ corrupt');
      const corrupt = fingerprint(project);
      expect(diff(['button']).status).toBe(2);
      expect(fingerprint(project)).toEqual(corrupt);
      const recordKey = `src/app/ui/${RECORD}`;
      delete corrupt[recordKey];
      const restored = { ...before };
      delete restored[recordKey];
      expect(corrupt).toEqual(restored);
    });

    it('corrupt or unsupported metadata exits 2', () => {
      run(current, project, ['add', 'button', '--track']);
      writeFileSync(join(ui, RECORD), JSON.stringify({ schemaVersion: 7, base: 'ng-primitives', files: {} }));
      const result = diffJson(['button']);
      expect(result.status).toBe(2);
      expect(result.report.error.code).toBe('UNSUPPORTED');
      expect(result.report.error.message).toMatch(/newer CLI/);
    });

    it('refuses a component file that is a symlink leaving the target, without reading it', () => {
      run(current, project, ['add', 'button']);
      const secret = join(project, 'secret.ts');
      writeFileSync(secret, 'SECRET_TOKEN\n');
      unlinkSync(join(ui, BUTTON_TS));
      symlinkSync(secret, join(ui, BUTTON_TS));
      const before = fingerprint(project);
      const result = diffJson(['button']);
      expect(result.status).toBe(2);
      expect(result.report.error.code).toBe('UNSAFE_PATH');
      expect(result.stdout).not.toContain('SECRET_TOKEN');
      expect(fingerprint(project)).toEqual(before);
    });

    it('refuses a component directory symlinked outside the target', () => {
      run(current, project, ['add', 'button', '--path=src/elsewhere']);
      mkdirSync(ui, { recursive: true });
      symlinkSync(join(project, 'src/elsewhere/button'), join(ui, 'button'));
      expect(diffJson(['button']).report.error.code).toBe('UNSAFE_PATH');
    });

    it('refuses a symlinked record', () => {
      run(current, project, ['add', 'button', '--track']);
      const real = join(project, 'record.json');
      cpSync(join(ui, RECORD), real);
      unlinkSync(join(ui, RECORD));
      symlinkSync(real, join(ui, RECORD));
      expect(diffJson(['button']).report.error.code).toBe('UNSAFE');
      expect(run(current, project, ['add', 'card']).status).toBe(1);
    });

    it('a target directory that is itself a symlink is followed (it is the target)', () => {
      run(current, project, ['add', 'button', '--path=src/real-ui']);
      symlinkSync(join(project, 'src/real-ui'), join(project, 'src/link-ui'));
      expect(diffJson(['button', '--path=src/link-ui']).status).toBe(0);
    });

    it('works offline: no socket, DNS or fetch is attempted', () => {
      run(current, project, ['add', 'button', '--track']);
      const blocker = join(project, 'no-network.cjs');
      writeFileSync(
        blocker,
        `const block = name => () => { throw new Error('network used: ' + name); };
         for (const m of ['net', 'tls', 'http', 'https', 'dns']) {
           const mod = require(m);
           for (const k of ['connect', 'createConnection', 'request', 'get', 'lookup', 'resolve']) if (typeof mod[k] === 'function') mod[k] = block(m + '.' + k);
         }
         globalThis.fetch = block('fetch');`
      );
      writeFileSync(join(ui, BUTTON_TS), '// mine\n', { flag: 'a' });
      const result = diffJson(['button'], next, { NODE_OPTIONS: `--require ${blocker}` });
      expect(result.status).toBe(1);
      expect(result.stderr).not.toMatch(/network used/);
    });

    it('does not need git on PATH', () => {
      run(current, project, ['add', 'button']);
      const result = diffJson(['button'], current, { PATH: '' , GIT_DIR: '/nonexistent' });
      expect(result.status).toBe(0);
    });
  });
});

describe('unified diff', () => {
  it('is empty for equal text and treats CRLF as LF', () => {
    expect(unifiedDiff('a\nb\n', 'a\r\nb\r\n')).toBe('');
  });

  it('marks a missing final newline', () => {
    expect(unifiedDiff('a\nb', 'a\nb\n', { fromLabel: 'x', toLabel: 'y' })).toBe(
      ['--- x', '+++ y', '@@ -1,2 +1,2 @@', ' a', '-b', '\\ No newline at end of file', '+b', ''].join('\n')
    );
  });

  it('describes creation and deletion of whole files', () => {
    expect(unifiedDiff(null, 'a\n', { fromLabel: '/dev/null', toLabel: 'b/x' })).toBe(
      '--- /dev/null\n+++ b/x\n@@ -0,0 +1 @@\n+a\n'
    );
    expect(unifiedDiff('a\nb\n', null, { fromLabel: 'a/x', toLabel: '/dev/null' })).toBe(
      '--- a/x\n+++ /dev/null\n@@ -1,2 +0,0 @@\n-a\n-b\n'
    );
  });

  it('splits distant changes into separate hunks with three lines of context', () => {
    const a = Array.from({ length: 30 }, (_, i) => `l${i}`).join('\n') + '\n';
    const b = a.replace('l2\n', 'L2\n').replace('l25\n', 'L25\n');
    const out = unifiedDiff(a, b, { fromLabel: 'a', toLabel: 'b' });
    expect(out.match(/^@@/gm)).toHaveLength(2);
    expect(out).toContain('@@ -1,6 +1,6 @@');
    expect(out).toContain('@@ -23,7 +23,7 @@');
  });

  it('round-trips random edits through git apply', () => {
    const git = spawnSync('git', ['--version']);
    if (git.status !== 0) return;
    const work = mkdtempSync(join(tmpdir(), 'volt-udiff-'));
    let seed = 7;
    const rand = n => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % n;
    };
    try {
      for (let round = 0; round < 25; round++) {
        const a = Array.from({ length: 5 + rand(40) }, () => `line ${rand(12)}`);
        const b = [...a];
        for (let edits = rand(6); edits >= 0; edits--) {
          const at = rand(b.length + 1);
          if (rand(2)) b.splice(at, 1);
          else b.splice(at, 0, `new ${rand(5)}`);
        }
        const before = `${a.join('\n')}\n`;
        const after = b.length ? `${b.join('\n')}${rand(4) ? '\n' : ''}` : '';
        if (after === '') continue;
        writeFileSync(join(work, 'f.txt'), before);
        const patch = unifiedDiff(before, after, { fromLabel: 'a/f.txt', toLabel: 'b/f.txt' });
        if (!patch) continue;
        writeFileSync(join(work, 'p.diff'), patch);
        const applied = spawnSync('git', ['apply', 'p.diff'], { cwd: work, encoding: 'utf-8' });
        expect(applied.stderr, patch).toBe('');
        expect(readFileSync(join(work, 'f.txt'), 'utf-8')).toBe(after);
      }
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });
});

describe('provenance schema helpers', () => {
  it('accepts only relative paths inside the directory', () => {
    for (const ok of ['utils.ts', 'button/button.ts']) expect(provenance.isSafeRelativePath(ok)).toBe(true);
    for (const bad of ['', '/etc/passwd', '../x', 'a/../b', 'a//b', './a', 'a\\b', 'C:x', 'a\0b']) {
      expect(provenance.isSafeRelativePath(bad)).toBe(false);
    }
  });

  it('hashes LF-normalised bytes', () => {
    expect(provenance.hashContent('a\r\nb\n')).toBe(provenance.hashContent('a\nb\n'));
  });

  it('pins the copy transform: changing its output requires bumping TRANSFORM_VERSION', () => {
    const sample = [
      "import { cn } from '../../utils';",
      "import { VoltTooltip } from '../../components/tooltip';",
      "import { x } from 'volt';",
      "@Component({ selector: 'volt-thing, [voltThing]', template: '<volt-icon></volt-icon>' })",
      'export class VoltThing { voltThingValue = 1; }',
    ].join('\n');
    const hash = createHash('sha256').update(core.transformContent(sample)).digest('hex');
    // If this fails because transformContent changed on purpose, bump TRANSFORM_VERSION in
    // cli/lib/core.js and update both values here.
    expect({ version: core.TRANSFORM_VERSION, hash }).toEqual({
      version: 1,
      hash: 'eb52f3ca48d87d127b6b7436b01be033961e70c85fe46649bf58e3e55c4e15d1',
    });
  });
});
