---
name: volt-ui-distribution
description: >
  Install, use and update Volt UI correctly in either distribution mode: the @voltui/components
  package (Volt* classes, volt-* selectors) or copy-and-own via @voltui/cli (Ui* classes, ui-*
  selectors under ./ui). Use to detect the project's mode, add components, fix wrong imports or
  prefixes, or set up the agent.
---

# Package vs copy-and-own

Both modes are first-class for the whole 1.x line. Never mix them by accident.

## Detect the mode first

| Evidence                                                                             | Mode    |
| ------------------------------------------------------------------------------------ | ------- |
| `@voltui/components` in `package.json`; `import { VoltX } from '@voltui/components'` | package |
| a `src/app/ui/` folder (or the CLI's configured dir); `import { UiX } from './ui/x'` | copy    |

If unclear, ask — do not guess. A project in package mode must not get a copied `ui/` folder, and a
copy-mode project must not import `@voltui/components`.

## What changes between modes

| Context | Selector                                  | Class     | Import                 |
| ------- | ----------------------------------------- | --------- | ---------------------- |
| package | `volt-*` / `[voltXxx]`                    | `VoltXxx` | `'@voltui/components'` |
| copy    | `ui-*` / `[uiXxx]` (the CLI renames them) | `UiXxx`   | `'./ui/<component>'`   |

`'volt'` is only a path alias inside the Volt monorepo; it never exists in a consumer project. The
MCP server's `get_component` / `get_usage_example` accept `mode: "package" | "copy"`; pass the
project's mode and you get matching selectors and imports.

## Package mode

```bash
npm install @voltui/components @angular/cdk
```

Peer dependencies (`@angular/core`, `common`, `forms`, `router`, `cdk`) are declared by the package; install `@angular/cdk` yourself at the same major as `@angular/core`. Import the theme CSS and, optionally,
`provideVoltTheme` (see `volt-ui-styling`). Updating is a version bump; read the changelog's
migration notes for a major.

## Copy mode

```bash
npx @voltui/cli init                # scaffold the ui folder
npx @voltui/cli list                # what exists, with status
npx @voltui/cli add button card     # copies source; dependencies between components are detected
npx @voltui/cli add dialog ./src/app/shared/ui --dry-run
```

The CLI copies source from the library, applies the `volt-` → `ui-` transform, and you own the
result: edit it freely, but a later `add` of the same component can overwrite your edits — review the
diff. Install the runtime dependencies once (`ng-primitives class-variance-authority clsx
tailwind-merge`). Blocks, Layouts and Recipes from the docs site are copied the same way and import
the atoms from the project's mode.

## Agent setup

```bash
npx @voltui/agent <claude|codex|gemini|opencode|cursor|windsurf|copilot|vscode>
npx @voltui/agent doctor            # checks the files it wrote and the endpoint
npx @voltui/agent --uninstall <agent>
```

It writes the MCP server entry and, where the agent supports skills, these skills; for agents that
only read a rules file it writes a short routing block.

## Do not

- Write `volt-*` selectors in a copy-mode project or `ui-*` in package mode.
- Import from `'volt'` or from a path inside `node_modules/@voltui/components`.
- Add `ng-primitives` imports to application code.

<!-- volt:digest:start -->

- Detect the mode first: `@voltui/components` (package: `Volt*`, `volt-*`) or a copied `ui/` folder (copy: `Ui*`, `ui-*`). Never mix them; `'volt'` is not importable in a consumer.
- Copy mode: `npx @voltui/cli add <name>`; package mode: `npm install @voltui/components`.
- Pass the project's mode (`package` | `copy`) to the MCP tools to get matching selectors and imports.

<!-- volt:digest:end -->
