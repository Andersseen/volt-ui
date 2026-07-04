# Component Status

Volt UI is pre-v1. Status labels describe the current confidence level for the copy-paste workflow, not a permanent promise.

> Naming note: this is the independent Angular Volt UI project under `@voltui`, not PrimeVue Volt UI.

## Status Labels

- **stable**: recommended for early adoption; API and behavior are close to v1 shape, with meaningful tests and docs.
- **beta**: usable, but may still need more form, keyboard, accessibility, or edge-case coverage.
- **experimental**: useful demos exist, but the API or behavior may change before v1.

## Release Groups

- **Stable**: `avatar`, `badge`, `breadcrumbs`, `button`, `card`, `checkbox`, `form-field`, `input`, `meter`, `progress`, `radio`, `separator`, `skeleton`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`.
- **Beta**: `accordion`, `pagination`, `search`, `select`, `table`, `tabs`, `toolbar`.
- **Experimental**: `autofill`, `combobox`, `date-picker`, `dialog`, `drawer`, `dropdown-menu`, `file-upload`, `input-otp`, `listbox`, `navigation-menu`, `popover`, `resizable`, `sidebar`, `theme`, `toast`, `tooltip`.

## Table

| Component       | Status       | Forms support            | Keyboard support               | Overlay/focus behavior                  | Docs | Tests                    |
| --------------- | ------------ | ------------------------ | ------------------------------ | --------------------------------------- | ---- | ------------------------ |
| accordion       | beta         | n/a                      | via ng-primitives              | n/a                                     | yes  | unit                     |
| autofill        | experimental | n/a                      | n/a                            | n/a                                     | yes  | unit                     |
| avatar          | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit                     |
| badge           | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit                     |
| breadcrumbs     | stable       | n/a                      | link semantics                 | n/a                                     | yes  | unit                     |
| button          | stable       | n/a                      | native button                  | focus-visible styles                    | yes  | unit + e2e docs          |
| card            | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit + e2e docs          |
| checkbox        | stable       | full CVA contract        | via ng-primitives              | focus-visible styles                    | yes  | unit                     |
| combobox        | experimental | local value API          | partial                        | dropdown focus needs more hardening     | yes  | unit                     |
| date-picker     | experimental | local value API          | partial                        | calendar focus needs more hardening     | yes  | limited                  |
| dialog          | experimental | n/a                      | Escape covered in e2e          | modal focus/return covered minimally    | yes  | unit + e2e               |
| drawer          | experimental | n/a                      | Escape covered in e2e          | modal focus/return needs more coverage  | yes  | e2e                      |
| dropdown-menu   | experimental | n/a                      | Escape covered in e2e          | menu focus needs more coverage          | yes  | e2e                      |
| file-upload     | experimental | n/a                      | native input behavior          | drag/drop needs more coverage           | yes  | limited                  |
| form-field      | stable       | projected-control wiring | label/description semantics    | n/a                                     | yes  | unit                     |
| input           | stable       | full CVA contract        | native input                   | focus-visible styles                    | yes  | unit + e2e docs          |
| input-otp       | beta         | local value API          | partial                        | focus movement needs more coverage      | yes  | unit                     |
| listbox         | experimental | local value API          | via ng-primitives              | active option focus needs more coverage | yes  | limited                  |
| meter           | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit + e2e consumer      |
| navigation-menu | experimental | n/a                      | partial                        | nested menu focus needs hardening       | yes  | limited                  |
| pagination      | beta         | n/a                      | native buttons/links           | focus-visible styles                    | yes  | unit                     |
| popover         | experimental | n/a                      | Escape covered in e2e          | open/close/focus covered minimally      | yes  | e2e                      |
| progress        | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit + e2e consumer      |
| radio           | stable       | full CVA contract        | via ng-primitives              | focus-visible styles                    | yes  | unit                     |
| resizable       | experimental | n/a                      | pointer-first                  | resize focus/keyboard needs hardening   | yes  | limited                  |
| search          | beta         | structural wrapper       | native input                   | focus-visible styles                    | yes  | unit                     |
| select          | beta         | full CVA contract        | partial                        | listbox Escape covered in e2e           | yes  | unit + e2e               |
| separator       | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit + e2e consumer      |
| sidebar         | experimental | n/a                      | partial                        | tooltip dependency covered              | yes  | manifest dependency test |
| skeleton        | stable       | n/a                      | n/a                            | n/a                                     | yes  | unit                     |
| slider          | stable       | full CVA contract        | via ng-primitives              | focus-visible styles                    | yes  | unit + e2e consumer      |
| switch          | stable       | full CVA contract        | via ng-primitives              | focus-visible styles                    | yes  | unit + e2e consumer      |
| table           | beta         | n/a                      | semantic table                 | n/a                                     | yes  | limited                  |
| tabs            | beta         | n/a                      | via ng-primitives              | tab focus behavior via primitive        | yes  | unit + e2e consumer      |
| textarea        | stable       | full CVA contract        | native textarea                | focus-visible styles                    | yes  | unit                     |
| theme           | experimental | n/a                      | n/a                            | document-level theme state              | yes  | limited                  |
| toast           | beta         | n/a                      | partial                        | dismissal/focus needs more coverage     | yes  | limited                  |
| toggle          | stable       | full CVA contract        | via ng-primitives              | focus-visible styles                    | yes  | unit                     |
| toggle-group    | stable       | full CVA contract        | via ng-primitives              | roving focus via primitive              | yes  | unit                     |
| toolbar         | beta         | n/a                      | via ng-primitives              | focus grouping needs more coverage      | yes  | unit                     |
| tooltip         | experimental | n/a                      | hover/focus primitive behavior | visible content covered in e2e          | yes  | e2e consumer             |

## v1 Hardening Checklist

- Move experimental overlays to beta only after Escape, outside click, focus trap/return, nested overlays, and keyboard navigation are covered.
- Move CVA controls to stable candidate only after Reactive Forms disabled/write/change/touched behavior is covered.
- Keep component source copyable without hidden docs-app dependencies.
- Keep CLI overwrite behavior explicit and conservative.
- Document any known accessibility caveats per component before marking stable.
