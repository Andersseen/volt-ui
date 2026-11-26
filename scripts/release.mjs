#!/usr/bin/env node
/**
 * Release orchestrator.
 *
 * For each publishable package it reads the exact published state from the npm registry, then:
 *   - publishes the version if npm does not have it (and it is not a downgrade),
 *   - VERIFIES the version is on the registry,
 *   - only then creates the GitHub Release (and tag), and
 *   - for a version that is already on npm but has no GitHub Release, creates the missing one.
 *
 * The decisions live in scripts/lib/release-core.mjs and are unit-tested against a mocked registry
 * and a mocked GitHub (scripts/release.spec.mjs). This file only wires the real thing.
 *
 * Authentication: npm Trusted Publishing (OIDC). There is no token anywhere: `npm publish` in the
 * Release workflow exchanges the job's GitHub OIDC identity for a short-lived credential. This
 * script never runs `npm whoami` (it does not work with OIDC) and never reads NPM_TOKEN.
 *
 * Env:
 *   RELEASE_SHA  commit the releases should point at; wins over GITHUB_SHA
 *   DRY_RUN=1    read-only: reads the registry and GitHub, publishes and creates nothing
 *                (also `--dry-run`)
 */
import { execFileSync, execSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  checkTrustedPublishing,
  fetchPackument,
  fetchVersionEvidence,
  runRelease,
} from './lib/release-core.mjs';

/**
 * Packages published from this repo, in publish order.
 *
 * `dependsOn`: what must reach npm first. The agent's skills and setup text describe CLI commands
 * (`volt diff`, `--track`), so a new agent never goes out ahead of the CLI it documents. The CLI
 * copies source and needs no published `@voltui/components`, so the two are independent: a Trusted
 * Publisher rejected for one does not hold the other back.
 */
export const PACKAGES = [
  {
    name: '@voltui/components',
    label: 'Components library',
    versionFile: 'packages/volt/package.json',
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
    name: '@voltui/agent',
    label: 'Agent installer (skills + MCP)',
    versionFile: 'cli/agent/package.json',
    publish: 'pnpm publish:agent',
    tagPrefix: 'agent',
    dependsOn: ['@voltui/cli'],
  },
];

const readManifest = file => JSON.parse(readFileSync(file, 'utf8'));

const realPublisher = {
  async preflight(pkg) {
    const { checked } = await checkTrustedPublishing(pkg.name);
    if (checked) console.log(`  ✓ npm accepts this job as Trusted Publisher of ${pkg.name}`);
  },
  async publish(pkg) {
    console.log(`  $ ${pkg.publish}`);
    // OIDC: npm picks the identity up from the job; provenance is requested explicitly so it can
    // never be silently dropped.
    execSync(pkg.publish, {
      stdio: 'inherit',
      env: { ...process.env, NPM_CONFIG_PROVENANCE: 'true' },
    });
  },
};

const realGithub = {
  async releaseExists(tag) {
    try {
      execFileSync('gh', ['release', 'view', tag], { stdio: ['ignore', 'pipe', 'pipe'] });
      return true;
    } catch (error) {
      if (/release not found|HTTP 404/i.test(String(error.stderr))) return false;
      throw new Error(`gh release view ${tag}: ${String(error.stderr || error.message).trim()}`);
    }
  },
  async createRelease({ tag, title, target }) {
    console.log(`  $ gh release create ${tag} --target ${target.slice(0, 8)}`);
    execFileSync(
      'gh',
      ['release', 'create', tag, '--target', target, '--title', title, '--generate-notes'],
      { stdio: 'inherit' }
    );
  },
  /** The commit an existing git tag points at, or null when there is no such tag. */
  async tagCommit(tag) {
    try {
      return execFileSync('git', ['rev-list', '-n', '1', `refs/tags/${tag}`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch {
      return null;
    }
  },
  /** Whether `commit` is part of the history being released (an ancestor of HEAD). */
  inHistory(commit) {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', commit, 'HEAD'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  },
};

const ICON = {
  published: '🚀',
  reconciled: '🔁',
  'up-to-date': '✓',
  'would-publish': '…',
  'would-reconcile': '…',
  'on-npm': '✓',
  'release-unresolved': '?',
};

export async function main(argv = process.argv, env = process.env) {
  const dryRun = env.DRY_RUN === '1' || argv.includes('--dry-run');
  const sha = env.RELEASE_SHA || env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();

  console.log(`Release check @ ${sha.slice(0, 8)}${dryRun ? ' (dry run: read-only)' : ''}\n`);

  const report = await runRelease({
    packages: PACKAGES,
    readManifest,
    registry: {
      fetchPackument: name => fetchPackument(name),
      fetchVersionEvidence: (name, version) => fetchVersionEvidence(name, version),
    },
    publisher: realPublisher,
    github: realGithub,
    sha,
    dryRun,
    log: console.log,
  });

  const lines = report.results.map(
    r =>
      `${ICON[r.status] ?? '✗'} ${r.name}@${r.version ?? '?'} — ${r.status}${r.detail ? `: ${r.detail}` : ''}`
  );
  console.log(`\n${lines.join('\n')}`);

  if (env.GITHUB_OUTPUT) {
    appendFileSync(env.GITHUB_OUTPUT, `published=${report.published.length > 0}\n`);
  }
  if (env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      env.GITHUB_STEP_SUMMARY,
      `## Release${dryRun ? ' (dry run)' : ''}\n\n${lines.map(l => `- ${l}`).join('\n')}\n`
    );
  }

  if (!report.ok) {
    console.error(
      '\nRelease did not complete cleanly. Fix the cause and re-run: it is idempotent.'
    );
    return 1;
  }
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().then(
    code => process.exit(code),
    error => {
      console.error(error);
      process.exit(1);
    }
  );
}
