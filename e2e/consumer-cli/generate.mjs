#!/usr/bin/env node
/**
 * v0.9 Phase 1: CLI consumer validation.
 *
 * Regenerates this fixture's `src/ui/` directory by running the real `volt` CLI
 * binary the way a consumer would: `volt init` then `volt add <every component>`.
 * This is the CLI copy-paste path (transformed `volt-*` -> `ui-*` selectors,
 * `Volt*` -> `Ui*` classes, rewritten imports) — distinct from the sibling
 * `e2e/consumer/` fixture, which validates the npm-import path instead.
 *
 * `src/ui/` is generated output (gitignored); run this before building or
 * testing the fixture. Usage: node e2e/consumer-cli/generate.mjs
 */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../..');
const CLI_BIN = join(REPO_ROOT, 'cli/bin/volt');
const TARGET_DIR = join(__dirname, 'src/ui');

const manifest = JSON.parse(
  execFileSync('node', [CLI_BIN, 'list', '--json'], { cwd: REPO_ROOT, encoding: 'utf-8' })
);
const componentNames = manifest.map(component => component.name).sort();

console.log(`Regenerating consumer-cli fixture with ${componentNames.length} component(s)...`);

execFileSync('node', [CLI_BIN, 'init', TARGET_DIR], { cwd: REPO_ROOT, stdio: 'inherit' });
execFileSync('node', [CLI_BIN, 'add', ...componentNames, TARGET_DIR, '--force'], {
  cwd: REPO_ROOT,
  stdio: 'inherit',
});

console.log('Done.');
