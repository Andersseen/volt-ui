/**
 * GET /api/mcp/setup
 * GET /api/mcp/setup?agent=claude|cursor|copilot|vscode
 *
 * Returns per-agent setup configuration so the CLI (or a user)
 * can grab the exact files/content to install without needing
 * the local volt-ui repo.
 */

import { defineEventHandler, getQuery, setHeaders, createError, sendError } from 'h3';

const MCP_URL = 'https://volt-ui.pages.dev/api/mcp';

// ---------------------------------------------------------------------------
// Shared content assets
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
dialog · popover · dropdown-menu · slider · progress · breadcrumbs · nav-sidebar · sidebar ·
toggle-group · meter · pagination · toast · input-otp · file-upload · combobox ·
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

## Component pattern
\`\`\`ts
@Component({
  selector: 'ui-example',
  imports: [NgpButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<button ngpButton [class]="classes()"><ng-content /></button>\`,
})
export class UiExample {
  readonly variant = input<'solid'|'outline'>('solid');
  protected readonly classes = computed(() => exampleVariants({ variant: this.variant() }));
}
\`\`\`

## AI tools
MCP server at ${MCP_URL} — query it for component details, usage examples, and theme info.
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

## Available components

| Component | Import | Selector |
|-----------|--------|----------|
| Button | \`./ui/button\` | \`ui-button\` |
| Badge | \`./ui/badge\` | \`ui-badge\` |
| Card | \`./ui/card\` | \`ui-card\` + sub-components |
| Input | \`./ui/input\` | \`ui-input\` |
| Textarea | \`./ui/textarea\` | \`ui-textarea\` |
| Checkbox | \`./ui/checkbox\` | \`ui-checkbox\` |
| Radio | \`./ui/radio\` | \`ui-radio-group\`, \`ui-radio-item\` |
| Switch | \`./ui/switch\` | \`ui-switch\` |
| Toggle | \`./ui/toggle\` | \`ui-toggle\` |
| Select | \`./ui/select\` | \`ui-select\` + sub-components |
| Tabs | \`./ui/tabs\` | \`ui-tabs\` + sub-components |
| Accordion | \`./ui/accordion\` | \`ui-accordion\` + sub-components |
| Avatar | \`./ui/avatar\` | \`ui-avatar\` + sub-components |
| Separator | \`./ui/separator\` | \`ui-separator\` |
| Tooltip | \`./ui/tooltip\` | \`ui-tooltip\` |
| Navigation Menu | \`./ui/navigation-menu\` | \`ui-navigation-menu\` + sub-components |
| Form Field | \`./ui/form-field\` | \`ui-form-field\` + sub-components |
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
\`\`\`ts
import { UiCard, UiCardHeader, UiCardTitle, UiCardDescription, UiCardContent, UiCardFooter } from './ui/card';
\`\`\`
\`\`\`html
<ui-card>
  <ui-card-header>
    <ui-card-title>Title</ui-card-title>
    <ui-card-description>Description</ui-card-description>
  </ui-card-header>
  <ui-card-content>Content</ui-card-content>
  <ui-card-footer>
    <ui-button variant="outline">Cancel</ui-button>
    <ui-button>Save</ui-button>
  </ui-card-footer>
</ui-card>
\`\`\`

## Form field pattern
\`\`\`html
<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input type="email" placeholder="you@example.com" />
  <ui-form-field-hint>We'll never share your email</ui-form-field-hint>
  <ui-form-field-error>Email is required</ui-form-field-error>
</ui-form-field>
\`\`\`

## Theme system
\`\`\`ts
import { provideVoltTheme } from 'volt/theme';
// colors: volt | ember | sage | dusk | glacier
// styles: sharp | soft | brutal | ghost | retro
providers: [provideVoltTheme({ color: 'ember', style: 'soft', dark: false })]
\`\`\`

## CLI
\`\`\`bash
npx volt init && npx volt add button card form-field input
\`\`\`

## Code guidelines
1. Use standalone components with \`imports\` array
2. Use OnPush change detection
3. Use signal inputs (\`readonly x = input<T>(default)\`)
4. Use computed() for derived values
5. Import from \`'./ui/<component>'\`
`;

const VSCODE_SNIPPETS = {
  'Volt UI Button': {
    prefix: ['volt-button', 'ui-button'],
    description: 'Volt UI Button component',
    body: [
      '<ui-button variant="${1|solid,outline,ghost,link,destructive|}" size="${2|md,sm,lg,icon|}">${3:Label}</ui-button>',
    ],
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
    body: [
      '<ui-tooltip content="${1:Tooltip text}">',
      '  ${2:<ui-button>Hover me</ui-button>}',
      '</ui-tooltip>',
    ],
  },
  'Volt UI Badge': {
    prefix: ['volt-badge', 'ui-badge'],
    description: 'Volt UI Badge',
    body: ['<ui-badge variant="${1|default,secondary,outline,destructive|}">${2:Label}</ui-badge>'],
  },
  'Volt UI Dialog': {
    prefix: ['volt-dialog', 'ui-dialog'],
    description: 'Volt UI Dialog',
    body: [
      '<ui-dialog>',
      '  <ui-dialog-content>',
      '    <ui-dialog-title>${1:Title}</ui-dialog-title>',
      '    <ui-dialog-description>${2:Description}</ui-dialog-description>',
      '    ${3:<!-- Content -->}',
      '  </ui-dialog-content>',
      '</ui-dialog>',
    ],
  },
  'Volt UI Popover': {
    prefix: ['volt-popover', 'ui-popover'],
    description: 'Volt UI Popover',
    body: [
      '<ui-popover>',
      '  <ui-popover-trigger>${1:<ui-button>Open</ui-button>}</ui-popover-trigger>',
      '  <ui-popover-content>${2:Content}</ui-popover-content>',
      '</ui-popover>',
    ],
  },
  'Volt UI Dropdown Menu': {
    prefix: ['volt-dropdown-menu', 'ui-dropdown-menu'],
    description: 'Volt UI Dropdown Menu',
    body: [
      '<ui-dropdown-menu>',
      '  <ui-dropdown-menu-trigger>${1:<ui-button>Menu</ui-button>}</ui-dropdown-menu-trigger>',
      '  <ui-dropdown-menu-item>${2:Item}</ui-dropdown-menu-item>',
      '</ui-dropdown-menu>',
    ],
  },
  'Volt UI Slider': {
    prefix: ['volt-slider', 'ui-slider'],
    description: 'Volt UI Slider',
    body: ['<ui-slider [min]="${1:0}" [max]="${2:100}" [(value)]="${3:value}" />'],
  },
  'Volt UI Progress': {
    prefix: ['volt-progress', 'ui-progress'],
    description: 'Volt UI Progress',
    body: ['<ui-progress [value]="${1:60}" [max]="${2:100}" />'],
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
  'Volt UI Import Button': {
    prefix: ['import-ui-button'],
    description: 'Import Volt UI Button',
    body: ["import { UiButton } from './ui/button';"],
  },
  'Volt UI Import Card': {
    prefix: ['import-ui-card'],
    description: 'Import Volt UI Card',
    body: [
      "import { UiCard, UiCardHeader, UiCardTitle, UiCardDescription, UiCardContent, UiCardFooter } from './ui/card';",
    ],
  },
};

// ---------------------------------------------------------------------------
// Agent setup definitions (object map — no switch)
// ---------------------------------------------------------------------------

interface FileSpec {
  path: string;
  description: string;
  content: string | Record<string, unknown>;
  format: 'json' | 'text';
}

interface AgentSetup {
  label: string;
  description: string;
  mcpNative: boolean;
  files: FileSpec[];
  notes?: string[];
}

const MCP_ENTRY = { type: 'url', url: MCP_URL };

const agentSetups: Record<string, AgentSetup> = {
  claude: {
    label: 'Claude Desktop / Claude Code',
    description:
      'Connects Claude to the Volt UI MCP server so it can query components, examples, and theme info.',
    mcpNative: true,
    files: [
      {
        path: '.claude/mcp.json',
        description: 'Claude Code project MCP config (merge into existing file if it exists)',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY } },
        format: 'json',
      },
    ],
    notes: [
      'For Claude Desktop: merge into ~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or %APPDATA%/Claude/claude_desktop_config.json (Windows)',
      'Restart Claude after adding the config.',
    ],
  },

  cursor: {
    label: 'Cursor',
    description:
      'Connects Cursor to the Volt UI MCP server and adds cursor rules with component context.',
    mcpNative: true,
    files: [
      {
        path: '.cursor/mcp.json',
        description: 'Cursor MCP config',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY } },
        format: 'json',
      },
      {
        path: '.cursorrules',
        description: 'Cursor rules with Volt UI component context',
        content: CURSOR_RULES,
        format: 'text',
      },
    ],
    notes: ['Restart Cursor after adding the config.'],
  },

  windsurf: {
    label: 'Windsurf',
    description: 'Connects Windsurf to the Volt UI MCP server.',
    mcpNative: true,
    files: [
      {
        path: '.codeium/windsurf/mcp_config.json',
        description: 'Windsurf MCP config',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY } },
        format: 'json',
      },
    ],
    notes: ['Restart Windsurf after adding the config.'],
  },

  copilot: {
    label: 'GitHub Copilot (VS Code)',
    description: 'Adds Copilot instructions and VS Code snippets for Volt UI.',
    mcpNative: false,
    files: [
      {
        path: '.github/copilot-instructions.md',
        description: 'Copilot instructions with Volt UI context',
        content: COPILOT_INSTRUCTIONS,
        format: 'text',
      },
      {
        path: '.vscode/volt-snippets.code-snippets',
        description: 'VS Code snippets for Volt UI components',
        content: VSCODE_SNIPPETS,
        format: 'json',
      },
    ],
    notes: [
      'Copilot does not yet support MCP HTTP servers directly.',
      'The instructions file gives Copilot Chat context about Volt UI.',
      'Reload VS Code window after adding snippets.',
    ],
  },

  vscode: {
    label: 'VS Code (snippets only)',
    description: 'Adds VS Code snippets for fast Volt UI template expansion.',
    mcpNative: false,
    files: [
      {
        path: '.vscode/volt-snippets.code-snippets',
        description: 'VS Code snippets for Volt UI components',
        content: VSCODE_SNIPPETS,
        format: 'json',
      },
    ],
    notes: [
      'Reload VS Code window after adding snippets.',
      'Type "volt-button", "volt-card", etc. and press Tab.',
    ],
  },
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default defineEventHandler(async event => {
  setHeaders(event, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  const { agent } = getQuery(event) as { agent?: string };

  if (!agent) {
    return {
      description: 'Volt UI MCP setup configurations per agent',
      mcpUrl: MCP_URL,
      agents: Object.entries(agentSetups).map(([key, setup]) => ({
        key,
        label: setup.label,
        description: setup.description,
        mcpNative: setup.mcpNative,
        setupUrl: `${MCP_URL}/setup?agent=${key}`,
      })),
      cli: 'npx volt-ui-mcp',
    };
  }

  const setup = agentSetups[agent];

  if (!setup) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        message: `Agent "${agent}" not supported. Available: ${Object.keys(agentSetups).join(', ')}`,
      })
    );
  }

  return { agent, ...setup };
});
