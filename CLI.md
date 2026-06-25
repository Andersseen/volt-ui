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

| Flag         | Description                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------- |
| `target-dir` | Optional destination directory. Defaults to `./src/app/ui`.                                   |
| `--install`  | Installs runtime dependencies in the current working directory.                               |
| `--dry-run`  | Prints the files that would be copied without writing files or installing packages.           |
| `--force`    | Allows overwriting existing component files. Without this flag, the CLI refuses to overwrite. |

Runtime dependencies installed by `--install`:

```bash
ng-primitives class-variance-authority clsx tailwind-merge
```

### list

```bash
volt list
```

Prints component names from `public/manifest.json`.

## How Copying Works

When you run `volt add button`:

1. Source files are read from `projects/volt/src/lib/components/button/`.
2. Selectors are transformed from `volt-*` to `ui-*`.
3. Class and identifier names are transformed from `Volt*` / `volt*` to `Ui*` / `ui*`.
4. Local component dependencies from the manifest are copied too.
5. The target `index.ts` barrel is updated.
6. Existing files are protected unless you pass `--force`.

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

See [COMPONENT_STATUS.md](./COMPONENT_STATUS.md) for the current component list and pre-v1 maturity status.

## Safety Notes

- Copied components are yours to maintain.
- Re-running `volt add` over an edited component requires `--force`; review the diff before doing that.
- Prefer `--dry-run` when adding experimental or dependency-heavy components.
- Regenerate the manifest with `pnpm manifest` after changing component source in this repo.
