# Headless backends

Volt UI exposes one component experience over interchangeable headless engines. The behavioural and
accessibility contract belongs to Volt; the engine is an implementation detail of the backend you pick.

|                 | ng-primitives (default)        | Quartz Headless (experimental)                                                    |
| --------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| Package import  | `@voltui/components`           | `@voltui/components/quartz`                                                       |
| CLI             | `volt add checkbox`            | `volt add checkbox --base=quartz`                                                 |
| Components      | every component                | Checkbox, Switch, Toggle                                                          |
| Engine packages | `ng-primitives` (a dependency) | `@quartz-headless/core`, `@quartz-headless/primitives` `^0.16.0` (optional peers) |
| Angular         | 21.2+ and 22                   | 21.2+; 22 needs `--legacy-peer-deps`¹                                             |

¹ Quartz 0.16.0 declares `@angular/*` peers of `^21.0.0`. The components pass the whole suite on Angular 22.2.4,
but a strict `npm install` reports `ERESOLVE` until Quartz widens its ranges.

Colour presets (Volt, Ember, Sage, Dusk, Glacier, custom) and style presets (Sharp, Soft, Brutal, Ghost, Retro)
are independent of the backend: the Quartz components write the same `data-*` styling hooks and carry the same classes.

## Package mode

```bash
npm install @voltui/components @quartz-headless/core @quartz-headless/primitives
```

```ts
import { VoltCheckbox, VoltSwitch, VoltToggle } from '@voltui/components/quartz';
```

Same class names, selectors, inputs, models and outputs as the main entry point. Do **not** put both
implementations of a component in the same Angular `imports` array (two classes, one selector). The
entry points are independent: using Quartz's Checkbox never loads ng-primitives, and the main entry never loads Quartz.

## CLI mode

```bash
npx @voltui/cli init --base=quartz        # records { "base": "quartz" } in volt.json
npx @voltui/cli add checkbox switch toggle --base=quartz
npx @voltui/cli list --base=quartz        # what the base supports
```

- Without `--base` and without `volt.json`, behaviour is exactly as before (ng-primitives, no config written).
- An explicit `--base` is remembered; later `volt add` calls reuse it. A flag that contradicts `volt.json` is an error.
- A component with no Quartz implementation is rejected with the list of supported ones; the CLI never writes ng-primitives
  source while claiming Quartz. Nothing is written when any requested component is unsupported.
- A Quartz copy into a directory that already holds ng-primitives copies is refused (no silent mixing). Existing files are never
  overwritten without `--force`.
- `--install` installs only what the copied source imports (`@quartz-headless/*`, plus `class-variance-authority` / `clsx` /
  `tailwind-merge` where used) — not ng-primitives.

## What is guaranteed to match

Verified by one contract run against both engines (`packages/volt/testing/headless-contract.ts`), a differential
spec (`backend-parity.spec.ts`), and a packed-tarball browser suite in Chromium, Firefox and WebKit
(`scripts/check-quartz-consumer.mjs`):

- native `<button>`, role, accessible name, `aria-checked` (`mixed` included) / `aria-pressed`, `aria-required`, `aria-invalid`;
- Space/Enter/click activation, native `<label for>`, keyboard reachability in WebKit (`tabindex`), `:focus-visible` ring;
- `ControlValueAccessor`: silent programmatic writes, one emission per activation, dirty/touched on blur, reset, disable, `null` as off, `ngModel` and reactive forms;
- the `checked` / `indeterminate` / `pressed` models, two-way binding and outputs;
- identical attributes, classes and computed paint (colour, border, shadow, size, switch-thumb translate);
- prerendered SSR output and clean hydration, unique ids, no console errors.

## Known differences

- A disabled **Toggle** is natively `disabled` with Quartz (out of the tab order); ng-primitives keeps it focusable with `aria-disabled`. Both set `data-disabled`.
- Engine-owned attributes differ (`data-qz-*`; `data-hover`, `data-press`, `data-focus-visible`, `ngp*`). They are not part of Volt's contract; do not style them.

## Adding the next component

Create `packages/volt/src/lib/quartz/<name>/` with the same public contract, export it from `src/quartz-api.ts`, add a row to
`ngp-and-quartz.spec.ts` / `backend-parity.spec.ts`, and re-run `pnpm manifest` — the CLI and the generated `backends` field follow from the folder.
