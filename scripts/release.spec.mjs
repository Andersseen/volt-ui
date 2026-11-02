import { describe, expect, it, vi } from 'vitest';
import {
  compareSemver,
  fetchPackument,
  planPackage,
  runRelease,
  RegistryError,
} from './lib/release-core.mjs';
import { evaluateTrigger } from './lib/release-guard.mjs';

const PKG = { name: '@voltui/components', versionFile: 'v.json', tagPrefix: 'components' };
const SHA = 'a'.repeat(40);

/** Mocked npm registry: a map of package -> versions that "publish" mutates. */
function fakeRegistry(state, { failReads = {} } = {}) {
  return {
    fetchPackument: vi.fn(async name => {
      if (failReads[name]) throw failReads[name];
      const versions = state[name];
      return versions
        ? { exists: true, versions: [...versions], distTags: { latest: versions.at(-1) } }
        : { exists: false, versions: [], distTags: {} };
    }),
  };
}

function fakeGithub(releases = new Set(), { failCreate = false, commit = 'b'.repeat(40) } = {}) {
  return {
    releases,
    releaseExists: vi.fn(async tag => releases.has(tag)),
    createRelease: vi.fn(async ({ tag }) => {
      if (failCreate) throw new Error('GitHub 500');
      releases.add(tag);
    }),
    commitForVersion: vi.fn(async () => commit),
  };
}

function setup({
  local = '1.4.0',
  npm = { '@voltui/components': ['1.3.3'] },
  publishImpl,
  ...opts
} = {}) {
  const state = structuredClone(npm);
  const registry = opts.registry ?? fakeRegistry(state, opts);
  const publisher = {
    publish: vi.fn(async (pkg, version) => {
      if (publishImpl) return publishImpl(state, pkg, version);
      (state[pkg.name] ??= []).push(version);
    }),
  };
  const github = opts.github ?? fakeGithub();
  const run = (extra = {}) =>
    runRelease({
      packages: [PKG],
      readManifest: () => ({ name: PKG.name, version: local }),
      registry,
      publisher,
      github,
      sha: SHA,
      sleep: async () => {},
      ...extra,
    });
  return { run, registry, publisher, github, state };
}

describe('semver', () => {
  it('orders versions, prereleases below their release', () => {
    expect(compareSemver('1.4.0', '1.3.3')).toBe(1);
    expect(compareSemver('1.10.0', '1.9.0')).toBe(1);
    expect(compareSemver('1.4.0-rc.1', '1.4.0')).toBe(-1);
    expect(compareSemver('1.4.0', '1.4.0')).toBe(0);
  });
});

describe('fetchPackument', () => {
  const json = (status, body) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
  const opts = fetchImpl => ({ fetchImpl, sleep: async () => {}, attempts: 3 });

  it('reads versions and dist-tags', async () => {
    const body = {
      name: '@voltui/components',
      versions: { '1.3.3': {} },
      'dist-tags': { latest: '1.3.3' },
    };
    const result = await fetchPackument(
      '@voltui/components',
      opts(async () => json(200, body))
    );
    expect(result).toEqual({ exists: true, versions: ['1.3.3'], distTags: { latest: '1.3.3' } });
  });

  it('treats only a 404 as "not published"', async () => {
    const result = await fetchPackument(
      '@voltui/x',
      opts(async () => json(404, {}))
    );
    expect(result.exists).toBe(false);
  });

  it.each([401, 403])(
    'treats an authentication rejection (%i) as an error, not as unpublished',
    async status => {
      const fetchImpl = vi.fn(async () => json(status, {}));
      await expect(fetchPackument('@voltui/x', opts(fetchImpl))).rejects.toBeInstanceOf(
        RegistryError
      );
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    }
  );

  it('retries transient failures and then reports them as errors', async () => {
    const fetchImpl = vi.fn(async () => json(503, {}));
    await expect(fetchPackument('@voltui/x', opts(fetchImpl))).rejects.toThrow(/503/);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('recovers when a transient failure clears', async () => {
    const body = { name: '@voltui/x', versions: { '1.0.0': {} } };
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue(json(200, body));
    expect((await fetchPackument('@voltui/x', opts(fetchImpl))).versions).toEqual(['1.0.0']);
  });

  it('rejects a document for another package or an unreadable body', async () => {
    await expect(
      fetchPackument(
        '@voltui/x',
        opts(async () => json(200, { name: 'evil', versions: {} }))
      )
    ).rejects.toThrow(/not the expected package/);
  });
});

describe('planPackage', () => {
  const packument = { versions: ['1.3.2', '1.3.3'], distTags: { latest: '1.3.3' } };
  const plan = (version, name = PKG.name) =>
    planPackage({ pkg: PKG, manifest: { name, version }, packument });

  it('publishes a new higher version', () => expect(plan('1.4.0').action).toBe('publish'));
  it('reconciles a version npm already has', () => expect(plan('1.3.3').action).toBe('reconcile'));
  it('refuses a version lower than npm latest', () => {
    const p = planPackage({ pkg: PKG, manifest: { name: PKG.name, version: '1.3.1' }, packument });
    expect(p.action).toBe('refuse');
    expect(p.reason).toMatch(/rollback/);
  });
  it('refuses a prerelease, a malformed version and a wrong package name', () => {
    expect(plan('1.5.0-rc.1').action).toBe('refuse');
    expect(plan('one').action).toBe('refuse');
    expect(plan('1.4.0', '@voltui/other').action).toBe('refuse');
  });
});

describe('runRelease', () => {
  it('first publication: publishes, verifies on npm, then creates the GitHub Release at the CI sha', async () => {
    const t = setup({ npm: {} });
    const report = await t.run();
    expect(report.ok).toBe(true);
    expect(report.results[0].status).toBe('published');
    expect(t.publisher.publish).toHaveBeenCalledOnce();
    expect(t.github.createRelease).toHaveBeenCalledWith(
      expect.objectContaining({ tag: 'components-v1.4.0', target: SHA })
    );
    // npm was read again after publishing, before GitHub was told anything.
    expect(t.registry.fetchPackument.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(report.published).toHaveLength(1);
  });

  it('never republishes a version npm already has, and creates nothing when the release exists', async () => {
    const t = setup({ local: '1.3.3', github: fakeGithub(new Set(['components-v1.3.3'])) });
    const report = await t.run();
    expect(report.results[0].status).toBe('up-to-date');
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(t.github.createRelease).not.toHaveBeenCalled();
    expect(report.published).toHaveLength(0);
  });

  it('reconciles a published version with a missing tag/release, at the commit that introduced it', async () => {
    const oldCommit = 'c'.repeat(40);
    const github = fakeGithub(new Set(), { commit: oldCommit });
    const t = setup({ local: '1.3.3', github });
    const report = await t.run();
    expect(report.results[0].status).toBe('reconciled');
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(github.createRelease).toHaveBeenCalledWith(
      expect.objectContaining({ target: oldCommit })
    );
    expect(report.published).toHaveLength(0);
  });

  it('does not guess a tag target when the introducing commit cannot be found', async () => {
    const github = fakeGithub(new Set(), { commit: null });
    const report = await setup({ local: '1.3.3', github }).run();
    expect(report.results[0].status).toBe('release-failed');
    expect(github.createRelease).not.toHaveBeenCalled();
    expect(report.ok).toBe(false);
  });

  it('an unreachable registry is an error, never "unpublished": nothing is published', async () => {
    const t = setup({
      failReads: { '@voltui/components': new RegistryError('registry answered 503') },
    });
    const report = await t.run();
    expect(report.results[0].status).toBe('error');
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(report.ok).toBe(false);
  });

  it('an authentication rejection (401) from the registry stops the run', async () => {
    const t = setup({
      failReads: {
        '@voltui/components': new RegistryError('registry answered 401', { status: 401 }),
      },
    });
    const report = await t.run();
    expect(report.ok).toBe(false);
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(t.github.createRelease).not.toHaveBeenCalled();
  });

  it('refuses a rollback and does not touch npm or GitHub', async () => {
    const t = setup({ local: '1.3.0' });
    const report = await t.run();
    expect(report.results[0].status).toBe('refused');
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(t.github.createRelease).not.toHaveBeenCalled();
  });

  it('a failed publish (e.g. the 404 of a rejected credential) creates no release and halts', async () => {
    const t = setup({
      publishImpl: async () => {
        throw new Error('npm error 404 Not Found - PUT');
      },
    });
    const report = await t.run();
    expect(report.results[0].status).toBe('publish-failed');
    expect(t.github.createRelease).not.toHaveBeenCalled();
    expect(report.halted).toBe(PKG.name);
  });

  it('trusts the registry over the exit code: a publish that errored but landed still gets its release', async () => {
    const t = setup({
      publishImpl: async (state, pkg, version) => {
        state[pkg.name].push(version);
        throw new Error('timeout after upload');
      },
    });
    const report = await t.run();
    expect(report.results[0].status).toBe('published');
    expect(t.github.createRelease).toHaveBeenCalledOnce();
  });

  it('a publish reported successful but absent from the registry is not released', async () => {
    const t = setup({ publishImpl: async () => {} });
    const report = await t.run();
    expect(report.results[0].status).toBe('publish-failed');
    expect(t.github.createRelease).not.toHaveBeenCalled();
  });

  it('partial publication: stops at the failing package and reports the rest as not attempted', async () => {
    const packages = [
      PKG,
      { name: '@voltui/cli', versionFile: 'c.json', tagPrefix: 'cli' },
      { name: '@voltui/agent', versionFile: 'a.json', tagPrefix: 'agent' },
    ];
    const state = {
      '@voltui/components': ['1.3.3'],
      '@voltui/cli': ['1.3.3'],
      '@voltui/agent': ['0.6.0'],
    };
    const publisher = {
      publish: vi.fn(async (pkg, version) => {
        if (pkg.name === '@voltui/cli') throw new Error('boom');
        state[pkg.name].push(version);
      }),
    };
    const github = fakeGithub();
    const report = await runRelease({
      packages,
      readManifest: file => ({
        name: packages.find(p => p.versionFile === file).name,
        version: file === 'a.json' ? '0.7.0' : '1.4.0',
      }),
      registry: fakeRegistry(state),
      publisher,
      github,
      sha: SHA,
      sleep: async () => {},
    });
    expect(report.results.map(r => r.status)).toEqual([
      'published',
      'publish-failed',
      'not-attempted',
    ]);
    expect(github.releases.has('components-v1.4.0')).toBe(true);
    expect(github.releases.has('cli-v1.4.0')).toBe(false);
    expect(report.ok).toBe(false);
    // The next run picks up exactly where this one stopped.
    expect(state['@voltui/components']).toContain('1.4.0');
  });

  it('GitHub release creation failure after a verified publish is reported, and the retry reconciles it', async () => {
    const t = setup({ github: fakeGithub(new Set(), { failCreate: true }) });
    const first = await t.run();
    expect(first.results[0].status).toBe('published-release-failed');
    expect(first.ok).toBe(false);
    expect(first.published).toHaveLength(1); // the site still needs a refresh: npm has it

    const healed = fakeGithub();
    const second = await runRelease({
      packages: [PKG],
      readManifest: () => ({ name: PKG.name, version: '1.4.0' }),
      registry: fakeRegistry(t.state),
      publisher: t.publisher,
      github: healed,
      sha: SHA,
      sleep: async () => {},
    });
    expect(second.results[0].status).toBe('reconciled');
    expect(t.publisher.publish).toHaveBeenCalledOnce();
  });

  it('duplicate workflow execution: the second run publishes nothing and creates nothing', async () => {
    const t = setup({ npm: {} });
    await t.run();
    const again = await t.run();
    expect(t.publisher.publish).toHaveBeenCalledOnce();
    expect(t.github.createRelease).toHaveBeenCalledOnce();
    expect(again.results[0].status).toBe('up-to-date');
    expect(again.ok).toBe(true);
  });

  it('dry run has no side effects', async () => {
    const t = setup({ npm: {} });
    const report = await t.run({ dryRun: true });
    expect(report.results[0].status).toBe('would-publish');
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(t.github.createRelease).not.toHaveBeenCalled();
  });

  it('dry run on a published version with no release only reports it', async () => {
    const t = setup({ local: '1.3.3' });
    const report = await t.run({ dryRun: true });
    expect(report.results[0].status).toBe('would-reconcile');
    expect(t.github.createRelease).not.toHaveBeenCalled();
  });
});

describe('release trigger guard', () => {
  const TIP = SHA;
  const run = (over = {}) => ({
    head_repository: { full_name: 'Andersseen/volt-ui' },
    head_branch: 'main',
    head_sha: SHA,
    event: 'push',
    conclusion: 'success',
    path: '.github/workflows/ci.yml',
    ...over,
  });
  const decide = (over = {}) =>
    evaluateTrigger({
      eventName: 'workflow_run',
      repository: 'Andersseen/volt-ui',
      tipSha: TIP,
      workflowRun: run(),
      ...over,
    });

  it('allows validated CI on the tip of main', () => {
    expect(decide()).toMatchObject({ verdict: 'allow', sha: SHA });
  });
  it('denies CI from a fork, from another branch, from a pull request or a failed run', () => {
    expect(
      decide({ workflowRun: run({ head_repository: { full_name: 'evil/volt-ui' } }) }).verdict
    ).toBe('deny');
    expect(decide({ workflowRun: run({ head_branch: 'feature' }) }).verdict).toBe('deny');
    expect(decide({ workflowRun: run({ event: 'pull_request' }) }).verdict).toBe('deny');
    expect(decide({ workflowRun: run({ conclusion: 'failure' }) }).verdict).toBe('deny');
    expect(decide({ workflowRun: run({ path: '.github/workflows/other.yml' }) }).verdict).toBe(
      'deny'
    );
  });
  it('skips (does not publish) a stale CI sha once main has moved on', () => {
    expect(decide({ tipSha: 'f'.repeat(40) }).verdict).toBe('skip');
  });
  it('manual dispatch needs a successful CI run on main for that exact sha', () => {
    const base = {
      eventName: 'workflow_dispatch',
      ref: 'refs/heads/main',
      sha: SHA,
      workflowRun: undefined,
    };
    expect(decide({ ...base, ciRunsForSha: [] }).verdict).toBe('deny');
    expect(decide({ ...base, ciRunsForSha: [run()] }).verdict).toBe('allow');
    expect(decide({ ...base, ciRunsForSha: [run({ head_sha: 'd'.repeat(40) })] }).verdict).toBe(
      'deny'
    );
    expect(decide({ ...base, ref: 'refs/heads/feature', ciRunsForSha: [run()] }).verdict).toBe(
      'deny'
    );
  });
  it('denies any other trigger', () => {
    expect(decide({ eventName: 'pull_request_target' }).verdict).toBe('deny');
  });
});

describe('published version for the website', () => {
  const ok = latest => async () => ({
    exists: true,
    versions: ['1.3.2', '1.3.3', '1.4.0'],
    distTags: { latest },
  });

  it('is npm latest, not the source version', async () => {
    const { resolvePublishedVersion } = await import('./lib/published-version.mjs');
    expect(
      await resolvePublishedVersion({ previous: '1.3.3', fetchPackumentImpl: ok('1.3.3') })
    ).toBe('1.3.3');
  });
  it('follows npm as soon as a release is published, with no source change', async () => {
    const { resolvePublishedVersion } = await import('./lib/published-version.mjs');
    expect(
      await resolvePublishedVersion({ previous: '1.3.3', fetchPackumentImpl: ok('1.4.0') })
    ).toBe('1.4.0');
  });
  it('keeps the last known value, with a warning, when npm fails', async () => {
    const { resolvePublishedVersion } = await import('./lib/published-version.mjs');
    const warn = vi.fn();
    const value = await resolvePublishedVersion({
      previous: '1.3.3',
      warn,
      fetchPackumentImpl: async () => {
        throw new RegistryError('registry answered 503');
      },
    });
    expect(value).toBe('1.3.3');
    expect(warn).toHaveBeenCalledOnce();
  });
  it('keeps the last known value when the dist-tag points at a version npm does not list', async () => {
    const { resolvePublishedVersion } = await import('./lib/published-version.mjs');
    expect(
      await resolvePublishedVersion({
        previous: '1.3.3',
        warn() {},
        fetchPackumentImpl: ok('9.9.9'),
      })
    ).toBe('1.3.3');
  });
  it('never asks npm when offline, and honours a test fixture', async () => {
    const { resolvePublishedVersion } = await import('./lib/published-version.mjs');
    const fetchPackumentImpl = vi.fn();
    expect(
      await resolvePublishedVersion({ previous: '1.3.3', offline: true, fetchPackumentImpl })
    ).toBe('1.3.3');
    expect(
      await resolvePublishedVersion({ previous: '1.3.3', fixture: '2.0.0', fetchPackumentImpl })
    ).toBe('2.0.0');
    expect(fetchPackumentImpl).not.toHaveBeenCalled();
  });
});
