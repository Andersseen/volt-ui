# CLAUDE.md

Agent context for this repo lives in `AGENTS.md` (shared by all AI tools) and
`specs/GUARDRAILS.md` (hard rules). They are imported below rather than duplicated —
edit those files, not this one.

@AGENTS.md

@specs/GUARDRAILS.md

## Claude Code automation in this repo

Configured in `.claude/` and committed, so every contributor gets it:

| What                     | Where                            | Behavior                                                                                        |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/new-component <name>`  | `.claude/skills/new-component/`  | Scaffolds a component and completes all six ripple effects                                      |
| `/run-plan <version>`    | `.claude/skills/run-plan/`       | Executes a `specs/plans/vX.Y.md` under the SPEC.md §5 protocol                                  |
| `/release-check [--fix]` | `.claude/skills/release-check/`  | Audits local versions vs npm vs Releases vs Actions vs the deploy; repairs with `--fix`         |
| `/verify-ui <name>`      | `.claude/skills/verify-ui/`      | Drives the component in a real browser: a11y tree, keyboard path, non-default theme             |
| `/theme-audit <name>`    | `.claude/skills/theme-audit/`    | Sweeps a component across the 5 × 5 presets + dark mode for tokens that only resolve by default |
| `ssr-safety-reviewer`    | `.claude/agents/`                | Audits for browser-API access that breaks SSR (passes jsdom, fails `pnpm build`)                |
| `a11y-reviewer`          | `.claude/agents/`                | Audits ARIA, keyboard, focus, and ng-primitives delegation                                      |
| ripple-check hook        | `.claude/hooks/ripple-check.mjs` | After editing `projects/volt/src/lib/**`, reports which ripple effects are still missing        |
| ai-docs gate hook        | `.claude/hooks/ai-docs-gate.mjs` | Blocks end-of-session on `pnpm check:ai-docs` drift                                             |

## MCP servers

Configured in `.mcp.json` (committed, so the whole team gets them — Claude Code reads
project MCP servers from there, not from `.claude/settings.json`). Reach for the right
one instead of guessing or re-deriving from source:

| Server            | Use it for                                                              | Reach for it when                                                        |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ngp-mcp`         | ng-primitives API — directives, inputs, outputs, data attributes        | **Before writing any component template.** Never guess a primitive's API |
| `angular-cli`     | Angular 21 docs and best practices                                      | Signals, zoneless, control flow, SSR questions                           |
| `volt-ui`         | This library's own catalog, as a consumer sees it                       | Verifying what the published surface exposes                             |
| `playwright`      | Driving the docs app — accessibility tree, keyboard, focus, interaction | **Verifying UI work before calling it done** (see below)                 |
| `chrome-devtools` | Performance traces (LCP/CLS/INP), network, CPU/network throttling       | Bundle and perf audits (`specs/plans/v0.9.md` Phase 2)                   |
| `codebase-memory` | A persistent code knowledge graph — symbols, call paths, architecture   | Orienting in unfamiliar areas or tracing a symbol across 30+ components  |
| `github`          | Issues, PRs, CI runs                                                    | Reading a failing CI log, filing or triaging issues                      |

`ngp-mcp` runs from the **local install** (`npx --no-install ngp-mcp`) so its API surface
always matches the pinned `ng-primitives` version in `package.json`. Do not change it to
`npx -y @ng-primitives/mcp` — that fetches the latest release, which drifts ahead of the
pinned version and will describe primitives this repo does not have.

`codebase-memory` needs an explicit index before its queries return anything — it starts
with `autoindex.skip reason=disabled`. Once per clone (and after large refactors) call its
`index_repository` tool with this repo's absolute path, or flip its `auto_index` config on
once. Either way the graph lands in `~/.cache/codebase-memory-mcp/`, outside the repo. It answers
"where is this used / what calls this / what is the shape of this area" far more cheaply
than a grep sweep across 30+ components — but it is an index, so it can be stale. Anything
it reports about a specific line, verify by reading the file.

### Verifying UI work before delivering

Unit tests run in jsdom, where focus emulation is unreliable and nothing is actually
painted. Neither `pnpm test:run` nor `pnpm typecheck` can tell you a component _looks_
and _behaves_ right. For any change to a component's template, styles, or interaction,
verify in a real browser before reporting done:

1. `pnpm dev` (docs app on Vite) and navigate to `/docs/components/<name>`.
2. Take an **accessibility snapshot** with `playwright` — it returns the a11y tree, so it
   shows roles, names, and states rather than pixels. This is the fastest way to confirm
   the ARIA contract in `specs/patterns/overlay-tests.md` actually holds at runtime.
3. Exercise the keyboard path: Tab order, arrow keys on composites, Escape on overlays,
   focus return to the trigger on close.
4. Check at least one non-default theme — the repo ships 5 color × 5 style presets plus
   dark mode, and Tailwind semantic tokens are exactly what breaks across presets.

Findings from a real browser beat assertions from jsdom. If the two disagree, the
browser wins and the test is wrong.

## RTK — token-optimized shell output

[RTK](https://www.rtk-ai.app/) (Rust Token Killer) is a CLI proxy that filters verbose
command output before it reaches the context window. `rtk lint`, `rtk vitest`, `rtk tsc`,
`rtk git status` and ~100 more return the same information with the noise removed.

It is **opt-in per machine**, because the integration is a global Claude Code hook rather
than repo config:

```bash
brew install rtk-ai/tap/rtk   # or: curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
rtk init -g                   # installs the PreToolUse hook in ~/.claude/settings.json
rtk trust                     # run inside this repo — enables the committed .rtk/filters.toml
```

`rtk init -g` registers a `PreToolUse` hook on `Bash` (`rtk hook claude`) that rewrites
commands to their `rtk` equivalent automatically, so nothing about how you invoke commands
changes. Without it, RTK simply does not run — no breakage, no savings.

Do **not** run a bare `rtk init` in this repo: local mode injects a large instruction block
straight into `CLAUDE.md`, and this file is curated (edit `AGENTS.md`, not this one).

`.rtk/filters.toml` **is** committed. It adds the two filters RTK has no built-in for —
the ng-packagr library build and the manifest/AI-docs generators — and carries inline
tests. RTK refuses project-local filters until you `rtk trust` the directory, since the
file arrives via git. After editing it, validate with `rtk verify`, which runs those tests.
Do not add filters for `vitest`, `lint`, `tsc`, `prettier`, `playwright`, `pnpm`, `git` or
`gh`: RTK already ships better built-ins, and a same-named project filter shadows them.

## Deny-listed paths

Generated output is not editable: `dist/`, `coverage/`, `playwright-report/`,
`test-results/`, `public/manifest.json` (regenerate with `pnpm manifest`), `pnpm-lock.yaml`.
