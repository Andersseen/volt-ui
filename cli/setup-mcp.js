#!/usr/bin/env node

/**
 * Volt UI MCP Setup
 *
 * Interactive installer that configures AI agents to use
 * the Volt UI MCP server hosted at https://volt-ui.pages.dev/api/mcp
 *
 * Usage:
 *   npx volt-ui-mcp            # interactive
 *   npx volt-ui-mcp claude     # install directly for one agent
 *   npx volt-ui-mcp cursor copilot  # install for multiple agents
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MCP_URL = 'https://volt-ui.pages.dev/api/mcp';
const MCP_ENTRY = { type: 'url', url: MCP_URL };

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const log = (msg, color = 'reset') => console.log(`${c[color]}${msg}${c.reset}`);
const ok = msg => console.log(`${c.green}  ✓${c.reset} ${msg}`);
const info = msg => console.log(`${c.blue}  →${c.reset} ${msg}`);
const warn = msg => console.log(`${c.yellow}  ⚠${c.reset} ${msg}`);

// ---------------------------------------------------------------------------
// File writing utilities
// ---------------------------------------------------------------------------

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, content) {
  ensureDir(filePath);

  let merged = content;
  if (fs.existsSync(filePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      merged = deepMerge(existing, content);
    } catch {
      // Overwrite if file is invalid JSON
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n');
}

function writeText(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content);
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof out[key] === 'object') {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Agent-specific content
// ---------------------------------------------------------------------------

const CURSOR_RULES = `# Volt UI — Angular Component Library

Volt UI is inspired by shadcn/ui, built on ng-primitives for accessible Angular components.

## Stack
- Angular v21 · zoneless change detection
- Tailwind CSS v4
- class-variance-authority (CVA) for variants
- ng-primitives for accessibility primitives
- Signals: input(), output(), model(), computed()

## Naming
| Context | Selector | Class |
|---------|----------|-------|
| Source (library) | \`volt-*\` | \`Volt*\` |
| CLI output (user project) | \`ui-*\` | \`Ui*\` |

## Components
button · badge · card · input · textarea · checkbox · radio · switch · toggle ·
select · tabs · accordion · avatar · separator · tooltip · navigation-menu · form-field ·
dialog · popover · dropdown-menu · slider · progress · breadcrumbs · nav-sidebar · sidebar

## Component import
\`\`\`ts
import { UiButton } from './ui/button';
import { UiCard, UiCardHeader, UiCardContent, UiCardFooter } from './ui/card';
import { UiFormField, UiFormFieldLabel, UiFormFieldHint } from './ui/form-field';
\`\`\`

## Template selectors
\`\`\`html
<ui-button variant="solid|outline|ghost|link|destructive" size="sm|md|lg|icon">
<ui-card> <ui-card-header> <ui-card-title> <ui-card-content> <ui-card-footer>
<ui-form-field> <ui-form-field-label> <ui-input> <ui-form-field-hint>
<ui-tabs value="x"> <ui-tabs-list> <ui-tabs-trigger value="x"> <ui-tabs-content value="x">
<ui-accordion type="single|multiple" [collapsible]="true">
<ui-select placeholder="…"> <ui-select-content> <ui-select-item value="x">
\`\`\`

## Theme
\`\`\`ts
import { provideVoltTheme } from 'volt/theme';
// colors: volt | ember | sage | dusk | glacier
// styles: sharp | soft | brutal | ghost | retro
provideVoltTheme({ color: 'ember', style: 'soft', dark: false })
\`\`\`

## CLI
\`\`\`bash
npx volt init           # scaffold ui/ folder
npx volt add button     # add a component
npx volt list           # list all components
\`\`\`

## AI tools
MCP server at ${MCP_URL} — query for component details, examples, and theme info.
`;

const COPILOT_INSTRUCTIONS = `# Volt UI — GitHub Copilot Instructions

You are working with **Volt UI**, an Angular v21 component library (shadcn/ui-inspired).

## Architecture
- **Standalone components** — no NgModules
- **Zoneless signals** — input(), output(), model(), computed()
- **OnPush** change detection everywhere
- **CVA** (class-variance-authority) for variants
- **ng-primitives** for accessibility

## Naming
- Library source: \`volt-*\` selectors, \`Volt*\` classes
- After CLI copy: \`ui-*\` selectors, \`Ui*\` classes
- Import from: \`'./ui/<component>'\`

## Components

| Component | Import | Key selectors |
|-----------|--------|---------------|
| Button | \`./ui/button\` | \`ui-button\` |
| Badge | \`./ui/badge\` | \`ui-badge\` |
| Card | \`./ui/card\` | \`ui-card\`, \`ui-card-header\`, \`ui-card-title\`, \`ui-card-content\`, \`ui-card-footer\` |
| Input | \`./ui/input\` | \`ui-input\` |
| Textarea | \`./ui/textarea\` | \`ui-textarea\` |
| Checkbox | \`./ui/checkbox\` | \`ui-checkbox\` |
| Radio | \`./ui/radio\` | \`ui-radio-group\`, \`ui-radio-item\` |
| Switch | \`./ui/switch\` | \`ui-switch\` |
| Toggle | \`./ui/toggle\` | \`ui-toggle\` |
| Select | \`./ui/select\` | \`ui-select\`, \`ui-select-content\`, \`ui-select-item\` |
| Tabs | \`./ui/tabs\` | \`ui-tabs\`, \`ui-tabs-list\`, \`ui-tabs-trigger\`, \`ui-tabs-content\` |
| Accordion | \`./ui/accordion\` | \`ui-accordion\`, \`ui-accordion-item\`, \`ui-accordion-trigger\`, \`ui-accordion-content\` |
| Avatar | \`./ui/avatar\` | \`ui-avatar\`, \`ui-avatar-image\`, \`ui-avatar-fallback\` |
| Separator | \`./ui/separator\` | \`ui-separator\` |
| Tooltip | \`./ui/tooltip\` | \`ui-tooltip\` |
| Navigation Menu | \`./ui/navigation-menu\` | \`ui-navigation-menu\` + sub-components |
| Form Field | \`./ui/form-field\` | \`ui-form-field\`, \`ui-form-field-label\`, \`ui-form-field-hint\`, \`ui-form-field-error\` |
| Dialog | \`./ui/dialog\` | \`ui-dialog\` + sub-components |
| Popover | \`./ui/popover\` | \`ui-popover\` + sub-components |
| Dropdown Menu | \`./ui/dropdown-menu\` | \`ui-dropdown-menu\` + sub-components |
| Slider | \`./ui/slider\` | \`ui-slider\` + sub-components |
| Progress | \`./ui/progress\` | \`ui-progress\` + sub-components |
| Breadcrumbs | \`./ui/breadcrumbs\` | \`ui-breadcrumbs\` + sub-components |
| Nav Sidebar | \`./ui/nav-sidebar\` | \`ui-nav-sidebar\` |
| Sidebar Layout | \`./ui/sidebar\` | \`ui-sidebar\` + sub-components |

## Button variants
\`\`\`html
<ui-button variant="solid|outline|ghost|link|destructive" size="sm|md|lg|icon">
\`\`\`

## Card pattern
\`\`\`html
<ui-card>
  <ui-card-header>
    <ui-card-title>Title</ui-card-title>
  </ui-card-header>
  <ui-card-content>Content</ui-card-content>
  <ui-card-footer>
    <ui-button variant="outline">Cancel</ui-button>
    <ui-button>Save</ui-button>
  </ui-card-footer>
</ui-card>
\`\`\`

## Form pattern
\`\`\`html
<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input type="email" placeholder="you@example.com" />
  <ui-form-field-hint>We never share your email</ui-form-field-hint>
</ui-form-field>
\`\`\`

## Theme
\`\`\`ts
import { provideVoltTheme } from 'volt/theme';
providers: [provideVoltTheme({ color: 'ember', style: 'soft', dark: false })]
// colors: volt | ember | sage | dusk | glacier
// styles: sharp | soft | brutal | ghost | retro
\`\`\`

## CLI
\`\`\`bash
npx volt init && npx volt add button card form-field input
\`\`\`

## Rules
1. Use standalone components with \`imports\` array
2. Use OnPush change detection
3. Use signal inputs (\`readonly x = input<T>(default)\`)
4. Import from \`'./ui/<component>'\`
`;

const VSCODE_SNIPPETS = {
  'Volt UI Button': {
    prefix: ['volt-button', 'ui-button'],
    description: 'Volt UI Button component',
    body: ['<ui-button variant="${1|solid,outline,ghost,link,destructive|}" size="${2|md,sm,lg,icon|}">${3:Label}</ui-button>'],
  },
  'Volt UI Card': {
    prefix: ['volt-card', 'ui-card'],
    description: 'Volt UI Card with full structure',
    body: [
      '<ui-card>',
      '  <ui-card-header>',
      '    <ui-card-title>${1:Title}</ui-card-title>',
      '    <ui-card-description>${2:Description}</ui-card-description>',
      '  </ui-card-header>',
      '  <ui-card-content>',
      '    ${3:<!-- Content -->}',
      '  </ui-card-content>',
      '  <ui-card-footer>',
      '    <ui-button variant="outline">${4:Cancel}</ui-button>',
      '    <ui-button>${5:Confirm}</ui-button>',
      '  </ui-card-footer>',
      '</ui-card>',
    ],
  },
  'Volt UI Form Field': {
    prefix: ['volt-form-field', 'ui-form-field'],
    description: 'Volt UI Form Field with input',
    body: [
      '<ui-form-field>',
      '  <ui-form-field-label>${1:Label}</ui-form-field-label>',
      '  <ui-input type="${2:text}" placeholder="${3:Enter value}" />',
      '  <ui-form-field-hint>${4:Helper text}</ui-form-field-hint>',
      '</ui-form-field>',
    ],
  },
  'Volt UI Tabs': {
    prefix: ['volt-tabs', 'ui-tabs'],
    description: 'Volt UI Tabs component',
    body: [
      '<ui-tabs value="${1:tab1}">',
      '  <ui-tabs-list>',
      '    <ui-tabs-trigger value="${1:tab1}">${2:Tab 1}</ui-tabs-trigger>',
      '    <ui-tabs-trigger value="${3:tab2}">${4:Tab 2}</ui-tabs-trigger>',
      '  </ui-tabs-list>',
      '  <ui-tabs-content value="${1:tab1}">${5:Content 1}</ui-tabs-content>',
      '  <ui-tabs-content value="${3:tab2}">${6:Content 2}</ui-tabs-content>',
      '</ui-tabs>',
    ],
  },
  'Volt UI Select': {
    prefix: ['volt-select', 'ui-select'],
    description: 'Volt UI Select dropdown',
    body: [
      '<ui-select placeholder="${1:Select option}">',
      '  <ui-select-label>${2:Label}</ui-select-label>',
      '  <ui-select-content>',
      '    <ui-select-item value="${3:value1}">${4:Option 1}</ui-select-item>',
      '    <ui-select-item value="${5:value2}">${6:Option 2}</ui-select-item>',
      '  </ui-select-content>',
      '</ui-select>',
    ],
  },
  'Volt UI Accordion': {
    prefix: ['volt-accordion', 'ui-accordion'],
    description: 'Volt UI Accordion',
    body: [
      '<ui-accordion type="${1|single,multiple|}" [collapsible]="true">',
      '  <ui-accordion-item>',
      '    <ui-accordion-trigger>${2:Question}</ui-accordion-trigger>',
      '    <ui-accordion-content>${3:Answer}</ui-accordion-content>',
      '  </ui-accordion-item>',
      '</ui-accordion>',
    ],
  },
  'Volt UI Checkbox': {
    prefix: ['volt-checkbox', 'ui-checkbox'],
    description: 'Volt UI Checkbox',
    body: ['<ui-checkbox [(checked)]="${1:checked}">${2:Label}</ui-checkbox>'],
  },
  'Volt UI Switch': {
    prefix: ['volt-switch', 'ui-switch'],
    description: 'Volt UI Switch',
    body: ['<ui-switch [(checked)]="${1:enabled}">${2:Label}</ui-switch>'],
  },
  'Volt UI Radio': {
    prefix: ['volt-radio', 'ui-radio'],
    description: 'Volt UI Radio Group',
    body: [
      '<ui-radio-group [(value)]="${1:selectedValue}">',
      '  <ui-radio-item value="${2:option1}">${3:Option 1}</ui-radio-item>',
      '  <ui-radio-item value="${4:option2}">${5:Option 2}</ui-radio-item>',
      '</ui-radio-group>',
    ],
  },
  'Volt UI Avatar': {
    prefix: ['volt-avatar', 'ui-avatar'],
    description: 'Volt UI Avatar',
    body: [
      '<ui-avatar>',
      '  <ui-avatar-image [src]="${1:url}" [alt]="${2:User}" />',
      '  <ui-avatar-fallback>${3:JD}</ui-avatar-fallback>',
      '</ui-avatar>',
    ],
  },
  'Volt UI Tooltip': {
    prefix: ['volt-tooltip', 'ui-tooltip'],
    description: 'Volt UI Tooltip',
    body: ['<ui-tooltip content="${1:Tooltip text}">', '  ${2:<ui-button>Hover me</ui-button>}', '</ui-tooltip>'],
  },
  'Volt UI Badge': {
    prefix: ['volt-badge', 'ui-badge'],
    description: 'Volt UI Badge',
    body: ['<ui-badge variant="${1|default,secondary,outline,destructive|}">${2:Label}</ui-badge>'],
  },
  'Volt Theme Provider': {
    prefix: ['volt-theme', 'provide-volt-theme'],
    description: 'Provide Volt theme in app config',
    body: [
      "import { provideVoltTheme } from 'volt/theme';",
      '',
      'providers: [',
      '  provideVoltTheme({',
      "    color: '${1|volt,ember,sage,dusk,glacier|}',",
      "    style: '${2|sharp,soft,brutal,ghost,retro|}',",
      '    dark: ${3|false,true|}',
      '  })',
      ']',
    ],
  },
};

// ---------------------------------------------------------------------------
// Per-agent installers (object map — no switch)
// ---------------------------------------------------------------------------

const installers = {
  claude: {
    label: 'Claude Desktop / Claude Code',
    install(projectPath) {
      // Claude Code project config
      const projectConfig = path.join(projectPath, '.claude', 'mcp.json');
      writeJson(projectConfig, { mcpServers: { 'volt-ui': MCP_ENTRY } });
      ok(`Created ${path.relative(projectPath, projectConfig)}`);

      // Optionally patch Claude Desktop global config
      const desktopConfig = resolveClaudeDesktopConfig();
      if (desktopConfig) {
        writeJson(desktopConfig, { mcpServers: { 'volt-ui': MCP_ENTRY } });
        ok(`Patched ${desktopConfig}`);
      }

      info('Restart Claude for changes to take effect.');
    },
  },

  cursor: {
    label: 'Cursor',
    install(projectPath) {
      const mcpConfig = path.join(projectPath, '.cursor', 'mcp.json');
      writeJson(mcpConfig, { mcpServers: { 'volt-ui': MCP_ENTRY } });
      ok(`Created ${path.relative(projectPath, mcpConfig)}`);

      const rulesFile = path.join(projectPath, '.cursorrules');
      writeText(rulesFile, CURSOR_RULES);
      ok(`Created ${path.relative(projectPath, rulesFile)}`);

      info('Restart Cursor for MCP changes to take effect.');
    },
  },

  windsurf: {
    label: 'Windsurf',
    install(projectPath) {
      const mcpConfig = path.join(projectPath, '.codeium', 'windsurf', 'mcp_config.json');
      writeJson(mcpConfig, { mcpServers: { 'volt-ui': MCP_ENTRY } });
      ok(`Created ${path.relative(projectPath, mcpConfig)}`);

      info('Restart Windsurf for MCP changes to take effect.');
    },
  },

  copilot: {
    label: 'GitHub Copilot (VS Code)',
    install(projectPath) {
      const instructions = path.join(projectPath, '.github', 'copilot-instructions.md');
      writeText(instructions, COPILOT_INSTRUCTIONS);
      ok(`Created ${path.relative(projectPath, instructions)}`);

      const snippets = path.join(projectPath, '.vscode', 'volt-snippets.code-snippets');
      writeJson(snippets, VSCODE_SNIPPETS);
      ok(`Created ${path.relative(projectPath, snippets)}`);

      warn('Copilot does not support MCP HTTP yet — instructions file provides context instead.');
      info('Reload VS Code window to activate snippets.');
    },
  },

  vscode: {
    label: 'VS Code (snippets)',
    install(projectPath) {
      const snippets = path.join(projectPath, '.vscode', 'volt-snippets.code-snippets');
      writeJson(snippets, VSCODE_SNIPPETS);
      ok(`Created ${path.relative(projectPath, snippets)}`);

      info('Type "volt-button", "volt-card", etc. and press Tab to expand.');
      info('Reload VS Code window to activate snippets.');
    },
  },
};

// ---------------------------------------------------------------------------
// Claude Desktop config path resolver
// ---------------------------------------------------------------------------

function resolveClaudeDesktopConfig() {
  const candidates = {
    darwin: path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    win32: path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json'),
    linux: path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json'),
  };

  const configPath = candidates[process.platform];
  if (!configPath) return null;

  // Only patch if the file or its directory already exists (user has Claude Desktop)
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir) && !fs.existsSync(configPath)) return null;

  return configPath;
}

// ---------------------------------------------------------------------------
// Interactive prompt
// ---------------------------------------------------------------------------

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function selectAgents(rl) {
  const keys = Object.keys(installers);

  log('\nAvailable agents:\n', 'bold');
  keys.forEach((key, i) => {
    log(`  ${c.cyan}${i + 1}${c.reset}. ${installers[key].label}  ${c.gray}(${key})${c.reset}`);
  });
  log(`  ${c.cyan}a${c.reset}. All of the above\n`);

  const answer = await ask(rl, `${c.bold}Select agent(s)${c.reset} [1-${keys.length}, comma-separated, or "a" for all]: `);
  const trimmed = answer.trim().toLowerCase();

  if (!trimmed || trimmed === 'a' || trimmed === 'all') return keys;

  const selected = trimmed
    .split(/[,\s]+/)
    .map(s => {
      const n = parseInt(s, 10);
      if (!isNaN(n) && n >= 1 && n <= keys.length) return keys[n - 1];
      if (installers[s]) return s;
      return null;
    })
    .filter(Boolean);

  if (!selected.length) {
    warn('No valid selection — installing all.');
    return keys;
  }

  return [...new Set(selected)];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log(`\n${c.bold}${c.cyan}┌─────────────────────────────┐${c.reset}`);
  log(`${c.bold}${c.cyan}│   Volt UI  MCP  Setup       │${c.reset}`);
  log(`${c.bold}${c.cyan}└─────────────────────────────┘${c.reset}\n`);
  log(`MCP endpoint: ${c.cyan}${MCP_URL}${c.reset}\n`);

  // Check for CLI-arg shortcuts: `node setup-mcp.js cursor copilot`
  const cliArgs = process.argv.slice(2).filter(a => installers[a]);

  let selectedAgents;
  let projectPath;

  if (cliArgs.length) {
    selectedAgents = cliArgs;
    projectPath = process.cwd();
    log(`Installing for: ${selectedAgents.join(', ')}\n`, 'cyan');
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    selectedAgents = await selectAgents(rl);

    const dirAnswer = await ask(rl, `\n${c.bold}Project directory${c.reset} [${process.cwd()}]: `);
    projectPath = dirAnswer.trim() ? path.resolve(dirAnswer.trim()) : process.cwd();

    rl.close();
  }

  log(`\nProject: ${c.cyan}${projectPath}${c.reset}\n`);

  for (const key of selectedAgents) {
    const agent = installers[key];
    log(`\n${c.bold}${agent.label}${c.reset}`, 'blue');
    agent.install(projectPath);
  }

  log(`\n${c.green}${c.bold}Done!${c.reset} Restart your editor if needed.\n`);

  log(`${c.dim}Next steps:${c.reset}`);
  log(`  ${c.cyan}npx volt init${c.reset}          — scaffold ui/ folder in your project`);
  log(`  ${c.cyan}npx volt add button${c.reset}    — add a component`);
  log(`  ${c.cyan}npx volt list${c.reset}          — list all available components\n`);
}

main().catch(err => {
  console.error(`\n${c.red}Error:${c.reset}`, err.message);
  process.exit(1);
});
