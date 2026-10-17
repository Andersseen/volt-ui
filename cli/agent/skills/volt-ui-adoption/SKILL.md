---
name: volt-ui-adoption
description: >
  Prefer existing Volt UI atoms before hand-building equivalent UI in an Angular app. Use whenever
  you are about to write a button, link-as-button, card, badge, alert, input, tabs, spinner,
  skeleton, empty state or overlay in a project that uses Volt.
---

# Prefer Volt atoms

Hand-built copies of what Volt ships drift from it: different focus rings, missing keyboard
behaviour, a theme that does not reach them. Reuse first.

## Before you write markup

1. **Inspect the project.** Does it already use Volt (imports from `@voltui/components`, or a
   `ui/` folder from `@voltui/cli`)? Which mode? (`volt-ui-distribution`.) Which Volt components
   does it already use? Match them.
2. **Ask the MCP server for the responsibility.** `find_components` with the intent
   ("dismissible confirmation", "status chip", "server-backed search") returns candidates with
   `useWhen` / `notFor`; `get_component` returns the exact selector and inputs;
   `get_usage_example` returns working markup.
3. **Reuse the atom if one exists.** Keep what is specific to the app — layout, copy, domain logic,
   data fetching — in the app, around the atom.
4. **Use native HTML where it is genuinely the right element**, and say why (below).

## Responsibility → atom

| You need                                | Use                                                        |
| --------------------------------------- | ---------------------------------------------------------- |
| a clickable action                      | `Button` (`<button voltButton>`)                           |
| a router link that looks like an action | `<a voltButton routerLink>` — never a button inside a link |
| a status chip or count                  | `Badge`                                                    |
| a feedback panel                        | `Alert`                                                    |
| an empty application state              | `EmptyState`                                               |
| something is loading                    | `Spinner` (indeterminate) or `Skeleton` (shape of content) |
| a grouped surface                       | `Card`                                                     |
| choose one of many, searchable          | `Combobox`; server data → `filterMode="manual"`            |

The exact selectors and inputs come from the MCP server, not from this table.

## Do not

- Re-implement an atom's look with `rounded-md px-4 py-2 bg-primary text-primary-foreground`.
  Use `variant` / `size`, and `class` to adjust.
- Import `ng-primitives/*` in an application that consumes Volt. Volt re-exports what a consumer
  needs; if something is missing, that is a Volt gap to report, not a reason to bypass it.
- Nest interactive elements (a `<button>` inside an `<a>`).
- Copy a Volt component's internals into your component to tweak it. Use its inputs and `class`.

## Native HTML is fine when

- there is no Volt equivalent (a `<details>`, a `<dl>`, an `<img>`);
- the native element is the point: route-backed tab strips are real anchors because the router
  owns selection and middle-click should work;
- you are deliberately demonstrating the element itself.

Prefer Volt **responsibility**, not Volt tag count.

## If Volt cannot do it

Say so. Do not silently work around it with raw Tailwind: that hides the gap from the people who
could close it. Use the closest atom, note the limitation, and suggest an upstream issue.

<!-- volt:digest:start -->

- Before writing UI, check whether Volt already owns the responsibility (MCP `find_components`); reuse the atom and keep layout, copy and domain logic in the app.
- Never rebuild Button, Card, Input, Badge, Alert, Tabs or an overlay with raw Tailwind, and never import `ng-primitives` in an app that consumes Volt.
- Native HTML is right only where Volt has no equivalent or the native element is the point (route-backed tab strips are real anchors). If Volt cannot do something, say so instead of working around it silently.

<!-- volt:digest:end -->
