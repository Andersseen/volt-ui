/**
 * Release decision logic, with every side effect injected so it can be tested against a mocked
 * npm registry and a mocked GitHub interface (see scripts/release.spec.mjs).
 *
 * The rules, in one place:
 *   - the registry is the only source of truth for "is this version published"; a network, auth
 *     or server error is an ERROR, never "unpublished";
 *   - a published version is immutable: it is never republished, only reconciled with GitHub;
 *   - a version lower than what npm already has is refused (no downgrades);
 *   - npm is published first and VERIFIED before any GitHub Release mentions it;
 *   - the first publish failure halts the run so a partial release is never made worse.
 */

const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseSemver(version) {
  const match = SEMVER.exec(version ?? '');
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

/** Semver precedence: -1, 0 or 1. Throws on input that is not a version. */
export function compareSemver(a, b) {
  const x = parseSemver(a);
  const y = parseSemver(b);
  if (!x || !y) throw new Error(`Cannot compare "${a}" with "${b}": not semver`);
  for (const key of ['major', 'minor', 'patch']) {
    if (x[key] !== y[key]) return x[key] < y[key] ? -1 : 1;
  }
  if (!x.prerelease.length || !y.prerelease.length) {
    return x.prerelease.length === y.prerelease.length ? 0 : x.prerelease.length ? -1 : 1;
  }
  for (let i = 0; i < Math.max(x.prerelease.length, y.prerelease.length); i++) {
    const p = x.prerelease[i];
    const q = y.prerelease[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    const pn = /^\d+$/.test(p);
    const qn = /^\d+$/.test(q);
    if (pn && qn) return Number(p) < Number(q) ? -1 : 1;
    if (pn !== qn) return pn ? -1 : 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

/** A registry answer we could not trust: network failure, auth rejection, 5xx, malformed body. */
export class RegistryError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'RegistryError';
    this.status = status;
  }
}

/**
 * Reads a package's published state from the npm registry.
 *
 * Returns `{ exists: false }` ONLY for an HTTP 404 on the package document. Everything else that
 * is not a clean 200 throws RegistryError: a 401/403/429/5xx or a dropped connection says nothing
 * about whether the version exists.
 */
export async function fetchPackument(
  name,
  {
    fetchImpl = fetch,
    registry = 'https://registry.npmjs.org',
    attempts = 3,
    sleep = ms => new Promise(r => setTimeout(r, ms)),
  } = {}
) {
  const url = `${registry.replace(/\/$/, '')}/${name.replace('/', '%2f')}`;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    // Only transient trouble (network, 429, 5xx) is retried; a definite answer is never retried.
    let transient = false;
    try {
      const response = await fetchImpl(url, {
        headers: { accept: 'application/vnd.npm.install-v1+json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status === 404) return { exists: false, versions: [], distTags: {} };
      if (response.status >= 500 || response.status === 429) {
        transient = true;
        throw new RegistryError(`registry answered ${response.status} for ${name}`, {
          status: response.status,
        });
      }
      if (!response.ok) {
        throw new RegistryError(`registry answered ${response.status} for ${name}`, {
          status: response.status,
        });
      }
      let body;
      try {
        body = await response.json();
      } catch {
        throw new RegistryError(`registry returned unreadable JSON for ${name}`);
      }
      if (body?.name !== name || !body.versions || typeof body.versions !== 'object') {
        throw new RegistryError(`registry document for ${name} is not the expected package`);
      }
      return {
        exists: true,
        versions: Object.keys(body.versions),
        distTags: body['dist-tags'] ?? {},
      };
    } catch (error) {
      if (error instanceof RegistryError) {
        lastError = error;
      } else {
        transient = true; // fetch rejected: DNS, reset, timeout
        lastError = new RegistryError(`registry unreachable for ${name}: ${error.message}`);
      }
      if (!transient) throw lastError;
    }
    if (attempt < attempts) await sleep(1000 * attempt);
  }
  throw lastError;
}

/** Highest version by semver precedence (prereleases included), or null. */
export function highestVersion(versions) {
  return (
    versions
      .filter(v => parseSemver(v))
      .sort(compareSemver)
      .at(-1) ?? null
  );
}

/**
 * What should happen to one package?
 *   publish    - version absent from npm and not a downgrade
 *   reconcile  - version already on npm: never republish, only make sure GitHub agrees
 *   refuse     - cannot be released safely (downgrade, prerelease, malformed, wrong name)
 */
export function planPackage({ pkg, manifest, packument }) {
  if (manifest.name !== pkg.name) {
    return {
      action: 'refuse',
      reason: `${pkg.versionFile} is named ${manifest.name}, expected ${pkg.name}`,
    };
  }
  const version = manifest.version;
  const parsed = parseSemver(version);
  if (!parsed) return { action: 'refuse', reason: `"${version}" is not a valid semver version` };
  if (packument.versions.includes(version)) return { action: 'reconcile', version };
  if (parsed.prerelease.length) {
    return {
      action: 'refuse',
      reason: `${version} is a prerelease; npm would tag it "latest". Prereleases are not released by this script`,
    };
  }
  const highest = highestVersion(packument.versions);
  if (highest && compareSemver(version, highest) < 0) {
    return {
      action: 'refuse',
      reason: `${version} is lower than ${highest}, which npm already has: a version rollback is not allowed`,
    };
  }
  return { action: 'publish', version, previous: packument.distTags.latest ?? highest };
}

export const tagFor = (pkg, version) => `${pkg.tagPrefix}-v${version}`;

/**
 * Runs the release. Never throws for expected failures: everything lands in the returned report.
 *
 * deps:
 *   packages, readManifest(file), registry.fetchPackument(name), publisher.publish(pkg),
 *   github.releaseExists(tag) / github.createRelease({tag,title,pkg,version}) /
 *   github.commitForVersion(pkg, version), sha, dryRun, log, sleep
 */
export async function runRelease(deps) {
  const {
    packages,
    readManifest,
    registry,
    publisher,
    github,
    sha,
    dryRun = false,
    log = () => {},
    sleep = ms => new Promise(r => setTimeout(r, ms)),
    verifyAttempts = 5,
  } = deps;

  const results = [];
  let halted = null;

  for (const pkg of packages) {
    const entry = { name: pkg.name, status: 'pending' };
    results.push(entry);

    if (halted) {
      Object.assign(entry, { status: 'not-attempted', detail: `halted after ${halted}` });
      continue;
    }

    let manifest;
    let packument;
    try {
      manifest = readManifest(pkg.versionFile);
      entry.version = manifest.version;
      packument = await registry.fetchPackument(pkg.name);
    } catch (error) {
      Object.assign(entry, { status: 'error', detail: error.message });
      halted = pkg.name;
      continue;
    }

    const plan = planPackage({ pkg, manifest, packument });

    if (plan.action === 'refuse') {
      Object.assign(entry, { status: 'refused', detail: plan.reason });
      halted = pkg.name;
      continue;
    }

    const version = manifest.version;
    const tag = tagFor(pkg, version);
    let publishedNow = false;

    if (plan.action === 'publish') {
      log(`▲ ${pkg.name}@${version}: not on npm (latest: ${plan.previous ?? 'nothing'})`);
      if (dryRun) {
        Object.assign(entry, {
          status: 'would-publish',
          detail: `would publish, then release ${tag}`,
        });
        continue;
      }
      let publishError = null;
      try {
        await publisher.publish(pkg, version);
      } catch (error) {
        publishError = error;
      }

      // The publish command's exit code is not the verdict: ask the registry.
      let verified = false;
      let verifyError = null;
      for (let attempt = 1; attempt <= verifyAttempts && !verified; attempt++) {
        try {
          const after = await registry.fetchPackument(pkg.name);
          verified = after.versions.includes(version);
          verifyError = null;
        } catch (error) {
          verifyError = error;
        }
        if (!verified && attempt < verifyAttempts) await sleep(2000 * attempt);
      }

      if (!verified) {
        const why = publishError
          ? `publish failed: ${publishError.message}`
          : verifyError
            ? `could not verify the publication: ${verifyError.message}`
            : 'publish reported success but the version is not on the registry';
        Object.assign(entry, { status: 'publish-failed', detail: why });
        halted = pkg.name;
        continue;
      }
      publishedNow = true;
    } else {
      log(`✓ ${pkg.name}@${version} already on npm — never republished`);
    }

    // npm is verified from here on. Only now may GitHub say anything about this version.
    let exists;
    try {
      exists = await github.releaseExists(tag);
    } catch (error) {
      if (dryRun) {
        Object.assign(entry, {
          status: 'on-npm',
          detail: `GitHub release state unknown (${error.message})`,
        });
        continue;
      }
      Object.assign(entry, {
        status: publishedNow ? 'published-release-failed' : 'release-failed',
        detail: `could not read GitHub release ${tag}: ${error.message}`,
      });
      continue;
    }

    if (exists) {
      Object.assign(entry, { status: publishedNow ? 'published' : 'up-to-date', tag });
      continue;
    }

    // Published version, missing release: attach it to the commit that introduced the version
    // when it is not the one being released right now.
    let target = sha;
    if (!publishedNow) {
      try {
        target = await github.commitForVersion(pkg, version);
      } catch (error) {
        target = null;
        entry.detail = error.message;
      }
      if (!target) {
        Object.assign(entry, {
          status: 'release-failed',
          detail: `${version} is on npm but no commit introducing it was found; not guessing a tag target`,
        });
        continue;
      }
    }

    if (dryRun) {
      Object.assign(entry, {
        status: 'would-reconcile',
        detail: `on npm without GitHub release ${tag}; would create it at ${target.slice(0, 8)}`,
      });
      continue;
    }

    try {
      await github.createRelease({ tag, title: `${pkg.name} v${version}`, target, pkg, version });
      Object.assign(entry, { status: publishedNow ? 'published' : 'reconciled', tag });
    } catch (error) {
      Object.assign(entry, {
        status: publishedNow ? 'published-release-failed' : 'release-failed',
        detail: `GitHub release ${tag} failed: ${error.message}`,
      });
    }
  }

  const bad = new Set([
    'error',
    'refused',
    'publish-failed',
    'release-failed',
    'published-release-failed',
    'not-attempted',
  ]);
  return {
    results,
    ok: !results.some(r => bad.has(r.status)),
    /** Versions this run put on npm; a website refresh is only needed when this is non-empty. */
    published: results.filter(
      r => r.status === 'published' || r.status === 'published-release-failed'
    ),
    halted,
  };
}
