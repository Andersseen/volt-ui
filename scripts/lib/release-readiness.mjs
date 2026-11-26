/**
 * Release readiness: what would happen to each package if `main` were released now, and what stands
 * in the way. Read-only and deterministic for a given input — no clock, no network here. The thin
 * wrapper (scripts/release-readiness.mjs) gathers the input from the manifests, the registry, git
 * and CHANGELOG.md; scripts/release.spec.mjs drives this module with fixtures.
 *
 * It reuses the release decision itself (`planPackage`) and the bump rule (`planBump`), so the report
 * cannot disagree with what `scripts/release.mjs` and `pnpm release:bump` will do.
 */
import { compareSemver, highestVersion, parseSemver, planPackage } from './release-core.mjs';

export const LEVELS = ['patch', 'minor', 'major'];

/** Which source paths belong to which package (changes outside them release nothing). */
export const PACKAGE_PATHS = {
  '@voltui/components': ['packages/volt/'],
  '@voltui/cli': ['cli/'],
  '@voltui/agent': ['cli/agent/'],
};

/** Paths under a package root that are not part of what it publishes. */
const NOT_PUBLISHED = [/\.spec\.[cm]?[jt]s$/, /(^|\/)tests?\//, /(^|\/)__fixtures__\//, /\.md$/];

/** Files from `changed` that the package publishes (the CLI excludes the agent's own folder). */
export function filesForPackage(name, changed) {
  const roots = PACKAGE_PATHS[name] ?? [];
  return changed.filter(file => {
    if (!roots.some(root => file.startsWith(root))) return false;
    if (name === '@voltui/cli' && file.startsWith('cli/agent/')) return false;
    // The agent publishes its skills (Markdown): only specs/tests are excluded there.
    if (name === '@voltui/agent') return !NOT_PUBLISHED.slice(0, 3).some(re => re.test(file));
    return !NOT_PUBLISHED.some(re => re.test(file));
  });
}

/**
 * The `## [Unreleased]` section of a Keep a Changelog file, split by `### ` heading, with the level
 * each heading assigns to each package: "### Keeping copies (`@voltui/cli`, minor)",
 * "### AI context (`@voltui/agent`: patch; …)". A heading that names a package without a level, or
 * names none, is reported as unclassified rather than guessed.
 */
export function classifyUnreleased(changelog) {
  const start = changelog.search(/^## \[Unreleased\][ \t]*$/m);
  if (start < 0) return { found: false, packages: {}, unclassified: [], headings: [] };
  const rest = changelog.slice(start).split('\n').slice(1);
  const end = rest.findIndex(line => /^## \[/.test(line));
  const body = (end < 0 ? rest : rest.slice(0, end)).join('\n');
  const headings = [...body.matchAll(/^### (.+)$/gm)].map(m => m[1].trim());

  const packages = {};
  const unclassified = [];
  for (const heading of headings) {
    const mentions = [
      ...heading.matchAll(
        /`?(@voltui\/(?:components|cli|agent))`?\s*[:,]?\s*(major|minor|patch)?/g
      ),
    ];
    if (!mentions.length) {
      unclassified.push(heading);
      continue;
    }
    for (const [, name, level] of mentions) {
      const entry = (packages[name] ??= { level: null, headings: [] });
      entry.headings.push(heading);
      if (!level) {
        if (!unclassified.includes(heading)) unclassified.push(heading);
        continue;
      }
      if (!entry.level || LEVELS.indexOf(level) > LEVELS.indexOf(entry.level)) entry.level = level;
    }
  }
  return { found: true, packages, unclassified, headings, empty: !body.trim() };
}

export const NOT_PUBLISHED_MARK = '(not published to npm)';

/**
 * Versions the changelog presents as released: `## [x.y.z] - date`, except sections explicitly
 * marked `(not published to npm)` (a release that failed and was folded into a later one).
 */
export function changelogVersions(changelog) {
  return [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+[^\]]*)\](.*)$/gm)]
    .filter(m => !m[2].includes(NOT_PUBLISHED_MARK))
    .map(m => m[1]);
}

/** The smallest level that takes `from` to `to` (`1.3.3` → `1.4.1` is a minor), or null. */
export function bumpLevel(from, to) {
  const a = parseSemver(from);
  const b = parseSemver(to);
  if (!a || !b || compareSemver(to, from) <= 0) return null;
  if (b.major > a.major) return 'major';
  if (b.minor > a.minor) return 'minor';
  return 'patch';
}

/**
 * One package's readiness.
 *
 *   pkg          { name, versionFile, tagPrefix, dependsOn? }
 *   manifest     its package.json
 *   registry     { packument } or { error } (an unreachable registry is never "unpublished")
 *   changed      files changed since the published version's source commit, or null when unknown
 *   changelog    classifyUnreleased() output
 */
export function packageReadiness({
  pkg,
  manifest,
  registry,
  changed,
  changelog,
  releasedVersions,
}) {
  const blocking = [];
  const warnings = [];
  const sourceVersion = manifest?.version ?? null;
  const classification = changelog.packages[pkg.name]?.level ?? null;

  if (registry.error) {
    return {
      name: pkg.name,
      sourceVersion,
      registryLatest: null,
      sourceVersionPublished: null,
      action: 'unknown',
      changedFiles: changed?.length ?? null,
      changelog: classification,
      blocking: [`registry unavailable: ${registry.error}`],
      warnings,
    };
  }

  const { packument } = registry;
  const latest = packument.distTags?.latest ?? highestVersion(packument.versions);
  const published = packument.versions.includes(sourceVersion);
  const plan = planPackage({ pkg, manifest, packument });
  const publishedChanges = changed ? filesForPackage(pkg.name, changed) : null;

  let action;
  if (plan.action === 'refuse') {
    action = 'refused';
    blocking.push(plan.reason);
  } else if (plan.action === 'publish') {
    action = 'publish';
    const level = bumpLevel(latest ?? '0.0.0', sourceVersion);
    if (classification && level && LEVELS.indexOf(classification) > LEVELS.indexOf(level)) {
      blocking.push(
        `CHANGELOG classifies the pending changes as ${classification}, but ${sourceVersion} is only a ${level} over npm ${latest}`
      );
    }
    if (!classification) {
      warnings.push('no CHANGELOG [Unreleased] heading classifies this package');
    }
  } else if (publishedChanges?.length || classification) {
    action = 'bump-required';
    blocking.push(
      `${sourceVersion} is already on npm but ${
        publishedChanges?.length
          ? `${publishedChanges.length} published file(s) changed since it`
          : 'the CHANGELOG lists unreleased changes for it'
      }: run \`pnpm release:bump ${classification ?? 'patch'} --package=${pkg.tagPrefix}\``
    );
  } else {
    action = 'none';
  }

  if (publishedChanges === null && published) {
    warnings.push(
      'npm records no source commit for the published version: changes since it are unknown'
    );
  }

  // A dated CHANGELOG section must not present an unpublished components version as released.
  if (pkg.name === '@voltui/components') {
    for (const version of releasedVersions) {
      if (parseSemver(version) && !packument.versions.includes(version)) {
        warnings.push(`CHANGELOG has a [${version}] section, but npm does not have ${version}`);
      }
    }
  }

  return {
    name: pkg.name,
    sourceVersion,
    registryLatest: latest ?? null,
    sourceVersionPublished: published,
    action,
    changedFiles: publishedChanges?.length ?? null,
    changelog: classification,
    blocking,
    warnings,
  };
}

/** Readiness for every package, with `dependsOn` turned into blocking conditions. */
export function releaseReadiness({ packages, manifests, registries, changes, changelogText }) {
  const changelog = classifyUnreleased(changelogText);
  const releasedVersions = changelogVersions(changelogText);
  const rows = packages.map(pkg =>
    packageReadiness({
      pkg,
      manifest: manifests[pkg.name],
      registry: registries[pkg.name],
      changed: changes[pkg.name] ?? null,
      changelog,
      releasedVersions,
    })
  );
  for (const pkg of packages) {
    const row = rows.find(r => r.name === pkg.name);
    if (row.action !== 'publish' && row.action !== 'bump-required') continue;
    for (const dep of pkg.dependsOn ?? []) {
      const depRow = rows.find(r => r.name === dep);
      if (!depRow) continue;
      if (depRow.action === 'publish') {
        // Published earlier in the same run (packages go in order); only a failure there holds it.
        row.warnings.push(`goes out after ${dep} ${depRow.sourceVersion} (dependsOn), in the same run`);
      } else if (['bump-required', 'unknown', 'refused'].includes(depRow.action)) {
        row.blocking.push(`${dep} ${depRow.sourceVersion} must reach npm first (dependsOn)`);
      }
    }
  }
  return {
    packages: rows,
    unclassifiedChangelog: changelog.unclassified,
    ready: rows.every(r => r.blocking.length === 0),
  };
}

/** Plain-text table for the terminal and the job summary. */
export function formatReadiness(report) {
  const lines = [];
  for (const r of report.packages) {
    lines.push(
      `${r.name}: source ${r.sourceVersion ?? '?'} · npm latest ${r.registryLatest ?? '?'} · ` +
        `source on npm: ${r.sourceVersionPublished === null ? 'unknown' : r.sourceVersionPublished ? 'yes' : 'no'} · ` +
        `action: ${r.action} · changelog: ${r.changelog ?? 'unclassified'}` +
        (r.changedFiles === null ? '' : ` · published files changed: ${r.changedFiles}`)
    );
    for (const b of r.blocking) lines.push(`  ✗ ${b}`);
    for (const w of r.warnings) lines.push(`  ! ${w}`);
  }
  if (report.unclassifiedChangelog.length) {
    lines.push('CHANGELOG [Unreleased] headings without a package level:');
    for (const h of report.unclassifiedChangelog) lines.push(`  - ${h}`);
  }
  lines.push(report.ready ? 'Ready: nothing blocks a release.' : 'Not ready: see ✗ above.');
  return lines.join('\n');
}
