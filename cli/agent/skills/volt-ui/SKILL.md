---
name: volt-ui
description: >
  Entry point for Volt UI, an Angular component library (ng-primitives, Tailwind v4, signals).
  Use when a project imports from '@voltui/components' or has copied Volt source under src/app/ui,
  or the user asks for UI in an app that uses Volt. Routes to the specialised volt-ui-* skills and
  to the Volt MCP server, which is the source of exact component APIs.
---

# Volt UI

Volt is a set of accessible Angular **atoms** (Button, Input, Card, Tabs, Dialog, Combobox…). The
app keeps its own layout, icons, state and domain components.

## Three rules

1. **Volt first.** Before writing UI, check whether Volt already owns the responsibility
   (`volt-ui-adoption`). Do not rebuild Button, Card, Input, Badge, Alert, Tabs or an overlay with
   raw Tailwind, and do not import `ng-primitives` to get around Volt.
2. **The MCP server is the source of exact facts.** Selectors, inputs, outputs, variants, status and
   examples change between releases. Ask the `volt-ui` MCP server (`list_components`,
   `find_components`, `get_component`, `get_usage_example`) instead of recalling them. Never invent an
   input. If the server is not connected, read the component's source or run `npx @voltui/cli list`.
3. **Match the project's mode.** Package mode imports `Volt*` from `'@voltui/components'` and uses
   `volt-*` selectors. Copy mode has `Ui*` classes and `ui-*` selectors under `./ui`. Check which
   (`volt-ui-distribution`) before writing a single import.

## Which skill

| You are about to…                                                  | Load                          |
| ------------------------------------------------------------------ | ----------------------------- |
| build any UI: buttons, cards, lists, states                        | `volt-ui-adoption`            |
| choose between two similar components                              | `volt-ui-component-selection` |
| build a form, validation, a select or a search                     | `volt-ui-forms`               |
| open a dialog, drawer, popover, menu, tooltip or toast             | `volt-ui-overlays`            |
| change colours, size, spacing or theme; override a component       | `volt-ui-styling`             |
| install, update or copy components; unsure of the import or prefix | `volt-ui-distribution`        |

Accessibility is part of every skill, not a separate step: Volt components carry the roles, keyboard
and focus behaviour, so the way to keep it is to use them as documented.

<!-- volt:digest:start -->

- Volt first: reuse an existing atom before hand-building UI; never import `ng-primitives` to bypass Volt.
- The `volt-ui` MCP server is the source of exact selectors, inputs, status and examples (`find_components`, `get_component`, `get_usage_example`); never invent an input.
- Match the project's mode: package (`Volt*`, `'@voltui/components'`) or copy (`Ui*`, `./ui`).

<!-- volt:digest:end -->
