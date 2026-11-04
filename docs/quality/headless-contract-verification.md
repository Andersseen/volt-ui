# Headless contract verification — acceptance record

Verification and stabilization pass over the existing catalog (no new components, no new Quartz
migrations). The primary deliverable is reproducible evidence; the defects it found are fixed with a
failing test first.

|               |                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline      | `main` at `34a0826` (Volt source `1.4.0`; npm `latest` `1.3.3` — 1.4.0 is **not published**)                                                    |
| Quartz        | `@quartz-headless/core` / `@quartz-headless/primitives` **0.16.0** from npm (the only published release; unpublished Quartz `main` is not used) |
| ng-primitives | `0.131.2` (pinned)                                                                                                                              |
| Angular       | workspace 22.2.x; consumers 21.2.0 (declared minimum), 21 latest, 22 latest                                                                     |
| Branch        | `test/volt-headless-contract-verification`                                                                                                      |

**Source vs published.** Everything here was verified from this repository's source, built and
**packed** (`npm pack`), installed into isolated consumer projects. It is not a verification of an npm
release: 1.4.0 has not been published, and 1.3.3 (npm `latest`) has no Quartz entry point at all.

## 1. Evidence status

<!-- evidence:local -->

**Local run** — 2026-11-04, macOS 26 (Darwin 25.6), Node 22.23.1, Playwright 1.64.1, from the source of
this branch, packed. 854 results: **849 passed, 3 failed, 2 skipped** (`scripts/contract-evidence-summary.mjs`).

| suite                                                                         | Angular        | browsers          | passed | failed | skipped |
| ----------------------------------------------------------------------------- | -------------- | ----------------- | -----: | -----: | ------: |
| default-backend contracts + Tier 1 catalog (`playwright.contracts.config.ts`) | workspace 22.2 | Chromium, Firefox |    180 |      0 |     2 ¹ |
| dual backend, four consumer modes (`check-quartz-consumer.mjs 22`)            | 22.2.4         | Chromium, Firefox |    243 |    1 ² |       0 |
| dual backend, four consumer modes (`check-quartz-consumer.mjs 21.2.0`)        | 21.2.0         | Chromium, Firefox |    243 |    1 ² |       0 |
| strict AOT build from the tarball + contracts (`check-angular-compat.mjs 22`) | 22.2.4         | Chromium          |     91 |      0 |       0 |
| strict AOT build from the tarball + contracts (`check-angular-compat.mjs 21`) | 21 latest      | Chromium          |     90 |    1 ³ |       0 |

¹ OTP paste in Firefox: `clipboard permissions are Chromium-only in Playwright` and `Firefox ignores
clipboardData on a synthetic ClipboardEvent` (pre-existing skips) — **NOT TESTED** in Firefox, not passed.
² `browser.spec.ts` › "every backend paints and measures the same", Firefox: hit the 30 s default test
timeout while computing styles for four consumers (no assertion failed). The test now has an explicit
120 s budget and passed in a re-run (`quartz-consumer-ng22-local-rerun`: 2/2). The first result stays a
FAIL in the summary; only the cloud run is a clean record.
³ `catalog.spec.ts` › navigation menu, Escape: the trigger reported `aria-expanded="false"` while its link
stayed in the accessibility tree for 5 s. It ran while a Quartz build used the machine. Not reproduced in
20 isolated repetitions and 200 runs of the whole catalog under 8 workers on the same Angular 21 build.
Together with the unit-test timeout in §7 it is tracked as a possible close-timing race, not a pass.

Install facts (`install.json`): Angular 21.2.0 + Quartz 0.16.0 — strict peer resolution **PASS**;
Angular 22.2.4 + Quartz 0.16.0 — strict peer resolution **FAIL** (`ERESOLVE`, installed with
`--legacy-peer-deps`: runtime evidence only, **not** a strict compatibility pass). Engine isolation
**PASS** for all four bundles (no Quartz in the ng-primitives bundles, no ng-primitives in the Quartz ones).

**WebKit: BLOCKED locally.** `browserType.launch` timed out (180 s) on this machine, inside and outside
the shell sandbox, before any page loaded: an environment limitation, not a product result. WebKit
evidence comes only from the cloud run (GitHub-hosted Ubuntu).

The nine-family matrix of this local run (aggregated over Chromium and Firefox and all four modes):

| family      | Rendering | Pointer | Keyboard   | A11y (automated) | Value / model | Forms | SSR / hydration | Styling | Package | CLI copy |
| ----------- | --------- | ------- | ---------- | ---------------- | ------------- | ----- | --------------- | ------- | ------- | -------- |
| Checkbox    | PASS      | PASS    | PASS       | PASS             | PASS          | PASS  | PASS            | FAIL²   | PASS    | PASS     |
| Switch      | PASS      | PASS    | PASS       | PASS             | PASS          | PASS  | PASS            | FAIL²   | PASS    | PASS     |
| Toggle      | PASS      | PASS    | PASS       | DOC. DIFF.       | PASS          | PASS  | PASS            | FAIL²   | PASS    | PASS     |
| Radio       | PASS      | PASS    | DOC. DIFF. | DOC. DIFF.       | PASS          | PASS  | PASS            | FAIL²   | PASS    | PASS     |
| ToggleGroup | PASS      | PASS    | DOC. DIFF. | DOC. DIFF.       | PASS          | PASS  | PASS            | FAIL²   | PASS    | PASS     |
| Tabs        | PASS      | PASS    | DOC. DIFF. | DOC. DIFF.       | PASS          | N/A   | PASS            | FAIL²   | PASS    | PASS     |
| Accordion   | PASS      | PASS    | DOC. DIFF. | DOC. DIFF.       | PASS          | N/A   | PASS            | FAIL²   | PASS    | PASS     |
| Listbox     | PASS      | PASS    | PASS       | DOC. DIFF.       | PASS          | PASS  | PASS            | FAIL²   | PASS    | PASS     |
| Select      | PASS      | PASS    | DOC. DIFF. | DOC. DIFF.       | DOC. DIFF.    | PASS  | PASS            | FAIL²   | PASS    | PASS     |

"Styling" is FAIL for every family because it is computed from the two paint tests, one of which timed
out once in Firefox (²); the paint comparisons that completed — default theme, dark mode, Ember × Brutal,
Glacier × Soft dark and a custom-token theme — found the engines equal. "DOC. DIFF." = verified,
including an intended difference the tests assert (§4). Manual screen reader: **NOT TESTED** for all.
<!-- /evidence:local -->

### Cloud evidence

**Completed run:** [Volt UI — Contract Evidence #41862692037](https://github.com/Andersseen/volt-ui/actions/runs/41862692037)
on the pull request's head commit `3ad23cd`, 2026-11-04, GitHub-hosted Ubuntu, Node 22.23.4 — conclusion
**success**. Artifacts: [run artifacts](https://github.com/Andersseen/volt-ui/actions/runs/41862692037#artifacts).

1187 results: **1172 passed, 0 failed, 0 flaky, 15 skipped** (no retries in evidence mode).

| suite                                                                       | chromium    | firefox          | webkit            |
| --------------------------------------------------------------------------- | ----------- | ---------------- | ----------------- |
| A — default contracts + Tier 1 catalog                                      | 91 ✓        | 89 ✓ · 2 skipped | 86 ✓ · 5 skipped  |
| B — dual backend, Angular 21.2.0 (strict peers PASS)                        | 122 ✓       | 122 ✓            | 118 ✓ · 4 skipped |
| B — dual backend, Angular 22.2.4 (strict peers FAIL → `--legacy-peer-deps`) | 122 ✓       | 122 ✓            | 118 ✓ · 4 skipped |
| C — strict AOT from the tarball, Angular 21 / 22                            | 91 ✓ / 91 ✓ | –                | –                 |

Skipped, and therefore **NOT TESTED** in that engine (never counted as passed): OTP paste in Firefox
(2) and WebKit (1); WebKit Tab-order checks — radio Tab entry, dialog/drawer Tab trap, tooltip on keyboard
focus, and the new focus-visibility sweep in all four consumer modes ×2 Angular versions — because
Safari does not Tab to buttons by default (`TAB_SKIPS_BUTTONS`). Keyboard behaviour in WebKit is still
exercised by arrow / Enter / Space / Escape tests that focus the control first.

Nine-family matrix from that run (every cell aggregated over three engines and four consumer modes):
all **PASS** except the cells marked **DOCUMENTED DIFFERENCE** (Toggle a11y; Radio, ToggleGroup, Tabs,
Accordion keyboard + a11y; Listbox a11y; Select keyboard, a11y, value and styling — see §4); Forms
**N/A** for Tabs and Accordion. No cell is FAIL, BLOCKED or NOT TESTED. Manual screen reader: NOT TESTED.

Artifacts per run (30-day retention):

| artifact                                        | contents                                                                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `evidence-A-default-<browser>`                  | default-backend browser contracts incl. Tier 1 catalog; `html/` report, `results.json`, `junit.xml`, traces + screenshots for failures                                                                       |
| `evidence-B-dual-backend-ng<angular>-<browser>` | nine families × {ng-primitives, Quartz} × {package, CLI copy}; axe results, paint measurements and screenshots attached to the tests; `install.json` (versions, strict peer result, isolation, bundle sizes) |
| `evidence-C-compat-ng<major>`                   | strict AOT build of the contract fixtures from the tarball on that Angular major + contracts (Chromium)                                                                                                      |
| `evidence-summary`                              | `SUMMARY.md` — the same tables as the job summary                                                                                                                                                            |

## 2. Component inventory

44 public families plus the Sidebar layout. The engine column is what the source imports
(`grep "from 'ng-primitives/…'"`), not what the docs claim.

| Category                                          | Families                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B. ng-primitives and Quartz** (9)               | Accordion, Checkbox, Listbox, Radio, Select, Switch, Tabs, Toggle, ToggleGroup                                                                                                                                                                                                                                    |
| **A. ng-primitives only** (27)                    | Autofill, Avatar, Breadcrumbs, Button, Combobox, Date Picker, Dialog, Drawer, Dropdown Menu, File Upload, Form Field, Input, Input OTP, Meter, Navigation Menu, Pagination, Popover, Progress, Range Slider, Search, Separator, Slider, Textarea, Toast, Toolbar, Tooltip, Table (`ng-primitives/utils` ids only) |
| **C. Own implementation, no headless engine** (3) | Resizable (pointer/keyboard geometry), Native Select (`<select>`, in the Select folder), Theme (`applyVoltTheme` / `provideVoltTheme`)                                                                                                                                                                            |
| **D. Presentation only** (6 + layout)             | Alert, Badge, Card, Empty State, Skeleton, Spinner; Sidebar layout (router links + a service)                                                                                                                                                                                                                     |

Per-family inputs, models, outputs and variants are generated in
`apps/web/src/app/lib/api-reference.generated.ts`; stability, keyboard, focus and Forms support in
`COMPONENT_STATUS.md`; the contract → test map in `specs/behavioral-contracts.md`. This record does
not duplicate them.

### Where each family's browser evidence lives

| Tier                                  | Families                                                                                                                                                                                                        | Suite                                                                                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — catalog smoke (new)               | Alert, Autofill¹, Avatar, Badge, Breadcrumbs, Button, Card, Empty State, Form Field, Input, Meter, Navigation Menu, Pagination, Progress, Search, Separator, Sidebar, Skeleton, Spinner, Table, Textarea, Theme | `e2e/contracts/catalog.spec.ts` (`/contracts.html#catalog`)                                                                                                       |
| 2 — deep browser contracts (existing) | Combobox, Date Picker, Dialog, Drawer, Dropdown Menu, File Upload, Input OTP, Popover, Range Slider, Resizable, Slider, Toolbar, Tooltip, Toast, Native Select                                                  | `e2e/contracts/*.spec.ts`, `e2e/consumer*.spec.ts`                                                                                                                |
| 3 — dual-backend parity               | the nine B families                                                                                                                                                                                             | `e2e/quartz-consumer/{browser,forms-state,a11y-paint}.spec.ts` + `e2e/contracts/*` (default) + the shared jsdom contracts (`packages/volt/testing/*-contract.ts`) |

¹ Autofill: real browser autofill cannot be triggered by automation; the smoke proves typing is not
reported as autofill. Reporting a genuine autofill is **BLOCKED** (environment), not passed.

## 3. Audit of the behavioural-contract matrix

`specs/behavioral-contracts.md` attributes tests to contracts by title. Findings:

1. **A title is not an assertion.** `selection-contract.ts` › "selects on click, closes, **returns
   focus to the trigger** and emits once" never checked focus. Adding the assertion failed for
   ng-primitives: a real defect hidden behind a credited cell (fixed, §5).
2. **Broad patterns over-match.** `two-way: /model/`, `pointer: /press/`, `keyboard: /tab\b/`,
   `accessible name: /label/` credit unrelated tests (e.g. every "tabs:" title counts as keyboard).
   Counts are therefore an upper bound.
3. **The dual-backend browser suite was invisible to it.** `e2e/quartz-consumer` is now layer **Q**.
4. **"Gaps: None" covered 30 interactive rows only.** Presentation families had no row and, for 21
   families, no browser assertion anywhere. Tier 1 closes that; the matrix notes the limit.
5. A render-only test is never counted as interaction proof in this record: the nine-family table
   below is computed from executed results by `scripts/contract-evidence-summary.mjs`, cell by cell,
   with `NOT TESTED` when nothing ran and `BLOCKED` when everything that matched was skipped.

## 4. Known backend differences — classification

From `docs/headless-backends.md`, re-checked against the current source and Quartz 0.16.0.

| Difference                                                                                                            | Class                                                                         | Outcome                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Tabs, `activateOnFocus` off: Enter/Space select with Quartz only                                                      | **A** Volt contract violation (default)                                       | **Fixed** — failing test in `disclosure-contract.ts`, both engines green |
| Select: focus not returned to the trigger after a pointer selection (ng-primitives)                                   | **A** Volt contract violation (default)                                       | **Fixed** — `selection-contract.ts` asserts focus                        |
| Select, empty `multiple` shows no placeholder; `0` / `''` show the placeholder (ng-primitives)                        | **C** default-backend defect in Volt's own template                           | **Fixed** — shared contract test                                         |
| Select: `container`, `scrollToOption`, `allOptions` not available on Quartz                                           | **B** documented, compile-time error rather than silently ignored             | Kept, documented                                                         |
| Select: Quartz moves DOM focus into the popup; ng-primitives uses `aria-activedescendant`                             | **B** both valid combobox patterns; outcome (focus back on trigger) now equal | Kept, documented                                                         |
| Select popup unpositioned for one frame (Quartz)                                                                      | **E** upstream Quartz 0.16 behaviour                                          | Kept; tests wait for geometry, not time                                  |
| RTL: Quartz mirrors Left/Right for Radio / ToggleGroup / Tabs; ng-primitives does not                                 | **E**-like for the default engine (ng-primitives 0.131 behaviour)             | Kept, documented; asserted per engine; follow-up below                   |
| Disabled Toggle / Radio / ToggleGroup item: native `disabled` (Quartz) vs `aria-disabled` + focusable (ng-primitives) | **B** both conform; Volt contract is "inert + `data-disabled`"                | Kept; `forms-state.spec.ts` asserts inertness for both                   |
| Accordion: arrow keys, focus recovery, `aria-disabled` on the only open item (Quartz extras)                          | **B** additive, APG-conformant                                                | Kept                                                                     |
| Listbox: `aria-orientation`, active descendant before focus (Quartz)                                                  | **B**                                                                         | Kept                                                                     |
| Tabs: `hidden` vs `aria-hidden` on inactive panels; no dangling `aria-controls` (Quartz)                              | **B**                                                                         | Kept                                                                     |
| ToggleGroup single with two written values                                                                            | **B** invalid input normalised                                                | Kept                                                                     |
| ng-primitives Accordion open at SSR throws `MutationObserver is not defined`                                          | **E** upstream ng-primitives defect                                           | Kept, documented; fixtures open after hydration                          |

## 5. Confirmed defects fixed

Each had a failing test before the change, observed in a real browser or the shared contract.

| #   | Family (entry)   | Defect                                                                                                                                                                                 | Test that failed first                                                                                             | Evidence                                      |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| 1   | Tabs (default)   | Manual activation unreachable by keyboard                                                                                                                                              | `disclosure-contract.ts` "with activateOnFocus off, Enter and Space select the focused tab, once each"             | red ng-primitives / green Quartz → green both |
| 2   | Select (default) | Pointer selection dropped focus to `<body>`                                                                                                                                            | `selection-contract.ts` "selects on click, closes, returns focus to the trigger…"                                  | red ng-primitives → green both                |
| 3   | Select (default) | Placeholder logic tested truthiness                                                                                                                                                    | `selection-contract.ts` "shows the placeholder exactly when nothing is selected"                                   | red ng-primitives → green both                |
| 4   | Accordion (both) | `grid` discarded by `twMerge`: closed Quartz panels left full-height gaps; re-closed ng-primitives `multiple` items stayed visible (observed: `hidden` absent, 36 px, 3 s after close) | `a11y-paint.spec.ts` "layout: a closed accordion panel takes no space" + paint sweep (body height 3260 vs 3476 px) | packed consumers, Chromium + Firefox          |
| 5   | Toggle (both)    | Pressed `solid` text contrast 1.22:1 (light) / 1.12:1 (dark): classes bypassed `cn()`                                                                                                  | `visual-state.spec.ts` "toggle: every pressed variant meets WCAG AA text contrast"; axe in `a11y-paint.spec.ts`    | axe `color-contrast` serious → none           |
| 6   | Skeleton         | Inline host: 0×0 inside a block parent (the documented usage)                                                                                                                          | `catalog.spec.ts` "skeleton: takes the requested size…" (received width 0)                                         | Chromium + Firefox                            |
| 7   | Table            | Caption did not name the table                                                                                                                                                         | `table.spec.ts` "a caption names the table…", `catalog.spec.ts` table                                              | jsdom + browsers                              |

Release requirement: none of these is on npm. If 1.4.0 is still unpublished at merge they ship in
1.4.0, otherwise in 1.4.1 (`RELEASING.md`: never re-publish a version).

## 6. Accessibility evidence categories

| Category                                                                                                                         | Status                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Automated ARIA (roles, names, states, valid `aria-controls` / `-labelledby` / `-activedescendant`, unique ids)                   | Browser, both engines, four modes                                                                                   |
| axe-core 4.14 (WCAG 2.0/2.1/2.2 A + AA tags) on five functional states per consumer                                              | Browser, both engines, four modes                                                                                   |
| Keyboard and focus (Tab order, roving, arrows, Home/End, Escape, focus-visible ring, focus return, hidden content not focusable) | Browser; Tab-order checks skip WebKit, where Tab does not reach buttons by default (platform behaviour, not a pass) |
| Visual contrast                                                                                                                  | `pnpm check:contrast` (tokens) + axe `color-contrast` on rendered states, light and dark                            |
| **Manual screen reader** (VoiceOver, NVDA, JAWS, TalkBack)                                                                       | **NOT TESTED** — checklist: [`manual-a11y-checklist.md`](manual-a11y-checklist.md)                                  |

## 7. Follow-ups (outside this scope)

- RTL arrow mirroring on the default engine (Radio, ToggleGroup, Tabs): decide whether Volt owns it
  (wrapper key remap) or waits for ng-primitives; today it is a documented per-engine difference.
- Quartz peer ranges: 0.16.0 declares `@angular/* ^21`; Angular 22 installs only with
  `--legacy-peer-deps` (strict resolution: FAIL, recorded in `install.json`). Needs a Quartz release.
- Navigation Menu, Escape under load: `navigation-menu.spec.ts` › "closes the open submenu on Escape"
  timed out once under `test:coverage` (passed 4/4 in isolation, also on clean `main`), and the catalog
  smoke saw the panel outlive `aria-expanded="false"` once under machine load (§1 ³). Two independent
  signals on the same close path: investigate the content's exit-animation wait before calling it flaky.
- `pnpm format:check` fails on three files untouched here (`cli/bin/volt`, `scripts/check-seo.mjs`,
  `scripts/check-ssr.mjs`); the script is not part of `ci.yml`.

## 8. Reproduce

```bash
pnpm build:lib
EVIDENCE_DIR=$PWD/evidence EVIDENCE_LABEL=default-local \
  pnpm exec playwright test -c playwright.contracts.config.ts            # default backend + catalog
EVIDENCE_DIR=$PWD/evidence EVIDENCE_LABEL=ng22-local \
  node scripts/check-quartz-consumer.mjs 22 --no-build                     # nine families, four modes
EVIDENCE_DIR=$PWD/evidence EVIDENCE_LABEL=ng21.2.0-local \
  node scripts/check-quartz-consumer.mjs 21.2.0 --no-build
EVIDENCE_DIR=$PWD/evidence EVIDENCE_LABEL=compat-ng21 node scripts/check-angular-compat.mjs 21 --no-build
node scripts/contract-evidence-summary.mjs evidence --out evidence/SUMMARY.md
```

Open `evidence/<suite>/html/index.html` for the report of each suite. Without `EVIDENCE_DIR` every
config keeps its normal CI behaviour.
