---
name: volt-ui-distribution
description: >
  Install, use and update Volt UI correctly in either distribution mode: the @voltui/components
  package (Volt* classes, volt-* selectors) or copy-and-own via @voltui/cli (Ui* classes, ui-*
  selectors under ./ui). Use to detect the project's mode, add components, compare a customised copy
  with a newer CLI (volt diff), fix wrong imports or prefixes, or set up the agent.
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

```css
@import 'tailwindcss'; /* the full import: it includes preflight */
@import '@voltui/components/themes.css';
```

Components are styled on top of Tailwind's preflight reset. Importing only `tailwindcss/theme.css` +
`utilities.css` leaves native buttons, links and inputs with the browser's font, padding and colours.

## Copy mode

```bash
npx @voltui/cli init                          # scaffold src/app/ui of the nearest package.json
npx @voltui/cli list                          # what exists, with status
npx @voltui/cli add button card               # copies source; component dependencies come along
npx @voltui/cli add dialog --path=./src/app/shared/ui --dry-run
npx @voltui/cli add card --install            # also installs what the copied files import
npx @voltui/cli add button --track            # also records hashes in src/app/ui/.volt-ui.json
npx @voltui/cli@<version> diff button         # read-only: local copy → that CLI's source
```

Name a destination with `--path=<dir>` (the positional `target-dir` still works but can be mistaken
for a component name; it is the only form a CLI older than 1.4.0 understands — see below). Without one, the CLI uses `src/app/ui` of the nearest
`package.json`, also from a subfolder; in a workspace root it asks which app (`--path`). Unknown
flags and extra arguments are errors — read the message, do not retry blindly.

The CLI copies source from the library, applies the `volt-` → `ui-` transform, and you own the
result: edit it freely. A later `add` reuses untouched files and refuses to overwrite edited ones
unless you pass `--force` — review `volt diff` first. Dependencies are per component: `volt add` prints
exactly which packages the copied files need (with ranges); `--install` installs those once in the
right package, keeps compatible versions and never upgrades Angular. Do not install a fixed list.
Component examples on voltui.dev and from `get_usage_example` come in both modes.

## Compositions (blocks, layouts, patterns)

Before hand-building a page section, an app shell or a workflow (settings form, server search, data
table), call the MCP tool `find_compositions`: it returns copyable Recipes compositions
(recipes.voltui.dev) with the components they use, install commands per mode and what stays with the
app. They are source to copy, not package exports. In copy mode put the files in
`src/app/<folder>/`; they import `../ui/<component>`, where `volt add` writes. Replace the `fake*`
function a pattern names with your service; keep its state in your component.

## Source vs published

voltui.dev and the MCP server describe the **source**; npm can be behind it. `get_project_info`
lists what npm serves (`versions.publishedOnNpm`) and every capability that is not published yet.
Pass the project's versions (`componentsVersion`, `cliVersion`) to it and to `get_component` /
`generate_cli_command` to learn what that project can use. With an older CLI, use the positional
destination instead of `--path`, and skip `--track` / `volt diff`. Never pin an unpublished version
(`npx @voltui/cli@<next>`) or tell a user to install one.

## Updating a customised copy

`volt diff <name> [--path=<dir>] [--json]` compares the copy (and its shared helpers) with the source
inside the CLI version that runs — not npm's latest — offline, and never changes a file. Exit 0 same,
1 different, 2 error. With a `--track` record it says per file whether the copy (`local-changed`),
the reference (`reference-changed`) or both changed; without one, `unknown-origin`. Move the hunks
you want by hand and run the tests; never `--force` over edits you want to keep, and never edit or
create `.volt-ui.json` by hand.

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
- Replace `@import 'tailwindcss'` with only `theme.css` + `utilities.css`: that drops preflight.

<!-- volt:digest:start -->

- Detect the mode first: `@voltui/components` (package: `Volt*`, `volt-*`) or a copied `ui/` folder (copy: `Ui*`, `ui-*`). Never mix them; `'volt'` is not importable in a consumer.
- Docs and MCP describe the source; check `get_project_info` (`publishedOnNpm`, unreleased capabilities) and pass the installed versions. Never recommend an unpublished version.
- Page sections, app shells and workflows: `find_compositions` first; copy the composition instead of rebuilding it.
- Copy mode: `npx @voltui/cli add <name> [--path=<dir>] [--install] [--track]` (installs only what the copy imports); package mode: `npm install @voltui/components`.
- Before updating an edited copy: `npx @voltui/cli@<version> diff <name>` (read-only, local → that CLI's source); apply hunks by hand, never `--force` over edits.
- CSS: the full `@import 'tailwindcss'` (with preflight, which Volt is styled on), then `@import '@voltui/components/themes.css'`.
- Pass the project's mode (`package` | `copy`) to the MCP tools to get matching selectors and imports.

<!-- volt:digest:end -->
