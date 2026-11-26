#!/usr/bin/env node
/**
 * Read-only release readiness report (RELEASING.md, "Before cutting a release").
 *
 *   pnpm release:readiness            # human-readable
 *   pnpm release:readiness --json     # machine-readable, same facts
 *
 * Per package: source version, npm latest, whether the source version is on npm, the action the
 * Release workflow would take, the CHANGELOG [Unreleased] classification, the published files changed
 * since the version npm holds (from npm's recorded `gitHead`), and anything that blocks a release.
 * Never writes, never publishes; exits 1 when something blocks, 2 when the registry cannot be read.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PACKAGES } from './release.mjs';
import { fetchPackument, fetchVersionEvidence } from './lib/release-core.mjs';
import { formatReadiness, releaseReadiness } from './lib/release-readiness.mjs';

const readJson = file => JSON.parse(readFileSync(file, 'utf8'));

/** Files changed between `commit` and HEAD, or null when the commit is not in this clone. */
function changedSince(commit) {
  try {
    execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' });
    return execFileSync('git', ['diff', '--name-only', `${commit}..HEAD`], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return null;
  }
}

export async function gather() {
  const manifests = {};
  const registries = {};
  const changes = {};
  for (const pkg of PACKAGES) {
    manifests[pkg.name] = readJson(pkg.versionFile);
    try {
      const packument = await fetchPackument(pkg.name, { attempts: 2 });
      registries[pkg.name] = { packument };
      const latest = packument.distTags?.latest;
      if (latest) {
        const { gitHead } = await fetchVersionEvidence(pkg.name, latest);
        changes[pkg.name] = gitHead ? changedSince(gitHead) : null;
      }
    } catch (error) {
      registries[pkg.name] = { error: error.message };
    }
  }
  return {
    packages: PACKAGES,
    manifests,
    registries,
    changes,
    changelogText: readFileSync('CHANGELOG.md', 'utf8'),
  };
}

export async function main(argv = process.argv) {
  const report = releaseReadiness(await gather());
  console.log(argv.includes('--json') ? JSON.stringify(report, null, 2) : formatReadiness(report));
  if (report.packages.some(r => r.action === 'unknown')) return 2;
  return report.ready ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().then(
    code => process.exit(code),
    error => {
      console.error(error);
      process.exit(2);
    }
  );
}
