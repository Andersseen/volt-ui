// A deliberate change to the library — an input renamed, a selector changed, a status edited — must
// either be regenerated into every output or make `pnpm check:generated` fail with the command that
// repairs it. The generators run for real, against a copy of the sources (VOLT_REPO_ROOT), so the
// repository itself is never modified by this test.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const COPY = [
  'packages/volt/package.json',
  'packages/volt/src',
  'COMPONENT_STATUS.md',
  'stories/_docs/component-guides.mjs',
  'apps/web/src/app/lib/api-reference.generated.ts',
  'apps/web/src/server/routes/mcp/api.generated.ts',
  'packages/shared/lib/volt-names.generated.ts',
  '.prettierrc',
  '.prettierrc.json',
  '.prettierignore',
];

let copy;

function run(script, ...args) {
  const result = spawnSync('node', [join(ROOT, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, VOLT_REPO_ROOT: copy },
  });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

function edit(rel, from, to) {
  const file = join(copy, rel);
  const source = readFileSync(file, 'utf8');
  expect(source, `${rel} no longer contains the text this test edits`).toContain(from);
  writeFileSync(file, source.replace(from, to));
}

beforeAll(() => {
  copy = mkdtempSync(join(tmpdir(), 'volt-drift-'));
  for (const rel of COPY) {
    if (!existsSync(join(ROOT, rel))) continue;
    cpSync(join(ROOT, rel), join(copy, rel), { recursive: true });
  }
  // The manifest is gitignored: generate it once in the copy, as `pnpm manifest` would.
  const generated = run('cli/generate-manifest.js');
  expect(generated.status, generated.out).toBe(0);
}, 60_000);

afterAll(() => rmSync(copy, { recursive: true, force: true }));

describe('generated outputs follow the source or fail', () => {
  it('starts in sync', () => {
    expect(run('scripts/generate-api-reference.mjs', '--check').status).toBe(0);
    expect(run('cli/generate-manifest.js', '--check').status).toBe(0);
  }, 60_000);

  it('a renamed input makes the API reference, MCP facts and names stale', () => {
    edit('packages/volt/src/lib/components/badge/badge.ts', 'readonly variant', 'readonly tone');
    const result = run('scripts/generate-api-reference.mjs', '--check');
    expect(result.status).toBe(1);
    expect(result.out).toContain('apps/web/src/app/lib/api-reference.generated.ts');
    expect(result.out).toContain('apps/web/src/server/routes/mcp/api.generated.ts');
    expect(result.out).toContain('pnpm generate:api-reference');
    // Regenerating repairs it.
    expect(run('scripts/generate-api-reference.mjs').status).toBe(0);
    expect(run('scripts/generate-api-reference.mjs', '--check').status).toBe(0);
    expect(readFileSync(join(copy, 'apps/web/src/server/routes/mcp/api.generated.ts'), 'utf8')).toMatch(
      /name: 'tone'|"name": "tone"/
    );
  }, 60_000);

  it('a changed selector makes the copy-mode names stale', () => {
    edit('packages/volt/src/lib/components/card/card.ts', "selector: 'volt-card-title'", "selector: 'volt-card-heading'");
    const result = run('scripts/generate-api-reference.mjs', '--check');
    expect(result.status).toBe(1);
    expect(result.out).toContain('packages/shared/lib/volt-names.generated.ts');
  }, 60_000);

  it('an edited status makes the manifest stale', () => {
    edit('COMPONENT_STATUS.md', '| badge ', '| badge-x ');
    const missing = run('cli/generate-manifest.js', '--check');
    // A component without a status row cannot be built at all.
    expect(missing.status).toBe(1);
    expect(missing.out).toMatch(/"badge"/);
    edit('COMPONENT_STATUS.md', '| badge-x ', '| badge ');
    const table = readFileSync(join(copy, 'COMPONENT_STATUS.md'), 'utf8');
    const row = table.split('\n').find(line => /^\|\s*avatar\s*\|\s*stable\s*\|/.test(line));
    expect(row, 'avatar row').toBeTruthy();
    writeFileSync(join(copy, 'COMPONENT_STATUS.md'), table.replace(row, row.replace('stable', 'beta')));
    const stale = run('cli/generate-manifest.js', '--check');
    expect(stale.status).toBe(1);
    expect(stale.out).toContain('is stale');
    expect(stale.out).toContain('pnpm manifest');
  }, 60_000);

  it('an npm import the package does not declare fails the manifest', () => {
    const file = join(copy, 'packages/volt/src/lib/components/separator/separator.ts');
    writeFileSync(file, `import { something } from 'left-pad';\nvoid something;\n${readFileSync(file, 'utf8')}`);
    const result = run('cli/generate-manifest.js', '--check');
    expect(result.status).toBe(1);
    expect(result.out).toContain('imports "left-pad", which packages/volt/package.json does not declare');
    rmSync(dirname(file), { recursive: true, force: true });
    cpSync(join(ROOT, 'packages/volt/src/lib/components/separator'), dirname(file), { recursive: true });
  }, 60_000);
});
