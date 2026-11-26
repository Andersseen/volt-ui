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
volt init [--path=<dir>] [--base=ng-primitives|quartz]
volt init [target-dir]            # v1 form, still supported
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
volt init --path=./src/app/shared/ui
```

### add

```bash
volt add <component>... [--path=<dir>] [--base=<base>] [--install] [--dry-run] [--force]
volt add <component>... [target-dir]    # v1 form, still supported
```

Examples:

```bash
volt add button
volt add button card input
volt add card --path=./src/app/shared/ui
volt add card --path ./src/app/shared/ui
volt add dialog --path=./src/app/shared/ui --dry-run
volt add button --install
volt add button --force
```

Flags:

| Flag            | Description                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `--path=<dir>`  | Destination directory, resolved against the current directory. Also `--path <dir>`. Every other argument is then a component name. |
| `target-dir`    | The v1 positional destination: a trailing argument that is not a component. Kept for compatibility; prefer `--path`.               |
| `--base=<base>` | `ng-primitives` (default) or `quartz` (experimental). Recorded in `volt.json`.                                                     |
| `--install`     | Installs the npm packages the copied files import, once, in the resolved project (see below).                                      |
| `--dry-run`     | Prints the project, the plan and the dependency check without creating directories, writing files or `volt.json`, or installing.   |
| `--force`       | Allows replacing planned component and shared files that differ from the Volt UI source. Never touches other files.                |

#### Choosing the destination

Without a destination, components go to `src/app/ui` of the **nearest `package.json` above the
current directory** — running the CLI from `src/app` no longer creates `src/app/src/app/ui`. A
destination you give (`--path` or positional) is resolved against the current directory.

The v1 positional form keeps working: `volt add button custom-ui` copies into `./custom-ui`. Because
a bare name could also be a mistyped component, the CLI then says how it read the argument and
suggests `--path=custom-ui` (and the component it may have meant, for `volt add button dialg`).
Arguments after the target directory are an error instead of being ignored. With `--path`, every
positional argument must be a component, so a typo fails before anything is written.

#### Arguments are validated

Each command accepts only its own flags. An unknown flag (`--forse`, with a suggestion), a value
flag without a value (`--path`, `--path=`), a value on a boolean flag (`--force=yes`), the same
value flag repeated with different values, extra arguments (`volt list x`, `volt init a b`) and an
unknown command all stop with an error and exit status 1. `volt`, `volt help`, `--help` and `-h`
print the usage.

#### Project, workspace and package manager

The project is resolved from the destination, not assumed to be the current directory:

| What            | How it is found                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package         | The nearest directory with a `package.json` at or above the destination. `volt.json` lives there; `--install` adds there.                                                           |
| Workspace       | A pnpm (`pnpm-workspace.yaml`), npm, Yarn or Bun (`workspaces` in `package.json`) root that lists that package.                                                                     |
| Package manager | The `packageManager` field (package, then workspace root), else the lockfile: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` / `npm-shrinkwrap.json`, `bun.lock` / `bun.lockb`. |

Run from a workspace root with no destination, the CLI does not guess which application you mean:
it lists the workspace's applications and asks for `--path` (e.g.
`--path=apps/admin/src/app/ui`). Lockfiles of two different managers in one directory with no
`packageManager` field are ambiguous too: `--install` refuses (copying without it is fine). The CLI
never installs into the Volt UI repository itself.

#### Runtime dependencies

A copy needs only the npm packages its files import — Card needs `clsx` and `tailwind-merge`,
Button also `class-variance-authority` and `ng-primitives`, a Quartz copy never `ng-primitives`.
The ranges come from `@voltui/components`' own `package.json` and travel in the CLI's registry
together with the versions this release was tested with; the CLI holds no list of its own. After
`volt add`, the CLI prints each package's state:

| State     | Meaning                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| `keep`    | Declared and installed inside the range: left exactly as it is.                               |
| `add`     | Missing: added with the library's range (`clsx@^2.0.0`).                                      |
| `declare` | Installed only as another package's dependency: declared, at the range, without upgrading it. |
| `install` | Declared with a compatible range but not installed yet: a plain `install` fetches it.         |
| `problem` | Installed or declared outside the range, or Angular missing: reported, never changed.         |

`--install` follows that table: it runs **one** command in the resolved package (`pnpm add …`,
`yarn add …`, `bun add …`; for npm workspaces `npm install … --workspace <pkg>` from the root), only
for `add`/`declare`/`install` entries, then checks that every package now resolves inside its
range. It never upgrades Angular — a missing `@angular/cdk` or `@angular/router` is added at the
installed core's version — and never rewrites unrelated dependencies. Anything that would make the
install unsafe (an incompatible version, no Angular, an ambiguous manager, no `package.json`) stops
the command **before the first file is written**. Without `--install`, the CLI prints the exact
command to run.

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

With `--install`, packages are installed once, after every file has been written. If the package
manager fails — or reports success while a package still does not resolve inside its range — the
copied files stay in place, the CLI exits with status 1 and prints the command to run by hand.

### list

```bash
volt list [--status=stable|beta|experimental] [--base=quartz] [--json]
```

Prints the components in the CLI's registry, grouped as in the documentation, with their status
(from `COMPONENT_STATUS.md`) and what each is for.

## How Copying Works

When you run `volt add button`:

1. Source files are read from the registry packed into `@voltui/cli` (in this repository:
   `packages/volt/src/lib/components/button/`).
2. Selectors are transformed from `volt-*` to `ui-*`.
3. Class and identifier names are transformed from `Volt*` / `volt*` to `Ui*` / `ui*`.
4. Local component dependencies from the manifest are copied too.
5. The target `index.ts` barrel is updated.
6. Identical files are reused; edited files are protected unless you pass `--force`.

The CLI reports unknown components clearly. Run `volt list` if a component name fails.

## Styles

Copied components are styled with Tailwind CSS v4 utilities and Volt's semantic tokens. Import the
tokens from the package (`npm install @voltui/components` for its CSS, even if you import no
TypeScript from it) and let Tailwind scan your copy:

```css
@import 'tailwindcss';
@import '@voltui/components/themes.css';
```

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
