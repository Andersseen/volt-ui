# Volt UI

Volt UI is an independent Angular UI project inspired by shadcn/ui. It provides copyable, editable Angular components built with standalone components, signals, Tailwind CSS v4, CVA, and [ng-primitives](https://ng-primitives.dev).

> Naming note: this project is not affiliated with PrimeVue Volt UI. Volt UI here means an independent Angular implementation for the `@voltui` packages and CLI.

## What Is Volt UI?

Volt UI is primarily a source-ownership workflow for Angular apps:

- Use the CLI to copy component source into your project.
- The copied files become your code.
- Customize markup, styles, behavior, and variants locally.
- Use the npm package only when you want shared themes, utilities, or advanced package consumption.

This is intentionally closer to shadcn/ui than to a closed component library.

## Why This Exists

Angular has strong headless and enterprise UI options, but fewer projects focused on the shadcn-style "copy the component and own it" workflow. Volt UI fills that space with Angular 21 patterns: standalone components, OnPush, signals, zoneless compatibility, ng-primitives accessibility behavior, and Tailwind v4 tokens.

## Recommended Usage With CLI

Initialize a local UI folder:

```bash
npx @voltui/cli init
```

Add components:

```bash
npx @voltui/cli add button
npx @voltui/cli add card
npx @voltui/cli add dialog
```

Use copied components from your app:

```ts
import { UiButton } from './ui/button';

@Component({
  selector: 'app-example',
  imports: [UiButton],
  template: `<ui-button>Save</ui-button>`,
})
export class ExampleComponent {}
```

CLI behavior:

- Copies from `projects/volt/src/lib` into `src/app/ui` by default.
- Transforms `Volt*` to `Ui*` and `volt-*` to `ui-*`.
- Copies local component dependencies automatically.
- Refuses to overwrite existing files unless `--force` is passed.
- Supports `--dry-run` to preview files before writing.
- Supports `[target-dir]` when you want another destination.
- Supports `--install` to install runtime dependencies.

Example:

```bash
npx @voltui/cli add button card ./src/app/shared/ui --dry-run
npx @voltui/cli add button card ./src/app/shared/ui --force --install
```

## Optional Package Usage

The `@voltui/components` package exists for themes, utilities, and advanced consumers who deliberately want package-owned imports. It is not the recommended default for app teams who want source ownership.

```bash
npm install @voltui/components
```

Import themes once:

```css
@import '@voltui/components/themes.css';
```

Provide a theme:

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

Copied components require these runtime dependencies in the target app:

```bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
```

## Theme System

Themes are CSS custom properties mapped into Tailwind v4 via `@theme inline`.

Color presets:

- `volt`
- `ember`
- `sage`
- `dusk`
- `glacier`

Style presets:

- `sharp`
- `soft`
- `brutal`
- `ghost`
- `retro`

Components should use semantic Tailwind utilities such as `bg-primary`, `text-foreground`, `rounded-md`, and `shadow-sm`, rather than hard-coded `var()` utilities in component templates.

## Components Status

Volt UI is in pre-v1 hardening. Some primitives are stable candidates; complex overlays, composite inputs, file workflows, and layout interactions are still experimental.

See [COMPONENT_STATUS.md](./COMPONENT_STATUS.md) for the current status table covering forms, keyboard support, overlay/focus behavior, docs, and tests.

## Stability / Roadmap To v1

Current status: `0.x`, alpha hardening.

Before v1, the project needs:

- Hardened CLI source-copy workflow with overwrite protection and dependency copying.
- Reactive Forms coverage for all CVA components.
- E2E coverage for overlay open/close, Escape, focus return, and keyboard paths.
- Clear component status labels in docs.
- Stable theme token names and preset behavior.
- Better docs for source ownership, customization, and migration.

Stable means:

- Public inputs/outputs/selectors are documented.
- Component has meaningful unit tests.
- Forms and keyboard behavior are tested where applicable.
- Copied source is usable without private repo assumptions.
- Known accessibility and focus behavior is documented.

While Volt UI remains pre-v1, minor releases may still include breaking changes to component APIs, selectors, CSS class composition, theme tokens, generated CLI output, and manifest metadata. Breaking changes should be called out in release notes and kept focused. After v1, breaking changes should move to majors.

## Development

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build:lib
pnpm test:e2e:ci
```

Regenerate the CLI manifest after component source changes:

```bash
pnpm manifest
```

Live docs: https://volt-ui.pages.dev
