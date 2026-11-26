# Releasing

Publishing to npm is automated. You bump a version, merge to `main`, and CI
publishes the changed package(s) and creates a matching GitHub Release.

## How it works

[`.github/workflows/release.yml`](.github/workflows/release.yml) starts when the **CI** workflow completes on
`main` (or on manual dispatch) and has three jobs with three trust levels:

| Job            | Permissions                          | What it does                                                                                                 |
| -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `authorize`    | `contents: read`, `actions: read`    | [`scripts/release-guard.mjs`](scripts/release-guard.mjs): may this run publish at all?                       |
| `release`      | `contents: write`, `id-token: write` | Builds the validated commit, then runs [`scripts/release.mjs`](scripts/release.mjs). The only job with OIDC. |
| `refresh-site` | `actions: write`                     | Only if something was published: re-runs the main pipeline so voltui.dev reads the new npm `latest`.         |

**The guard** (`scripts/lib/release-guard.mjs`, tested) allows a publish only when CI ran in _this_ repository, on
`main`, from a push/dispatch/schedule (never a pull request), concluded `success`, and its commit is still the **tip of
`main`**. A stale run (main moved on) is skipped, not published: the newer commit has its own CI and Release run.
A manual dispatch gets no shortcut: it must run on `main` at a commit that already has a successful CI run.

**The script** reads the exact published state from the registry and, per package:

1. **Missing version** → publishes (`pnpm publish:*`), then **re-reads npm to verify** the version is there. The
   publish command's exit code is not the verdict, the registry is.
2. Only after that verification it creates the GitHub tag + Release. A release is never created for an unverified artifact.
3. **Version already on npm** → never republished. If its GitHub Release is missing (a run died between npm and GitHub)
   it is created at the commit the **publication evidence** names: npm's `gitHead` for that version, the commit in its
   provenance attestation, and an existing git tag. They must agree and the commit must be in the repository's history;
   otherwise the package is reported `release-unresolved` and nothing is tagged. It is never the commit that first
   introduced the version number: a version can stay unpublished while more PRs merge on top of it, and the artifact npm
   holds was built from wherever the Release job ran. A version this run published is tagged at the run's commit, unless
   npm recorded a different `gitHead` (then nothing is tagged and the run fails).
4. **Refused**, with nothing published: a version lower than what npm has (rollback), a prerelease, a malformed
   version, a manifest with the wrong package name.
5. **A registry error is an error.** Only an HTTP 404 on the package document means "never published"; a 401/403/429/5xx
   or a dropped connection stops the run. (The old script treated every failure as "unpublished".)
6. **Independent packages stay independent.** A package refused before anything was attempted (a rejected Trusted
   Publisher, an invalid manifest) blocks only the packages that declare `dependsOn` it — `@voltui/agent` depends on
   `@voltui/cli`, because its skills document CLI commands; components and the CLI are independent. A failure _during_ a
   publish (state unknown) or a registry error halts everything after it (`not-attempted`). Re-running resumes exactly
   there. A GitHub failure after a verified publish is reported and healed by the next run.

| Package              | Version source               | npm                                                     | Release tag         |
| -------------------- | ---------------------------- | ------------------------------------------------------- | ------------------- |
| `@voltui/components` | `packages/volt/package.json` | [npm](https://www.npmjs.com/package/@voltui/components) | `components-vX.Y.Z` |
| `@voltui/cli`        | `cli/package.json`           | [npm](https://www.npmjs.com/package/@voltui/cli)        | `cli-vX.Y.Z`        |
| `@voltui/agent`      | `cli/agent/package.json`     | [npm](https://www.npmjs.com/package/@voltui/agent)      | `agent-vX.Y.Z`      |

## Release readiness (read-only)

```bash
pnpm release:readiness          # table
pnpm release:readiness --json   # the same facts as JSON
```

Per package: source version, npm `latest`, whether the source version is on npm, the action the Release workflow would
take (`publish`, `none`, `bump-required`, `refused`, `unknown`), the `[Unreleased]` classification from `CHANGELOG.md`
(`### … (`@voltui/cli`, minor)`), how many **published** files changed since the commit npm recorded for the latest
version, and what blocks a release: a published version whose files changed (bump it), a pending version smaller than the
changelog says it must be, a dependency that cannot go first, an unreachable registry. It also warns about a dated
changelog section for a version npm does not have; such sections are marked `(not published to npm)`. Nothing is written
or published; exit 0 ready, 1 blocked, 2 registry unreadable. CI and the Release job print it in their summaries.

`@voltui/agent` is the former `@voltui/mcp` (and, before that, the unscoped `volt-ui-mcp`). Both old
names are deprecated on npm, point to `@voltui/agent`, and are no longer released from this repo.

## One-time setup: npm Trusted Publishing (OIDC)

There is **no `NPM_TOKEN`** and no long-lived credential. `npm publish` in the `release` job authenticates with the job's
GitHub OIDC identity and attaches provenance. A package without a Trusted Publisher configured fails to publish; the
workflow does not fall back to a token. (A rejected credential shows up as `npm error 404 ... PUT` - that is how the
registry answers an unauthorised publish, and it is what broke the 1.4.0 release.)

For **each** of the three packages, on npmjs.com (an owner of the `@voltui` scope does this, once):

> Package page → **Settings** → **Trusted Publisher** → **GitHub Actions**

| Field                | Value                                              |
| -------------------- | -------------------------------------------------- |
| Organization or user | `Andersseen`                                       |
| Repository           | `volt-ui`                                          |
| Workflow filename    | `release.yml`                                      |
| Environment name     | _(leave empty)_ - the workflow uses no environment |

Do it for `@voltui/components`, `@voltui/cli` and `@voltui/agent`. The page is
`https://www.npmjs.com/package/<name>/access`. Optionally, under **Publishing access**, choose
"Require two-factor authentication and disallow tokens" once the first OIDC publish succeeded.

Requirements the workflow already meets: GitHub-hosted runner, `id-token: write`, Node 24 with npm >= 11.5.1 (the job
fails early otherwise), `repository.url` in each `package.json` equal to `https://github.com/Andersseen/volt-ui`, no
`~/.npmrc` token and no `NODE_AUTH_TOKEN`. The old `NPM_TOKEN` repository secret can be **deleted** after the first
successful OIDC release.

## Versioning policy

- Versions are **independent** per package and strictly increasing; only a package whose version is not on npm is published.
- The version in a `package.json` is a statement of intent, **not** a statement that it is released. Only npm says
  what is released, and only what npm says is advertised as stable.
- Internal plan/milestone numbers (`specs/plans/v1.5.md` ...) are **not** npm versions. Do not bump the version
  per milestone; bump it once, in the PR that is meant to be released, and do not skip or invent numbers.
- Never rewrite or re-tag a published version. A bad release is fixed forward with a new patch.
- Keep `CHANGELOG.md` current in the PR that bumps the version.

## Where the website gets its version

[`scripts/generate-site-stats.mjs`](scripts/generate-site-stats.mjs) writes two fields into
`apps/web/src/app/lib/generated/site-stats.ts`:

- `sourceVersion` - `packages/volt/package.json`, the next release. Not shown to visitors.
- `publishedVersion` - npm's `latest` dist-tag for `@voltui/components`, read at build time. **This is what the header
  and the landing badge show.** If npm cannot be reached the last committed value is kept with a warning; the build
  never fails on the network and never falls back to the source version. `--offline` and `--check` never use the network.

The same run writes `packages/shared/lib/release-availability.generated.ts`: source and npm `latest` of **all three**
packages. With `packages/shared/lib/release-capabilities.ts` (each documented capability, the first version that ships it
and a probe) it drives the version notices on both sites and the MCP server's version answers. `pnpm check:published`
installs the real npm `latest` of the three packages in an isolated project and proves every claim both ways (CI job
`published`). When a release makes a capability available, the notice disappears on the next build with no code change.

Order of events for a release: merge → CI deploys the sites (still showing the previous `latest`) → Release publishes and
verifies npm → `refresh-site` re-runs CI on `main`, which rebuilds and redeploys the sites reading the new `latest`.
No version bump is needed to refresh the website, and the refresh run publishes nothing, so there is no loop.
Production deploys are serialised (`concurrency: deploy-production`).

## Cutting a release

1. Open a PR that bumps the version of whatever you're releasing with `pnpm release:bump <patch|minor|major>`
   (`--package=cli` / `--package=agent` for the others; the default is `@voltui/components`). It computes the
   next version **from npm**, not from the source, and writes every place that carries it: the package's
   `package.json`, for components also the workspace `package.json`, the CHANGELOG (`[Unreleased]` becomes the
   new version) and the site stats. If the source already holds a version npm does not have (a release that
   has not gone out yet), it bumps nothing and says so: add the changes to that version's CHANGELOG entry
   instead of skipping a number. Label features that are not production-ready (experimental) in the changelog
   and docs.
2. Merge to `main`. CI runs; when it succeeds on the tip of `main`, **Release** publishes the bumped package(s),
   verifies them on npm and creates the GitHub Releases.
3. The website follows on its own (above).

To retry or reconcile (for example after a failure) run **Actions → Release → Run workflow** on `main`: it needs a
successful CI run for that commit, and re-running is always safe.

## Recovery

| Situation                                          | What happens / what to do                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Publish rejected (Trusted Publisher missing/wrong) | That package and its dependents are not published, no GitHub Release. Fix npm (below), re-run Release.    |
| Published, GitHub Release creation failed          | Reported as failed; the next run creates the Release at the commit npm recorded. The site is refreshed.   |
| Published but tag/Release missing, no evidence     | `release-unresolved`: create the tag by hand at the publishing commit (from the Release job log), re-run. |
| Registry unreachable / 5xx / 401                   | Run stops without publishing. Re-run later.                                                               |
| Two runs at once                                   | `concurrency: release` serialises them; the second finds everything published.                            |
| Version lower than npm's                           | Refused. Fix the manifest; never publish a rollback.                                                      |

## Trusted Publishing recovery (owner-side)

Checked against the npm documentation on 2026-11-26 ([Trusted publishing](https://docs.npmjs.com/trusted-publishers),
last edited 2026-10-06; [`npm trust`](https://docs.npmjs.com/cli/v11/commands/npm-trust)). **Repository code cannot
repair this**: it is configuration on npmjs.com that only an owner of the `@voltui` scope can change, with 2FA enabled on
their account.

### What the Release log says

`scripts/release.mjs` performs the OIDC exchange before publishing. Since 2026-11-16 every run reports, for
`@voltui/components`:

```text
npm refused this job as Trusted Publisher of @voltui/components (HTTP 404: OIDC token exchange error - package not
found). npm was shown: repository=Andersseen/volt-ui, workflow_ref=Andersseen/volt-ui/.github/workflows/release.yml@refs/heads/main,
job_workflow_ref=…/release.yml@refs/heads/main, event_name=workflow_run, ref=refs/heads/main
```

The identity is the expected one (this repository, `release.yml`, `main`). A 404 from the exchange means npm found no
trusted publisher for that package that accepts this identity for a publish.

### Configuration each package needs

| Field (npmjs.com → package → Settings → Trusted publishing) | Value                                          |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Publisher                                                   | GitHub Actions                                 |
| Organization or user                                        | `Andersseen` (case-sensitive, exact)           |
| Repository                                                  | `volt-ui`                                      |
| Workflow filename                                           | `release.yml` (file name only, with extension) |
| Environment name                                            | empty (the workflow uses none)                 |
| Allowed actions                                             | **`npm publish` must be allowed**              |

- Configurations created after **2026-09-03 allow only `npm stage publish` by default**; this workflow runs `npm publish`,
  so "publish" must be ticked (`--allow-publish` with `npm trust`).
- A newly created configuration **expires if its first successful publish does not happen within 2 days**; an expired
  one can be neither used nor edited. Existing connections cannot be changed either: delete and recreate.
- npm does not validate a configuration when it is saved; only a publish (or this job's exchange) proves it.
- Requirements the workflow already meets: GitHub-hosted runner (self-hosted is not supported), `id-token: write`,
  npm ≥ 11.5.1 and Node ≥ 22.14 (Node 24 in the job), `repository.url` equal to `https://github.com/Andersseen/volt-ui`
  in each published `package.json`, no token in the environment.

### Steps, for each of `@voltui/components`, `@voltui/cli`, `@voltui/agent`

1. Inspect (npm ≥ 11.15, logged in as an owner): `npm trust list @voltui/components`.
2. If there is no configuration, or it differs from the table, or it only allows stage publish, or it may have expired:
   `npm trust revoke @voltui/components --id=<id>`, then
   `npm trust github @voltui/components --file release.yml --repo Andersseen/volt-ui --allow-publish`
   (or the same on the package's Settings page).
3. Repeat for `@voltui/cli` and `@voltui/agent`, then `npm trust list` each one to confirm.
4. Within 2 days: **Actions → Release → Run workflow** on `main` (it needs a successful CI run for the tip). The
   preflight now passes or names the exact refusal; nothing is published for a refused package.
5. Verify: `npm view @voltui/components@<version> gitHead dist.attestations` (the commit and the provenance),
   `pnpm release:readiness` (nothing pending), `gh release list` (one release per package version).

Re-running is safe at any point: published versions are never republished, and a refused package publishes nothing.

## Preview locally

Read-only check of what would be published (hits npm, publishes nothing):

```bash
DRY_RUN=1 node scripts/release.mjs
```
