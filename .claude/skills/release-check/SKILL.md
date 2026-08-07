---
name: release-check
description: Audit the whole release chain — local versions vs npm vs GitHub Releases vs Actions runs vs the Cloudflare deploy — and repair whatever drifted. Usage: /release-check [--fix]
disable-model-invocation: true
---

# Release chain check

This repo releases through two workflows that both fire on a push to `main`:

- `.github/workflows/ci.yml` — verify, then **deploy** to Cloudflare Pages
- `.github/workflows/release.yml` — runs `scripts/release.mjs`, which publishes any
  package whose local version is not yet on npm and creates a GitHub Release per package

Both are `on: push` **and** `workflow_dispatch`. That second trigger is the whole point of
this skill: on 2026-08-06 two PRs (#72, #73) merged to `main` and GitHub simply never
queued a run. Versions said `1.0.0`, npm said `0.9.0`, and nothing was deployed. Nothing
in the repo was broken — the push event was just lost. A green `main` is not evidence that
a release happened; only npm and the Releases list are.

Argument: `--fix` to dispatch the missing workflows after reporting. Without it, report only.

## Step 1 — Collect the five sources of truth

Run these and put the answers in one table. Do not skip any: the failure mode is always a
mismatch _between_ two of them, so a partial read tells you nothing.

```bash
# 1. Local versions (what the repo thinks it is)
node -p "require('./projects/volt/package.json').version"   # @voltui/components
node -p "require('./cli/package.json').version"             # @voltui/cli
node -p "require('./cli/mcp/package.json').version"         # volt-ui-mcp

# 2. What is actually on npm
npm view @voltui/components version
npm view @voltui/cli version
npm view volt-ui-mcp version

# 3. GitHub Releases (tags are components-vX / cli-vX / mcp-vX)
gh release list --limit 10

# 4. Did a run even happen for the tip of main?
git log origin/main -1 --format='%H %ci %s'
gh run list --branch main --limit 10

# 5. Is main pushed at all?
git fetch origin --prune && git rev-list --left-right --count main...origin/main
```

## Step 2 — Diagnose against this table

| Symptom                                          | Meaning                                      | Fix                                                 |
| ------------------------------------------------ | -------------------------------------------- | --------------------------------------------------- |
| local version > npm version                      | release never ran, or ran and failed         | dispatch `release.yml` (Step 3)                     |
| no run whose commit == tip of `main`             | **GitHub dropped the push event**            | dispatch both workflows                             |
| npm has the version but no GitHub Release        | publish succeeded, `gh release create` died  | re-dispatch `release.yml` — it is idempotent        |
| Release run green but npm unchanged              | all versions already current — nothing to do | none; this is the healthy no-op                     |
| CI green but no `Deploy to Cloudflare Pages` job | run came from a `pull_request` event         | dispatch `ci.yml` on `main`                         |
| `main...origin/main` is not `0 0`                | local main is not what CI sees               | push (or reset) before drawing any other conclusion |
| deploy job failed on `wrangler`                  | expired `CLOUDFLARE_API_TOKEN` secret        | rotate the secret; do not retry blindly             |

Read the local versions from the **files**, never from a tag or from memory — the whole
bug class here is a version that exists in git but nowhere else.

## Step 3 — Repair (only with `--fix`, and only what Step 2 named)

Preview first. `scripts/release.mjs` honours `DRY_RUN=1`, which prints exactly which
packages it would publish without touching npm:

```bash
DRY_RUN=1 node scripts/release.mjs
```

Then dispatch only the workflow that is actually missing:

```bash
gh workflow run release.yml --ref main     # publish + GitHub Releases
gh workflow run ci.yml --ref main          # verify + Cloudflare Pages deploy
```

`ci.yml`'s deploy job is gated on `github.event_name != 'pull_request' && github.ref ==
'refs/heads/main'`, so a `workflow_dispatch` on `main` does deploy. Watch them:

```bash
gh run list --limit 3
gh run watch <run-id>
```

## Step 4 — Confirm, don't assume

A green run is not proof. Re-read the two external sources and say the actual numbers:

```bash
npm view @voltui/components version && npm view @voltui/cli version
gh release list --limit 4
gh run view <ci-run-id> --json jobs --jq '.jobs[] | "\(.name): \(.conclusion)"'
```

The deploy is only real when the log shows `Deployment complete` from wrangler.

## Guardrails

- `scripts/release.mjs` is idempotent — versions already on npm are skipped. Re-running is
  safe and is the correct response to a partial failure. Never hand-publish to "catch up".
- Never `npm publish` from your machine to work around a broken workflow. The workflow runs
  lint, typecheck, `check:ai-docs`, coverage, packaging and e2e first; your shell does not.
- Never move or delete a published tag. If a version is wrong, ship the next patch.
- Publishing and deploying are hard rule 11 in `specs/GUARDRAILS.md` — a human asks for
  them explicitly. This skill reports by default and only acts on `--fix`.
