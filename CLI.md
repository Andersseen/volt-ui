# Volt UI CLI

`@voltui/cli` copies Volt UI component source into your Angular project, similar to shadcn/ui.

> Volt UI is an independent Angular project and is not related to PrimeVue Volt UI.

## Philosophy

The CLI workflow is the recommended way to use Volt UI components. Copied files become code in your app. You can edit them, delete variants, add styles, or change behavior without waiting on the library package.

The npm package `@voltui/components` is mainly for themes, utilities, and advanced direct package consumption.

## Installation

```bash
npx @voltui/cli init
npx @voltui/cli add button
```

During local development in this repo:

```bash
node cli/bin/volt add button
```

## Commands

### init

```bash
volt init [target-dir]
```

Creates the target UI directory and an `index.ts` barrel.

`init` is safe to run again, and in an existing project: a missing directory is created, a missing
`index.ts` gets the initial barrel, and an existing `index.ts` is left exactly as it is — comments,
imports, custom exports and formatting included. No other file is touched.

Default target:

```text
./src/app/ui
```

Example:

```bash
volt init ./src/app/shared/ui
```

### add

```bash
volt add <component-name>... [target-dir] [--install] [--dry-run] [--force]
```

Examples:

```bash
volt add button
volt add button card input
volt add card ./src/app/shared/ui
volt add dialog ./src/app/shared/ui --dry-run
volt add button --install
volt add button --force
```

Flags:

| Flag         | Description                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `target-dir` | Optional destination directory. Defaults to `./src/app/ui`.                                                               |
| `--install`  | Installs runtime dependencies in the current working directory.                                                           |
| `--dry-run`  | Prints the operation plan (see below) without creating directories, writing files or `volt.json`, or installing packages. |
| `--force`    | Allows replacing planned component and shared files that differ from the Volt UI source. Never touches other files.       |

Runtime dependencies installed by `--install`:

```bash
ng-primitives class-variance-authority clsx tailwind-merge
```

#### One operation, validated before anything is written

`volt add tooltip sidebar` is planned as a single operation: the requested components, their
transitive dependencies (Sidebar needs Tooltip and Theme) and the shared helpers they import
(`utils.ts`, `form-control-state.ts`, …) are collected once, deduplicated, and every target file is
compared with what is already on disk:

| On disk                         | Plan                                                                  |
| ------------------------------- | --------------------------------------------------------------------- |
| missing                         | `create`                                                              |
| identical to the Volt UI source | `reuse` — left untouched (line-ending differences count as identical) |
| different (you edited it)       | `conflict` — the command stops; with `--force`, `replace`             |

So the order of names does not matter (`add tooltip sidebar` and `add sidebar tooltip` give the same
files), re-adding an untouched component is a no-op, and an edited component or shared helper is
never overwritten silently.

If anything in the plan is a conflict, an unknown component, a missing source file or a component
the selected base does not support, the command fails **before the first write**: no file is created
or changed and `index.ts` stays as it was. The error names each conflicting path and the two ways
out (keep your edits and use another target-dir, or review the difference and re-run with `--force`).

If a write itself fails (permissions, a full disk), the CLI restores the files it replaced, removes
the files and empty directories it created, and leaves everything else alone. This is not a
crash-proof transaction: a killed process can still leave a partial copy, and the error says so if
the restore itself fails.

The barrel only grows: missing `export * from './<component>';` lines are appended, a component the
barrel already exports (in any quote style, or through a curated `export { … } from`) is not added
again, and nothing already in the file is rewritten.

`--dry-run` prints that same plan — requested components, dependencies, shared files, each file's
`create` / `reuse` / `replace` / `conflict`, and the exports the barrel would gain — and exits with
status 1 when the real command would stop on a conflict.

With `--install`, packages are installed once, after every file has been written. If the install
fails, the copied files stay in place and the CLI prints the command to run by hand.

### list

```bash
volt list
```

Prints component names from `public/manifest.json`.

## How Copying Works

When you run `volt add button`:

1. Source files are read from `packages/volt/src/lib/components/button/`.
2. Selectors are transformed from `volt-*` to `ui-*`.
3. Class and identifier names are transformed from `Volt*` / `volt*` to `Ui*` / `ui*`.
4. Local component dependencies from the manifest are copied too.
5. The target `index.ts` barrel is updated.
6. Identical files are reused; edited files are protected unless you pass `--force`.

The CLI reports unknown components clearly. Run `volt list` if a component name fails.

## Usage In Your App

```ts
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: `<ui-button variant="solid">Click me</ui-button>`,
})
export class MyComponent {}
```

## Available Components

See [COMPONENT_STATUS.md](./COMPONENT_STATUS.md) for the current component list and maturity status.

## Safety Notes

- Copied components are yours to maintain.
- Re-running `volt add` over an untouched component changes nothing; over an edited one it requires `--force` — review the diff before doing that.
- Re-running `volt init` never replaces your `index.ts`.
- Prefer `--dry-run` when adding beta or dependency-heavy components.
- Regenerate the manifest with `pnpm manifest` after changing component source in this repo.
