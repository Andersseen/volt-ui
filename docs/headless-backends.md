# Headless backends

Volt UI exposes one component experience over interchangeable headless engines. The behavioural and
accessibility contract belongs to Volt; the engine is an implementation detail of the backend you pick.

|                 | ng-primitives (default)        | Quartz Headless (experimental)                                                       |
| --------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Package import  | `@voltui/components`           | `@voltui/components/quartz`                                                          |
| CLI             | `volt add checkbox`            | `volt add checkbox --base=quartz`                                                    |
| Components      | every component                | Accordion, Checkbox, Radio, Switch, Tabs, Toggle, ToggleGroup (groups + their parts) |
| Engine packages | `ng-primitives` (a dependency) | `@quartz-headless/core`, `@quartz-headless/primitives` `^0.16.0` (optional peers)    |
| Angular         | 21.2+ and 22                   | 21.2+; 22 needs `--legacy-peer-deps`¹                                                |
| Quartz version  | n/a                            | `0.16.0` (the only published release)                                                |

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
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltCheckbox,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
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
npx @voltui/cli add checkbox radio switch toggle toggle-group tabs accordion --base=quartz
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

Verified by one contract run against both engines (`packages/volt/testing/headless-contract.ts`, `group-contract.ts`, `disclosure-contract.ts`), a differential
spec (`backend-parity.spec.ts`), and a packed-tarball browser suite in Chromium, Firefox and WebKit
(`scripts/check-quartz-consumer.mjs`):

- native `<button>`, role, accessible name, `aria-checked` (`mixed` included) / `aria-pressed`, `aria-required`, `aria-invalid`;
- **Radio**: `radiogroup` of `radio` buttons, `aria-labelledby` pointing at the projected label, a supplied `id` on the button (so `<label for>` names it), roving `tabindex`, arrows move **and select**, Space selects, `orientation`, `compareWith`, `[(value)]`, disabled item and group;
- **ToggleGroup**: single mode = `role="radio"` + `aria-checked`, multiple mode = `aria-pressed`; the value is always a `string[]`; arrows move focus only, Space/Enter press; `allowDeselection`; disabled item and group;
- **Tabs**: `tablist` / `tab` / `tabpanel` with `aria-selected`, `aria-controls` ⇄ `aria-labelledby` (no dangling reference, unique ids), roving `tabindex`, `data-state="active|inactive"` on trigger and panel, arrows/Home/End, vertical `orientation`, `[(value)]`, `activateOnFocus`;
- **Accordion**: native-button triggers with `aria-expanded` / `aria-controls`, a labelled `region` per panel, `single` / `multiple`, `collapsible`, `[(value)]` (`string | string[] | null`), group `disabled`, every trigger in the Tab order, `data-open` / `data-closed` styling hooks;
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

## Tabs and Accordion

Both families cross-reference their parts (`aria-controls`, `aria-labelledby`) and both keep their own `value`, so the wrappers
own more than the controls above. Everything below is verified against the published `@quartz-headless/primitives@0.16.0`
(`packages/volt/testing/disclosure-contract.ts`, `quartz/disclosure-quartz.spec.ts`, and the packed-tarball browser suite).

**Tabs** — `VoltTabs` (`value: string | undefined`, `orientation`, `activateOnFocus`), `VoltTabsList`, `VoltTabsTrigger`, `VoltTabsContent`.

- `activateOnFocus` (default `true`) is Volt's boolean. Quartz has `activationMode`, a signal input that only a template can bind, and a
  host directive cannot be bound from its host's own bindings; so Quartz always runs `automatic` and, with `activateOnFocus` off,
  `VoltTabs` puts the selection back in the same keydown, before anything renders: arrows move focus only, a click selects. Enter and Space
  select the focused tab with Quartz (see Known differences).
- With `value` undefined the first tab is shown and **nothing is emitted or written** (ng-primitives derives it; Quartz writes its own `value`).
  `VoltTabs` takes Quartz's value into the model only after a user click or keyboard move.
- If the selected tab is removed, Quartz moves its own selection to the first tab; the Volt model keeps its value and the tab is selected again
  when it returns, as with ng-primitives.

**Accordion** — `VoltAccordion` (`type: 'single' | 'multiple'`, `collapsible`, `value: string | string[] | null`, `disabled`, `orientation`),
`VoltAccordionItem` (`value`), `VoltAccordionTrigger`, `VoltAccordionContent`.

- Quartz opens the first item by itself in a single, non-collapsible accordion; Volt (like ng-primitives) opens nothing until asked. The wrapper gives
  Quartz a value no item has for "nothing open" (`NONE` in `accordion.ts`), so the model stays `null` and nothing is emitted.
- Quartz's `value` reaches the model after a user toggle only; a removed open item that returns is open again.
- A closed panel is `visibility: hidden` (not `hidden` / `display: none`): it leaves the Tab order and the accessibility tree when the 200 ms
  grid-row transition ends and returns when it starts, so the open/close animation survives. The `hidden` attribute Quartz writes is removed after its binding.
- Quartz roves the accordion's `tabindex` (one Tab stop, arrows between triggers). Volt's contract is ng-primitives': every enabled trigger is a Tab stop.
  The wrapper writes `tabindex` after Quartz's binding; the arrow keys, Home and End still work on top.

## Ids

Quartz 0.16.0 numbers ids with a module-level counter (`qz-radio-1`, `qz-toggle-item-1`, `qz-tab-1`, `qz-tab-panel-1`, `qz-accordion-trigger-1`) that is not scoped to an
Angular application, so a long-lived SSR process never matches the browser's count. Volt does not render those ids:
the radio button carries the `id` you supply (or none), a radio group gets an id counted per application, and
toggle items carry no id. Tabs and Accordion cannot drop theirs (the ids are the `aria-controls` / `aria-labelledby` targets), so the wrapper's constructor
replaces the directive's `id` / `panelId` fields (`replaceQuartzIds`, readonly in Quartz's typings only) with ids counted per application before Quartz registers the
part: no attribute is patched after render and every cross-reference stays consistent. The prerendered HTML and the hydrated DOM contain the same set of ids (checked in the
consumer suite), and no `qz-*` id reaches the page.

## Known differences

- A disabled **Toggle** is natively `disabled` with Quartz (out of the tab order); ng-primitives keeps it focusable with `aria-disabled`. Both set `data-disabled`.
- Disabled **Radio** / **ToggleGroup** items: same rule, native `disabled` with Quartz, `aria-disabled` with ng-primitives.
- **ToggleGroup, single mode** with several values written at once (`['a','b']`): ng-primitives marks both pressed;
  Quartz shows the first only. A single-select group holding two values is invalid input; Quartz normalises it.
- **Removing the checked radio** and adding it back: Quartz keeps the group's `value` and re-checks it; ng-primitives does not.
- **Tabs, `activateOnFocus` off**: Quartz's tab is activated by Enter and Space; ng-primitives' tab is a custom element with no such handler, so with it a manual-activation tablist can be selected by pointer only.
- **Tabs, RTL**: Quartz mirrors Left/Right; ng-primitives does not (same as Radio/ToggleGroup).
- **Tabs**: an unrelated `aria-controls` is omitted for a tab with no panel with Quartz; ng-primitives always writes one (it can dangle). An inactive panel is `hidden` with Quartz, `aria-hidden="true"` with ng-primitives; both carry `data-state="inactive"`, which the Volt classes turn into `display: none`.
- **Tabs**: setting `value` back to `undefined` after mount leaves the current selection with Quartz (ng-primitives shows the first tab again); a `value` no tab has selects nothing with Quartz (ng-primitives falls back to the first tab).
- **Accordion**: the one open item of a single, non-collapsible accordion has `aria-disabled="true"` with Quartz (the WAI-ARIA accordion pattern asks for exactly that); ng-primitives does not set it.
- **Accordion**: Quartz also moves focus with the arrow keys / Home / End and recovers focus when the focused trigger is removed; ng-primitives has neither.
- Engine-owned attributes differ (`data-qz-*`; `data-hover`, `data-press`, `data-focus-visible`, `ngp*`). They are not part of Volt's contract; do not style them.

## Upstream finding: ng-primitives Accordion and server rendering

With ng-primitives 0.131.2 an accordion item that is **open when the page is server-rendered** (`value="a"`, `[value]="['a']"`) throws
`ReferenceError: MutationObserver is not defined` in Node's `platform-server`: `ngpCollapsibleContent` creates a `MutationObserver` for an open item
(`fromMutationObserver`, `disabled: !open`) without a platform guard. The prerender then serializes a partial page (observed in the packed-tarball
fixture on Angular 22). A closed-at-load accordion is unaffected, and so is every Quartz accordion (`quartz/disclosure-ssr.spec.ts` renders open items on
the real server). This is an upstream defect in the default backend, not something this change introduced; the consumer fixture therefore opens its
accordions from the keyboard and the pointer instead of pre-opening them.

## Adding the next component

Create `packages/volt/src/lib/quartz/<name>/` with the same public contract, export it from `src/quartz-api.ts`, add a row to
`ngp-and-quartz.spec.ts` / `backend-parity.spec.ts`, and re-run `pnpm manifest` — the CLI and the generated `backends` field follow from the folder.
