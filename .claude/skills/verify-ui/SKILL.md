---
name: verify-ui
description: Verify a component in a real browser — a11y tree, keyboard path, and a non-default theme — before calling UI work done. Usage: /verify-ui <component>
disable-model-invocation: true
---

# Verify UI work in a real browser

Unit tests run in jsdom, where focus emulation is unreliable and nothing is painted.
Neither `pnpm test:run` nor `pnpm typecheck` can tell you a component _looks_ or _behaves_
right. This skill is the CLAUDE.md "Verifying UI work before delivering" playbook, made
repeatable.

Argument: the component name in kebab-case (e.g. `dialog`, `select`). With no argument,
infer it from the files changed in the working tree and say which one you picked.

Run this for any change to a component's template, styles, or interaction. Skip it for
pure refactors with no rendered output change — and say that you skipped it, and why.

## Step 1 — Get the docs app up

```bash
pnpm dev    # Vite docs app; run in background, note the port it prints
```

Navigate with `playwright` to `/docs/components/<name>`. If the page 404s, the demo page is
missing — that is ripple effect #4 in `specs/GUARDRAILS.md` and a real bug, not a detour.

## Step 2 — Accessibility snapshot, not a screenshot

Take an **a11y snapshot** (`browser_snapshot`). It returns roles, names and states rather
than pixels, which is what the contract is actually written in. A screenshot cannot tell
you whether a button is named, and a passing jsdom test cannot tell you whether the name
survives real rendering.

Check against `specs/patterns/overlay-tests.md` for overlays. Look for:

- every interactive node has an accessible **name** (not "button", not empty)
- ng-primitives state lands on the DOM: `data-checked`, `data-disabled`, `data-state`
- `aria-expanded` / `aria-controls` on triggers actually point at a rendered node
- no duplicate or orphaned `id` from a `:host` template

## Step 3 — Walk the keyboard path

This is where jsdom lies most. Drive it for real:

| Component kind  | Path that must work                                                         |
| --------------- | --------------------------------------------------------------------------- |
| any interactive | reachable by `Tab`, visible focus ring, not a focus trap                    |
| composite       | arrow keys move within, `Tab` leaves the whole widget (roving tabindex)     |
| overlay         | `Escape` closes, focus **returns to the trigger**, background is inert      |
| form control    | `Space`/`Enter` toggles, `[formControl]` value updates, disabled is skipped |

Focus return on overlay close is the single most common real-browser-only failure. Verify
it explicitly by snapshotting after `Escape` and confirming the trigger is focused.

## Step 4 — At least one non-default theme

The repo ships 5 colors × 5 styles plus dark mode, and Tailwind semantic tokens are exactly
what breaks across presets. Default (`volt` + `sharp`, light) proves nothing. Switch via the
`<html>` attributes and reload:

```js
// browser_evaluate
document.documentElement.setAttribute('data-color', 'ember');
document.documentElement.setAttribute('data-style', 'brutal');
document.documentElement.classList.add('dark');
```

Pick a style preset that is structurally different from `sharp` — `brutal` (heavy borders
and offset shadows) and `ghost` (borderless) break opposite things. For a full 5×5 sweep,
use `/theme-audit <component>` instead.

Look for: invisible text (foreground token not paired with its background), a border that
vanished, a shadow token that resolved to nothing, hardcoded hex or `bg-[var(--primary)]`
instead of `bg-primary`.

## Step 5 — Report what you actually observed

Say what you drove and what you saw — roles and names from the snapshot, keys pressed,
presets checked. "Verified in browser" with no specifics is not a report.

If the browser and a unit test disagree, **the browser wins and the test is wrong**. Fix
the test; never loosen an assertion to make it agree (`specs/GUARDRAILS.md`, session
protocol).
