/**
 * Version bump decisions for `pnpm release:bump` (scripts/bump-version.mjs), with no I/O so they
 * can be tested (scripts/release.spec.mjs).
 *
 * The next version is computed from what npm has, never from the source alone: the source can be
 * ahead of npm when a release failed (1.4.0 and 1.4.1 were bumped in the source while npm stayed at
 * 1.3.3). Bumping again from the source would skip numbers that were never published.
 */
import { compareSemver, highestVersion, parseSemver } from './release-core.mjs';

export const BUMP_TYPES = ['patch', 'minor', 'major'];

export function incrementVersion(version, type) {
  const v = parseSemver(version);
  if (!v || v.prerelease.length) throw new Error(`cannot bump "${version}": not a release version`);
  if (type === 'major') return `${v.major + 1}.0.0`;
  if (type === 'minor') return `${v.major}.${v.minor + 1}.0`;
  if (type === 'patch') return `${v.major}.${v.minor}.${v.patch + 1}`;
  throw new Error(`unknown bump "${type}": use ${BUMP_TYPES.join(', ')}`);
}

/**
 * `{ action: 'bump', version }` or `{ action: 'keep', reason }`.
 *   local      the version in the package's package.json
 *   published  every version npm has for the package
 */
export function planBump({ local, published, type }) {
  const base = highestVersion(published) ?? local;
  const next = incrementVersion(base, type);
  const localPending = !published.includes(local);
  if (localPending && compareSemver(local, next) >= 0) {
    return {
      action: 'keep',
      reason:
        `${local} is not on npm yet (npm has ${base}) and is already a ${type} over it. ` +
        `It will be published as is: add your changes to its CHANGELOG entry instead of bumping again.`,
    };
  }
  return { action: 'bump', version: next, previous: local };
}

/**
 * Turns `## [Unreleased]` into `## [version] - date` and opens a fresh, empty `## [Unreleased]`.
 * Throws if there is no Unreleased section or it is already released under that version.
 */
export function releaseChangelog(text, version, date) {
  if (text.includes(`## [${version}]`)) throw new Error(`CHANGELOG.md already has ${version}`);
  if (!/^## \[Unreleased\][ \t]*$/m.test(text)) {
    throw new Error('CHANGELOG.md has no "## [Unreleased]" section');
  }
  return text.replace(/^## \[Unreleased\][ \t]*$/m, `## [Unreleased]\n\n## [${version}] - ${date}`);
}

/**
 * A version that never reached npm keeps its number (planBump 'keep'), so what accumulated in
 * `## [Unreleased]` since then belongs to it: this moves that text to the top of the pending
 * version's section, dates it `date` and drops a `(not published to npm)` mark. Without a section
 * for the version, the Unreleased section is released under it (`releaseChangelog`). Nothing is
 * dropped: an empty Unreleased leaves the text unchanged.
 */
export function foldUnreleased(text, version, date) {
  const heading = new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\].*$`, 'm');
  if (!heading.test(text)) return releaseChangelog(text, version, date);
  const start = text.search(/^## \[Unreleased\][ \t]*$/m);
  if (start < 0) throw new Error('CHANGELOG.md has no "## [Unreleased]" section');
  const afterHeading = text.indexOf('\n', start) + 1;
  const next = text.slice(afterHeading).search(/^## \[/m);
  const end = next < 0 ? text.length : afterHeading + next;
  const body = text.slice(afterHeading, end).trim();
  const without = `${text.slice(0, afterHeading)}\n${text.slice(end)}`;
  return without.replace(heading, `## [${version}] - ${date}${body ? `\n\n${body}\n` : ''}`);
}
