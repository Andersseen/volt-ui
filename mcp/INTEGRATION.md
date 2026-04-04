# Volt UI MCP - Integration Guide

Complete guide for integrating Volt UI MCP with various AI editors and assistants.

## Table of Contents

- [Cursor](#cursor)
- [Claude Desktop/Code](#claude-desktopcode)
- [GitHub Copilot](#github-copilot)
- [VS Code](#vs-code)
- [Other Editors](#other-editors)
- [Troubleshooting](#troubleshooting)

---

## Cursor

### Automatic Installation

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e cursor
```

### Manual Installation

1. Copy `.cursorrules` to your project root:
   ```bash
   cp /path/to/volt-ui/mcp/cursor/.cursorrules ./.cursorrules
   ```

2. Create `.cursor/mcp.json`:
   ```bash
   mkdir -p .cursor
   cp /path/to/volt-ui/mcp/cursor/mcp.json ./.cursor/mcp.json
   ```

3. Edit `.cursor/mcp.json` and update the path:
   ```json
   {
     "mcpServers": {
       "volt-ui": {
         "command": "node",
         "args": ["/actual/path/to/volt-ui/mcp/scripts/mcp-server.js"]
       }
     }
   }
   ```

### Verification

1. Open Cursor
2. Open the command palette (`Cmd/Ctrl + Shift + P`)
3. Type "MCP" and verify Volt UI appears
4. Start a chat and ask: "What Volt UI components are available?"

### Features

- ✅ Component autocomplete
- ✅ Usage examples in chat
- ✅ Theme system knowledge
- ✅ CLI command suggestions

---

## Claude Desktop/Code

### Automatic Installation

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e claude
```

### Manual Installation

1. Create `.claude` directory:
   ```bash
   mkdir -p .claude
   ```

2. Copy configuration files:
   ```bash
   cp /path/to/volt-ui/mcp/claude/claude-mcp.json ./.claude/mcp.json
   cp /path/to/volt-ui/mcp/claude/volt-prompts.md ./.claude/volt-prompts.md
   ```

3. For Claude Desktop, add to `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "volt-ui": {
         "command": "node",
         "args": ["/path/to/volt-ui/mcp/scripts/mcp-server.js"],
         "env": {
           "VOLT_UI_PATH": "/path/to/volt-ui"
         }
       }
     }
   }
   ```

   Location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

### Verification

1. Restart Claude Desktop
2. Look for the 🔌 icon in the bottom right
3. Click it and verify "volt-ui" is listed
4. Try asking: "How do I add a button component?"

### Features

- ✅ Tool-based component queries
- ✅ Rich prompts for context
- ✅ Theme configuration help
- ✅ Component source code access

---

## GitHub Copilot

### Automatic Installation

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e copilot
```

### Manual Installation

1. Create `.github` directory:
   ```bash
   mkdir -p .github
   ```

2. Copy instructions:
   ```bash
   cp /path/to/volt-ui/mcp/copilot/copilot-instructions.md ./.github/copilot-instructions.md
   ```

3. For VS Code snippets, create `.vscode`:
   ```bash
   mkdir -p .vscode
   cp /path/to/volt-ui/mcp/copilot/volt-snippets.json ./.vscode/volt-snippets.code-snippets
   ```

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "You are working with Volt UI, an Angular component library. Components use 'ui-' prefix (e.g., ui-button) and are imported from './ui/<component>'. Use standalone components with signals for reactivity."
    }
  ],
  "github.copilot.chat.codeGeneration.useInstructionFiles": true
}
```

### Verification

1. Open VS Code
2. Start typing a Volt UI component: `<ui-`
3. Copilot should suggest completions
4. Try: "Create a card with Volt UI"

### Features

- ✅ Inline completions
- ✅ Code snippets (`volt-button`, `volt-card`)
- ✅ Context-aware suggestions
- ✅ Import suggestions

---

## VS Code

### Automatic Installation

```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -e vscode
```

### Manual Configuration

1. Open VS Code settings (`Cmd/Ctrl + ,`)
2. Search for "copilot instructions"
3. Add instruction file path or text

### Using Snippets

Type these prefixes and press `Tab`:

| Prefix | Description |
|--------|-------------|
| `volt-button` | Button component |
| `volt-card` | Full card structure |
| `volt-form-field` | Form field with input |
| `volt-tabs` | Tabs component |
| `volt-import-button` | Import statement |
| `volt-import-card` | Card imports |
| `volt-theme` | Theme provider |

### Features

- ✅ IntelliSense for components
- ✅ Snippet expansion
- ✅ Documentation on hover
- ✅ Import path suggestions

---

## Other Editors

### Generic MCP

For editors that support MCP but don't have specific configurations:

1. Install generic MCP:
   ```bash
   node /path/to/volt-ui/mcp/scripts/install-mcp.js
   ```

2. Point your editor to:
   - Config: `.volt-ui/context.json`
   - Documentation: `.volt-ui/context.md`
   - Server: `/path/to/volt-ui/mcp/scripts/mcp-server.js`

### Neovim

Add to your LSP configuration:

```lua
-- Using nvim-lspconfig
require('lspconfig').angularls.setup {
  -- Your Angular config
}

-- Add Volt UI context
vim.g.volt_ui_path = '/path/to/volt-ui'
```

### JetBrains IDEs

1. Install the Angular plugin
2. Add Volt UI as a library
3. Use `.volt-ui/context.md` for AI assistant context

### Zed

Add to `~/.config/zed/settings.json`:

```json
{
  "assistant": {
    "default_model": {
      "provider": "openai",
      "model": "gpt-4"
    },
    "version": "2"
  }
}
```

Then include `.volt-ui/context.md` in your prompts.

---

## Troubleshooting

### General Issues

#### "Could not find Volt UI repository"

**Solution**: Specify the path explicitly
```bash
node /path/to/volt-ui/mcp/scripts/install-mcp.js -p /path/to/volt-ui
```

Or set environment variable:
```bash
export VOLT_UI_PATH=/path/to/volt-ui
```

#### MCP not working after installation

**Solution**: Restart your editor completely

#### Components not recognized

1. Check `.volt-ui/context.json` exists
2. Verify component files were copied: `ls ./src/app/ui/button/`
3. Check import paths are correct

### Cursor-Specific

#### MCP server not connecting

1. Check `.cursor/mcp.json` path is absolute
2. Verify `mcp-server.js` exists at that path
3. Try running the server manually:
   ```bash
   node /path/to/volt-ui/mcp/scripts/mcp-server.js
   ```

### Claude-Specific

#### Tools not appearing

1. Check `claude_desktop_config.json` syntax
2. Verify the path to `mcp-server.js` is correct
3. Restart Claude Desktop completely

### Copilot-Specific

#### No inline suggestions

1. Verify `.github/copilot-instructions.md` exists
2. Check VS Code settings have instructions enabled
3. Try reloading VS Code window

#### Snippets not working

1. Check `.vscode/volt-snippets.code-snippets` exists
2. Reload VS Code window
3. Check snippet prefix is typed correctly

---

## Advanced Configuration

### Custom Component Registry

Edit `mcp/scripts/mcp-server.js` to add custom components:

```javascript
const components = {
  // ... existing components
  'my-custom': {
    name: 'My Custom',
    description: 'My custom component',
    files: ['my-custom.ts', 'index.ts'],
    dependencies: [],
    inputs: [
      { name: 'customProp', type: 'string' }
    ]
  }
};
```

### Custom Prompts

#### Cursor
Edit `.cursorrules` to add custom rules

#### Claude
Edit `.claude/volt-prompts.md` to add prompts

#### Copilot
Edit `.github/copilot-instructions.md` to add instructions

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VOLT_UI_PATH` | Path to Volt UI repository |
| `VOLT_MCP_DEBUG` | Enable debug logging |

---

## Testing MCP

### Test Script

```bash
# Test MCP server
echo '{"jsonrpc":"2.0","id":1,"method":"list_components"}' | node /path/to/volt-ui/mcp/scripts/mcp-server.js
```

### Expected Output

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    { "name": "button", "displayName": "Button", ... },
    ...
  ]
}
```

---

## Getting Help

1. Check [MCP README](./README.md) for overview
2. See [Quick Start](./QUICKSTART.md) for setup
3. Review [Integration Guide](./INTEGRATION.md) (this file)
4. Open an issue on the Volt UI repository
