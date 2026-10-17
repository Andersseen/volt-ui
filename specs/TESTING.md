# Testing — what "verified" means

> **Coverage is a side effect of meaningful tests, not their purpose.**

A `stable` component is not verified because its lines execute, its initial markup renders, a
`FormControl.value` round-trips, ng-primitives has its own tests, or Storybook can render it. It is
verified when its **public consumer contract** is observed through the DOM and, where browser
behaviour matters, in a real browser.

- Never add a test whose only purpose is to raise a coverage number. If a line cannot be exercised
  meaningfully, ask whether the implementation should change instead of writing a hollow assertion.
- Coverage thresholds stay enforced as a safety floor and are never lowered. They are not reported as
  the result of a change; the result is which contracts are covered, which bugs were reproduced and
  fixed, and what was verified in a browser.
- A test names the behaviour, not the implementation: assert `aria-checked`, `aria-selected`,
  `aria-pressed`, `aria-expanded`, `aria-valuenow`, `data-selected`, visible/hidden panels, the native
  input's value, the real disabled state — not internal signals, private state, implementation
  classes or ng-primitives internals. Query with `getByRole` / `getByLabelText` / accessible name.

## The contracts

The consumer-visible surface a component can promise. `specs/behavioral-contracts.md` (generated,
`pnpm generate:behavior-matrix`) lists which apply to each public component and points at the tests;
it exists to expose what is missing, not to produce a score.

```text
default state · static initial value · dynamic one-way binding · two-way model binding
Reactive Forms · Template-driven Forms · single emission · disabled · re-enabled · touched · invalid
keyboard · pointer · focus · accessible name · ARIA state
open/close · Escape · outside click · focus trap · focus return · portal position
drag/drop · paste · SSR · hydration · visible selected/pressed/checked state
```

Do not mark a contract covered because a similar component is covered.

### The Stateful Value Contract

The 1.3.0 regression — `radio-group`, `toggle-group`, `slider` and `listbox` rendered a static initial
value and then ignored every click — passed every spec because the specs only exercised the
two-way and forms paths. A component that holds a value is verified in **each** of these ways, in the
DOM:

| Mode                    | Example                        | Verify                                                                                         |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Default / uncontrolled  | `<volt-radio-group>`           | render → interact → the DOM changes                                                            |
| Static initial value    | `<volt-radio-group value="a">` | A is selected → click B → B is selected                                                        |
| Dynamic one-way binding | `<volt-x [value]="value()">`   | a parent update reaches the DOM **and** the component is still interactive afterwards          |
| Two-way binding         | `<volt-x [(value)]="value">`   | parent → DOM; DOM interaction → parent; one interaction → one output                           |
| Reactive Forms          | `[formControl]="c"`            | initial value → DOM; `setValue` → DOM; user → control; dirty; touched; disable/enable; invalid |
| Template-driven         | `[(ngModel)]="v"`              | one smoke test                                                                                 |

Assert consumer-visible DOM/ARIA state, never only the Angular object.

Outputs: one user action → exactly one emission; a parent update or a programmatic write must not
masquerade as a user change where the component has a user-driven output (see
[`state-ownership.md`](state-ownership.md) for which outputs are which).

## The layers — each assertion lives in one

| Layer                  | Where                                                                                | Proves                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| static                 | lint, typecheck, `check:generated`, `check:dogfood`, `check:ai-docs`                 | the repo is consistent; the AI content tells the truth                                                                          |
| unit / component       | `*.spec.ts` (Vitest, Testing Library, zoneless)                                      | behavioural Angular contracts in jsdom                                                                                          |
| cross-cutting contract | `behavior-contract.spec.ts`, `interaction-contract*.spec.ts`, `static-value.spec.ts` | the Stateful Value Contract and interactions that span components                                                               |
| browser contracts      | `e2e/contracts` (`pnpm test:e2e:contracts`)                                          | focus, keyboard, pointer geometry, portals, drag and drop, computed styles — what jsdom cannot prove; Chromium, Firefox, WebKit |
| Storybook              | `e2e/storybook`                                                                      | the public states exist and are visibly distinct; axe; every story renders                                                      |
| package consumers      | `e2e/consumer*`, `check:angular-compat`                                              | the packed `@voltui/components` and the `@voltui/cli` copy work in an isolated project, on Angular 21 and 22                    |
| SSR                    | `check:ssr`, `e2e/ssr-gallery`                                                       | server render and hydration                                                                                                     |
| docs e2e               | `e2e/*.spec.ts`                                                                      | the official site's flows                                                                                                       |

Findings from a real browser beat assertions from jsdom. If they disagree, the browser wins and the
unit test is wrong. jsdom loads no CSS: it cannot tell a pressed control from an unpressed one by
looks. That is the browser contract's job (`visual-state.spec.ts` compares computed styles — that they
differ, never what they are).

## Browser-contract conventions

- Fixtures live in `e2e/consumer/src/contracts` and import only from the built `@voltui/components`;
  one hash per fixture (`/contracts.html#radio`) so nothing else on the page can steal focus.
- Programmatic `focus()` followed at once by a key can beat a roving-focus group's own bookkeeping;
  use `focusRoving()`. Safari does not Tab to buttons by default, so Tab-order checks skip WebKit
  (`TAB_SKIPS_BUTTONS`) rather than weaken the assertion.
- The same suite runs against the tarball built for Angular 21 and 22 (`check:angular-compat`).

## Storybook and bug fixes

A behavioural bug fix asks: does this bug correspond to a public visual/state story? A pressed-state
bug → ensure a _Pressed_ story exists; a manual Combobox bug → _Loading_, _Results_, _Empty_. Not
every regression needs a story — Storybook shows what a consumer-facing reviewer needs to see, not
internal edge cases. `scripts/check-storybook.mjs` (`REQUIRED_STATES`) fails when a listed state story
disappears; add to it when a fix corresponds to a public state.
