# Component Status

Volt UI is pre-v1. Status labels describe the current confidence level for the copy-paste workflow, not a permanent promise.

> Naming note: this is the independent Angular Volt UI project under `@voltui`, not PrimeVue Volt UI.

## Status Labels

- **stable**: recommended for early adoption; API and behavior are close to v1 shape, with meaningful tests and docs.
- **beta**: usable, but may still need more form, keyboard, accessibility, or edge-case coverage.
- **experimental**: useful demos exist, but the API or behavior may change before v1.

## Release Groups

- **Stable**: `avatar`, `badge`, `breadcrumbs`, `button`, `card`, `checkbox`, `form-field`, `input`, `meter`, `progress`, `radio`, `separator`, `skeleton`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`.
- **Beta**: `accordion`, `autofill`, `combobox`, `date-picker`, `dialog`, `drawer`, `dropdown-menu`, `file-upload`, `input-otp`, `listbox`, `native-select`, `navigation-menu`, `pagination`, `popover`, `range-slider`, `resizable`, `search`, `select`, `sidebar`, `table`, `tabs`, `theme`, `toast`, `toolbar`, `tooltip`.
- **Experimental**: none. The v1 component surface is now fixed.

## Table

| Component       | Status | Forms support             | Keyboard support                | Overlay/focus behavior                   | Docs | Tests               |
| --------------- | ------ | ------------------------- | ------------------------------- | ---------------------------------------- | ---- | ------------------- |
| accordion       | beta   | n/a                       | via ng-primitives               | n/a                                      | yes  | unit                |
| autofill        | beta   | n/a                       | n/a                             | n/a                                      | yes  | unit                |
| avatar          | stable | n/a                       | n/a                             | n/a                                      | yes  | unit                |
| badge           | stable | n/a                       | n/a                             | n/a                                      | yes  | unit                |
| breadcrumbs     | stable | n/a                       | link semantics                  | n/a                                      | yes  | unit                |
| button          | stable | n/a                       | native button                   | focus-visible styles                     | yes  | unit + e2e docs     |
| card            | stable | n/a                       | n/a                             | n/a                                      | yes  | unit + e2e docs     |
| checkbox        | stable | full CVA contract         | via ng-primitives               | focus-visible styles                     | yes  | unit                |
| combobox        | beta   | full CVA contract         | via ng-primitives               | dropdown keyboard/focus covered          | yes  | unit                |
| date-picker     | beta   | Reactive Forms CVA        | via ng-primitives               | calendar browser coverage can expand     | yes  | unit                |
| dialog          | beta   | n/a                       | Escape covered in e2e           | focus trap/return, outside click covered | yes  | unit + e2e          |
| drawer          | beta   | n/a                       | Escape covered in e2e           | focus trap/return, outside click covered | yes  | unit + e2e          |
| dropdown-menu   | beta   | n/a                       | Arrow/Home/End/Enter covered    | Escape, outside click, focus covered     | yes  | unit + e2e          |
| file-upload     | beta   | output-based API          | native input behavior           | drag/drop browser coverage can expand    | yes  | unit                |
| form-field      | stable | projected-control wiring  | label/description semantics     | n/a                                      | yes  | unit                |
| input           | stable | full CVA contract         | native input                    | focus-visible styles                     | yes  | unit + e2e docs     |
| input-otp       | beta   | local value API           | partial                         | focus movement needs more coverage       | yes  | unit                |
| listbox         | beta   | full CVA contract         | Arrow/Enter via ng-primitives   | active option covered                    | yes  | unit                |
| meter           | stable | n/a                       | n/a                             | n/a                                      | yes  | unit + e2e consumer |
| native-select   | beta   | native `<select>` element | native select                   | n/a                                      | yes  | unit                |
| navigation-menu | beta   | n/a                       | via ng-primitives               | nested menu browser coverage can expand  | yes  | unit                |
| pagination      | beta   | n/a                       | native buttons/links            | focus-visible styles                     | yes  | unit                |
| popover         | beta   | n/a                       | Escape covered in e2e           | open/close/position covered              | yes  | unit + e2e          |
| progress        | stable | n/a                       | n/a                             | n/a                                      | yes  | unit + e2e consumer |
| radio           | stable | full CVA contract         | via ng-primitives               | focus-visible styles                     | yes  | unit                |
| resizable       | beta   | n/a                       | arrow keys and pointer          | separator exposes ARIA value             | yes  | unit                |
| search          | beta   | structural wrapper        | native input                    | focus-visible styles                     | yes  | unit                |
| select          | beta   | full CVA contract         | partial                         | listbox Escape covered in e2e            | yes  | unit + e2e          |
| separator       | stable | n/a                       | n/a                             | n/a                                      | yes  | unit + e2e consumer |
| sidebar         | beta   | n/a                       | native links and Escape         | tooltip dependency covered               | yes  | unit + manifest     |
| skeleton        | stable | n/a                       | n/a                             | n/a                                      | yes  | unit                |
| slider          | stable | full CVA contract         | via ng-primitives               | focus-visible styles                     | yes  | unit + e2e consumer |
| switch          | stable | full CVA contract         | via ng-primitives               | focus-visible styles                     | yes  | unit + e2e consumer |
| table           | beta   | n/a                       | ARIA table semantics            | n/a                                      | yes  | unit                |
| tabs            | beta   | n/a                       | via ng-primitives               | tab focus behavior via primitive         | yes  | unit + e2e consumer |
| textarea        | stable | full CVA contract         | native textarea                 | focus-visible styles                     | yes  | unit                |
| theme           | beta   | n/a                       | n/a                             | document-level theme state               | yes  | unit                |
| toast           | beta   | n/a                       | close control covered           | pause and keyboard dismissal covered     | yes  | unit + e2e          |
| toggle          | stable | full CVA contract         | via ng-primitives               | focus-visible styles                     | yes  | unit                |
| toggle-group    | stable | full CVA contract         | via ng-primitives               | roving focus via primitive               | yes  | unit                |
| toolbar         | beta   | n/a                       | via ng-primitives               | focus grouping needs more coverage       | yes  | unit                |
| tooltip         | beta   | n/a                       | hover/focus/Escape/blur covered | aria-describedby and position covered    | yes  | unit + e2e          |

## v1 Hardening Checklist

- Keep all v1-surface components at beta until their remaining browser-level caveats are covered.
- Move CVA controls to stable candidate only after Reactive Forms disabled/write/change/touched behavior is covered.
- Keep component source copyable without hidden docs-app dependencies.
- Keep CLI overwrite behavior explicit and conservative.
- Document any known accessibility caveats per component before marking stable.
