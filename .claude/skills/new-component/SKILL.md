---
name: new-component
description: Scaffold a new Volt UI component end to end — library files, tests, and all six required ripple effects. Usage: /new-component <name> [shape]
disable-model-invocation: true
---

# New Volt UI component

Creates a component under `projects/volt/src/lib/components/<name>/` and completes every
ripple effect, so CI and the `volt add` CLI stay green.

Argument: the component name in kebab-case (e.g. `carousel`, `color-picker`).
Optional second argument: `cva` or `form-control` to force the shape.

## Step 0 — Read the authorities first

Do not write code from memory. Read, in order:

1. `specs/GUARDRAILS.md` — hard rules and the ripple-effect list.
2. `specs/patterns/component.md` — the two canonical component shapes.
3. `specs/patterns/docs-page.md` — demo page + snippet registration.
4. The nearest existing sibling component as a live reference:
   - CVA shape → `projects/volt/src/lib/components/button/`
   - form-control shape → `projects/volt/src/lib/components/checkbox/`
   - overlay → `projects/volt/src/lib/components/dialog/`

If a pattern doc disagrees with real source, **the real file wins** — and say so, so the
pattern doc gets updated.

## Step 1 — Pick the shape

| Shape            | When                                      | Reference                      |
| ---------------- | ----------------------------------------- | ------------------------------ |
| A — CVA variants | visual variants, no form binding          | `button`, `badge`, `toggle`    |
| B — form control | bindable with `[formControl]` / `ngModel` | `checkbox`, `input`, `select`  |
| Overlay          | floating/dismissable                      | `dialog`, `popover`, `tooltip` |

Shape B and overlays have extra non-negotiables — the `NG_VALUE_ACCESSOR` block in
`specs/patterns/component.md`, and the ARIA table in `specs/patterns/overlay-tests.md`.

## Step 2 — Find the primitive

Volt components wrap ng-primitives; they do not reimplement behavior. Use the `ngp-mcp`
MCP server to find the matching primitive and its API before writing the template. If no
primitive exists, say so explicitly and confirm with the user before hand-rolling
behavior — that is an architectural decision, not an implementation detail.

## Step 3 — Create the library files

`projects/volt/src/lib/components/<name>/`:

- `<name>.ts` — selector `volt-<name>`, class `Volt<Name>`, `OnPush`, signals API.
- `variants.ts` — Shape A only. Export `<name>Variants` + a `VariantProps` type.
- `index.ts` — barrel re-exporting the above.
- `<name>.spec.ts` — see step 5.

Hard rules that bite here (from GUARDRAILS):

- `input<boolean, unknown>(false, { transform: booleanAttribute })` for every boolean.
- Tailwind semantic utilities only — `bg-primary`, never `bg-[var(--primary)]` or hex.
- Interaction state via primitive data attributes (`data-[hover]:`, `data-[press]:`).
- Never import from `src/` — the library must stay copyable standalone.
- No `document`/`window` at construction or in field initializers (SSR).

## Step 4 — Ripple effects (all six, no exceptions)

1. `projects/volt/src/public-api.ts` — `export * from './lib/components/<name>';`
2. `src/app/lib/snippets/index.ts` — `?raw` import + `<NAME>_SNIPPET` export.
3. `src/app/lib/snippets/usage.ts` — `<NAME>_USAGE` template string.
4. `src/app/pages/(components-docs)/docs/components/<name>.page.ts` — demo page,
   **must have `export default`** or the Analog route 404s.
5. `pnpm manifest` — regenerates `public/manifest.json`.
6. `COMPONENT_STATUS.md` — add the row with its stability level.

If the component is part of the public catalog, also sync the AI-tooling copies listed
in `AGENTS.md` → "AI tools for consumers", then confirm with `pnpm check:ai-docs`.

The `ripple-check` PostToolUse hook reports whichever of 1–5 are still missing after
each edit — treat its output as a checklist, not a suggestion.

## Step 5 — Tests

Copy the matching skeleton rather than inventing assertions:

- Form controls → `specs/patterns/form-control-tests.md` (the 6-point contract).
- Overlays → `specs/patterns/overlay-tests.md` (unit = state + ARIA; focus/keyboard = e2e).

Zoneless repo: no `fakeAsync`/`tick`. Use `await` + `fixture.whenStable()` or
`userEvent`. Real behavioral assertions — never string matching on the template.

## Step 6 — Verify

```bash
pnpm vitest --run projects/volt/src/lib/components/<name>/<name>.spec.ts
pnpm typecheck && pnpm lint
pnpm build:lib
pnpm check:ai-docs
```

All four must pass before you report done. Then offer to run `pnpm dev` and check
`/docs/components/<name>` renders.

Do not commit or publish unless asked (GUARDRAILS rules 11–12).
