# Volt UI MCP - Quick Start Guide

Get AI assistance for Volt UI components in under 2 minutes.

## 1. Install MCP (30 seconds)

```bash
# From your Angular project directory
node /path/to/volt-ui/mcp/scripts/install-mcp.js
```

Or use the shell script:

```bash
/path/to/volt-ui/mcp/scripts/setup-mcp.sh
```

## 2. Install Dependencies (30 seconds)

```bash
npm install ng-primitives class-variance-authority
```

## 3. Initialize Volt UI (30 seconds)

```bash
# Using npm script (if installer added it)
npm run volt:init

# Or directly
node /path/to/volt-ui/cli/bin/volt init
```

## 4. Add Components & Use (30 seconds)

```bash
# Add button component
npm run volt:add button

# Or directly
node /path/to/volt-ui/cli/bin/volt add button
```

Use in your component:

```typescript
import { Component } from '@angular/core';
import { UiButton } from './ui/button';

@Component({
  selector: 'app-example',
  imports: [UiButton],
  template: ` <ui-button variant="solid" (click)="handleClick()"> Click me </ui-button> `,
})
export class ExampleComponent {
  handleClick() {
    console.log('Clicked!');
  }
}
```

## What AI Now Understands

After MCP installation, AI assistants know:

### ✅ Component Names & Selectors

- Use `ui-button`, not `volt-button`
- Import from `./ui/button`, not `volt`

### ✅ Component Variants

```typescript
<ui-button variant="solid|outline|ghost|link|destructive">
<ui-button size="sm|md|lg|icon">
```

### ✅ Theme System

```typescript
import { provideVoltTheme } from 'volt/theme';

providers: [
  provideVoltTheme({
    color: 'ember', // volt | ember | sage | dusk | glacier
    style: 'soft', // sharp | soft | brutal | ghost | retro
    dark: false,
  }),
];
```

### ✅ Architecture Patterns

- Standalone components
- Signal inputs: `readonly variant = input<Variant>('default')`
- OnPush change detection
- CVA for variants

### ✅ Available Components

| Category   | Components                                                       |
| ---------- | ---------------------------------------------------------------- |
| Form       | button, input, textarea, checkbox, radio, switch, toggle, select |
| Layout     | card, separator                                                  |
| Navigation | tabs, accordion, navigation-menu                                 |
| Display    | badge, avatar, tooltip, form-field                               |

## Try These AI Prompts

> "Create a login form with Volt UI using card, form-field, input, and button components"

> "Add a settings page with Volt UI tabs for Account, Notifications, and Security"

> "Create a data table with Volt UI badge for status and avatar for user column"

> "Build a navigation header with Volt UI navigation-menu"

## Editor-Specific Setup

### Cursor

✅ Automatically configured with `.cursorrules` and `.cursor/mcp.json`

### Claude (Desktop/Code)

✅ Automatically configured with `.claude/mcp.json` and `.claude/volt-prompts.md`

### VS Code + GitHub Copilot

✅ Automatically configured with `.github/copilot-instructions.md` and `.vscode/volt-snippets.code-snippets`

### Other Editors

Use the generic context at `.volt-ui/context.md`

## Troubleshooting

### AI doesn't recognize Volt UI components

1. **Restart your editor** - MCP changes require restart
2. **Check `.volt-ui/context.json`** exists in your project
3. **Verify paths** in editor config files

### "Command not found" errors

```bash
# Make sure volt-ui path is correct
export VOLT_UI_PATH=/path/to/volt-ui
node $VOLT_UI_PATH/mcp/scripts/install-mcp.js
```

### Component files not found after `volt add`

Check the target directory (default: `./src/app/ui/`):

```bash
ls -la ./src/app/ui/button/
```

## Next Steps

1. **Explore components**: Run `npm run volt:list` to see all available components
2. **Add more components**: `npm run volt:add card tabs badge`
3. **Customize themes**: Edit theme in `app.config.ts`
4. **Read full docs**: See `mcp/README.md` for detailed documentation

## One-Liner Setup

Copy and paste this to set everything up:

```bash
# Set your volt-ui path
VOLT_UI_PATH=/path/to/volt-ui

# Install MCP, dependencies, and initialize
node $VOLT_UI_PATH/mcp/scripts/install-mcp.js && \
npm install ng-primitives class-variance-authority && \
node $VOLT_UI_PATH/cli/bin/volt init && \
node $VOLT_UI_PATH/cli/bin/volt add button card input && \
echo "✅ Volt UI ready! Restart your editor."
```

Happy coding with AI-assisted Volt UI! ⚡
