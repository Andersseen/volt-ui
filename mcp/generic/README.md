# Volt UI MCP - Generic Integration

This directory contains the generic MCP (Model Context Protocol) configuration for Volt UI that can be used with any AI assistant or editor that supports MCP.

## Files

- `volt-mcp.json` - Complete MCP schema definition
- `context.md` - Context documentation for AI consumption

## Using This MCP

### For AI Assistants

Include the content of `context.md` in your system prompt or context window when working with Volt UI components.

### For Editors

Point your editor's MCP configuration to `volt-mcp.json`.

## Quick Reference

### Project Structure
```
volt-ui/
├── projects/volt/src/lib/     # Component source files
├── cli/bin/volt               # CLI tool
└── mcp/                       # MCP configurations
```

### Key Concepts

1. **Standalone Components** - No NgModules required
2. **Zoneless Change Detection** - Uses Angular signals
3. **CVA (class-variance-authority)** - Type-safe variants
4. **ng-primitives** - Accessible component primitives
5. **CLI Transform** - `volt-*` → `ui-*` on copy

### Component Quick Start

```bash
# Add component to your project
node /path/to/volt-ui/cli/bin/volt add button
```

```typescript
import { UiButton } from './ui/button';

@Component({
  imports: [UiButton],
  template: `<ui-button variant="solid">Click</ui-button>`
})
```

### Theme Quick Start

```typescript
import { provideVoltTheme } from 'volt/theme';

providers: [
  provideVoltTheme({ color: 'ember', style: 'soft', dark: false })
]
```
