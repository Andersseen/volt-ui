# Component Status

Volt UI `1.0.0` is stable. Status labels describe the current confidence level for the copy-paste workflow, not a permanent promise — a `beta` label means more hardening may land in a minor release, not that the API can break outside a major.

> Naming note: this is the independent Angular Volt UI project under `@voltui`, not PrimeVue Volt UI.

## Status Labels

- **stable**: recommended for production use; API and behavior are settled, with meaningful tests and docs. Every 1.0 component is stable.
- **beta**: usable, but may still need more form, keyboard, accessibility, or edge-case coverage before moving to stable. Reserved for components added after 1.0; not currently used.
- **experimental**: reserved for future previews whose API or behavior may still change; not currently used.

## Release Groups

- **Stable**: every component in the table below. The 1.0 surface ships entirely stable.
- **Beta**: none.
- **Experimental**: none. The 1.0 component surface is fixed.

## Table

| Component       | Status | Forms support             | Keyboard support                 | Overlay/focus behavior                   | Docs | Tests               |
| --------------- | ------ | ------------------------- | -------------------------------- | ---------------------------------------- | ---- | ------------------- |
| accordion       | stable | n/a                       | via ng-primitives                | n/a                                      | yes  | unit                |
| autofill        | stable | n/a                       | n/a                              | n/a                                      | yes  | unit                |
| avatar          | stable | n/a                       | n/a                              | n/a                                      | yes  | unit                |
| badge           | stable | n/a                       | n/a                              | n/a                                      | yes  | unit                |
| breadcrumbs     | stable | n/a                       | link semantics                   | n/a                                      | yes  | unit                |
| button          | stable | n/a                       | native button                    | focus-visible styles                     | yes  | unit + e2e docs     |
| card            | stable | n/a                       | n/a                              | n/a                                      | yes  | unit + e2e docs     |
| checkbox        | stable | full CVA contract         | via ng-primitives                | focus-visible styles                     | yes  | unit                |
| combobox        | stable | full CVA contract         | via ng-primitives                | dropdown keyboard/focus covered          | yes  | unit                |
| date-picker     | stable | full CVA contract         | via ng-primitives                | calendar grid selection covered          | yes  | unit                |
| dialog          | stable | n/a                       | Escape covered in e2e            | focus trap/return, outside click covered | yes  | unit + e2e          |
| drawer          | stable | n/a                       | Escape covered in e2e            | focus trap/return, outside click covered | yes  | unit + e2e          |
| dropdown-menu   | stable | n/a                       | Arrow/Home/End/Enter covered     | Escape, outside click, focus covered     | yes  | unit + e2e          |
| file-upload     | stable | output-based API          | native input behavior            | real-browser drag/drop covered           | yes  | unit + e2e          |
| form-field      | stable | projected-control wiring  | label/description semantics      | n/a                                      | yes  | unit                |
| input           | stable | full CVA contract         | native input                     | focus-visible styles                     | yes  | unit + e2e docs     |
| input-otp       | stable | full CVA contract         | typing/paste/pattern covered     | per-slot active and caret covered        | yes  | unit                |
| listbox         | stable | full CVA contract         | Arrow/Enter via ng-primitives    | active option covered                    | yes  | unit                |
| meter           | stable | n/a                       | n/a                              | n/a                                      | yes  | unit + e2e consumer |
| native-select   | stable | native `<select>` element | native select                    | n/a                                      | yes  | unit                |
| navigation-menu | stable | n/a                       | Escape covered                   | submenu open/swap covered                | yes  | unit                |
| pagination      | stable | n/a                       | native buttons/links             | focus-visible styles                     | yes  | unit                |
| popover         | stable | n/a                       | Escape covered in e2e            | open/close/position covered              | yes  | unit + e2e          |
| progress        | stable | n/a                       | n/a                              | n/a                                      | yes  | unit + e2e consumer |
| radio           | stable | full CVA contract         | via ng-primitives                | focus-visible styles                     | yes  | unit                |
| range-slider    | stable | full CVA contract         | via ng-primitives                | focus-visible styles                     | yes  | unit                |
| resizable       | stable | n/a                       | arrow keys on both axes covered  | separator exposes ARIA value             | yes  | unit                |
| search          | stable | structural wrapper        | native input                     | focus-visible styles                     | yes  | unit                |
| select          | stable | full CVA contract         | via ng-primitives                | listbox Escape covered in e2e            | yes  | unit + e2e          |
| separator       | stable | n/a                       | n/a                              | n/a                                      | yes  | unit + e2e consumer |
| sidebar         | stable | n/a                       | native links and Escape          | tooltip dependency covered               | yes  | unit + manifest     |
| skeleton        | stable | n/a                       | n/a                              | n/a                                      | yes  | unit                |
| slider          | stable | full CVA contract         | via ng-primitives                | focus-visible styles                     | yes  | unit + e2e consumer |
| switch          | stable | full CVA contract         | via ng-primitives                | focus-visible styles                     | yes  | unit + e2e consumer |
| table           | stable | n/a                       | ARIA table semantics             | n/a                                      | yes  | unit                |
| tabs            | stable | n/a                       | via ng-primitives                | tab focus behavior via primitive         | yes  | unit + e2e consumer |
| textarea        | stable | full CVA contract         | native textarea                  | focus-visible styles                     | yes  | unit                |
| theme           | stable | n/a                       | n/a                              | document-level theme state               | yes  | unit                |
| toast           | stable | n/a                       | close control covered            | pause and keyboard dismissal covered     | yes  | unit + e2e          |
| toggle          | stable | full CVA contract         | via ng-primitives                | focus-visible styles                     | yes  | unit                |
| toggle-group    | stable | full CVA contract         | via ng-primitives                | roving focus via primitive               | yes  | unit                |
| toolbar         | stable | n/a                       | arrow-key focus movement covered | roving focus via primitive               | yes  | unit                |
| tooltip         | stable | n/a                       | hover/focus/Escape/blur covered  | aria-describedby and position covered    | yes  | unit + e2e          |

## What `stable` was verified against

Every component meets the same bar: a frozen public API, a unit spec exercising its own
contract rather than Angular's (for form controls that means asserting the DOM reflects
what the form wrote, not just that `FormControl.value` changed), and — for overlays —
Escape, outside-click, focus-return and positioning covered by the Playwright consumer
suite in `e2e/consumer.spec.ts`.

The last five components were closed out by fixing real defects the old tests were
shaped around, not by relabeling:

| Component         | What was actually wrong                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `date-picker`     | `[formControl]` was disconnected in both directions; now covered by calendar tests |
| `file-upload`     | Drag/drop now driven by a real `DataTransfer` in `e2e/file-upload.spec.ts`         |
| `input-otp`       | `NgpInputOtpInput` was never imported, so no slot ever filled                      |
| `navigation-menu` | Submenu open/swap/Escape had no coverage; only static markup was asserted          |
| `resizable`       | A handle inside a vertical group resized horizontally                              |

## Ongoing hardening policy

- A component only becomes `stable` once its own contract is asserted against the DOM — a test that only round-trips a `FormControl` proves nothing about the component.
- Keep any future `beta` component at `beta` until its remaining browser-level caveats are covered — moving to `stable` never happens as part of a patch that also changes behavior.
- Move CVA controls to `stable` only after Reactive Forms disabled/write/change/touched behavior is covered.
- Keep component source copyable without hidden docs-app dependencies.
- Keep CLI overwrite behavior explicit and conservative.
- Document any known accessibility caveats per component before marking `stable`.
