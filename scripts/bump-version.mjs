#!/usr/bin/env node
/**
 * Bump a package's version for the next release, everywhere it has to change, in one step.
 *
 *   pnpm release:bump patch              # @voltui/components (default)
 *   pnpm release:bump minor --package=cli
 *   pnpm release:bump patch --package=components --package=agent
 *
 * The next version is computed from npm (scripts/lib/version-bump.mjs): if the source already
 * holds a version npm does not have yet, nothing is bumped and the reason is printed.
 *
 * For @voltui/components it also updates the workspace package.json, releases the CHANGELOG's
 * "Unreleased" section under the new version and regenerates the site stats (`sourceVersion`).
 * Commit the result in the PR meant to be released (RELEASING.md, "Cutting a release").
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { PACKAGES } from './release.mjs';
import { fetchPackument } from './lib/release-core.mjs';
import { BUMP_TYPES, planBump, releaseChangelog } from './lib/version-bump.mjs';

const args = process.argv.slice(2);
const type = args.find(arg => !arg.startsWith('--'));
const wanted = args.filter(arg => arg.startsWith('--package=')).map(arg => arg.slice(10));
const selected = wanted.length ? wanted : ['components'];

if (!BUMP_TYPES.includes(type)) {
  console.error(
    `Usage: pnpm release:bump <${BUMP_TYPES.join('|')}> [--package=components|cli|agent]`
  );
  process.exit(1);
}
const unknown = selected.filter(id => !PACKAGES.some(pkg => pkg.tagPrefix === id));
if (unknown.length) {
  console.error(`Unknown package: ${unknown.join(', ')} (components, cli, agent)`);
  process.exit(1);
}

const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
/** Replaces only the version line, so the file keeps its formatting. */
const writeVersion = (file, version) =>
  writeFileSync(
    file,
    readFileSync(file, 'utf8').replace(/("version":\s*")[^"]+(")/, `$1${version}$2`)
  );

let failed = false;
for (const pkg of PACKAGES.filter(p => selected.includes(p.tagPrefix))) {
  const local = readJson(pkg.versionFile).version;
  const { versions } = await fetchPackument(pkg.name);
  const plan = planBump({ local, published: versions, type });

  if (plan.action === 'keep') {
    console.log(`= ${pkg.name} stays at ${local}: ${plan.reason}`);
    continue;
  }

  writeVersion(pkg.versionFile, plan.version);
  console.log(`▲ ${pkg.name}: ${local} → ${plan.version} (${pkg.versionFile})`);

  if (pkg.tagPrefix === 'components') {
    writeVersion('package.json', plan.version);
    try {
      const date = new Date().toISOString().slice(0, 10);
      writeFileSync(
        'CHANGELOG.md',
        releaseChangelog(readFileSync('CHANGELOG.md', 'utf8'), plan.version, date)
      );
      console.log(`  CHANGELOG.md: "Unreleased" is now [${plan.version}] - ${date}`);
    } catch (error) {
      console.error(`  CHANGELOG.md not updated: ${error.message}`);
      failed = true;
    }
    execFileSync('node', ['scripts/generate-site-stats.mjs'], { stdio: 'inherit' });
  }
}

process.exit(failed ? 1 : 0);
