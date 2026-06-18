# Volt UI

An Angular UI component library inspired by shadcn/ui, built on top of [ng-primitives](https://ng-primitives.dev).

## Features

- 🎨 **Fully customizable** - Copy components directly into your project and modify them
- ♿ **Accessible** - Built on ng-primitives with proper ARIA attributes
- 🎯 **Angular v21** - Uses zoneless change detection and standalone components
- 💅 **Tailwind CSS** - Styled with Tailwind CSS v4
- 📦 **TypeScript** - Fully typed with TypeScript
- 🌙 **Dark mode** - Built-in dark mode support
- 🤖 **AI Ready** - MCP support for Cursor, Claude, Copilot, and more

## Quick Start

### Using the npm package (themes and utilities only)

For the copy-paste workflow you do **not** need to install `@voltui/components`. The package is provided for projects that want to consume the theme system and utilities directly:

1. **Install the package:**

```bash
npm install @voltui/components
```

2. **Import the theme CSS in your global stylesheet:**

```css
@import '@voltui/components/themes.css';
```

3. **Add the theme provider:**

```typescript
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

> **Note:** If you copy components with the CLI below, you do not need `@voltui/components` unless you want to reuse the theme package.

### Using the CLI (like shadcn)

1. **Initialize volt/ui in your project:**

```bash
npx @voltui/cli init
```

2. **Add components:**

```bash
npx @voltui/cli add button
npx @voltui/cli add card
npx @voltui/cli add navigation-menu
```

3. **Use in your components:**

```typescript
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: `<ui-button variant="solid">Click me</ui-button>`,
})
export class MyComponent {}
```

### Copy from Demo

Each component demo page includes a **"Copy code"** button that copies the full component source code to your clipboard. Simply:

1. Visit the component demo page
2. Click "Copy code"
3. Paste into your project's `ui/` folder
4. Customize as needed

## MCP (Model Context Protocol) - AI Integration 🚀

Volt UI includes full MCP support for AI assistants! Get intelligent code suggestions, component usage help, and more.

### Supported Editors

| Editor                    | Status          | Installation              |
| ------------------------- | --------------- | ------------------------- |
| **Cursor**                | ✅ Full support | `npx volt-ui-mcp cursor`  |
| **Claude** (Desktop/Code) | ✅ Full support | `npx volt-ui-mcp claude`  |
| **GitHub Copilot**        | ✅ Full support | `npx volt-ui-mcp copilot` |
| **VS Code**               | ✅ Full support | `npx volt-ui-mcp vscode`  |
| **Other**                 | ✅ Generic MCP  | `npx volt-ui-mcp`         |

### Quick MCP Setup

```bash
npx volt-ui-mcp
```

See the [AI Integration docs](<./src/app/pages/(getting-started)/docs/mcp.page.ts>) for setup details.

### What AI Now Understands

After MCP installation, AI assistants automatically know:

- ✅ All available components and their APIs
- ✅ Component selectors (`ui-button`, `ui-card`, etc.)
- ✅ Import paths (`./ui/button`, `./ui/card`)
- ✅ Variant options (`solid`, `outline`, `ghost`, etc.)
- ✅ Theme system (`provideVoltTheme`, `applyVoltTheme`)
- ✅ Architecture patterns (standalone, signals, OnPush)
- ✅ CLI commands for adding components

### Example AI Prompts

> "Create a login form with Volt UI card, form-field, input, and button components"

> "Add a settings page with Volt UI tabs for Account and Security sections"

> "Build a navigation header with Volt UI navigation-menu"

See [MCP Documentation](./mcp/README.md) for complete details.

## Available Components

- [Button](./src/app/pages/docs/components/button.ts)
- [Badge](./src/app/pages/docs/components/badge.ts)
- [Card](./src/app/pages/docs/components/card.ts)
- [Input](./src/app/pages/docs/components/input.ts)
- Search
- Autofill
- [Checkbox](./src/app/pages/docs/components/checkbox.ts)
- [Switch](./src/app/pages/docs/components/switch.ts)
- [Select](./src/app/pages/docs/components/select.ts)
- [Tabs](./src/app/pages/docs/components/tabs.ts)
- [Accordion](./src/app/pages/docs/components/accordion.ts)
- [Navigation Menu](./src/app/pages/docs/components/navigation-menu.ts)
- [Tooltip](./src/app/pages/docs/components/tooltip.ts)
- [Avatar](./src/app/pages/docs/components/avatar.ts)
- [Radio](./src/app/pages/docs/components/radio.ts)
- [Toggle](./src/app/pages/docs/components/toggle.ts)
- [Separator](./src/app/pages/docs/components/separator.ts)
- Dialog
- Popover
- Dropdown Menu
- Slider
- Progress
- Breadcrumbs
- Sidebar Layout
- Toggle Group
- Meter
- Pagination
- Toast
- Input OTP
- File Upload
- Combobox
- Date Picker
- Listbox
- Toolbar

See all components in the [live demo](https://volt-ui.pages.dev).

## Dependencies

When using `@voltui/components` from npm, runtime dependencies are installed with the package.

When copying components into your app with the CLI or manually, install:

```bash
npm install ng-primitives class-variance-authority
```

## Development

This project uses Angular CLI v21 with zoneless change detection.

### Start development server

```bash
pnpm start
```

### Build

```bash
pnpm build
```

### Build library

```bash
npx ng build volt
```

## Architecture

- **Standalone components** - No NgModules required
- **Zoneless change detection** - Uses signals for reactivity
- **Host directives** - ng-primitives applied via hostDirectives
- **CVA (class-variance-authority)** - For component variants
- **Signals** - input(), output(), model(), computed()

## Theme System

Volt UI includes a powerful theme system with multiple color palettes and styles.

### Available Colors

- `volt` (default) - Blue-purple
- `ember` - Warm orange-red
- `sage` - Green
- `dusk` - Purple
- `glacier` - Cool blue

### Available Styles

- `sharp` (default) - Moderate radius
- `soft` - Larger radius
- `brutal` - No radius, heavy borders
- `ghost` - Minimal, transparent
- `retro` - Classic aesthetic

### Applying Themes

Import the theme CSS once in your global stylesheet:

```css
@import '@voltui/components/themes.css';
```

```typescript
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'ember', style: 'soft', dark: false })],
});
```

Or dynamically:

```typescript
import { applyVoltTheme } from '@voltui/components';

applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });
```

## Stability

Volt UI is currently in **alpha hardening**. The component architecture has stabilized around a shadcn/ui-style copy-paste model, the CLI copies source files locally, and a growing suite of real Angular unit tests is in place. Advanced overlay components (dialog, popover, dropdown-menu) and form integrations are still being hardened before a v1 release.

## Architecture

- **shadcn/ui-style copy-paste** - Use the CLI to copy components into your project and own the code.
- **Standalone components** - No NgModules required.
- **Zoneless change detection** - Uses signals for reactivity.
- **Host directives** - ng-primitives applied via hostDirectives.
- **CVA (class-variance-authority)** - For component variants.
- **Tailwind-first styling** - Components use Tailwind utilities directly; no embedded critical CSS required.

## Deploy to Cloudflare Pages

```bash
pnpm run deploy
```

## License

MIT
