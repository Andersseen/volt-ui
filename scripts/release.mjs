#!/usr/bin/env node
/**
 * Auto-publish release script.
 *
 * For each publishable package, compares the version in its package.json with
 * the versions already on npm. If the local version is new, it:
 *   1. publishes the package to npm (reusing the existing `publish:*` scripts), and
 *   2. creates a GitHub Release (which also creates the git tag) so the release
 *      shows up in the repo's right-hand sidebar.
 *
 * It is idempotent: versions already on npm are skipped, so re-running never
 * double-publishes. Run from CI (`.github/workflows/release.yml`) or locally
 * with the right credentials (NPM auth in ~/.npmrc and `gh` logged in).
 *
 * Env:
 *   GITHUB_SHA  commit the releases should point at (defaults to HEAD)
 *   DRY_RUN=1   log what would happen without publishing or creating releases
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

/** Packages published from this repo, in publish order. */
const PACKAGES = [
  {
    name: '@voltui/components',
    label: 'Components library',
    versionFile: 'projects/volt/package.json',
    publish: 'pnpm publish:lib',
    tagPrefix: 'components',
  },
  {
    name: '@voltui/cli',
    label: 'CLI',
    versionFile: 'cli/package.json',
    publish: 'pnpm publish:cli',
    tagPrefix: 'cli',
  },
  {
    name: 'volt-ui-mcp',
    label: 'MCP installer',
    versionFile: 'cli/mcp/package.json',
    publish: 'pnpm publish:mcp',
    tagPrefix: 'mcp',
  },
];

const sha =
  process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();

const versionOf = (file) => JSON.parse(readFileSync(file, 'utf8')).version;

/** Returns the list of versions already published to npm (empty if unpublished). */
function publishedVersions(name) {
  try {
    const out = execSync(`npm view ${name} versions --json`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (!out) return [];
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // E404 — the package has never been published.
    return [];
  }
}

function run(cmd) {
  console.log(`  $ ${cmd}`);
  if (DRY_RUN) return;
  execSync(cmd, { stdio: 'inherit' });
}

let released = 0;
let failed = false;

console.log(`Release check @ ${sha.slice(0, 8)}${DRY_RUN ? ' (dry run)' : ''}\n`);

for (const pkg of PACKAGES) {
  const version = versionOf(pkg.versionFile);
  const published = publishedVersions(pkg.name);

  if (published.includes(version)) {
    console.log(`✓ ${pkg.name}@${version} already on npm — skip`);
    continue;
  }

  const latest = published.slice(-1)[0] || 'nothing';
  console.log(`\n▲ ${pkg.label}: releasing ${pkg.name}@${version} (npm latest: ${latest})`);

  try {
    run(pkg.publish);
    const tag = `${pkg.tagPrefix}-v${version}`;
    const title = `${pkg.name} v${version}`;
    // `gh release create` creates the tag at --target and the GitHub Release.
    run(
      `gh release create "${tag}" --target "${sha}" --title "${title}" --generate-notes`,
    );
    console.log(`✓ ${tag} published + released`);
    released += 1;
  } catch (err) {
    console.error(`✗ ${pkg.name}@${version} failed: ${err.message}`);
    failed = true;
  }
}

console.log(
  `\n${released} package(s) ${DRY_RUN ? 'would be ' : ''}released.` +
    (released === 0 && !failed ? ' Nothing to do — all versions are current.' : ''),
);

if (failed) process.exit(1);
