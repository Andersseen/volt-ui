# Releasing

Publishing to npm is automated. You bump a version, merge to `main`, and CI
publishes the changed package(s) and creates a matching GitHub Release.

## How it works

[`.github/workflows/release.yml`](.github/workflows/release.yml) runs when a
version changes in any publishable `package.json` on `main` (or on manual
dispatch). It runs the quality gates (lint · typecheck · test · build) and then
[`scripts/release.mjs`](scripts/release.mjs), which for each package:

1. Compares the local version with the versions already on npm.
2. If the version is **new**, publishes it (via the existing `publish:*` scripts).
3. Creates a GitHub Release + git tag so it shows up in the repo sidebar.

The script is **idempotent** — versions already on npm are skipped, so re-running
never double-publishes.

| Package              | Version source               | npm                                                     | Release tag         |
| -------------------- | ---------------------------- | ------------------------------------------------------- | ------------------- |
| `@voltui/components` | `projects/volt/package.json` | [npm](https://www.npmjs.com/package/@voltui/components) | `components-vX.Y.Z` |
| `@voltui/cli`        | `cli/package.json`           | [npm](https://www.npmjs.com/package/@voltui/cli)        | `cli-vX.Y.Z`        |
| `volt-ui-mcp`        | `cli/mcp/package.json`       | [npm](https://www.npmjs.com/package/volt-ui-mcp)        | `mcp-vX.Y.Z`        |

## One-time setup: `NPM_TOKEN`

CI needs a token with publish rights:

1. On [npmjs.com](https://www.npmjs.com/) → **Access Tokens** → **Generate New Token** →
   **Automation** (automation tokens bypass 2FA, which is required for CI).
2. In GitHub → repo **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `NPM_TOKEN`
   - Value: the token from step 1.

That's the only secret required (`GITHUB_TOKEN` is provided automatically).

## Cutting a release

1. Open a PR that bumps the version of whatever you're releasing, e.g. in
   `projects/volt/package.json`. Keep [`CHANGELOG.md`](CHANGELOG.md) updated in the
   same PR.
2. Merge to `main`.
3. The **Release** workflow fires, publishes the bumped package(s), and creates the
   GitHub Release. Independent versions are fine — only the packages you bumped go out.

To publish without a version-file change (e.g. the first run, to push the CLI that's
currently behind on npm), trigger it manually: **Actions → Release → Run workflow**.

## Preview locally

Read-only check of what would be published (hits npm, publishes nothing):

```bash
DRY_RUN=1 node scripts/release.mjs
```
