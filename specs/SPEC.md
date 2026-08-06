# Volt UI — Product Spec (Spec-Driven Development)

**Current version:** 1.0.0
**Status:** Release ladder complete — Volt UI is stable.
**Last updated:** 2026-08-06

This is the master spec. It defines _what_ v1.0 was (§2) and records _how_ the work was
divided into minor-version plans (§4, now complete) and the policy that replaces the
ladder post-1.0 (§7). Each plan in [`specs/plans/`](plans/) is self-contained and was
designed to be executed in a fresh session (potentially by a smaller/cheaper model)
**without re-analyzing the repository from scratch** — the same pattern applies to any
future major-version plan.

---

## 1. Vision

**Volt UI is shadcn/ui for Angular.**

| shadcn/ui (React)       | Volt UI (Angular)                                                           |
| ----------------------- | --------------------------------------------------------------------------- |
| Radix UI primitives     | **ng-primitives** (behavioral/a11y layer)                                   |
| Tailwind CSS            | **Tailwind CSS v4** (CSS-only config)                                       |
| `cva` variants          | **class-variance-authority** (`variants.ts` per component)                  |
| `npx shadcn add`        | **`volt add <component>`** (`@voltui/cli`)                                  |
| Copy-paste ownership    | Same — source is copied into the consumer project (`volt-*` → `ui-*`)       |
| Theme via CSS variables | Same — `--volt-*` tokens + `@theme inline`, 5 colors × 5 styles × dark mode |

Consumers own the code. The npm package `@voltui/components` ships the theme CSS and
runtime utilities; the CLI copies component source into the consumer's project.

## 2. What v1.0 means (Definition of Done for the major)

1. **Every shipped component is `stable` or `beta`** — no `experimental` labels remain
   in `COMPONENT_STATUS.md`. Anything not ready is removed from the public API, not shipped broken.
2. **Forms contract:** every form control implements `ControlValueAccessor`, passes
   reactive + template-driven form tests (write / change / touched / disabled), and
   respects validation styling.
3. **Overlay contract:** every overlay (dialog, drawer, popover, dropdown-menu, tooltip,
   toast) handles focus trap/return, Escape, outside click, nesting, and is SSR-safe.
4. **Docs completeness:** every public component has a demo page, source snippet, usage
   snippet, and API documentation.
5. **Theme system audited:** WCAG AA contrast on all 25 presets (light + dark), plus a
   documented guide for authoring custom presets.
6. **CLI validated end-to-end:** `volt init` + `volt add` for every component works in a
   fresh Angular 21 consumer app (verified by automated consumer fixture tests).
7. **API frozen:** public input/output names, selectors, and CVA export names are frozen;
   post-v1 breaking changes require a major version.
8. **Published:** `@voltui/components@1.0.0` and `@voltui/cli@1.0.0` on npm, with a
   migration guide from 0.x.

## 3. Non-goals (unchanged from SDD.md)

- No Angular < 21 support. No Tailwind v3 / `tailwind.config.js`.
- No black-box UI kit — source ownership is the model.
- No re-implementation of a11y primitives (ng-primitives is the layer for v1;
  a first-party headless layer under `@volt-ui/core` is reserved for **post-v1**).

## 4. Release ladder (one plan per minor) — complete

| Version | Theme                               | Plan file                      | Status |
| ------- | ----------------------------------- | ------------------------------ | ------ |
| 0.5.0   | Form controls hardening             | [plans/v0.5.md](plans/v0.5.md) | done   |
| 0.6.0   | Overlay hardening                   | [plans/v0.6.md](plans/v0.6.md) | done   |
| 0.7.0   | Composite components                | [plans/v0.7.md](plans/v0.7.md) | done   |
| 0.8.0   | Theme system & docs completeness    | [plans/v0.8.md](plans/v0.8.md) | done   |
| 0.9.0   | CLI, distribution & API freeze (RC) | [plans/v0.9.md](plans/v0.9.md) | done   |
| 1.0.0   | Stable release                      | [plans/v1.0.md](plans/v1.0.md) | done   |

The ladder from 0.5.0 to 1.0.0 is complete — see [`CHANGELOG.md`](../CHANGELOG.md) for
release-by-release detail. Post-1.0 work follows the stability policy in §7 below, not
this ladder.

Rules (still apply to any post-1.0 minor/patch plan):

- **One minor = one plan = one (or a few) working sessions.** Plans are split into
  phases; a session may execute one phase or several, but never mixes plans.
- Plans are executed **in order**. Each plan's "Entry state" section says what must be
  true before starting.
- The executing session updates the plan file's checkboxes and the **Status** header as
  work progresses, so the next session can resume mid-plan without re-analysis.
- Every plan ends with the same release gate: `pnpm release:check` green, version bumps,
  `CHANGELOG.md` entry, `COMPONENT_STATUS.md` updated.

## 5. Execution protocol for a session picking up a plan

1. Read [`GUARDRAILS.md`](GUARDRAILS.md) — hard rules, required ripple effects,
   troubleshooting. It overrides everything except direct user instructions.
2. Read the plan file top to bottom. Its **Context primer** replaces repo analysis.
3. Verify entry state with the commands listed in the plan (cheap, < 1 min).
4. Work phase by phase. Check off tasks in the plan file as you complete them.
5. Copy code shapes from [`specs/patterns/`](patterns/) instead of inventing them
   (component anatomy, form-control contract tests, overlay tests, docs pages).
6. Follow the conventions in `AGENTS.md` and `SDD.md` §5 (component model) — they are
   authoritative for code style; the plan is authoritative for scope.
7. Never expand scope: if you find work belonging to a later minor, add a note to that
   plan file instead of doing it.
8. Before finishing a session: run the plan's verification commands, update the plan's
   Status header (`not started` / `in progress — phase N` / `done`), and update
   `CHANGELOG.md` under an `[Unreleased]` heading if the minor isn't released yet.

## 6. Reference documents

| File                  | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `SDD.md`              | Architecture, component model, conventions (detail)           |
| `AGENTS.md`           | Contribution conventions and required commands                |
| `COMPONENT_STATUS.md` | Per-component stability labels — keep in sync                 |
| `CHANGELOG.md`        | Keep a Changelog format, semver                               |
| `specs/SPEC.md`       | This file — vision + release ladder                           |
| `specs/plans/*.md`    | Executable per-minor plans                                    |
| `specs/GUARDRAILS.md` | Hard rules, ripple effects, troubleshooting                   |
| `specs/patterns/*.md` | Canonical code shapes to copy (components, tests, docs pages) |

## 7. Post-1.0

The 0.5→1.0 ladder in §4 is done; this repo isn't going back to a "one plan per minor"
cadence for routine work. Post-1.0 changes follow ordinary semver (see `SDD.md` §12.0):
breaking changes need a major-version plan, features need a minor-version plan, fixes
are ordinary patches that don't need a `specs/plans/*.md` file at all.

The one exception already reserved: a first-party headless primitives layer under
`@volt-ui/core`, meant to eventually replace `ng-primitives` as the accessibility/behavior
layer (see §3's non-goals — explicitly out of scope for `1.0`). That project gets its own
future spec when it starts; nothing about it is planned or scoped here.
