# GUARDRAILS — Hard Rules for Executing Agents

Read this before writing any code. These rules are absolute; a plan never overrides them.
If a rule seems to conflict with your task, STOP and record it in the plan's
"Open questions" section instead of guessing.

## Hard rules (never violate)

| #   | Rule                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **pnpm only.** Never run `npm install` / `yarn` inside the repo.                                                                                                      |
| 2   | **No `tailwind.config.js`.** Tailwind v4 is CSS-configured (`@theme inline`). Its absence is intentional.                                                             |
| 3   | **No NgModules.** Standalone components, `ChangeDetectionStrategy.OnPush`, signals API (`input()`, `output()`, `model()`, `computed()`).                              |
| 4   | Boolean inputs always: `input<boolean, unknown>(false, { transform: booleanAttribute })`. Numeric inputs use `numberAttribute`.                                       |
| 5   | Never edit generated/output dirs: `dist/`, `coverage/`, `playwright-report/`, `test-results/`, `public/manifest.json` (regenerate with `pnpm manifest`).              |
| 6   | Library selectors are `volt-*`, classes `Volt*`. Never hand-write `ui-*` in the library — the CLI does that transform for consumers.                                  |
| 7   | Library code (`projects/volt/`) must never import from the docs app (`src/`). Components must stay copyable standalone.                                               |
| 8   | No zone.js reliance in tests: the repo is zoneless. Don't use `fakeAsync`/`tick`; use `await` + `fixture.whenStable()` / testing-library `userEvent`.                 |
| 9   | SSR safety: no `document`/`window`/`localStorage` access at component construction or in field initializers. Guard with `afterNextRender()` or `isPlatformBrowser()`. |
| 10  | No new npm dependencies without writing the justification in the active plan file first.                                                                              |
| 11  | Never publish to npm or deploy unless the plan's release phase explicitly says so.                                                                                    |
| 12  | Stay inside the active plan's scope. Work belonging to another minor → add a note to THAT plan file; do not do it.                                                    |

## Required ripple effects (when you touch component files)

Adding, renaming, or deleting any file in `projects/volt/src/lib/` requires ALL of:

1. `projects/volt/src/public-api.ts` — export updated.
2. `src/app/lib/snippets/index.ts` — `?raw` import + `*_SNIPPET` export updated.
3. `src/app/lib/snippets/usage.ts` — usage example updated.
4. Demo page in `src/app/pages/(components-docs)/docs/components/` updated.
5. `pnpm manifest` — regenerates `public/manifest.json`.
6. `COMPONENT_STATUS.md` — if status/coverage changed.

Skipping any of these WILL break CI or the CLI. See `specs/patterns/docs-page.md`.

## Session protocol

- Before starting: run the plan's "Verify entry state" commands. If they fail, fix entry
  state or stop — don't build on a broken base.
- Work task by task; after each meaningful unit run the narrow check first
  (`pnpm vitest --run <file>`), full suite before committing.
- Check off plan checkboxes and update the plan's **Status** header as you go.
- **Blocked or unsure > ~15 minutes on one decision?** Write it under an
  `## Open questions` heading at the bottom of the plan file (create it if missing),
  pick the most conservative interpretation or skip the task, and continue.
  Never invent APIs, never delete tests to make CI pass, never loosen a test assertion
  just to go green.
- Commits: small, conventional style (`feat:`, `fix:`, `test:`, `docs:`, `chore:`),
  matching recent `git log` style. Do not push unless asked.

## Troubleshooting (check here BEFORE debugging from scratch)

| Symptom                                                                        | Fix                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matchMedia is not a function` / `ResizeObserver is not defined` in unit tests | Mocks live in `test-setup.ts`; make sure you run via `pnpm vitest`, not `ng test`.                                                                                          |
| Playwright: "browser not found"                                                | `pnpm exec playwright install` (add `--with-deps` on Linux CI).                                                                                                             |
| `ng build volt` fails on missing export                                        | You forgot `public-api.ts` (ripple effect #1).                                                                                                                              |
| CLI copies stale/missing files                                                 | You forgot `pnpm manifest` (ripple effect #5).                                                                                                                              |
| SSR/prerender crashes on a page                                                | Unguarded `document`/`window` (hard rule 9). `grep -n "document\.\|window\." <component>.ts`                                                                                |
| Test can't find element by role                                                | ng-primitives renders state via `data-*` attributes (`data-checked`, `data-disabled`); assert on those or use `screen.getByRole` with the semantic role the primitive sets. |
| `pnpm release:check` npm-cache permission errors                               | Scripts already use repo-local `.npm-cache`; don't "fix" by using the global cache.                                                                                         |
| Husky blocks a commit                                                          | Fix the lint error. Never use `--no-verify`.                                                                                                                                |

## Where things are (quick map)

```text
projects/volt/src/lib/components/<name>/   component (+ index.ts, variants.ts?, <name>.spec.ts)
projects/volt/src/lib/layouts/<name>/      layout components (sidebar)
projects/volt/src/lib/utils.ts             cn() = twMerge(clsx(...))
projects/volt/src/public-api.ts            public surface (frozen at v0.9)
projects/volt/src/themes/                  --volt-* tokens, presets
src/app/pages/(components-docs)/docs/components/<name>.page.ts   demo pages
src/app/lib/snippets/{index,usage}.ts      copy-code snippets
cli/                                       @voltui/cli (own package, ignored by root eslint)
e2e/                                       Playwright tests
specs/                                     SPEC.md + plans + patterns (you are here)
```
