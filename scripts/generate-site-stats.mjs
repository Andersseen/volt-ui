#!/usr/bin/env node
/**
 * Generates the marketing numbers shown on the landing page from the repo itself,
 * so they can never drift from reality the way hand-written copy does.
 *
 *   node scripts/generate-site-stats.mjs              # structural facts only (fast)
 *   node scripts/generate-site-stats.mjs --with-tests # also re-runs the suite for the test count
 *
 * The structural facts (component count, preset counts) are cheap and exact, so they
 * regenerate on every dev/build. The test count needs a real run, so it refreshes only
 * on --with-tests and is otherwise carried over from the previously generated file.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(root, 'src/app/lib/generated/site-stats.ts');

const countDirs = relativePath =>
  readdirSync(resolve(root, relativePath), { withFileTypes: true }).filter(entry =>
    entry.isDirectory()
  ).length;

const countCssPresets = relativePath =>
  readdirSync(resolve(root, relativePath)).filter(file => file.endsWith('.css')).length;

/** Reads the test count from the last generated file so a fast run never invents a number. */
function previousTestCount() {
  try {
    const match = readFileSync(OUTPUT, 'utf8').match(/tests: (\d+)/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

function runTestCount() {
  const reportPath = resolve(root, 'node_modules/.cache/site-stats-vitest.json');
  mkdirSync(dirname(reportPath), { recursive: true });

  try {
    execFileSync(
      'pnpm',
      ['exec', 'vitest', '--run', '--reporter=json', `--outputFile=${reportPath}`],
      { cwd: root, stdio: 'ignore' }
    );
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    return report.numPassedTests ?? report.numTotalTests ?? null;
  } catch {
    console.warn('[site-stats] test run failed; keeping the previous test count');
    return null;
  } finally {
    rmSync(reportPath, { force: true });
  }
}

/** The published library version — what "Volt UI x.y.z" on the site means. */
const libraryVersion = () =>
  JSON.parse(readFileSync(resolve(root, 'projects/volt/package.json'), 'utf8')).version;

const withTests = process.argv.includes('--with-tests');
const version = libraryVersion();
const components = countDirs('projects/volt/src/lib/components');
const layouts = countDirs('projects/volt/src/lib/layouts');
const colorPresets = countCssPresets('projects/volt/src/themes/colors');
const stylePresets = countCssPresets('projects/volt/src/themes/styles');
const tests = (withTests ? runTestCount() : null) ?? previousTestCount();

if (tests === null) {
  console.error('[site-stats] no test count available; run once with --with-tests');
  process.exit(1);
}

const contents = `// GENERATED FILE - do not edit by hand.
// Regenerate with: pnpm stats (structural only) or pnpm stats:full (re-runs the suite).
export const SITE_STATS = {
  version: '${version}',
  components: ${components},
  layouts: ${layouts},
  tests: ${tests},
  colorPresets: ${colorPresets},
  stylePresets: ${stylePresets},
  themeCombos: ${colorPresets * stylePresets},
} as const;
`;

mkdirSync(dirname(OUTPUT), { recursive: true });

let previous = '';
try {
  previous = readFileSync(OUTPUT, 'utf8');
} catch {
  previous = '';
}

if (previous !== contents) {
  writeFileSync(OUTPUT, contents);
  console.log(
    `[site-stats] wrote v${version}, ${components} components, ${tests} tests, ${colorPresets * stylePresets} theme combos`
  );
}
