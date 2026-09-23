<div align="center">

<a href="https://volt-ui.andersseen.dev">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/hero-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/hero-light.png" />
    <img alt="Volt UI — Modern UI building blocks for Angular" src="./docs/hero-light.png" width="840" />
  </picture>
</a>

<h1>⚡ Volt UI</h1>

### Modern UI building blocks for Angular

Angular UI atoms that stay out of the way of your product's own design — built on **signals**,<br/>
**Tailwind CSS v4**, **CVA** and [ng-primitives](https://ng-primitives.dev). Install the package or copy the source.

<br/>

### ⚡ v1.1 — Consumer DX

**Built from what real apps ran into.** `class` now reliably styles the element you expect on every
component, `<a voltButton routerLink>` replaces `<a><volt-button>`, forms get sizes and states,
toasts and state-driven dialogs no longer need ng-primitives APIs, and `Alert` + `Spinner` join the
catalog. Fully backwards compatible with 1.0.<br/>
See the **[release notes](./CHANGELOG.md)** · **[upgrade notes](./MIGRATION.md)** ·
**[versioning policy](https://volt-ui.andersseen.dev/docs/versioning)**

<br/>

[![npm — components](https://img.shields.io/npm/v/@voltui/components?style=for-the-badge&logo=npm&logoColor=white&label=components&color=6366F1)](https://www.npmjs.com/package/@voltui/components)
[![npm — cli](https://img.shields.io/npm/v/@voltui/cli?style=for-the-badge&logo=npm&logoColor=white&label=cli&color=6366F1)](https://www.npmjs.com/package/@voltui/cli)
[![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![Components](https://img.shields.io/badge/components-42-8B5CF6?style=for-the-badge)](https://volt-ui.andersseen.dev/docs/components)
[![CI](https://img.shields.io/github/actions/workflow/status/Andersseen/volt-ui/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=CI&branch=main)](https://github.com/Andersseen/volt-ui/actions/workflows/ci.yml)
[![License MIT](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/Andersseen/volt-ui?style=for-the-badge&logo=github&logoColor=white&color=F59E0B)](https://github.com/Andersseen/volt-ui/stargazers)

<br/>

**[🌐 Live Docs](https://volt-ui.andersseen.dev)** · **[📦 Components](https://volt-ui.andersseen.dev/docs/components)** · **[🎨 Theme Builder](https://volt-ui.andersseen.dev/create-theme)** · **[🤖 AI / MCP](https://volt-ui.andersseen.dev/api/mcp)** · **[📖 Docs](https://volt-ui.andersseen.dev/docs/introduction)**

</div>

---

## 💡 What is Volt UI?

Volt UI is an independent Angular component library **inspired by [shadcn/ui](https://ui.shadcn.com)**.
It provides the **atoms** — buttons, inputs, cards, badges, tabs, form fields, alerts, overlays — and
leaves everything that makes your product yours to your app: layouts, identity, icons, motion,
state and domain components.

There are two first-class ways to use it. Pick per project; both are supported for the whole 1.x line.

|           | **Package mode** — `@voltui/components`              | **Copy-and-own mode** — `@voltui/cli`                 |
| --------- | ---------------------------------------------------- | ----------------------------------------------------- |
| You get   | `VoltButton`, `VoltCard`… imported from npm          | `UiButton`, `UiCard`… copied into `src/app/ui`        |
| Updates   | `npm update` — centralized, one version across apps  | You own the source; re-copy when you choose           |
| Customize | `class` (merged with `cn()`), variants, theme tokens | Edit the component itself                             |
| Best for  | Several apps sharing the same atoms and behavior     | Apps that want full control and no long-term coupling |

- 🎨 Restyle through **Tailwind v4 tokens** and `class` instead of fighting a theming API.
- ♿ Keyboard, focus and ARIA behavior come from ng-primitives, on the native elements you write.

> **Why it exists** — Angular has strong headless and enterprise UI options, but few focused on the shadcn-style _"copy the component and own it"_ workflow. Volt UI fills that gap with modern Angular 21 patterns: standalone components, `OnPush`, signals, zoneless compatibility, `ng-primitives` accessibility behavior, and Tailwind v4 tokens.

> _Naming note: this project is not affiliated with PrimeVue Volt UI. Here, Volt UI is an independent Angular implementation for the `@voltui` packages and CLI._

---

## ✨ Highlights

|                                |                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| ⚡ **Package or copy**         | Import from npm for shared updates, or copy the source with the CLI and own it.               |
| ♿ **Accessible by default**   | Keyboard, focus, and ARIA behavior delegated to [ng-primitives](https://ng-primitives.dev).   |
| 🎨 **25 theme combinations**   | 5 color × 5 style presets, plus dark mode, driven by Tailwind v4 tokens.                      |
| 🧩 **44 components**           | Forms, overlays, feedback, navigation, data display — see the [catalog](#-component-catalog). |
| 🛰️ **Zoneless & signal-first** | `input()` / `output()` / `model()` / `computed()`, `OnPush` everywhere.                       |
| 🤖 **AI-ready**                | Ships an MCP server, a skill, and a prompt reference so assistants use it correctly.          |

---

## 🚀 Quick Start

### Package mode

```bash
npm install @voltui/components
```

```css
/* styles.css */
@import 'tailwindcss';
@import '@voltui/components/themes.css';
```

```ts
import { RouterLink } from '@angular/router';
import { VoltCard, VoltCardContent, VoltNativeButton } from '@voltui/components';

@Component({
  selector: 'app-example',
  imports: [RouterLink, VoltCard, VoltCardContent, VoltNativeButton],
  template: `
    <volt-card>
      <volt-card-content class="p-4">
        <a voltButton variant="outline" routerLink="/docs">Documentation</a>
      </volt-card-content>
    </volt-card>
  `,
})
export class ExampleComponent {}
```

### Copy-and-own mode

Initialize a local UI folder, then add components:

```bash
# Scaffold ./src/app/ui
npx @voltui/cli init

# Add components (dependencies are copied automatically)
npx @voltui/cli add button card dialog
```

Use the copied components from your app:

```ts
import { UiButton } from './ui/button';

@Component({
  selector: 'app-example',
  imports: [UiButton],
  template: `<button uiButton type="submit">Save</button>`,
})
export class ExampleComponent {}
```

<details>
<summary><b>🛠️ CLI behavior & flags</b></summary>

<br/>

- Copies from `projects/volt/src/lib` into `src/app/ui` by default.
- Transforms `Volt*` → `Ui*` and `volt-*` → `ui-*`.
- Detects and copies local component dependencies automatically.
- Refuses to overwrite existing files unless `--force` is passed.
- `--dry-run` previews files before writing.
- `[target-dir]` sets an alternate destination.
- `--install` installs the required runtime dependencies.

```bash
npx @voltui/cli add button card ./src/app/shared/ui --dry-run
npx @voltui/cli add button card ./src/app/shared/ui --force --install
```

Copied components need these runtime dependencies in the target app:

```bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
```

</details>

---

## 🎨 Theme System

Themes are CSS custom properties mapped into Tailwind v4 via `@theme inline`. Components use **semantic utilities** (`bg-primary`, `text-foreground`, `rounded-md`, `shadow-sm`) instead of hard-coded `var()` utilities — so a preset swap restyles everything.

<table>
<tr>
<td valign="top" width="50%">

**🌈 Color presets**

- `volt`
- `ember`
- `sage`
- `dusk`
- `glacier`

</td>
<td valign="top" width="50%">

**🖌️ Style presets**

- `sharp`
- `soft`
- `brutal`
- `ghost`
- `retro`

</td>
</tr>
</table>

> 🎛️ Mix and match live in the **[Theme Builder →](https://volt-ui.andersseen.dev/create-theme)** — generate a
> contrast-checked palette in one click, or import one from
> [Palette Crafter](https://palette-crafter.andersseen.dev).

---

## 🧩 Component Catalog

**44 components** across every common surface. Every component is labeled `stable` or `beta` —
see **[COMPONENT_STATUS.md](./COMPONENT_STATUS.md)**.

<sub>1.0 shipped 42 components, the Answer to the Ultimate Question of Life, the Universe, and
Everything. 1.1 added <code>alert</code> and <code>spinner</code>, which ruined the joke exactly as
promised. We have made peace with that.</sub>

<details open>
<summary><b>Browse all components</b></summary>

<br/>

| Category             | Components                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms & inputs**   | `input` · `textarea` · `checkbox` · `radio` · `select` · `combobox` · `listbox` · `switch` · `slider` · `toggle` · `toggle-group` · `input-otp` · `form-field` · `autofill` · `file-upload` · `date-picker` · `search` |
| **Actions**          | `button` (+ `voltButton` on `<button>` / `<a>`) · `toolbar`                                                                                                                                                            |
| **Feedback**         | `alert` · `spinner` · `badge` · `toast`                                                                                                                                                                                |
| **Overlays**         | `dialog` · `drawer` · `popover` · `tooltip` · `dropdown-menu`                                                                                                                                                          |
| **Navigation**       | `navigation-menu` · `breadcrumbs` · `pagination` · `tabs` · `accordion`                                                                                                                                                |
| **Data display**     | `table` · `avatar` · `card` · `meter` · `progress` · `skeleton` · `separator`                                                                                                                                          |
| **Layout & utility** | `resizable` · `sidebar` · `theme`                                                                                                                                                                                      |

</details>

---

## 📦 Package Mode in Detail

`@voltui/components` is a first-class way to use Volt: import the same `Volt*` components the CLI
copies, and get fixes and features through normal semver updates.

```bash
npm install @voltui/components
```

Import themes once — that single line is all Tailwind v4 needs:

```css
@import 'tailwindcss';
@import '@voltui/components/themes.css';
```

The theme CSS self-registers the compiled component bundle as a `@source`, so every utility class the components use is generated automatically. It also aligns Tailwind's `dark:` variant with the `.dark` class Volt toggles.

Customize with `class` — on every component it is merged with `cn()` (tailwind-merge) over the
defaults and applied to the element that paints, so `<volt-card-content class="p-3">` replaces the
default padding and `<volt-input class="w-24">` sizes the native input.

Provide a theme at bootstrap:

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

---

## 🤖 AI Tools for Consumers

Volt UI ships three complementary ways to give AI assistants correct context:

| Tool                    | What it is                                                                                           | Install                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 🧠 **Skill**            | Auto-discovered by Claude Code / OpenCode in a workspace                                             | `npx volt-ui-mcp claude`                             |
| 🛰️ **MCP server**       | `list_components`, `get_component`, `get_usage_example`, `get_theme_info`, `generate_cli_command`, … | [`/api/mcp`](https://volt-ui.andersseen.dev/api/mcp) |
| 📋 **Prompt reference** | Single file to paste into any LLM chat                                                               | [`VOLT_UI_PROMPT.md`](./VOLT_UI_PROMPT.md)           |

---

## 📈 Stability & Roadmap

Current status: **`1.1.0` — stable. The public API is locked; 1.1 only adds to it.**

Component inputs, outputs, and selectors follow semantic versioning as of `1.0.0`:
breaking changes only happen in a major version bump, new features land in minors, and
fixes land in patches. If you're upgrading from a `0.x` release, see
**[MIGRATION.md](./MIGRATION.md)** for the full 0.x → 1.0 upgrade guide (the three
aliases it documents as removed in 1.0.0 are gone as of this release) and
**[specs/api-freeze-0.9.md](./specs/api-freeze-0.9.md)** for the frozen pre-1.0 API
reference this release shipped against.

- **Stable** — recommended for production use.
- **Beta** — usable; may still gain forms / keyboard / a11y / edge-case coverage before
  moving to stable, but its public API won't change outside a major bump.
- **Experimental** — reserved for future previews. Not currently used — every shipped
  component is `stable` or `beta` as of `1.0.0`.

All components remain available through the package and CLI; the status label
communicates **confidence, not availability**. See
**[docs/versioning](https://volt-ui.andersseen.dev/docs/versioning)** for the full
semver promise and support policy.

Full status table: **[COMPONENT_STATUS.md](./COMPONENT_STATUS.md)**.

### Compatibility policy

The `1.x` line targets Angular `^21.2` and Node 20 or newer. Volt UI supports the
latest declared Angular major only; widening that range requires consumer-fixture
verification and is never assumed from a successful build. Each supported Angular
major is documented with migration notes or release notes before a major is dropped.

Coverage is measured against the complete library source, CLI core and hosted
MCP route. Every component family requires a real behavior spec, while overlays
and keyboard workflows are additionally exercised in Playwright.

---

## 🛠️ Development

```bash
pnpm install        # install dependencies
pnpm dev            # docs app (AnalogJS + Vite)
pnpm typecheck      # type check
pnpm lint           # lint
pnpm test:run       # unit tests (Vitest)
pnpm build:lib      # build the Angular library
pnpm test:e2e:ci    # Playwright e2e
pnpm manifest       # regenerate the CLI manifest after component changes
```

CI and deployment run through a **single pipeline** (`.github/workflows/ci.yml`): every PR runs lint · typecheck · test · build · e2e, and a merge to `main` deploys the docs to **Cloudflare Pages**.

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [AGENTS.md](./AGENTS.md) for conventions.

---

<div align="center">

Built with ⚡ by [Andersseen](https://github.com/Andersseen) · [MIT License](./LICENSE)

**[🌐 volt-ui.andersseen.dev](https://volt-ui.andersseen.dev)**

<sub><a href="#-volt-ui">↑ Back to top</a></sub>

</div>
