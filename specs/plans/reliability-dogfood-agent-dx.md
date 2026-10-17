# Plan — Reliability, Dogfooding & Agent DX

**Status:** implemented on `feat/reliability-dogfood-agent-dx`; awaiting CI and review.
**Base:** `main` @ `5c4a767` (after PR #174). **Starts at:** `@voltui/components` 1.3.1, `@voltui/cli` 1.3.1, `@voltui/agent` 0.5.0.
**Ships:** `@voltui/components` / `@voltui/cli` **1.3.2**, `@voltui/agent` **0.6.0**. Nothing is published by this plan (rule 11).

Not in scope, and not done: new components or features, a Quartz/headless layer, Storybook rebuild, new
theme presets, DataTable, a Button loading API.

## Principle

> Coverage is a side effect of meaningful tests, not their purpose. A stable component is verified
> when its public consumer behaviour is observed through the DOM and, where it matters, in a real
> browser. — [`../TESTING.md`](../TESTING.md)

## Phases

- [x] **0. Entry state.** `main` synchronised; #164, #171, #172, #173 (and #174) merged; CI green on `main`;
      the _Release_ run after #174 had failed (`Missing public/manifest.json` — fixed, below).
- [x] **1. Quality rule** documented: `specs/TESTING.md`, GUARDRAILS 13, AGENTS.md "Testing".
- [x] **2. Behavioural-contract inventory:** `specs/behavioral-contracts.md` (generated from the real test
      names; per component, which contracts apply and which tests prove them; 0 gaps against the map).
- [x] **3. Stateful Value Contract** extended to default / static / dynamic one-way / two-way / forms
      (`behavior-contract.spec.ts`, `interaction-contract*.spec.ts`).
- [x] **4. Primitive state-ownership audit:** `specs/state-ownership.md`; `mirrorValue()` applied only
      where the ownership model needs it.
- [x] **5–6. Behaviour not implementation; duplicate outputs and feedback loops:** one emission per user
      action, none for a parent update, asserted per component.
- [x] **7–9. Real-browser contract suite** `e2e/contracts` (Chromium, Firefox, WebKit) against the built
      package, with the 1.3.0 static-value regression for every value component.
- [x] **10–13. Storybook as the state layer:** state stories (Toggle States, Checkbox/Switch/Radio
      Invalid, Radio States, Combobox manual Loading/Results/Empty), `REQUIRED_STATES`, Playwright state +
      theme + axe tests; visible pressed/selected/checked states asserted on computed styles.
- [x] **14–19. Dogfooding:** Volt-first rule, `pnpm check:dogfood`, `specs/dogfood-inventory.md`.
- [x] **20–32. Agent architecture:** MCP = facts, skills = decisions; 7 skills; installer 0.6.0;
      generated catalog/responsibilities; `check:ai-docs` compares AI content with the library.
- [x] **33–37. Repo's own agent rule, review checklist, docs/Storybook split** (AGENTS.md).
- [x] **38–39. Angular compatibility and package consumers:** `check:angular-compat 21|22`.
- [x] **40. Versions.** **42–45.** CI structure, verification, PR.

## Bugs found (each reproduced by a failing test first)

| #   | Component         | Defect                                                                                              | Found by                       |
| --- | ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | range-slider      | static `[low]`/`[high]` froze after the first key (controlled-mode latch)                           | `behavior-contract.spec.ts`    |
| 2   | date-picker       | static `[date]` froze; `[(date)]` never saw a calendar click                                        | `behavior-contract.spec.ts`    |
| 3   | date-range-picker | static `[startDate]`/`[endDate]` froze                                                              | `behavior-contract.spec.ts`    |
| 4   | pagination        | static `[page]` froze (the only spec checked that it rendered)                                      | `interaction-contract.spec.ts` |
| 5   | combobox          | with a selected value, opening offered only that option                                             | `behavior-contract.spec.ts`    |
| 6   | radio-group       | default vertical orientation never reached the primitive: Left/Right in a column, Up/Down dead      | `e2e/contracts`                |
| 7   | date-picker       | previous/next month were not buttons (no role, no tab stop)                                         | `e2e/contracts`                |
| 8   | date-picker       | never marked a form control touched; a form-set date in another month was off screen                | `interaction-contract-2/3`     |
| 9   | tooltip           | documented 300 ms / 100 ms / 8 px / `useTextContent` defaults never applied                         | defaults audit                 |
| 10  | radio-item        | no accessible name with `<label for>`/`aria-label` (`aria-labelledby` → empty span; `id` on host)   | Storybook axe scan             |
| 11  | toggle            | pressed colour failed WCAG AA contrast                                                              | Storybook axe scan             |
| 12  | package           | peers excluded Angular 22 (`ERESOLVE`); `@angular/router` and `@angular/cdk` undeclared             | `check:angular-compat`         |
| 13  | mcp               | `get_usage_example` told agents to import `UiButton` from `@voltui/components`                      | `mode` tests                   |
| 14  | mcp/content       | `<ui-form-field-label>` snippets, `ui-file-upload` attribute, prompt calling stable components beta | `check:ai-docs`                |
| 15  | docs              | "click to upload" on a drop-only dropzone                                                           | browser contract               |
| 16  | release workflow  | `pack:cli` ran without `public/manifest.json`                                                       | main's failing Release run     |

Components with no change needed after audit: accordion, tabs, navigation-menu, listbox, slider,
toggle-group, checkbox, switch, toggle, select, input, textarea, input-otp, dialog, drawer, popover,
dropdown-menu, toast, resizable, toolbar, file-upload, search, native-select, progress, meter.

## Decisions

- **Dependency (rule 10): `axe-core` 4.14.0 as a devDependency.** Already in the lockfile through
  `@storybook/addon-a11y`; now a direct dependency so `e2e/storybook/states.spec.ts` can run an axe scan
  against representative stories. It found two real defects (#10, #11). No runtime effect.
- **`model()` outputs report any change** (user, parent or forms); only components with a user-driven
  output are held to "a programmatic write is not a user change". See `state-ownership.md`.
- **`@angular/cdk` is declared as a peer** although Volt never imports it: it is `ng-primitives`'
  peer, and npm resolves an undeclared one to the newest CDK, which breaks an older Angular. The
  install line is now `npm install @voltui/components @angular/cdk`.
- **Versions.** Compatible behavioural fixes plus a peer-range widening → patch **1.3.2**. `radio-item`
  gained `id` / `ariaLabel` inputs; they are additive and exist only to make the already-documented
  `<volt-radio-item id=… >` + `<label for>` usage work (the same inputs `volt-checkbox` has), so the
  release stays a patch rather than a `1.4.0` manufactured by the size of the work. The agent's move
  from one skill to seven plus new MCP tools is an additive product feature → **0.6.0**.
- **Browser matrix.** Contracts run in Chromium, Firefox and WebKit; Safari does not Tab to buttons by
  default, so Tab-order assertions skip WebKit instead of being weakened.

## Open questions / known gaps

- **Glossa copy was not changed** (the Glossa MCP could not connect in this session). The AI pages
  (`/docs/ai-skill`, `/docs/ai-mcp`, `/docs/mcp`, `/docs/ai-prompt`) still describe "the skill" in the
  singular and the install line without `@angular/cdk`; the Angular badge/README were updated. Those
  keys need updating through Glossa, locale-complete (en, es, uk).
- **Toggle-group tab stop** is its first item, not the pressed one (APG radio pattern). Needs a
  roving-focus initial-item seam; not changed.
- **Popover offset** is 4 px, not the documented 8 px (only tooltip's defaults were corrected).
- **CLI copy mode on Angular 21** installs `ng-primitives` without pinning `@angular/cdk` to the app's
  major; `check:angular-compat` covers the package, not the CLI install step.
- `specs/behavioral-contracts.md` is a map by test title, not proof; regenerating it runs the unit suite.
