# Volt UI - MCP (Model Context Protocol)

This directory contains MCP (Model Context Protocol) configurations for Volt UI, enabling AI assistants and editors to understand and work with Volt UI components effectively.

## What is MCP?

Model Context Protocol (MCP) is a standard for providing context to AI assistants about your codebase. It helps AI understand:

- Component structure and patterns
- Naming conventions
- Available components and their APIs
- Theme system
- CLI usage

## Supported Editors/Assistants

| Editor/Assistant          | Directory  | Files                                           |
| ------------------------- | ---------- | ----------------------------------------------- |
| **Cursor**                | `cursor/`  | `.cursorrules`, `mcp.json`                      |
| **Claude** (Desktop/Code) | `claude/`  | `claude-mcp.json`, `volt-prompts.md`            |
| **GitHub Copilot**        | `copilot/` | `copilot-instructions.md`, `volt-snippets.json` |
| **VS Code**               | `copilot/` | Settings integration                            |
| **Generic**               | `generic/` | `volt-mcp.json`, `context.md`                   |

## Quick Installation

### Option 1: Using the Setup Script (Recommended)

```bash
# From your project directory
node /path/to/volt-ui/mcp/scripts/install-mcp.js

# Or use the shell script
/path/to/volt-ui/mcp/scripts/setup-mcp.sh
```

### Option 2: Manual Installation

Copy the relevant files from this directory to your project:

**For Cursor:**

```bash
cp /path/to/volt-ui/mcp/cursor/.cursorrules ./.cursorrules
cp /path/to/volt-ui/mcp/cursor/mcp.json ./.cursor/mcp.json
```

**For Claude:**

```bash
mkdir -p ./.claude
cp /path/to/volt-ui/mcp/claude/claude-mcp.json ./.claude/mcp.json
cp /path/to/volt-ui/mcp/claude/volt-prompts.md ./.claude/volt-prompts.md
```

**For GitHub Copilot:**

```bash
mkdir -p ./.github
cp /path/to/volt-ui/mcp/copilot/copilot-instructions.md ./.github/copilot-instructions.md
mkdir -p ./.vscode
cp /path/to/volt-ui/mcp/copilot/volt-snippets.json ./.vscode/volt-snippets.code-snippets
```

## Installation Options

### Install All MCP Configurations

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js
```

### Install for Specific Editor

```bash
# Only Cursor
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e cursor

# Only Claude
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e claude

# Only Copilot
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e copilot

# Only VS Code
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e vscode
```

### Install for Different Project

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -j /path/to/your/project
```

### Specify Volt UI Location

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -p /path/to/volt-ui
```

## What Gets Installed

When you run the installer, it creates:

1. **Editor-specific configuration files** in your project
2. **Project context** in `.volt-ui/context.json`
3. **Volt UI context documentation** in `.volt-ui/context.md`
4. **Package.json scripts** for easy CLI access:
   ```json
   {
     "scripts": {
       "volt:add": "node /path/to/volt-ui/cli/bin/volt add",
       "volt:init": "node /path/to/volt-ui/cli/bin/volt init",
       "volt:list": "node /path/to/volt-ui/cli/bin/volt list"
     }
   }
   ```

## Using MCP in Your Project

After installation, AI assistants will understand:

### 1. Component Patterns

```typescript
// AI knows to use 'ui-' prefix and signal inputs
import { UiButton } from './ui/button';

@Component({
  imports: [UiButton],
  template: `<ui-button variant="solid" size="md">Click</ui-button>`
})
```

### 2. Available Components

AI can suggest from 17 available components:

- Form controls: button, input, textarea, checkbox, radio, switch, toggle, select
- Layout: card, separator
- Navigation: tabs, accordion, navigation-menu
- Display: badge, avatar, tooltip, form-field

### 3. Theme System

```typescript
// AI knows the theme API
import { provideVoltTheme } from 'volt/theme';

providers: [
  provideVoltTheme({
    color: 'ember', // volt | ember | sage | dusk | glacier
    style: 'soft', // sharp | soft | brutal | ghost | retro
    dark: false,
  }),
];
```

### 4. CLI Commands

AI can help generate CLI commands:

```bash
# Add button component
node /path/to/volt-ui/cli/bin/volt add button

# Initialize in custom directory
node /path/to/volt-ui/cli/bin/volt init ./src/components/ui
```

## MCP Server

The MCP server (`scripts/mcp-server.js`) provides a protocol for AI assistants to query:

### Available Methods

| Method                 | Description           | Parameters                         |
| ---------------------- | --------------------- | ---------------------------------- |
| `list_components`      | List all components   | -                                  |
| `get_component`        | Get component details | `name`                             |
| `get_component_source` | Get source code       | `name`                             |
| `get_usage_example`    | Get usage examples    | `component`                        |
| `get_theme_info`       | Get theme system info | -                                  |
| `generate_cli_command` | Generate CLI command  | `action`, `component`, `targetDir` |
| `get_project_info`     | Get project metadata  | -                                  |

### Using the MCP Server

```bash
# Start the MCP server
node /path/to/volt-ui/mcp/scripts/mcp-server.js

# Or with environment variable
VOLT_UI_PATH=/path/to/volt-ui node mcp-server.js
```

## Directory Structure

```
mcp/
├── README.md                    # This file
├── cursor/                      # Cursor editor configuration
│   ├── .cursorrules            # Cursor rules file
│   └── mcp.json                # Cursor MCP config
├── claude/                      # Claude Desktop/Code configuration
│   ├── claude-mcp.json         # Claude MCP config
│   └── volt-prompts.md         # Claude prompts
├── copilot/                     # GitHub Copilot configuration
│   ├── copilot-instructions.md # Copilot instructions
│   └── volt-snippets.json      # VS Code snippets
├── generic/                     # Generic MCP for any AI
│   ├── volt-mcp.json           # Generic MCP schema
│   ├── context.md              # Context documentation
│   └── README.md               # Generic usage guide
└── scripts/                     # Installation scripts
    ├── install-mcp.js          # Main installer (Node.js)
    ├── setup-mcp.sh            # Shell wrapper
    └── mcp-server.js           # MCP server implementation
```

## Customization

### Adding Custom Components to MCP

1. Edit `scripts/mcp-server.js` and add your component to the `components` object
2. Restart your editor for changes to take effect

### Creating Custom Prompts

Add custom prompts to:

- **Cursor**: Edit `.cursorrules`
- **Claude**: Edit `.claude/volt-prompts.md`
- **Copilot**: Edit `.github/copilot-instructions.md`

## Troubleshooting

### MCP Not Working

1. **Restart your editor** - MCP changes require editor restart
2. **Check file paths** - Ensure paths in config files are correct
3. **Verify Volt UI path** - The installer needs to find the Volt UI repository

### "Could not find Volt UI repository"

Specify the path explicitly:

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -p /path/to/volt-ui
```

Or set environment variable:

```bash
export VOLT_UI_PATH=/path/to/volt-ui
node /path/to/volt-ui/mcp/scripts/install-mcp.js
```

## Examples

### Prompting AI with MCP Context

**Without MCP:**

> "Create a form with a button"

**With MCP:**

> "Create a form using Volt UI components with form-field, input, and ui-button with outline variant"

The AI will understand:

- Import from `./ui/form-field` and `./ui/button`
- Use `ui-form-field`, `ui-input`, `ui-button` selectors
- Use `variant="outline"` for the button
- Use standalone component pattern with signals

## Contributing

To improve the MCP configuration:

1. Update the relevant files in `mcp/<editor>/`
2. Test with the target editor
3. Update `scripts/mcp-server.js` if adding new components
4. Update this README with any new features

## License

MIT - Same as Volt UI
