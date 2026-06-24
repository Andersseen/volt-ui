# Volt UI — Software Design Document (SDD)

**Version:** 0.2.0-alpha  
**Status:** Pre-v1 hardening  
**Last updated:** 2026-06-24  
**Maintainers:** Volt UI contributors

---

## 1. Overview

**Volt UI** is an Angular component library inspired by [shadcn/ui](https://ui.shadcn.com). It ships ready-to-copy components that consumers own and customize in their own codebases, combined with a published theme/CSS package (`@voltui/components`) for the design tokens and runtime utilities.

The project exists because the Angular ecosystem lacks a shadcn/ui equivalent: existing solutions such as Spartan/ng are mostly headless directives, while Volt UI provides higher-level, opinionated but customizable components with a built-in theme system.

### 1.1 Core idea

- **For Angular:** first-class support for Angular 21+ (zoneless, standalone components, signals).
- **Copy-paste ownership:** components are copied into the consumer project via a CLI, so teams can customize markup, styles, and behavior.
- **Primitive-based accessibility:** accessibility and interaction logic come from [ng-primitives](https://ng-primitives.dev), the Angular equivalent of Radix UI.
- **Tailwind-first styling:** styles are built with Tailwind CSS v4 and `class-variance-authority` (CVA), making variants fast to author and consistent.
- **Theme engine:** multiple color and style presets, switchable at runtime, backed by CSS custom properties.

### 1.2 Distribution model

Volt UI has two consumption paths:

1. **CLI / copy-paste workflow (recommended):** install `@voltui/cli`, run `volt init`, then `volt add <component>`. Source files are copied into the consumer's `src/app/ui/` folder, renamed from `volt-*` / `Volt*` to `ui-*` / `Ui*`, and wired to local imports.
2. **npm package workflow:** install `@voltui/components` to reuse the theme CSS, theme provider, and a small set of utilities directly.

The library is **not** a traditional drop-in component package for every component; the source-code ownership model is the primary design choice.

---

## 2. Goals and Non-Goals

### 2.1 Goals

- Provide a shadcn/ui-like experience for Angular developers.
- Keep components accessible by default through ng-primitives.
- Make components easy to customize because the source lives in the consumer project.
- Support multiple visual presets (colors + styles) without changing component code.
- Offer a first-class CLI for scaffolding and adding components.
- Maintain a docs site with live demos, source snippets, and usage examples.
- Reach v1 with a stable public API, solid test coverage, and hardened overlay/form components.

### 2.2 Non-Goals

- Be a locked, black-box UI kit (consumers are expected to edit the copied code).
- Support Angular versions older than v21.
- Maintain a Tailwind v3 configuration (`tailwind.config.js` is intentionally absent).
- Provide every possible component variant out of the box; variants are templates consumers can extend.
- Re-implement low-level accessibility primitives from scratch (ng-primitives handles this).

---

## 3. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       Docs App (volt-ui)                    │
│              AnalogJS + Vite + SSR + Tailwind v4            │
│  Pages: src/app/pages/(components-docs)/docs/components/    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ imports via `volt` alias
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Library Source (projects/volt)            │
│   Components    Layouts    Themes    Theme provider         │
│   public-api.ts                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ build / copy
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         CLI (@voltui/cli)                   │
│   init / add / list / clear-cache                           │
│   Transforms volt-* → ui-* and copies source locally        │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Repository layout

```text
/
├── projects/volt/                 # Publishable Angular library
│   ├── src/lib/components/<name>/ # Component source folders
│   ├── src/lib/layouts/<name>/    # Layout components (e.g. sidebar)
│   ├── src/themes/                # Theme presets and core tokens
│   ├── src/public-api.ts          # Public exports
│   └── package.json               # @voltui/components manifest
├── src/app/                       # AnalogJS docs app
│   ├── pages/(components-docs)/docs/components/<name>.page.ts
│   └── lib/snippets/              # Source and usage snippets
├── cli/                           # @voltui/cli package
│   ├── bin/volt                   # CLI entry
│   ├── lib/core.js                # Copy/transform logic
│   └── generate-manifest.js       # public/manifest.json generator
├── public/manifest.json           # Component manifest
├── e2e/                           # Playwright tests
├── package.json                   # Workspace root
└── vite.config.ts                 # Vite + AnalogJS config
```

---

## 4. Tech Stack

| Layer           | Technology                        | Version          | Purpose                                                                 |
| --------------- | --------------------------------- | ---------------- | ----------------------------------------------------------------------- |
| Framework       | Angular                           | ^21.2.2          | UI framework, zoneless change detection, standalone components, signals |
| Docs / SSR      | AnalogJS                          | ^2.6.1           | File-based routing, SSR, Nitro preset for Cloudflare Pages              |
| Build tool      | Vite                              | ^7.3.1           | Dev server and production builds                                        |
| Styling         | Tailwind CSS                      | ^4.3.0           | CSS-only configuration, `@theme inline`                                 |
| Primitives      | ng-primitives                     | 0.110.2          | Accessible behaviors (button, dialog, select, tabs, etc.)               |
| Variants        | class-variance-authority          | ^0.7.1           | Type-safe component variants                                            |
| Class merging   | clsx + tailwind-merge             | ^2.1.1 / ^3.5.0  | Conditional and deduplicated class strings                              |
| Forms           | @angular/forms                    | ^21.2.2          | ControlValueAccessor integration                                        |
| Positioning     | @floating-ui/dom                  | ^1.6.0           | Overlay positioning                                                     |
| Icons           | lumen-icons                       | ^0.1.0           | Icon set                                                                |
| Testing (unit)  | Vitest + @testing-library/angular | ^4.1.8 / ^19.2.1 | Component unit tests                                                    |
| Testing (e2e)   | Playwright                        | ^1.60.0          | Browser and consumer fixture tests                                      |
| Package manager | pnpm                              | 10.30.1          | Workspace dependency management                                         |
| Deploy          | Wrangler / Cloudflare Pages       | ^4.72.0          | Docs app hosting                                                        |

---

## 5. Component Model

### 5.1 Design rules

Every library component follows these rules:

- **Standalone component** — no NgModules.
- **OnPush change detection** everywhere.
- **Signals API** — `input()`, `output()`, `model()`, `computed()` for derived class strings.
- **Boolean inputs** must use `booleanAttribute`:
  ```ts
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  ```
- **Number inputs** should use `numberAttribute` when relevant (e.g. slider).
- **CVA for variants** — each variant surface is defined with `class-variance-authority` and exported as `<name>Variants`.
- **ng-primitives integration** via direct template directives (`ngpButton`, `ngpInput`) or `hostDirectives` (accordion, tabs, slider, etc.).
- **Form integration** — input, checkbox, switch, toggle, select, slider, textarea implement `ControlValueAccessor` with `NG_VALUE_ACCESSOR`.
- **Class merging utility** — components merge base, variant, and user classes with `clsx` + `tailwind-merge`.

### 5.2 File structure per component

```text
projects/volt/src/lib/components/button/
├── index.ts          # Public barrel export
├── button.ts         # Main component + CVA variants
└── button.spec.ts    # Unit tests (required for v1)
```

### 5.3 Naming conventions

| Scope                | Selector | Class   | File names              |
| -------------------- | -------- | ------- | ----------------------- |
| Library              | `volt-*` | `Volt*` | `button.ts`, `index.ts` |
| Consumer (after CLI) | `ui-*`   | `Ui*`   | `button.ts`, `index.ts` |

### 5.4 Form components

Form components must:

1. Implement `ControlValueAccessor`.
2. Accept `disabled` state and propagate it to ng-primitives directives.
3. Emit changes via the Angular forms API.
4. Remain compatible with reactive and template-driven forms.

---

## 6. Theme System

### 6.1 Philosophy

Components use Tailwind utilities (`bg-primary`, `rounded-md`, `shadow-sm`) instead of arbitrary `var()` values. Theme tokens are CSS custom properties mapped to Tailwind theme keys via `@theme inline`.

### 6.2 Token layers

- **Source variables** (`--volt-*`) — defined in `projects/volt/src/themes/core.css` and preset files. Example: `--volt-shadow-sm`.
- **Tailwind theme mapping** — maps semantic keys to source variables. Example: `--shadow-sm: var(--volt-shadow-sm);`.
- **Semantic variables** — `--background`, `--foreground`, `--primary`, `--secondary`, `--destructive`, `--success`, `--warning`, `--error`, `--info`, etc.

### 6.3 Presets

**Color palettes:**

- `volt` (default) — blue-purple
- `ember` — warm orange-red
- `sage` — green
- `dusk` — purple
- `glacier` — cool blue

**Style presets:**

- `sharp` (default) — moderate border radius
- `soft` — larger radius
- `brutal` — no radius, heavy borders
- `ghost` — minimal, transparent
- `retro` — classic aesthetic

### 6.4 Applying themes

Import the bundled theme CSS:

```css
@import '@voltui/components/themes.css';
```

Provide the theme at bootstrap:

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

Or apply dynamically:

```ts
import { applyVoltTheme } from '@voltui/components';
applyVoltTheme({ color: 'ember', style: 'soft', dark: true });
```

The provider sets `data-color`, `data-style`, and the `.dark` class on the document element.

---

## 7. CLI

The CLI package is `@voltui/cli` located in `cli/`.

### 7.1 Commands

| Command                                         | Description                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `volt init [target-dir]`                        | Scaffolds the local `ui/` folder with an `index.ts`.                                         |
| `volt add <component> [target-dir] [--install]` | Copies a component and its local dependencies, transforms naming, and installs runtime deps. |
| `volt list`                                     | Lists components from `public/manifest.json`.                                                |
| `volt clear-cache`                              | Clears `~/.volt-ui/cache`.                                                                   |

### 7.2 Copy / transform behavior

1. Reads source from `projects/volt/src/lib` (local copy workflow).
2. Replaces `volt-` selectors with `ui-`.
3. Replaces `Volt*` / `volt*` identifiers with `Ui*` / `ui*`.
4. Rewrites `from 'volt'` imports to local `./index`.
5. Updates the target `index.ts` barrel.
6. Installs runtime dependencies if `--install` is passed: `ng-primitives`, `class-variance-authority`, `clsx`, `tailwind-merge`.

### 7.3 Manifest

`public/manifest.json` is generated by `cli/generate-manifest.js` and describes:

- Available components and layouts.
- Files per component.
- Version.
- Transitive dependencies detected automatically from source imports (`'volt'` alias and relative imports across component/layout folders).

Run `pnpm manifest` to regenerate it after component changes.

### 7.4 Known limitations

- Dependency mapping relies on explicit cross-component imports in source files; components that are only used together in demos but not imported in source must still be added manually if needed.
- The CLI does not yet support adding multiple components in a single command.

---

## 8. Documentation App

The docs app is an AnalogJS application using file-based routing.

### 8.1 Routes

- Component docs live at `src/app/pages/(components-docs)/docs/components/<name>.page.ts`.
- Getting-started and other content pages live under `src/app/pages/(getting-started)/docs/`.

### 8.2 Demo page anatomy

A typical component demo page:

- Imports the library component via the `volt` alias.
- Uses a `CodePanel` component to display source and usage snippets.
- Imports raw source from `src/app/lib/snippets/index.ts`.
- Imports usage examples from `src/app/lib/snippets/usage.ts`.

### 8.3 Snippet system

- `src/app/lib/snippets/index.ts` — exports raw component source files (`*.ts?raw`) for the "Copy code" feature.
- `src/app/lib/snippets/usage.ts` — exports usage examples for every public component.

When adding or editing a component, both snippet files must be updated.

---

## 9. Testing Strategy

### 9.1 Unit tests

- **Runner:** Vitest.
- **Setup:** `test-setup.ts` configures zoneless `TestBed`, jest-dom matchers, and common DOM mocks (`matchMedia`, `ResizeObserver`, `getAnimations`).
- **Library tests:** live next to components in `projects/volt/src/lib/components/**/*.spec.ts`.
- **App tests:** live in `src/app/**/*.spec.ts`.
- **Pattern:** prefer `@testing-library/angular` `render()` + `screen` + `userEvent` over manual `TestBed` wiring.

### 9.2 E2E tests

- **Tool:** Playwright.
- **Main config:** `playwright.config.ts` — tests the docs app in Chromium and Firefox.
- **Consumer config:** `playwright.consumer.config.ts` — tests the built library inside a fixture Angular app.
- **Coverage:** smoke tests on demo pages and overlay behavior (select, popover, dropdown, tooltip, dialog, drawer).

### 9.3 CLI tests

- `cli/tests/core.spec.js` covers `transformContent`, manifest loading, `initProject`, `copyComponent`, and cache behavior.

---

## 10. Quality Tooling and CI/CD

### 10.1 Local checks

```bash
pnpm lint          # ESLint for .ts and .html
pnpm typecheck     # tsc --noEmit
pnpm test:run      # Vitest unit tests
pnpm build:lib     # ng-packagr library build
pnpm test:e2e:ci   # Build + Playwright smoke tests
```

### 10.2 Lint and format

- **ESLint:** `eslint.config.js` uses `@eslint/js`, `typescript-eslint`, `angular-eslint`, `prettier`.
  - Valid component prefixes: `app`, `volt`, `ui`.
  - `cli/` is ignored by the root config (CLI has its own package).
- **Prettier:** formats TS, HTML, CSS, SCSS, JSON, MD.
- **Husky:** pre-commit runs `lint-staged`; commit-msg hook is present but currently disabled.

### 10.3 GitHub Actions

- **CI** (`.github/workflows/ci.yml`): lint, typecheck, unit tests, library build, CLI pack, Playwright install, e2e smoke + consumer tests.
- **Deploy** (`.github/workflows/deploy-cloudflare-pages.yml`): lint, typecheck, unit tests, lib + app build, deploy to Cloudflare Pages.

---

## 11. Public API Surface

The library currently exposes 40 component groups plus one layout from `projects/volt/src/public-api.ts`:

- **Basic:** button, badge, input, search, autofill, textarea, card
- **Form:** checkbox, radio, switch, toggle, form-field, select, slider, input-otp, file-upload, combobox, date-picker, listbox
- **Overlays:** tooltip, dialog, drawer, popover, dropdown-menu, toast
- **Navigation:** navigation-menu, tabs, accordion, breadcrumbs, pagination, toolbar, sidebar (layout)
- **Data / Feedback:** avatar, separator, progress, meter, toggle-group, skeleton, table, resizable
- **Theming:** theme provider and utilities

> The public API is still alpha; breaking changes may occur before v1.

---

## 12. Roadmap to v1

The following items are considered blockers or strong requirements for a v1.0.0 release.

### 12.1 Harden overlay and form components

- Dialog, popover, dropdown-menu, toast, drawer, tooltip.
- Ensure correct focus trapping, escape handling, portal behavior, and SSR safety.
- Validate all form components with reactive and template-driven forms, including `disabled` states and validation styling.

### 12.2 Complete unit test coverage

- ✅ Added tests for: badge, separator, skeleton, avatar, card, toggle, toolbar, progress, meter, breadcrumbs, pagination, textarea, search.
- Still missing tests for: accordion, autofill, date-picker, drawer, dropdown-menu, file-upload, form-field, input-otp, listbox, navigation-menu, popover, resizable, table, toast, theme.

### 12.3 CLI robustness

- ✅ Removed the GitHub raw URL fallback; local source copy is now the only path.
- ✅ Generate transitive dependency mapping automatically from source imports.
- ✅ Added integration tests that run `volt init` and `volt add` against a temporary directory.
- Support adding multiple components in one command (`volt add button card input`).

### 12.4 Documentation completeness

- Ensure every public component has a demo page, a source snippet, and a usage snippet.
- Keep README.md and AGENTS.md in sync with `public-api.ts` and the component list.
- Add migration and customization guides.

### 12.5 Theme system polish

- Audit token usage for contrast and accessibility.
- Document how to create custom color/style presets.
- Ensure all components respect `.dark` and `data-color` / `data-style` attributes.

### 12.6 Performance and bundle size

- Verify tree-shaking of unused components when consumed from `@voltui/components`.
- Audit bundle size of the docs app and the theme CSS.

### 12.7 API stability

- Freeze public input/output names and selector conventions.
- Mark experimental components explicitly if they are not v1-ready.
- Publish a v1 migration guide from the alpha versions.

---

## 13. Contribution Notes for Agents

When modifying this codebase:

1. Read `AGENTS.md` for the latest conventions and commands.
2. Components live in `projects/volt/src/lib/components/<name>/`.
3. Update `projects/volt/src/public-api.ts` for new public exports.
4. Add/update the demo page in `src/app/pages/(components-docs)/docs/components/<name>.page.ts`.
5. Add/update snippet exports in `src/app/lib/snippets/index.ts` and `src/app/lib/snippets/usage.ts`.
6. Add real unit tests using `@testing-library/angular` or `TestBed`.
7. Run `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, and `pnpm build:lib` before committing.
8. Regenerate the CLI manifest with `pnpm manifest` when component files change.
9. Keep this SDD in sync if architecture, scope, or conventions change.

---

## 14. Glossary

| Term          | Meaning                                                               |
| ------------- | --------------------------------------------------------------------- |
| CVA           | `class-variance-authority` — type-safe class variant generator.       |
| CLI           | `@voltui/cli` — command-line tool for copying components.             |
| ng-primitives | Headless, accessible Angular primitives used as the behavioral layer. |
| OnPush        | `ChangeDetectionStrategy.OnPush` — used in every component.           |
| Preset        | A pre-defined color or style theme (e.g. `volt`, `sharp`).            |
| SDD           | This Software Design Document.                                        |
| shadcn/ui     | React UI library that popularized the copy-paste component model.     |
| Zoneless      | Angular change detection without `zone.js`, relying on signals.       |
