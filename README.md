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

### Using the CLI (like shadcn)

1. **Initialize volt/ui in your project:**
```bash
node cli/bin/volt init
```

2. **Add components:**
```bash
node cli/bin/volt add button
node cli/bin/volt add card
node cli/bin/volt add navigation-menu
```

3. **Use in your components:**
```typescript
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: `<ui-button variant="solid">Click me</ui-button>`
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

| Editor | Status | Installation |
|--------|--------|--------------|
| **Cursor** | ✅ Full support | `node mcp/scripts/install-mcp.js -e cursor` |
| **Claude** (Desktop/Code) | ✅ Full support | `node mcp/scripts/install-mcp.js -e claude` |
| **GitHub Copilot** | ✅ Full support | `node mcp/scripts/install-mcp.js -e copilot` |
| **VS Code** | ✅ Full support | `node mcp/scripts/install-mcp.js -e vscode` |
| **Other** | ✅ Generic MCP | `node mcp/scripts/install-mcp.js` |

### Quick MCP Setup

```bash
# Install MCP in your Angular project
node /path/to/volt-ui/mcp/scripts/install-mcp.js

# Or use the shell script
/path/to/volt-ui/mcp/scripts/setup-mcp.sh
```

See [MCP Quick Start](./mcp/QUICKSTART.md) for detailed instructions.

### What AI Now Understands

After MCP installation, AI assistants automatically know:

- ✅ All 17 available components and their APIs
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

See all components in the [live demo](https://volt-ui.pages.dev).

## Dependencies

Components require:

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

```typescript
import { provideVoltTheme } from 'volt/theme';

bootstrapApplication(AppComponent, {
  providers: [
    provideVoltTheme({ color: 'ember', style: 'soft', dark: false })
  ]
});
```

Or dynamically:
```typescript
import { applyVoltTheme } from 'volt/theme';

applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });
```

## MCP Structure

```
mcp/
├── cursor/          # Cursor editor MCP config
├── claude/          # Claude Desktop/Code MCP config
├── copilot/         # GitHub Copilot instructions
├── generic/         # Generic MCP for any AI
├── scripts/         # Installation scripts
└── README.md        # Full MCP documentation
```

## Deploy to Cloudflare Pages

```bash
pnpm run deploy
```

## License

MIT
