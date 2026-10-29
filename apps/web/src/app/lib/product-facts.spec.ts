import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_GROUPS } from './component-metadata';
import { SITE_STATS } from './generated/site-stats';

/**
 * One product, one story. Every current-facing statement about the library — its version, how many
 * components it has, which are stable, how you consume it — is either generated or checked here
 * against the thing it describes. Historical documents (CHANGELOG, specs/plans) are exempt on
 * purpose: they are allowed to say what was true then.
 */

const ROOT = join(process.cwd());
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');
const json = (path: string) => JSON.parse(read(path)) as { version: string };
const dirs = (path: string) =>
  readdirSync(join(ROOT, path), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

/** `| name | stable |` rows of COMPONENT_STATUS.md — the one hand-maintained copy. */
function statusTable(): Record<string, string> {
  const table: Record<string, string> = {};
  for (const line of read('COMPONENT_STATUS.md').split('\n')) {
    const row = line.match(/^\|\s*([a-z][a-z-]*)\s*\|\s*(stable|beta|experimental)\s*\|/);
    if (row) table[row[1]] = row[2];
  }
  return table;
}

const SEMVER = /\b\d+\.\d+\.\d+\b/g;

describe('version', () => {
  const library = json('packages/volt/package.json').version;

  it('is the same in the workspace, the library and the generated site stats', () => {
    expect(json('package.json').version).toBe(library);
    expect(SITE_STATS.version).toBe(library);
  });

  it('is not hand-copied into the current-facing headers', () => {
    // These used to say 1.1.0 while the library was 1.2.0. They now point at package.json; if one
    // grows a version again it must at least be the right one.
    const heads: [string, string][] = [
      ['COMPONENT_STATUS.md', read('COMPONENT_STATUS.md').split('\n').slice(0, 4).join('\n')],
      ['specs/SPEC.md', read('specs/SPEC.md').split('\n').slice(0, 6).join('\n')],
      ['SDD.md', read('SDD.md').split('\n').slice(0, 6).join('\n')],
      [
        'README.md "Current status"',
        read('README.md').match(/Current status:[^\n]*/)?.[0] ?? 'MISSING Current status line',
      ],
    ];
    for (const [file, text] of heads) {
      expect(text, file).not.toContain('MISSING');
      for (const found of text.match(SEMVER) ?? []) {
        expect(found, `${file} names a version that is not the current one`).toBe(library);
      }
    }
  });
});

describe('component inventory', () => {
  const components = dirs('packages/volt/src/lib/components');
  const status = statusTable();

  it('SITE_STATS counts the component directories', () => {
    expect(SITE_STATS.components).toBe(components.length);
  });

  it('README states the same count', () => {
    const readme = read('README.md');
    const counts = [...readme.matchAll(/\*\*(\d+) components\*\*/g)].map(m => Number(m[1]));
    expect(counts.length).toBeGreaterThan(0);
    for (const count of counts) expect(count).toBe(components.length);
  });

  it('COMPONENT_STATUS.md has a row for every component, and only real ones', () => {
    // `native-select` is a directive inside select/ and `sidebar` a layout: documented, not a dir.
    const extras = new Set(['native-select', 'sidebar']);
    for (const name of components) expect(status[name], `no status row for ${name}`).toBeDefined();
    for (const name of Object.keys(status)) {
      expect(components.includes(name) || extras.has(name), `status row for unknown ${name}`).toBe(
        true
      );
    }
  });

  it('the CLI manifest and the status table carry identical stability labels', () => {
    // The manifest is gitignored output; build it from the source rather than trusting whatever
    // an earlier run left behind.
    execFileSync('node', ['cli/generate-manifest.js'], { cwd: ROOT, stdio: 'ignore' });
    const manifest = JSON.parse(read('apps/web/public/manifest.json')) as {
      components: Record<string, { stability: string }>;
    };
    for (const [name, meta] of Object.entries(manifest.components)) {
      expect(meta.stability, name).toBe(status[name]);
    }
  });

  it('the docs catalog agrees with the status table', () => {
    const catalog = COMPONENT_GROUPS.flatMap(group => group.components);
    expect(catalog.length).toBeGreaterThan(0);
    for (const component of catalog) {
      expect(component.stability, component.name).toBe(status[component.name]);
    }
  });

  it('every component appears in the docs catalog', () => {
    const catalog = new Set(COMPONENT_GROUPS.flatMap(group => group.components.map(c => c.name)));
    // Not catalogued as a card: `theme` is a guide page, `native-select` rides on Select.
    const notCards = new Set(['theme']);
    for (const name of components) {
      expect(catalog.has(name) || notCards.has(name), `${name} missing from the catalog`).toBe(
        true
      );
    }
  });
});

describe('product positioning', () => {
  it('SDD describes package mode and copy-and-own mode as equals', () => {
    const sdd = read('SDD.md');
    expect(sdd).toMatch(/two consumption paths\. They are equals/);
    expect(sdd).not.toMatch(/advanced and secondary/i);
    expect(sdd).not.toMatch(/CLI \/ copy-paste workflow \(recommended\)/);
  });

  it('README and SDD agree that both modes are first-class', () => {
    expect(read('README.md')).toMatch(/two first-class ways/i);
    expect(read('SDD.md')).toMatch(/first-class/i);
  });
});
