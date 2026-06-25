# Component Status

Volt UI is pre-v1. Status labels describe the current confidence level for the copy-paste workflow, not a permanent promise.

> Naming note: this is the independent Angular Volt UI project under `@voltui`, not PrimeVue Volt UI.

## Status Labels

- **stable candidate**: API and behavior are close to v1 shape, with meaningful tests and docs.
- **beta**: usable, but may still need more form, keyboard, accessibility, or edge-case coverage.
- **experimental**: useful demos exist, but the API or behavior may change before v1.

## Table

| Component       | Status           | Forms support               | Keyboard support               | Overlay/focus behavior                  | Docs | Tests                    |
| --------------- | ---------------- | --------------------------- | ------------------------------ | --------------------------------------- | ---- | ------------------------ |
| accordion       | beta             | n/a                         | via ng-primitives              | n/a                                     | yes  | unit                     |
| autofill        | beta             | n/a                         | n/a                            | n/a                                     | yes  | unit                     |
| avatar          | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit                     |
| badge           | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit                     |
| breadcrumbs     | stable candidate | n/a                         | link semantics                 | n/a                                     | yes  | unit                     |
| button          | stable candidate | n/a                         | native button                  | focus-visible styles                    | yes  | unit + e2e docs          |
| card            | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit + e2e docs          |
| checkbox        | beta             | CVA + Reactive Forms tests  | via ng-primitives              | focus-visible styles                    | yes  | unit                     |
| combobox        | experimental     | local value API             | partial                        | dropdown focus needs more hardening     | yes  | unit                     |
| date-picker     | experimental     | local value API             | partial                        | calendar focus needs more hardening     | yes  | limited                  |
| dialog          | experimental     | n/a                         | Escape covered in e2e          | modal focus/return covered minimally    | yes  | unit + e2e               |
| drawer          | experimental     | n/a                         | Escape covered in e2e          | modal focus/return needs more coverage  | yes  | e2e                      |
| dropdown-menu   | experimental     | n/a                         | Escape covered in e2e          | menu focus needs more coverage          | yes  | e2e                      |
| file-upload     | experimental     | n/a                         | native input behavior          | drag/drop needs more coverage           | yes  | limited                  |
| form-field      | beta             | supports projected controls | label semantics                | n/a                                     | yes  | unit                     |
| input           | stable candidate | CVA + Reactive Forms tests  | native input                   | focus-visible styles                    | yes  | unit + e2e docs          |
| input-otp       | beta             | local value API             | partial                        | focus movement needs more coverage      | yes  | unit                     |
| listbox         | beta             | local value API             | via ng-primitives              | active option focus needs more coverage | yes  | limited                  |
| meter           | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit + e2e consumer      |
| navigation-menu | experimental     | n/a                         | partial                        | nested menu focus needs hardening       | yes  | limited                  |
| pagination      | beta             | n/a                         | native buttons/links           | focus-visible styles                    | yes  | unit                     |
| popover         | experimental     | n/a                         | Escape covered in e2e          | open/close/focus covered minimally      | yes  | e2e                      |
| progress        | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit + e2e consumer      |
| radio           | beta             | CVA coverage needed         | via ng-primitives              | focus-visible styles                    | yes  | unit                     |
| resizable       | experimental     | n/a                         | pointer-first                  | resize focus/keyboard needs hardening   | yes  | limited                  |
| search          | beta             | local value API             | native input                   | focus-visible styles                    | yes  | unit                     |
| select          | experimental     | CVA + Reactive Forms tests  | partial                        | listbox Escape covered in e2e           | yes  | unit + e2e               |
| separator       | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit + e2e consumer      |
| sidebar         | beta             | n/a                         | partial                        | tooltip dependency covered              | yes  | manifest dependency test |
| skeleton        | stable candidate | n/a                         | n/a                            | n/a                                     | yes  | unit                     |
| slider          | beta             | CVA coverage needed         | via ng-primitives              | focus-visible styles                    | yes  | unit + e2e consumer      |
| switch          | beta             | CVA + Reactive Forms tests  | via ng-primitives              | focus-visible styles                    | yes  | unit + e2e consumer      |
| table           | stable candidate | n/a                         | semantic table                 | n/a                                     | yes  | limited                  |
| tabs            | beta             | n/a                         | via ng-primitives              | tab focus behavior via primitive        | yes  | unit + e2e consumer      |
| textarea        | stable candidate | CVA + Reactive Forms tests  | native textarea                | focus-visible styles                    | yes  | unit                     |
| theme           | beta             | n/a                         | n/a                            | document-level theme state              | yes  | limited                  |
| toast           | beta             | n/a                         | partial                        | dismissal/focus needs more coverage     | yes  | limited                  |
| toggle          | beta             | CVA unit tests              | via ng-primitives              | focus-visible styles                    | yes  | unit                     |
| toggle-group    | beta             | local value API             | via ng-primitives              | roving focus needs more coverage        | yes  | unit                     |
| toolbar         | beta             | n/a                         | via ng-primitives              | focus grouping needs more coverage      | yes  | unit                     |
| tooltip         | beta             | n/a                         | hover/focus primitive behavior | visible content covered in e2e          | yes  | e2e consumer             |

## v1 Hardening Checklist

- Move experimental overlays to beta only after Escape, outside click, focus trap/return, nested overlays, and keyboard navigation are covered.
- Move CVA controls to stable candidate only after Reactive Forms disabled/write/change/touched behavior is covered.
- Keep component source copyable without hidden docs-app dependencies.
- Keep CLI overwrite behavior explicit and conservative.
- Document any known accessibility caveats per component before marking stable.
