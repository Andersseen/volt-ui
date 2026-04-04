#!/usr/bin/env node

/**
 * Volt UI MCP Server
 * 
 * Provides MCP (Model Context Protocol) endpoints for AI assistants
 * to query Volt UI component information.
 */

const fs = require('fs');
const path = require('path');

const VOLT_UI_PATH = process.env.VOLT_UI_PATH || findVoltUiPath();
const COMPONENTS_DIR = path.join(VOLT_UI_PATH, 'projects/volt/src/lib');

function findVoltUiPath() {
  let checkDir = __dirname;
  for (let i = 0; i < 5; i++) {
    const mcpDir = path.join(checkDir, 'mcp');
    if (fs.existsSync(mcpDir)) {
      return checkDir;
    }
    const parent = path.dirname(checkDir);
    if (parent === checkDir) break;
    checkDir = parent;
  }
  throw new Error('Could not find Volt UI repository');
}

// Component metadata
const components = {
  button: {
    name: 'Button',
    description: 'Button component with multiple variants and sizes',
    files: ['button.ts', 'index.ts'],
    dependencies: ['ng-primitives/button'],
    variants: ['solid', 'outline', 'ghost', 'link', 'destructive'],
    sizes: ['sm', 'md', 'lg', 'icon'],
    inputs: [
      { name: 'variant', type: 'string', default: 'solid', options: ['solid', 'outline', 'ghost', 'link', 'destructive'] },
      { name: 'size', type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'icon'] },
      { name: 'disabled', type: 'boolean', default: false }
    ],
    examples: [
      '<ui-button>Click me</ui-button>',
      '<ui-button variant="outline" size="sm">Cancel</ui-button>',
      '<ui-button variant="destructive" [disabled]="isLoading()">Delete</ui-button>'
    ]
  },
  badge: {
    name: 'Badge',
    description: 'Badge component for labels and counts',
    files: ['badge.ts', 'index.ts'],
    dependencies: [],
    variants: ['default', 'secondary', 'outline', 'destructive'],
    inputs: [
      { name: 'variant', type: 'string', default: 'default' }
    ],
    examples: [
      '<ui-badge>New</ui-badge>',
      '<ui-badge variant="outline">Draft</ui-badge>'
    ]
  },
  card: {
    name: 'Card',
    description: 'Card container with header, content, and footer',
    files: ['card.component.ts', 'index.ts'],
    dependencies: [],
    subComponents: ['card-header', 'card-title', 'card-description', 'card-content', 'card-footer'],
    examples: [
      `<ui-card>
  <ui-card-header>
    <ui-card-title>Title</ui-card-title>
    <ui-card-description>Description</ui-card-description>
  </ui-card-header>
  <ui-card-content>Content</ui-card-content>
  <ui-card-footer>Footer</ui-card-footer>
</ui-card>`
    ]
  },
  input: {
    name: 'Input',
    description: 'Text input field',
    files: ['input.component.ts', 'index.ts'],
    dependencies: [],
    inputs: [
      { name: 'type', type: 'string', default: 'text' },
      { name: 'placeholder', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false }
    ],
    examples: [
      '<ui-input placeholder="Enter email" />',
      '<ui-input type="password" [disabled]="isDisabled()" />'
    ]
  },
  textarea: {
    name: 'Textarea',
    description: 'Multi-line text input',
    files: ['textarea.ts', 'index.ts'],
    dependencies: [],
    inputs: [
      { name: 'rows', type: 'number', default: 3 },
      { name: 'placeholder', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false }
    ]
  },
  checkbox: {
    name: 'Checkbox',
    description: 'Checkbox input with indeterminate state',
    files: ['checkbox.component.ts', 'index.ts'],
    dependencies: ['ng-primitives/checkbox'],
    inputs: [
      { name: 'checked', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'indeterminate', type: 'boolean', default: false }
    ],
    examples: [
      '<ui-checkbox [(checked)]="isChecked">Accept terms</ui-checkbox>',
      '<ui-checkbox [indeterminate]="isIndeterminate">Select all</ui-checkbox>'
    ]
  },
  radio: {
    name: 'Radio',
    description: 'Radio group and radio items',
    files: ['radio-group.ts', 'radio-item.ts', 'index.ts'],
    dependencies: ['ng-primitives/radio'],
    subComponents: ['radio-group', 'radio-item'],
    inputs: [
      { name: 'value', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false }
    ],
    examples: [
      `<ui-radio-group [(value)]="selectedValue">
  <ui-radio-item value="option1">Option 1</ui-radio-item>
  <ui-radio-item value="option2">Option 2</ui-radio-item>
</ui-radio-group>`
    ]
  },
  switch: {
    name: 'Switch',
    description: 'Toggle switch component',
    files: ['switch.component.ts', 'index.ts'],
    dependencies: ['ng-primitives/switch'],
    inputs: [
      { name: 'checked', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false }
    ],
    examples: [
      '<ui-switch [(checked)]="isEnabled">Enable notifications</ui-switch>'
    ]
  },
  toggle: {
    name: 'Toggle',
    description: 'Toggle button (pressed state)',
    files: ['toggle.ts', 'index.ts'],
    dependencies: ['ng-primitives/button'],
    inputs: [
      { name: 'pressed', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false }
    ]
  },
  select: {
    name: 'Select',
    description: 'Dropdown select with options',
    files: ['select.component.ts', 'select-content.component.ts', 'select-item.component.ts', 'select-label.component.ts', 'select-separator.component.ts', 'index.ts'],
    dependencies: ['ng-primitives/select'],
    subComponents: ['select-content', 'select-item', 'select-label', 'select-separator'],
    inputs: [
      { name: 'value', type: 'string' },
      { name: 'placeholder', type: 'string' },
      { name: 'disabled', type: 'boolean', default: false }
    ],
    examples: [
      `<ui-select placeholder="Select option">
  <ui-select-label>Choose one</ui-select-label>
  <ui-select-content>
    <ui-select-item value="1">Option 1</ui-select-item>
    <ui-select-item value="2">Option 2</ui-select-item>
  </ui-select-content>
</ui-select>`
    ]
  },
  tabs: {
    name: 'Tabs',
    description: 'Tabbed interface',
    files: ['tabs.component.ts', 'tabs-list.component.ts', 'tabs-trigger.component.ts', 'tabs-content.component.ts'],
    dependencies: ['ng-primitives/tab'],
    subComponents: ['tabs-list', 'tabs-trigger', 'tabs-content'],
    inputs: [
      { name: 'value', type: 'string' }
    ],
    examples: [
      `<ui-tabs value="tab1">
  <ui-tabs-list>
    <ui-tabs-trigger value="tab1">Tab 1</ui-tabs-trigger>
    <ui-tabs-trigger value="tab2">Tab 2</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="tab1">Content 1</ui-tabs-content>
  <ui-tabs-content value="tab2">Content 2</ui-tabs-content>
</ui-tabs>`
    ]
  },
  accordion: {
    name: 'Accordion',
    description: 'Collapsible accordion panels',
    files: ['accordion.component.ts', 'accordion-item.component.ts', 'accordion-trigger.component.ts', 'accordion-content.component.ts', 'index.ts'],
    dependencies: ['ng-primitives/accordion'],
    subComponents: ['accordion-item', 'accordion-trigger', 'accordion-content'],
    inputs: [
      { name: 'type', type: 'string', default: 'single', options: ['single', 'multiple'] },
      { name: 'collapsible', type: 'boolean', default: false }
    ]
  },
  avatar: {
    name: 'Avatar',
    description: 'User avatar with image and fallback',
    files: ['avatar.ts', 'avatar-image.ts', 'avatar-fallback.ts', 'index.ts'],
    dependencies: ['ng-primitives/avatar'],
    subComponents: ['avatar-image', 'avatar-fallback'],
    inputs: [
      { name: 'src', type: 'string' },
      { name: 'alt', type: 'string' },
      { name: 'delayMs', type: 'number', default: 0 }
    ],
    examples: [
      `<ui-avatar [src]="user.avatar" [alt]="user.name">
  <ui-avatar-fallback>{{ user.initials }}</ui-avatar-fallback>
</ui-avatar>`
    ]
  },
  separator: {
    name: 'Separator',
    description: 'Visual divider line',
    files: ['separator.component.ts', 'index.ts'],
    dependencies: ['ng-primitives/separator'],
    inputs: [
      { name: 'orientation', type: 'string', default: 'horizontal', options: ['horizontal', 'vertical'] }
    ]
  },
  tooltip: {
    name: 'Tooltip',
    description: 'Floating tooltip on hover',
    files: ['tooltip.ts', 'tooltip-content.ts', 'index.ts'],
    dependencies: ['ng-primitives/tooltip'],
    subComponents: ['tooltip-content'],
    inputs: [
      { name: 'content', type: 'string' },
      { name: 'side', type: 'string', default: 'top' },
      { name: 'align', type: 'string', default: 'center' }
    ],
    examples: [
      '<ui-tooltip content="More info"><ui-button>Hover me</ui-button></ui-tooltip>'
    ]
  },
  'navigation-menu': {
    name: 'Navigation Menu',
    description: 'Navigation menu with dropdowns',
    files: ['navigation-menu.ts', 'navigation-menu-list.ts', 'navigation-menu-item.ts', 'navigation-menu-trigger.ts', 'navigation-menu-content.ts', 'navigation-menu-content-item.ts', 'navigation-menu-link.ts', 'index.ts'],
    dependencies: ['ng-primitives/navigation-menu'],
    subComponents: ['navigation-menu-list', 'navigation-menu-item', 'navigation-menu-trigger', 'navigation-menu-content', 'navigation-menu-link']
  },
  'form-field': {
    name: 'Form Field',
    description: 'Form field wrapper with label, hint, error',
    files: ['form-field.ts', 'form-field-label.ts', 'form-field-hint.ts', 'form-field-error.ts', 'index.ts'],
    dependencies: ['ng-primitives/form-field'],
    subComponents: ['form-field-label', 'form-field-hint', 'form-field-error'],
    examples: [
      `<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input type="email" />
  <ui-form-field-hint>We'll never share your email</ui-form-field-hint>
  <ui-form-field-error>Invalid email</ui-form-field-error>
</ui-form-field>`
    ]
  }
};

// MCP Protocol Handlers
const handlers = {
  // List all components
  'list_components': () => {
    return Object.entries(components).map(([key, comp]) => ({
      name: key,
      displayName: comp.name,
      description: comp.description
    }));
  },

  // Get component details
  'get_component': (params) => {
    const component = components[params.name];
    if (!component) {
      return { error: `Component "${params.name}" not found` };
    }
    return component;
  },

  // Get component source code
  'get_component_source': (params) => {
    const component = components[params.name];
    if (!component) {
      return { error: `Component "${params.name}" not found` };
    }

    const sources = {};
    for (const file of component.files) {
      const filePath = path.join(COMPONENTS_DIR, params.name, file);
      if (fs.existsSync(filePath)) {
        sources[file] = fs.readFileSync(filePath, 'utf-8');
      }
    }
    return sources;
  },

  // Get usage example
  'get_usage_example': (params) => {
    const component = components[params.component];
    if (!component) {
      return { error: `Component "${params.component}" not found` };
    }

    const examples = component.examples || [];
    return {
      component: params.component,
      import: `import { Ui${component.name.replace(/\s/g, '')} } from './ui/${params.component}';`,
      examples: examples
    };
  },

  // Get theme info
  'get_theme_info': () => {
    return {
      colors: ['volt', 'ember', 'sage', 'dusk', 'glacier'],
      styles: ['sharp', 'soft', 'brutal', 'ghost', 'retro'],
      provider: 'provideVoltTheme',
      dynamic: 'applyVoltTheme',
      usage: {
        provider: `provideVoltTheme({ color: 'ember', style: 'soft', dark: false })`,
        dynamic: `applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true })`
      }
    };
  },

  // Generate CLI command
  'generate_cli_command': (params) => {
    const cliPath = path.join(VOLT_UI_PATH, 'cli/bin/volt');
    
    switch (params.action) {
      case 'init':
        return { command: `node ${cliPath} init ${params.targetDir || ''}`.trim() };
      case 'add':
        if (!params.component) {
          return { error: 'Component name required for add action' };
        }
        return { command: `node ${cliPath} add ${params.component} ${params.targetDir || ''}`.trim() };
      case 'list':
        return { command: `node ${cliPath} list` };
      default:
        return { error: `Unknown action: ${params.action}` };
    }
  },

  // Get project info
  'get_project_info': () => {
    return {
      name: 'Volt UI',
      type: 'angular-component-library',
      framework: 'Angular v21',
      primitives: 'ng-primitives',
      styling: 'Tailwind CSS v4',
      architecture: {
        components: 'standalone',
        changeDetection: 'zoneless-signals',
        hostDirectives: true
      },
      naming: {
        sourcePrefix: 'volt',
        cliPrefix: 'ui',
        sourceClassPrefix: 'Volt',
        cliClassPrefix: 'Ui'
      }
    };
  }
};

// MCP Protocol (stdio)
async function handleRequest(request) {
  const { method, params = {} } = request;
  
  if (handlers[method]) {
    try {
      const result = await handlers[method](params);
      return {
        jsonrpc: '2.0',
        id: request.id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id: request.id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  };
}

// Main loop
async function main() {
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  for await (const line of rl) {
    try {
      const request = JSON.parse(line);
      const response = await handleRequest(request);
      console.log(JSON.stringify(response));
    } catch (error) {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error'
        }
      }));
    }
  }
}

// If run directly, start server
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { handlers, components };
