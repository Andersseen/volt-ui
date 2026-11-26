import { describe, expect, it, vi } from 'vitest';
import {
  checkTrustedPublishing,
  compareSemver,
  fetchPackument,
  fetchVersionEvidence,
  planPackage,
  provenanceCommit,
  resolveReleaseTarget,
  runRelease,
  RegistryError,
} from './lib/release-core.mjs';
import { evaluateTrigger } from './lib/release-guard.mjs';
import {
  foldUnreleased,
  incrementVersion,
  planBump,
  releaseChangelog,
} from './lib/version-bump.mjs';
import {
  bumpLevel,
  classifyUnreleased,
  changelogVersions,
  filesForPackage,
  releaseReadiness,
} from './lib/release-readiness.mjs';

const PKG = { name: '@voltui/components', versionFile: 'v.json', tagPrefix: 'components' };
const SHA = 'a'.repeat(40);

/**
 * Mocked npm registry: a map of package -> versions that "publish" mutates. `evidence` maps
 * `name@version` to what npm recorded when it was published (gitHead, provenance commit).
 */
function fakeRegistry(state, { failReads = {}, evidence = {} } = {}) {
  return {
    fetchVersionEvidence: vi.fn(async (name, version) => ({
      gitHead: null,
      provenanceCommit: null,
      hasProvenance: false,
      integrity: `sha512-${name}@${version}`,
      ...evidence[`${name}@${version}`],
    })),
    fetchPackument: vi.fn(async name => {
      if (failReads[name]) throw failReads[name];
      const versions = state[name];
      return versions
        ? { exists: true, versions: [...versions], distTags: { latest: versions.at(-1) } }
        : { exists: false, versions: [], distTags: {} };
    }),
  };
}

/**
 * Mocked GitHub + git history. `tags` maps a tag to the commit it points at; `history` lists the
 * commits reachable from the release commit.
 */
function fakeGithub(
  releases = new Set(),
  { failCreate = false, tags = {}, history = [SHA, 'b'.repeat(40), 'c'.repeat(40)] } = {}
) {
  return {
    releases,
    releaseExists: vi.fn(async tag => releases.has(tag)),
    createRelease: vi.fn(async ({ tag }) => {
      if (failCreate) throw new Error('GitHub 500');
      releases.add(tag);
    }),
    tagCommit: vi.fn(async tag => tags[tag] ?? null),
    inHistory: vi.fn(commit => history.includes(commit)),
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

  it('reconciles a published version with a missing release at the commit npm recorded (gitHead)', async () => {
    const published = 'c'.repeat(40);
    const github = fakeGithub();
    const t = setup({
      local: '1.3.3',
      github,
      evidence: { '@voltui/components@1.3.3': { gitHead: published } },
    });
    const report = await t.run();
    expect(report.results[0].status).toBe('reconciled');
    expect(t.publisher.publish).not.toHaveBeenCalled();
    expect(github.createRelease).toHaveBeenCalledWith(
      expect.objectContaining({ target: published })
    );
    expect(report.results[0].identity).toMatchObject({ gitHead: published });
    expect(report.published).toHaveLength(0);
  });

  it('does not guess a tag target when npm records no source commit', async () => {
    const github = fakeGithub();
    const report = await setup({ local: '1.3.3', github }).run();
    expect(report.results[0].status).toBe('release-unresolved');
    expect(report.results[0].detail).toMatch(/not guessing/);
    expect(github.createRelease).not.toHaveBeenCalled();
    expect(report.ok).toBe(false);
  });

  it('uses an existing git tag when it agrees with npm, and refuses when they disagree', async () => {
    const commit = 'b'.repeat(40);
    const agree = fakeGithub(new Set(), { tags: { 'components-v1.3.3': commit } });
    const ok = await setup({
      local: '1.3.3',
      github: agree,
      evidence: { '@voltui/components@1.3.3': { gitHead: commit } },
    }).run();
    expect(ok.results[0].status).toBe('reconciled');
    expect(agree.createRelease).toHaveBeenCalledWith(expect.objectContaining({ target: commit }));

    const disagree = fakeGithub(new Set(), { tags: { 'components-v1.3.3': 'c'.repeat(40) } });
    const bad = await setup({
      local: '1.3.3',
      github: disagree,
      evidence: { '@voltui/components@1.3.3': { gitHead: commit } },
    }).run();
    expect(bad.results[0].status).toBe('release-unresolved');
    expect(bad.results[0].detail).toMatch(/disagrees/);
    expect(disagree.createRelease).not.toHaveBeenCalled();
  });

  it('refuses a recorded commit that is not in the repository history', async () => {
    const github = fakeGithub(new Set(), { history: [SHA] });
    const report = await setup({
      local: '1.3.3',
      github,
      evidence: { '@voltui/components@1.3.3': { gitHead: 'd'.repeat(40) } },
    }).run();
    expect(report.results[0].status).toBe('release-unresolved');
    expect(github.createRelease).not.toHaveBeenCalled();
  });

  it("a fresh publish is released at this run's sha, and refused if npm recorded another commit", async () => {
    const ok = setup({ npm: {}, evidence: { '@voltui/components@1.4.0': { gitHead: SHA } } });
    expect((await ok.run()).results[0].status).toBe('published');

    const other = setup({
      npm: {},
      evidence: { '@voltui/components@1.4.0': { gitHead: 'e'.repeat(40) } },
    });
    const report = await other.run();
    expect(report.results[0].status).toBe('published-release-failed');
    expect(other.github.createRelease).not.toHaveBeenCalled();
    expect(report.published).toHaveLength(1); // on npm: the site still follows
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

  it('published, GitHub failed, main moved on: the retry tags the publishing commit, not the new tip nor the commit that introduced the version', async () => {
    const introduced = 'b'.repeat(40); // first commit carrying "1.4.0" in package.json
    const publishedAt = SHA; // the commit the Release job built and published
    const laterTip = 'f'.repeat(40); // main after more PRs merged while GitHub was failing
    const history = [introduced, publishedAt, laterTip];

    const t = setup({
      github: fakeGithub(new Set(), { failCreate: true, history }),
      evidence: { '@voltui/components@1.4.0': { gitHead: publishedAt } },
    });
    const first = await t.run();
    expect(first.results[0].status).toBe('published-release-failed');
    expect(first.ok).toBe(false);
    expect(first.published).toHaveLength(1); // the site still needs a refresh: npm has it

    const healed = fakeGithub(new Set(), { history });
    const second = await runRelease({
      packages: [PKG],
      readManifest: () => ({ name: PKG.name, version: '1.4.0' }),
      registry: t.registry,
      publisher: t.publisher,
      github: healed,
      sha: laterTip,
      sleep: async () => {},
    });
    expect(second.results[0].status).toBe('reconciled');
    expect(healed.createRelease).toHaveBeenCalledWith(
      expect.objectContaining({ tag: 'components-v1.4.0', target: publishedAt })
    );
    expect(t.publisher.publish).toHaveBeenCalledOnce();
  });

  it('the same retry without publication evidence stays unresolved instead of tagging the tip', async () => {
    const t = setup({ github: fakeGithub(new Set(), { failCreate: true }) });
    await t.run();
    const healed = fakeGithub();
    const second = await runRelease({
      packages: [PKG],
      readManifest: () => ({ name: PKG.name, version: '1.4.0' }),
      registry: t.registry,
      publisher: t.publisher,
      github: healed,
      sha: 'f'.repeat(40),
      sleep: async () => {},
    });
    expect(second.results[0].status).toBe('release-unresolved');
    expect(healed.createRelease).not.toHaveBeenCalled();
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
    const t = setup({
      local: '1.3.3',
      evidence: { '@voltui/components@1.3.3': { gitHead: 'c'.repeat(40) } },
    });
    const report = await t.run({ dryRun: true });
    expect(report.results[0].status).toBe('would-reconcile');
    expect(t.github.createRelease).not.toHaveBeenCalled();
  });
});

describe('independent packages', () => {
  const packages = [
    PKG,
    { name: '@voltui/cli', versionFile: 'c.json', tagPrefix: 'cli' },
    {
      name: '@voltui/agent',
      versionFile: 'a.json',
      tagPrefix: 'agent',
      dependsOn: ['@voltui/cli'],
    },
  ];
  const versions = { 'v.json': '1.4.1', 'c.json': '1.4.0', 'a.json': '0.6.1' };
  const run = ({ refuse = [], state, github = fakeGithub() }) => {
    const publisher = {
      preflight: vi.fn(async pkg => {
        if (refuse.includes(pkg.name)) {
          throw new Error(
            'npm refused this job (HTTP 404: OIDC token exchange error - package not found)'
          );
        }
      }),
      publish: vi.fn(async (pkg, version) => state[pkg.name].push(version)),
    };
    return runRelease({
      packages,
      readManifest: file => ({
        name: packages.find(p => p.versionFile === file).name,
        version: versions[file],
      }),
      registry: fakeRegistry(state),
      publisher,
      github,
      sha: SHA,
      sleep: async () => {},
    }).then(report => ({ report, publisher, github }));
  };
  const npm = () => ({
    '@voltui/components': ['1.3.3'],
    '@voltui/cli': ['1.3.3'],
    '@voltui/agent': ['0.6.0'],
  });

  it('a Trusted Publisher rejected for one package does not hold back independent ones', async () => {
    const state = npm();
    const { report, publisher } = await run({ refuse: ['@voltui/components'], state });
    expect(report.results.map(r => r.status)).toEqual(['publish-failed', 'published', 'published']);
    expect(publisher.publish).toHaveBeenCalledTimes(2);
    expect(state['@voltui/components']).not.toContain('1.4.1');
    expect(report.ok).toBe(false);
  });

  it('a package whose dependency was not released waits for it', async () => {
    const state = npm();
    const { report } = await run({ refuse: ['@voltui/cli'], state });
    expect(report.results.map(r => r.status)).toEqual([
      'published',
      'publish-failed',
      'not-attempted',
    ]);
    expect(report.results[2].detail).toMatch(/depends on @voltui\/cli/);
    expect(state['@voltui/agent']).toEqual(['0.6.0']);
    expect(report.blocked).toEqual(['@voltui/cli', '@voltui/agent']);
  });

  it('repeated execution after the npm fix resumes exactly the missing packages', async () => {
    const state = npm();
    const github = fakeGithub();
    await run({ refuse: ['@voltui/components'], state, github });
    const { report, publisher } = await run({ state, github });
    expect(report.results.map(r => r.status)).toEqual(['published', 'up-to-date', 'up-to-date']);
    expect(publisher.publish).toHaveBeenCalledOnce();
  });
});

describe('publication evidence', () => {
  const statement = commit =>
    Buffer.from(
      JSON.stringify({
        predicate: {
          buildDefinition: {
            resolvedDependencies: [
              { uri: 'git+https://github.com/x/y', digest: { gitCommit: commit } },
            ],
          },
        },
      })
    ).toString('base64');
  const bundle = commit => ({
    attestations: [
      { predicateType: 'https://github.com/npm/attestation/tree/main/specs/publish/v0.1' },
      {
        predicateType: 'https://slsa.dev/provenance/v1',
        bundle: { dsseEnvelope: { payload: statement(commit) } },
      },
    ],
  });

  it('reads the source commit from an SLSA provenance bundle', () => {
    expect(provenanceCommit(bundle('A'.repeat(40)))).toBe('a'.repeat(40));
    expect(provenanceCommit({ attestations: [] })).toBeNull();
    expect(provenanceCommit(undefined)).toBeNull();
  });

  it('fetches gitHead, integrity and the provenance commit of one version', async () => {
    const fetchImpl = vi.fn(async url => ({
      ok: true,
      status: 200,
      json: async () =>
        url.endsWith('/1.4.0')
          ? {
              name: '@voltui/cli',
              version: '1.4.0',
              gitHead: 'b'.repeat(40),
              dist: { integrity: 'sha512-x', tarball: 't', attestations: { url: 'https://att' } },
            }
          : bundle('b'.repeat(40)),
    }));
    const evidence = await fetchVersionEvidence('@voltui/cli', '1.4.0', { fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://registry.npmjs.org/@voltui%2fcli/1.4.0');
    expect(evidence).toMatchObject({
      gitHead: 'b'.repeat(40),
      provenanceCommit: 'b'.repeat(40),
      hasProvenance: true,
      integrity: 'sha512-x',
    });
  });

  it('a registry failure is an error, not "no evidence"', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 503 }));
    await expect(fetchVersionEvidence('@voltui/cli', '1.4.0', { fetchImpl })).rejects.toThrow(
      RegistryError
    );
  });

  it('resolveReleaseTarget prefers agreement, and reports everything else as unresolved', () => {
    const c = 'c'.repeat(40);
    const inHistory = commit => commit === c;
    expect(
      resolveReleaseTarget({ publishedNow: false, sha: SHA, evidence: { gitHead: c }, inHistory })
    ).toMatchObject({ target: c });
    expect(
      resolveReleaseTarget({
        publishedNow: false,
        sha: SHA,
        evidence: { gitHead: c, provenanceCommit: 'd'.repeat(40) },
        inHistory,
      }).unresolved
    ).toMatch(/disagrees/);
    expect(resolveReleaseTarget({ publishedNow: false, sha: SHA, inHistory }).unresolved).toMatch(
      /no source commit/
    );
    expect(resolveReleaseTarget({ publishedNow: true, sha: SHA })).toMatchObject({ target: SHA });
  });
});

describe('Trusted Publishing preflight', () => {
  const jwt = claims =>
    ['e30', Buffer.from(JSON.stringify(claims)).toString('base64url'), 'sig'].join('.');
  const ACTIONS = {
    GITHUB_ACTIONS: 'true',
    ACTIONS_ID_TOKEN_REQUEST_URL: 'https://token.actions.example/id?x=1',
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'request-bearer',
  };
  const reply = (status, body) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
  const idToken = jwt({
    repository: 'Andersseen/volt-ui',
    workflow_ref: 'Andersseen/volt-ui/.github/workflows/release.yml@refs/heads/main',
    event_name: 'workflow_run',
  });

  it('is skipped off GitHub Actions, where npm uses the local login', async () => {
    const fetchImpl = vi.fn();
    await expect(
      checkTrustedPublishing('@voltui/components', { env: {}, fetchImpl })
    ).resolves.toEqual({ checked: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('passes when npm exchanges the job identity for a publish token', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(reply(200, { value: idToken }))
      .mockResolvedValueOnce(reply(201, { token: 'short-lived' }));
    await expect(
      checkTrustedPublishing('@voltui/components', { env: ACTIONS, fetchImpl })
    ).resolves.toEqual({ checked: true });
    expect(fetchImpl.mock.calls[0][0]).toContain('audience=npm%3Aregistry.npmjs.org');
    expect(fetchImpl.mock.calls[1][0]).toBe(
      'https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/@voltui%2fcomponents'
    );
    expect(fetchImpl.mock.calls[1][1].headers.authorization).toBe(`Bearer ${idToken}`);
  });

  // npm itself swallows this and then answers the PUT with a bare E404 (every run since 1.4.0).
  it("names npm's answer and the identity it was shown, never the token", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(reply(200, { value: idToken }))
      .mockResolvedValueOnce(reply(404, { message: 'No matching trusted publisher found' }));
    const error = await checkTrustedPublishing('@voltui/components', {
      env: ACTIONS,
      fetchImpl,
    }).catch(e => e);
    expect(error.message).toContain('HTTP 404: No matching trusted publisher found');
    expect(error.message).toContain('repository=Andersseen/volt-ui');
    expect(error.message).toContain('workflows/release.yml@refs/heads/main');
    expect(error.message).toContain('event_name=workflow_run');
    expect(error.message).not.toContain(idToken);
  });

  it('fails without an OIDC identity in the job', async () => {
    await expect(
      checkTrustedPublishing('@voltui/components', {
        env: { GITHUB_ACTIONS: 'true' },
        fetchImpl: vi.fn(),
      })
    ).rejects.toThrow(/id-token: write/);
  });

  it('a failed preflight publishes nothing and creates no release', async () => {
    const { run, publisher, github } = setup();
    publisher.preflight = vi.fn(async () => {
      throw new Error('npm refused this job');
    });
    const report = await run();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(github.createRelease).not.toHaveBeenCalled();
    expect(report.ok).toBe(false);
    expect(report.results[0]).toMatchObject({
      status: 'publish-failed',
      detail: 'not published: npm refused this job',
    });
  });

  it('is not run for a version npm already has, nor in a dry run', async () => {
    const preflight = vi.fn();
    const published = setup({ local: '1.3.3' });
    published.publisher.preflight = preflight;
    await published.run();
    const dry = setup();
    dry.publisher.preflight = preflight;
    await dry.run({ dryRun: true });
    expect(preflight).not.toHaveBeenCalled();
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

describe('release:bump', () => {
  it('increments patch, minor and major', () => {
    expect(incrementVersion('1.4.1', 'patch')).toBe('1.4.2');
    expect(incrementVersion('1.4.1', 'minor')).toBe('1.5.0');
    expect(incrementVersion('1.4.1', 'major')).toBe('2.0.0');
    expect(() => incrementVersion('1.4.1', 'micro')).toThrow(/unknown bump/);
  });

  it('bumps from what npm has when the source is released', () => {
    expect(planBump({ local: '1.4.1', published: ['1.3.3', '1.4.1'], type: 'patch' })).toEqual({
      action: 'bump',
      version: '1.4.2',
      previous: '1.4.1',
    });
    expect(planBump({ local: '1.4.1', published: ['1.4.1'], type: 'minor' }).version).toBe('1.5.0');
  });

  // The state the repository was in: source 1.4.1, npm still 1.3.3 after failed releases.
  it('keeps a version npm does not have yet instead of skipping numbers', () => {
    for (const type of ['patch', 'minor']) {
      const plan = planBump({ local: '1.4.1', published: ['1.3.3'], type });
      expect(plan.action, type).toBe('keep');
      expect(plan.reason).toMatch(/1\.4\.1 is not on npm yet/);
    }
    // A bigger step than the pending one is still possible.
    expect(planBump({ local: '1.4.1', published: ['1.3.3'], type: 'major' }).version).toBe('2.0.0');
  });

  it('releases the Unreleased section of the CHANGELOG', () => {
    const text = '# Changelog\n\n## [Unreleased]\n\n- Fixed a thing.\n\n## [1.4.1] - 2026-11-16\n';
    expect(releaseChangelog(text, '1.4.2', '2026-12-01')).toBe(
      '# Changelog\n\n## [Unreleased]\n\n## [1.4.2] - 2026-12-01\n\n- Fixed a thing.\n\n## [1.4.1] - 2026-11-16\n'
    );
    expect(() => releaseChangelog(text, '1.4.1', '2026-12-01')).toThrow(/already has 1\.4\.1/);
    expect(() => releaseChangelog('# Changelog\n', '1.4.2', 'x')).toThrow(/Unreleased/);
  });
});

describe('release:bump keeps CHANGELOG entries with the version that ships them', () => {
  const text = [
    '# Changelog',
    '',
    '## [Unreleased]',
    '',
    '### CLI (`@voltui/cli`, minor)',
    '',
    '- volt diff',
    '',
    '## [1.4.1] - 2026-11-16 (not published to npm)',
    '',
    '- earlier fix',
    '',
    '## [1.3.3] - 2026-10-19',
    '',
    '- shipped',
    '',
  ].join('\n');

  it('folds [Unreleased] into a pending version, dated, without the unpublished mark', () => {
    const out = foldUnreleased(text, '1.4.1', '2026-12-01');
    expect(out).toMatch(/## \[Unreleased\]\n\n## \[1\.4\.1\] - 2026-12-01\n\n### CLI/);
    expect(out).toContain('- volt diff');
    expect(out).toContain('- earlier fix');
    expect(out).not.toContain('not published to npm');
    expect(out.indexOf('- volt diff')).toBeLessThan(out.indexOf('- earlier fix'));
    expect(out).toContain('## [1.3.3] - 2026-10-19');
  });

  it('releases [Unreleased] under a version that has no section yet', () => {
    expect(foldUnreleased(text, '1.5.0', '2026-12-01')).toMatch(
      /## \[Unreleased\]\n\n## \[1\.5\.0\] - 2026-12-01/
    );
  });
});

describe('release readiness report', () => {
  const PACKAGES = [
    { name: '@voltui/components', versionFile: 'v.json', tagPrefix: 'components' },
    { name: '@voltui/cli', versionFile: 'c.json', tagPrefix: 'cli' },
    {
      name: '@voltui/agent',
      versionFile: 'a.json',
      tagPrefix: 'agent',
      dependsOn: ['@voltui/cli'],
    },
  ];
  const packument = (versions, latest = versions.at(-1)) => ({
    packument: { exists: true, versions, distTags: { latest } },
  });
  const changelogText = [
    '## [Unreleased]',
    '',
    '### Keeping copies (`@voltui/cli`, minor)',
    '### AI context (`@voltui/agent`: patch; the site is deployed)',
    '### Components (`@voltui/components`, minor)',
    '### Consumer verification',
    '',
    '## [1.4.1] - 2026-11-16 (not published to npm)',
    '## [1.3.3] - 2026-10-19',
  ].join('\n');
  const input = overrides => ({
    packages: PACKAGES,
    manifests: {
      '@voltui/components': { name: '@voltui/components', version: '1.4.1' },
      '@voltui/cli': { name: '@voltui/cli', version: '1.4.0' },
      '@voltui/agent': { name: '@voltui/agent', version: '0.6.0' },
    },
    registries: {
      '@voltui/components': packument(['1.3.3']),
      '@voltui/cli': packument(['1.3.3']),
      '@voltui/agent': packument(['0.5.0', '0.6.0']),
    },
    changes: {
      '@voltui/components': ['packages/volt/src/lib/components/input/input.ts'],
      '@voltui/cli': ['cli/lib/diff.js', 'cli/agent/skills/volt-ui/SKILL.md'],
      '@voltui/agent': ['cli/agent/skills/volt-ui/SKILL.md', 'cli/agent/tests/x.spec.js'],
    },
    changelogText,
    ...overrides,
  });

  it('classifies [Unreleased] per package and lists what it cannot classify', () => {
    const c = classifyUnreleased(changelogText);
    expect(c.packages['@voltui/cli'].level).toBe('minor');
    expect(c.packages['@voltui/agent'].level).toBe('patch');
    expect(c.unclassified).toEqual(['Consumer verification']);
    expect(changelogVersions(changelogText)).toEqual(['1.3.3']);
  });

  it('counts only the files each package publishes', () => {
    const changed = ['cli/lib/diff.js', 'cli/agent/setup-agent.js', 'cli/tests/a.spec.js'];
    expect(filesForPackage('@voltui/cli', changed)).toEqual(['cli/lib/diff.js']);
    expect(filesForPackage('@voltui/agent', changed)).toEqual(['cli/agent/setup-agent.js']);
  });

  it('reports pending versions, a required agent bump and its dependency on the CLI', () => {
    const report = releaseReadiness(input());
    const [components, cli, agent] = report.packages;
    expect(components).toMatchObject({
      sourceVersion: '1.4.1',
      registryLatest: '1.3.3',
      sourceVersionPublished: false,
      action: 'publish',
      changelog: 'minor',
      blocking: [],
    });
    expect(cli).toMatchObject({ action: 'publish', changedFiles: 1 });
    expect(agent).toMatchObject({ sourceVersionPublished: true, action: 'bump-required' });
    expect(agent.blocking.join('\n')).toMatch(/release:bump patch --package=agent/);
    // The CLI goes out earlier in the same run: a sequencing note, not a blocker.
    expect(agent.warnings.join('\n')).toMatch(/after @voltui\/cli 1\.4\.0 \(dependsOn\)/);
    expect(report.ready).toBe(false);
  });

  it('blocks a pending version smaller than the changelog says it must be', () => {
    const report = releaseReadiness(
      input({
        manifests: {
          ...input().manifests,
          '@voltui/cli': { name: '@voltui/cli', version: '1.3.4' },
        },
      })
    );
    expect(report.packages[1].blocking.join()).toMatch(/minor, but 1\.3\.4 is only a patch/);
    expect(bumpLevel('1.3.3', '1.4.1')).toBe('minor');
  });

  it('never treats an unreachable registry as "unpublished"', () => {
    const report = releaseReadiness(
      input({
        registries: { ...input().registries, '@voltui/cli': { error: 'registry answered 503' } },
      })
    );
    expect(report.packages[1]).toMatchObject({ action: 'unknown', sourceVersionPublished: null });
    expect(report.packages[2].blocking.join()).toMatch(/must reach npm first/);
  });

  it('warns about a dated changelog section for a version npm does not have', () => {
    const report = releaseReadiness(
      input({ changelogText: changelogText.replace(' (not published to npm)', '') })
    );
    expect(report.packages[0].warnings).toContain(
      'CHANGELOG has a [1.4.1] section, but npm does not have 1.4.1'
    );
  });

  it('is deterministic: the same input gives the same report', () => {
    expect(JSON.stringify(releaseReadiness(input()))).toBe(
      JSON.stringify(releaseReadiness(input()))
    );
  });
});
