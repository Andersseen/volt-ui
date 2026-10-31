# Headless backends

Volt UI exposes one component experience over interchangeable headless engines. The behavioural and
accessibility contract belongs to Volt; the engine is an implementation detail of the backend you pick.

|                 | ng-primitives (default)        | Quartz Headless (experimental)                                                    |
| --------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| Package import  | `@voltui/components`           | `@voltui/components/quartz`                                                       |
| CLI             | `volt add checkbox`            | `volt add checkbox --base=quartz`                                                 |
| Components      | every component                | Checkbox, Radio (group + item), Switch, Toggle, ToggleGroup (group + item)        |
| Engine packages | `ng-primitives` (a dependency) | `@quartz-headless/core`, `@quartz-headless/primitives` `^0.16.0` (optional peers) |
| Angular         | 21.2+ and 22                   | 21.2+; 22 needs `--legacy-peer-deps`¹                                             |
| Quartz version  | n/a                            | `0.16.0` (the only published release)                                             |

¹ Quartz 0.16.0 declares `@angular/*` peers of `^21.0.0`. The components pass the whole suite on Angular 22.2.4,
but a strict `npm install` reports `ERESOLVE` until Quartz widens its ranges.

Colour presets (Volt, Ember, Sage, Dusk, Glacier, custom) and style presets (Sharp, Soft, Brutal, Ghost, Retro)
are independent of the backend: the Quartz components write the same `data-*` styling hooks and carry the same classes.

## Package mode

```bash
npm install @voltui/components @quartz-headless/core @quartz-headless/primitives
```

```ts
import {
  VoltCheckbox,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSwitch,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from '@voltui/components/quartz';
```

Same class names, selectors, inputs, models and outputs as the main entry point. Do **not** put both
implementations of a component in the same Angular `imports` array (two classes, one selector). The
entry points are independent: using Quartz's Checkbox never loads ng-primitives, and the main entry never loads Quartz.

## CLI mode

```bash
npx @voltui/cli init --base=quartz        # records { "base": "quartz" } in volt.json
npx @voltui/cli add checkbox radio switch toggle toggle-group --base=quartz
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
- **Radio**: `radiogroup` of `radio` buttons, `aria-labelledby` pointing at the projected label, a supplied `id` on the button (so `<label for>` names it), roving `tabindex`, arrows move **and select**, Space selects, `orientation`, `compareWith`, `[(value)]`, disabled item and group;
- **ToggleGroup**: single mode = `role="radio"` + `aria-checked`, multiple mode = `aria-pressed`; the value is always a `string[]`; arrows move focus only, Space/Enter press; `allowDeselection`; disabled item and group;
- Space/Enter/click activation, native `<label for>`, keyboard reachability in WebKit (`tabindex`), `:focus-visible` ring;
- `ControlValueAccessor`: silent programmatic writes, one emission per activation, dirty/touched on blur, reset, disable, `null` as off, `ngModel` and reactive forms;
- the `checked` / `indeterminate` / `pressed` models, two-way binding and outputs;
- identical attributes, classes and computed paint (colour, border, shadow, size, switch-thumb translate);
- prerendered SSR output and clean hydration, unique ids, no console errors.

## Group value shapes

Volt's public contracts are the same under both engines, even where Quartz's own shapes differ:

| Control     | Volt `value`                                   | Quartz directive (internal)             | Where it is mapped                             |
| ----------- | ---------------------------------------------- | --------------------------------------- | ---------------------------------------------- |
| RadioGroup  | `string \| null`                               | `T \| null`                             | pass-through                                   |
| ToggleGroup | `string[]` in **both** `single` and `multiple` | `T \| null` (single) / `T[]` (multiple) | `toQuartz` / `fromQuartz` in `VoltToggleGroup` |

- Volt owns `value`. It is written into the directive silently, and only Quartz's `valueChangeCommitted` (a user
  activation) flows back to the model and to `onChange`, so a programmatic write or `writeValue` never reaches Forms.
- ToggleGroup, `single`: the group shows at most one pressed item (the first written value) and emits `[]` or `['x']`.
  `multiple`: duplicates are shown once; user presses append in press order.
- `@quartz-headless/primitives/forms` is not used. Volt's `ControlValueAccessor` is the only Forms adapter.

## Ids

Quartz 0.16.0 numbers ids with a module-level counter (`qz-radio-1`, `qz-toggle-item-1`) that is not scoped to an
Angular application, so a long-lived SSR process never matches the browser's count. Volt does not render those ids:
the radio button carries the `id` you supply (or none), a radio group gets an id counted per application, and
toggle items carry no id. The prerendered HTML and the hydrated DOM contain the same set of ids (checked in the
consumer suite), and no `qz-*` id reaches the page.

## Known differences

- A disabled **Toggle** is natively `disabled` with Quartz (out of the tab order); ng-primitives keeps it focusable with `aria-disabled`. Both set `data-disabled`.
- Disabled **Radio** / **ToggleGroup** items: same rule, native `disabled` with Quartz, `aria-disabled` with ng-primitives.
- **ToggleGroup, single mode** with several values written at once (`['a','b']`): ng-primitives marks both pressed;
  Quartz shows the first only. A single-select group holding two values is invalid input; Quartz normalises it.
- **Removing the checked radio** and adding it back: Quartz keeps the group's `value` and re-checks it; ng-primitives does not.
- Engine-owned attributes differ (`data-qz-*`; `data-hover`, `data-press`, `data-focus-visible`, `ngp*`). They are not part of Volt's contract; do not style them.

## Adding the next component

Create `packages/volt/src/lib/quartz/<name>/` with the same public contract, export it from `src/quartz-api.ts`, add a row to
`ngp-and-quartz.spec.ts` / `backend-parity.spec.ts`, and re-run `pnpm manifest` — the CLI and the generated `backends` field follow from the folder.
