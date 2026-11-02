import { fetchPackument, parseSemver } from './release-core.mjs';

/**
 * The version of @voltui/components a visitor can install: npm's `latest` dist-tag.
 *
 * Safe failure: when npm is unreachable or answers something unusable the last known value is
 * returned (with a warning) - never a guess, never the source version. `fixture` pins the answer
 * for tests; `offline` skips the network.
 */
export async function resolvePublishedVersion({
  previous = null,
  offline = false,
  fixture,
  fetchPackumentImpl = fetchPackument,
  warn = console.warn,
}) {
  if (fixture) {
    if (!parseSemver(fixture)) throw new Error(`--published-from=${fixture} is not a version`);
    return fixture;
  }
  if (offline) return previous;
  try {
    const packument = await fetchPackumentImpl('@voltui/components', { attempts: 2 });
    const latest = packument.distTags?.latest;
    if (
      !packument.exists ||
      !latest ||
      !parseSemver(latest) ||
      !packument.versions.includes(latest)
    ) {
      throw new Error('registry has no usable "latest" dist-tag');
    }
    return latest;
  } catch (error) {
    warn(
      `[site-stats] could not read the published version from npm (${error.message}); keeping ${previous ?? 'nothing'}`
    );
    return previous;
  }
}
