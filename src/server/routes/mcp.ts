/**
 * Volt UI MCP Server — HTTP transport (Streamable HTTP / JSON-RPC 2.0)
 *
 * Implements the Model Context Protocol so AI assistants can query
 * Volt UI component information without a local install.
 *
 * Usage in claude_desktop_config.json / .cursor/mcp.json:
 * {
 *   "mcpServers": {
 *     "volt-ui": {
 *       "type": "url",
 *       "url": "https://volt-ui.pages.dev/api/mcp"
 *     }
 *   }
 * }
 */

import { defineEventHandler, readBody, setHeaders, getMethod } from 'h3';

// ---------------------------------------------------------------------------
// Component metadata (inlined — CF Workers have no filesystem access)
// ---------------------------------------------------------------------------

const components: Record<string, ComponentMeta> = {
  button: {
    name: 'Button',
    description: 'Button component with multiple variants and sizes',
    dependencies: ['ng-primitives/button'],
    variants: ['solid', 'outline', 'ghost', 'link', 'destructive'],
    sizes: ['sm', 'md', 'lg', 'icon'],
    inputs: [
      {
        name: 'variant',
        type: 'string',
        default: 'solid',
        options: ['solid', 'outline', 'ghost', 'link', 'destructive'],
      },
      { name: 'size', type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'icon'] },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      '<ui-button>Click me</ui-button>',
      '<ui-button variant="outline" size="sm">Cancel</ui-button>',
      '<ui-button variant="destructive" [disabled]="isLoading()">Delete</ui-button>',
    ],
  },
  badge: {
    name: 'Badge',
    description: 'Badge component for labels and counts',
    dependencies: [],
    variants: ['default', 'secondary', 'outline', 'destructive'],
    inputs: [{ name: 'variant', type: 'string', default: 'default' }],
    examples: ['<ui-badge>New</ui-badge>', '<ui-badge variant="outline">Draft</ui-badge>'],
  },
  card: {
    name: 'Card',
    description: 'Card container with header, content, and footer',
    dependencies: [],
    subComponents: ['card-header', 'card-title', 'card-description', 'card-content', 'card-footer'],
    examples: [
      `<ui-card>\n  <ui-card-header>\n    <ui-card-title>Title</ui-card-title>\n    <ui-card-description>Description</ui-card-description>\n  </ui-card-header>\n  <ui-card-content>Content</ui-card-content>\n  <ui-card-footer>Footer</ui-card-footer>\n</ui-card>`,
    ],
  },
  input: {
    name: 'Input',
    description: 'Text input field',
    dependencies: [],
    inputs: [
      { name: 'type', type: 'string', default: 'text' },
      { name: 'placeholder', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      '<ui-input placeholder="Enter email" />',
      '<ui-input type="password" [disabled]="isDisabled()" />',
    ],
  },
  textarea: {
    name: 'Textarea',
    description: 'Multi-line text input',
    dependencies: [],
    inputs: [
      { name: 'rows', type: 'number', default: 3 },
      { name: 'placeholder', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: ['<ui-textarea placeholder="Enter message" [rows]="5" />'],
  },
  checkbox: {
    name: 'Checkbox',
    description: 'Checkbox input with indeterminate state',
    dependencies: ['ng-primitives/checkbox'],
    inputs: [
      { name: 'checked', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'indeterminate', type: 'boolean', default: false },
    ],
    examples: [
      '<ui-checkbox [(checked)]="isChecked">Accept terms</ui-checkbox>',
      '<ui-checkbox [indeterminate]="isIndeterminate">Select all</ui-checkbox>',
    ],
  },
  radio: {
    name: 'Radio',
    description: 'Radio group and radio items',
    dependencies: ['ng-primitives/radio'],
    subComponents: ['radio-group', 'radio-item'],
    inputs: [
      { name: 'value', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-radio-group [(value)]="selectedValue">\n  <ui-radio-item value="option1">Option 1</ui-radio-item>\n  <ui-radio-item value="option2">Option 2</ui-radio-item>\n</ui-radio-group>`,
    ],
  },
  switch: {
    name: 'Switch',
    description: 'Toggle switch component',
    dependencies: ['ng-primitives/switch'],
    inputs: [
      { name: 'checked', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: ['<ui-switch [(checked)]="isEnabled">Enable notifications</ui-switch>'],
  },
  toggle: {
    name: 'Toggle',
    description: 'Toggle button (pressed state)',
    dependencies: ['ng-primitives/button'],
    inputs: [
      { name: 'pressed', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: ['<ui-toggle [(pressed)]="isBold">Bold</ui-toggle>'],
  },
  select: {
    name: 'Select',
    description: 'Dropdown select with options',
    dependencies: ['ng-primitives/select'],
    subComponents: ['select-content', 'select-item', 'select-label', 'select-separator'],
    inputs: [
      { name: 'value', type: 'string' },
      { name: 'placeholder', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-select placeholder="Select option">\n  <ui-select-label>Choose one</ui-select-label>\n  <ui-select-content>\n    <ui-select-item value="1">Option 1</ui-select-item>\n    <ui-select-item value="2">Option 2</ui-select-item>\n  </ui-select-content>\n</ui-select>`,
    ],
  },
  tabs: {
    name: 'Tabs',
    description: 'Tabbed interface',
    dependencies: ['ng-primitives/tab'],
    subComponents: ['tabs-list', 'tabs-trigger', 'tabs-content'],
    inputs: [{ name: 'value', type: 'string' }],
    examples: [
      `<ui-tabs value="tab1">\n  <ui-tabs-list>\n    <ui-tabs-trigger value="tab1">Tab 1</ui-tabs-trigger>\n    <ui-tabs-trigger value="tab2">Tab 2</ui-tabs-trigger>\n  </ui-tabs-list>\n  <ui-tabs-content value="tab1">Content 1</ui-tabs-content>\n  <ui-tabs-content value="tab2">Content 2</ui-tabs-content>\n</ui-tabs>`,
    ],
  },
  accordion: {
    name: 'Accordion',
    description: 'Collapsible accordion panels',
    dependencies: ['ng-primitives/accordion'],
    subComponents: ['accordion-item', 'accordion-trigger', 'accordion-content'],
    inputs: [
      { name: 'type', type: 'string', default: 'single', options: ['single', 'multiple'] },
      { name: 'collapsible', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-accordion type="single" [collapsible]="true">\n  <ui-accordion-item value="item1">\n    <ui-accordion-trigger>Question</ui-accordion-trigger>\n    <ui-accordion-content>Answer</ui-accordion-content>\n  </ui-accordion-item>\n</ui-accordion>`,
    ],
  },
  avatar: {
    name: 'Avatar',
    description: 'User avatar with image and fallback',
    dependencies: ['ng-primitives/avatar'],
    subComponents: ['avatar-image', 'avatar-fallback'],
    inputs: [
      { name: 'src', type: 'string' },
      { name: 'alt', type: 'string' },
      { name: 'delayMs', type: 'number', default: 0 },
    ],
    examples: [
      `<ui-avatar>\n  <ui-avatar-image [src]="user.avatar" [alt]="user.name" />\n  <ui-avatar-fallback>{{ user.initials }}</ui-avatar-fallback>\n</ui-avatar>`,
    ],
  },
  separator: {
    name: 'Separator',
    description: 'Visual divider line',
    dependencies: ['ng-primitives/separator'],
    inputs: [
      {
        name: 'orientation',
        type: 'string',
        default: 'horizontal',
        options: ['horizontal', 'vertical'],
      },
    ],
    examples: ['<ui-separator />', '<ui-separator orientation="vertical" />'],
  },
  tooltip: {
    name: 'Tooltip',
    description: 'Floating tooltip on hover',
    dependencies: ['ng-primitives/tooltip'],
    subComponents: ['tooltip-content'],
    inputs: [
      { name: 'content', type: 'string' },
      { name: 'side', type: 'string', default: 'top' },
      { name: 'align', type: 'string', default: 'center' },
    ],
    examples: ['<ui-tooltip content="More info"><ui-button>Hover me</ui-button></ui-tooltip>'],
  },
  'navigation-menu': {
    name: 'Navigation Menu',
    description: 'Navigation menu with dropdowns',
    dependencies: ['ng-primitives/navigation-menu'],
    subComponents: [
      'navigation-menu-list',
      'navigation-menu-item',
      'navigation-menu-trigger',
      'navigation-menu-content',
      'navigation-menu-link',
    ],
    examples: [
      `<ui-navigation-menu>\n  <ui-navigation-menu-list>\n    <ui-navigation-menu-item>\n      <ui-navigation-menu-trigger>Item</ui-navigation-menu-trigger>\n      <ui-navigation-menu-content>...</ui-navigation-menu-content>\n    </ui-navigation-menu-item>\n  </ui-navigation-menu-list>\n</ui-navigation-menu>`,
    ],
  },
  'form-field': {
    name: 'Form Field',
    description: 'Form field wrapper with label, hint, and error',
    dependencies: ['ng-primitives/form-field'],
    subComponents: ['form-field-label', 'form-field-hint', 'form-field-error'],
    examples: [
      `<ui-form-field>\n  <ui-form-field-label>Email</ui-form-field-label>\n  <ui-input type="email" />\n  <ui-form-field-hint>We'll never share your email</ui-form-field-hint>\n  <ui-form-field-error>Invalid email</ui-form-field-error>\n</ui-form-field>`,
    ],
  },
  dialog: {
    name: 'Dialog',
    description: 'Modal dialog with overlay, title, description and content',
    dependencies: ['ng-primitives/dialog'],
    subComponents: ['dialog-overlay', 'dialog-content', 'dialog-title', 'dialog-description'],
    inputs: [
      { name: 'modal', type: 'boolean', default: true },
      { name: 'open', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-dialog>\n  <ui-dialog-content>\n    <ui-dialog-title>Confirm</ui-dialog-title>\n    <ui-dialog-description>Are you sure?</ui-dialog-description>\n    <ui-button>Confirm</ui-button>\n  </ui-dialog-content>\n</ui-dialog>`,
    ],
  },
  popover: {
    name: 'Popover',
    description: 'Floating popover anchored to a trigger element',
    dependencies: ['ng-primitives/popover'],
    subComponents: ['popover-trigger', 'popover-content'],
    inputs: [
      { name: 'side', type: 'string', default: 'bottom' },
      { name: 'align', type: 'string', default: 'center' },
    ],
    examples: [
      `<ui-popover>\n  <ui-popover-trigger><ui-button>Open</ui-button></ui-popover-trigger>\n  <ui-popover-content>Popover content</ui-popover-content>\n</ui-popover>`,
    ],
  },
  'dropdown-menu': {
    name: 'Dropdown Menu',
    description: 'Dropdown menu with items, labels and separators',
    dependencies: ['ng-primitives/menu'],
    subComponents: [
      'dropdown-menu-trigger',
      'dropdown-menu-item',
      'dropdown-menu-label',
      'dropdown-menu-separator',
    ],
    inputs: [{ name: 'disabled', type: 'boolean', default: false }],
    examples: [
      `<ui-dropdown-menu>\n  <ui-dropdown-menu-trigger><ui-button>Menu</ui-button></ui-dropdown-menu-trigger>\n  <ui-dropdown-menu-item>Profile</ui-dropdown-menu-item>\n  <ui-dropdown-menu-separator />\n  <ui-dropdown-menu-item>Logout</ui-dropdown-menu-item>\n</ui-dropdown-menu>`,
    ],
  },
  slider: {
    name: 'Slider',
    description: 'Range slider input with track and thumb',
    dependencies: ['ng-primitives/slider'],
    subComponents: ['slider-track', 'slider-range', 'slider-thumb'],
    inputs: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: ['<ui-slider [min]="0" [max]="100" [(value)]="volume" />'],
  },
  progress: {
    name: 'Progress',
    description: 'Progress bar with track and indicator',
    dependencies: ['ng-primitives/progress'],
    subComponents: ['progress-track', 'progress-indicator'],
    inputs: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
    ],
    examples: ['<ui-progress [value]="60" [max]="100" />'],
  },
  breadcrumbs: {
    name: 'Breadcrumbs',
    description: 'Navigation breadcrumbs with items, links, ellipsis and separators',
    dependencies: ['ng-primitives/breadcrumbs'],
    subComponents: [
      'breadcrumbs-list',
      'breadcrumbs-item',
      'breadcrumbs-link',
      'breadcrumbs-page',
      'breadcrumbs-separator',
      'breadcrumbs-ellipsis',
    ],
    examples: [
      `<ui-breadcrumbs>\n  <ui-breadcrumbs-item><ui-breadcrumbs-link href="/">Home</ui-breadcrumbs-link></ui-breadcrumbs-item>\n  <ui-breadcrumbs-separator />\n  <ui-breadcrumbs-item><ui-breadcrumbs-page>Current</ui-breadcrumbs-page></ui-breadcrumbs-item>\n</ui-breadcrumbs>`,
    ],
  },
  'nav-sidebar': {
    name: 'Nav Sidebar',
    description: 'Navigation sidebar component for menus',
    dependencies: ['ng-primitives/navigation-menu'],
    inputs: [{ name: 'collapsed', type: 'boolean', default: false }],
    examples: ['<ui-nav-sidebar>…</ui-nav-sidebar>'],
  },
  sidebar: {
    name: 'Sidebar Layout',
    description: 'Application sidebar layout with header, content, groups, items and footer',
    dependencies: [],
    subComponents: [
      'sidebar-header',
      'sidebar-content',
      'sidebar-group',
      'sidebar-item',
      'sidebar-footer',
    ],
    inputs: [{ name: 'collapsed', type: 'boolean', default: false }],
    examples: [
      `<ui-sidebar>\n  <ui-sidebar-header>Logo</ui-sidebar-header>\n  <ui-sidebar-content>\n    <ui-sidebar-group label="Main">\n      <ui-sidebar-item>Dashboard</ui-sidebar-item>\n    </ui-sidebar-group>\n  </ui-sidebar-content>\n  <ui-sidebar-footer>User</ui-sidebar-footer>\n</ui-sidebar>`,
    ],
  },
  'toggle-group': {
    name: 'Toggle Group',
    description: 'Group of toggle buttons with single or multiple selection',
    dependencies: ['ng-primitives/toggle-group'],
    subComponents: ['toggle-group-item'],
    inputs: [
      { name: 'value', type: 'string[]', default: [] },
      { name: 'type', type: 'string', default: 'single', options: ['single', 'multiple'] },
      {
        name: 'orientation',
        type: 'string',
        default: 'horizontal',
        options: ['horizontal', 'vertical'],
      },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-toggle-group type="single" [(value)]="selected">\n  <ui-toggle-group-item value="bold">Bold</ui-toggle-group-item>\n  <ui-toggle-group-item value="italic">Italic</ui-toggle-group-item>\n</ui-toggle-group>`,
    ],
  },
  meter: {
    name: 'Meter',
    description: 'Meter component for displaying a value within a known range',
    dependencies: ['ng-primitives/meter'],
    subComponents: ['meter-track', 'meter-indicator'],
    inputs: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
    ],
    examples: [
      '<ui-meter [value]="75" [max]="100"><ui-meter-track><ui-meter-indicator /></ui-meter-track></ui-meter>',
    ],
  },
  pagination: {
    name: 'Pagination',
    description: 'Pagination controls with first, previous, next, last and page buttons',
    dependencies: ['ng-primitives/pagination'],
    subComponents: [
      'pagination-first',
      'pagination-previous',
      'pagination-next',
      'pagination-last',
      'pagination-button',
    ],
    inputs: [
      { name: 'page', type: 'number', default: 1 },
      { name: 'pageCount', type: 'number', default: 0 },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-pagination [pageCount]="10" [(page)]="currentPage">\n  <ui-pagination-first />\n  <ui-pagination-previous />\n  <ui-pagination-button *ngFor="let p of pages" [page]="p" />\n  <ui-pagination-next />\n  <ui-pagination-last />\n</ui-pagination>`,
    ],
  },
  toast: {
    name: 'Toast',
    description: 'Toast notification container with title, description and close button',
    dependencies: ['ng-primitives/toast'],
    subComponents: ['toast-title', 'toast-description', 'toast-close'],
    inputs: [
      {
        name: 'variant',
        type: 'string',
        default: 'default',
        options: ['default', 'success', 'error', 'warning', 'info'],
      },
    ],
    examples: [
      `<ui-toast>\n  <ui-toast-title>Success</ui-toast-title>\n  <ui-toast-description>Your changes have been saved.</ui-toast-description>\n</ui-toast>`,
    ],
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InputDef {
  name: string;
  type: string;
  default?: unknown;
  options?: string[];
}

interface ComponentMeta {
  name: string;
  description: string;
  dependencies: string[];
  variants?: string[];
  sizes?: string[];
  inputs?: InputDef[];
  subComponents?: string[];
  examples?: string[];
}

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// MCP tool definitions
// ---------------------------------------------------------------------------

const tools = [
  {
    name: 'list_components',
    description: 'List all available Volt UI components with their names and descriptions.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_component',
    description:
      'Get detailed information about a specific Volt UI component including inputs, variants, subcomponents, and usage examples.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component key (e.g. "button", "card", "form-field")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_usage_example',
    description: 'Get Angular template usage examples and import path for a Volt UI component.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component key (e.g. "button", "accordion")',
        },
      },
      required: ['component'],
    },
  },
  {
    name: 'get_theme_info',
    description: 'Get available Volt UI themes, colors, and how to configure them.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_project_info',
    description:
      'Get general information about the Volt UI project: framework, architecture, naming conventions.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'generate_cli_command',
    description: 'Generate the npx command to scaffold or add a Volt UI component to a project.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['init', 'add', 'list'],
          description:
            '"init" to set up Volt UI in a project, "add" to add a component, "list" to list available components.',
        },
        component: {
          type: 'string',
          description: 'Component name — required when action is "add".',
        },
        targetDir: {
          type: 'string',
          description: 'Target directory (optional).',
        },
      },
      required: ['action'],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool call handlers (object map — no switch)
// ---------------------------------------------------------------------------

const cliActions: Record<string, (args: Record<string, unknown>) => unknown> = {
  init: args => ({
    command: `npx @voltui/cli init${args['targetDir'] ? ` ${args['targetDir']}` : ''}`,
  }),
  add: args => {
    if (!args['component']) return { error: 'component is required for the "add" action' };
    return {
      command: `npx @voltui/cli add ${args['component']}${args['targetDir'] ? ` ${args['targetDir']}` : ''}`,
    };
  },
  list: () => ({ command: 'npx @voltui/cli list' }),
};

const toolHandlers: Record<string, (args: Record<string, unknown>) => unknown> = {
  list_components: () =>
    Object.entries(components).map(([key, comp]) => ({
      name: key,
      displayName: comp.name,
      description: comp.description,
    })),

  get_component: args => {
    const comp = components[args['name'] as string];
    if (!comp)
      return {
        error: `Component "${args['name']}" not found. Use list_components to see available components.`,
      };
    return comp;
  },

  get_usage_example: args => {
    const key = args['component'] as string;
    const comp = components[key];
    if (!comp)
      return {
        error: `Component "${key}" not found. Use list_components to see available components.`,
      };
    const className = `Ui${comp.name.replace(/\s/g, '')}`;
    return {
      component: key,
      imports: {
        npm: `import { ${className} } from '@voltui/components';`,
        cli: `import { ${className} } from './ui/${key}';`,
      },
      examples: comp.examples ?? [],
    };
  },

  get_theme_info: () => ({
    colors: ['volt', 'ember', 'sage', 'dusk', 'glacier'],
    styles: ['sharp', 'soft', 'brutal', 'ghost', 'retro'],
    provider: 'provideVoltTheme',
    dynamic: 'applyVoltTheme',
    import: `import { provideVoltTheme, applyVoltTheme } from '@voltui/components';`,
    usage: {
      provider: `provideVoltTheme({ color: 'ember', style: 'soft', dark: false })`,
      dynamic: `applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true })`,
    },
  }),

  get_project_info: () => ({
    name: 'Volt UI',
    type: 'angular-component-library',
    framework: 'Angular v21',
    primitives: 'ng-primitives',
    styling: 'Tailwind CSS v4',
    docs: 'https://volt-ui.pages.dev',
    packages: {
      components: '@voltui/components',
      cli: '@voltui/cli',
      mcp: 'volt-ui-mcp',
    },
    install: {
      npm: 'npm install @voltui/components',
      cli: 'npx @voltui/cli init',
      mcp: 'npx volt-ui-mcp',
    },
    architecture: {
      components: 'standalone',
      changeDetection: 'zoneless-signals',
      hostDirectives: true,
    },
    naming: {
      sourcePrefix: 'volt',
      cliPrefix: 'ui',
      sourceClassPrefix: 'Volt',
      cliClassPrefix: 'Ui',
    },
  }),

  generate_cli_command: args => {
    const action = args['action'] as string;
    const handler = cliActions[action];
    if (!handler)
      return {
        error: `Unknown action: ${action}. Valid actions: ${Object.keys(cliActions).join(', ')}`,
      };
    return handler(args);
  },
};

function callTool(name: string, args: Record<string, unknown>): unknown {
  const handler = toolHandlers[name];
  if (!handler) return { error: `Unknown tool: ${name}` };
  return handler(args);
}

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 dispatcher (object map — no switch)
// ---------------------------------------------------------------------------

type RpcHandler = (params: Record<string, unknown>, id: JsonRpcRequest['id']) => unknown;

const rpcHandlers: Record<string, RpcHandler> = {
  initialize: (params, id) => {
    // Store client capabilities for potential future adaptation
    clientCapabilities = (params['capabilities'] as Record<string, unknown>) ?? {};

    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          logging: {},
        },
        serverInfo: { name: 'volt-ui', version: '1.0.0' },
      },
    };
  },

  ping: (_params, id) => ({ jsonrpc: '2.0', id, result: {} }),

  'tools/list': (_params, id) => ({ jsonrpc: '2.0', id, result: { tools } }),

  'tools/call': (params, id) => {
    const toolName = params['name'] as string;
    const toolArgs = (params['arguments'] ?? {}) as Record<string, unknown>;
    const content = callTool(toolName, toolArgs);
    return {
      jsonrpc: '2.0',
      id,
      result: { content: [{ type: 'text', text: JSON.stringify(content, null, 2) }] },
    };
  },
};

function handleRpc(request: JsonRpcRequest): unknown {
  const { id, method, params = {} } = request;

  // Silently ignore notifications (no id)
  if (id === null || id === undefined) {
    if (method === 'notifications/initialized') {
      return undefined;
    }
    if (method === 'initialize') {
      // Edge case: some clients send initialize without id
      return rpcHandlers['initialize']?.(params, null);
    }
    return undefined;
  }

  try {
    const handler = rpcHandlers[method];
    if (!handler) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
    }
    return handler(params, id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { jsonrpc: '2.0', id, error: { code: -32603, message } };
  }
}

// ---------------------------------------------------------------------------
// Analog / Nitro event handler
// ---------------------------------------------------------------------------

export default defineEventHandler(async event => {
  setHeaders(event, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id',
  });

  const method = getMethod(event);

  // Preflight
  if (method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    return null;
  }

  // GET — return server info for humans browsing the endpoint
  if (method === 'GET') {
    const base = 'https://volt-ui.pages.dev/api/mcp';
    return {
      name: 'Volt UI MCP Server',
      protocol: 'Model Context Protocol (JSON-RPC 2.0)',
      transport: 'Streamable HTTP',
      setup: {
        cli: 'npx volt-ui-mcp',
        configUrl: `${base}/setup`,
        agents: ['claude', 'cursor', 'windsurf', 'copilot', 'vscode'].map(agent => ({
          agent,
          configUrl: `${base}/setup?agent=${agent}`,
        })),
      },
      tools: tools.map(t => ({ name: t.name, description: t.description })),
    };
  }

  // POST — JSON-RPC 2.0
  if (method === 'POST') {
    let body: unknown;
    try {
      body = await readBody(event);
    } catch {
      event.node.res.statusCode = 400;
      return { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } };
    }

    // Batch requests
    if (Array.isArray(body)) {
      return body.map(req => handleRpc(req as JsonRpcRequest));
    }

    return handleRpc(body as JsonRpcRequest);
  }

  event.node.res.statusCode = 405;
  return { error: 'Method not allowed' };
});
