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
   it is created, at the commit that introduced that version.
4. **Refused**, with nothing published: a version lower than what npm has (rollback), a prerelease, a malformed
   version, a manifest with the wrong package name.
5. **A registry error is an error.** Only an HTTP 404 on the package document means "never published"; a 401/403/429/5xx
   or a dropped connection stops the run. (The old script treated every failure as "unpublished".)
6. The first publish failure **halts** the run; packages after it are reported `not-attempted`. Re-running resumes
   exactly there. A GitHub failure after a verified publish is reported and healed by the next run.

| Package              | Version source               | npm                                                     | Release tag         |
| -------------------- | ---------------------------- | ------------------------------------------------------- | ------------------- |
| `@voltui/components` | `packages/volt/package.json` | [npm](https://www.npmjs.com/package/@voltui/components) | `components-vX.Y.Z` |
| `@voltui/cli`        | `cli/package.json`           | [npm](https://www.npmjs.com/package/@voltui/cli)        | `cli-vX.Y.Z`        |
| `@voltui/agent`      | `cli/agent/package.json`     | [npm](https://www.npmjs.com/package/@voltui/agent)      | `agent-vX.Y.Z`      |

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

Order of events for a release: merge → CI deploys the sites (still showing the previous `latest`) → Release publishes and
verifies npm → `refresh-site` re-runs CI on `main`, which rebuilds and redeploys the sites reading the new `latest`.
No version bump is needed to refresh the website, and the refresh run publishes nothing, so there is no loop.
Production deploys are serialised (`concurrency: deploy-production`).

## Cutting a release

1. Open a PR that bumps the version of whatever you're releasing, e.g. in
   `packages/volt/package.json`, with the `CHANGELOG.md` entry. Label features that are not production-ready
   (experimental) in the changelog and docs.
2. Merge to `main`. CI runs; when it succeeds on the tip of `main`, **Release** publishes the bumped package(s),
   verifies them on npm and creates the GitHub Releases.
3. The website follows on its own (above).

To retry or reconcile (for example after a failure) run **Actions → Release → Run workflow** on `main`: it needs a
successful CI run for that commit, and re-running is always safe.

## Recovery

| Situation                                          | What happens / what to do                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Publish rejected (Trusted Publisher missing/wrong) | Run halts, no GitHub Release. Fix the npm setting, re-run Release.                      |
| Published, GitHub Release creation failed          | Reported as failed; the next run creates the Release. The site is refreshed regardless. |
| Published but tag/Release missing (old failure)    | The next run creates it at the commit that introduced the version.                      |
| Registry unreachable / 5xx / 401                   | Run stops without publishing. Re-run later.                                             |
| Two runs at once                                   | `concurrency: release` serialises them; the second finds everything published.          |
| Version lower than npm's                           | Refused. Fix the manifest; never publish a rollback.                                    |

## Preview locally

Read-only check of what would be published (hits npm, publishes nothing):

```bash
DRY_RUN=1 node scripts/release.mjs
```
