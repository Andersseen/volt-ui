'use strict';

/**
 * Content the @voltui/agent installer writes into a consumer project: the rules/instructions block
 * for agents that do not load skills, and the VS Code snippets. The skills themselves are the files
 * under ./skills (see ./skills.js); the rules block is built from them, never written separately.
 *
 * Single source for both the installer (setup-agent.js) and the hosted /api/mcp/setup endpoint, which
 * reads a generated copy (`pnpm generate:mcp-content`). Edit here, never in the generated file.
 */

const { routingBlock, loadSkills } = require('./skills');

const DEFAULT_MCP_URL = 'https://voltui.dev/api/mcp';

/** @param {string} MCP_URL endpoint written into the rules/instructions */
function buildContent(MCP_URL) {
  // One block for every rules-file agent (Cursor, Copilot, Gemini, Windsurf): short, because the
  // facts are in the MCP server and the playbooks are digests of the skills.
  const RULES = routingBlock(MCP_URL);
  const CURSOR_RULES = RULES;
  const COPILOT_INSTRUCTIONS = RULES;
  const WINDSURF_RULES = RULES;
  const VOLT_UI_SKILLS = loadSkills();

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
        '  <ui-label>${1:Label}</ui-label>',
        '  <ui-input type="${2:text}" placeholder="${3:Enter value}" />',
        '  <ui-hint>${4:Helper text}</ui-hint>',
        '</ui-form-field>',
      ],
    },
    'Volt UI Tabs': {
      prefix: ['volt-tabs', 'ui-tabs'],
      description: 'Volt UI Tabs component',
      body: [
        '<ui-tabs [(value)]="${1:activeTab}">',
        '  <ui-tabs-list>',
        '    <ui-tabs-trigger value="${2:tab1}">${3:Tab 1}</ui-tabs-trigger>',
        '    <ui-tabs-trigger value="${4:tab2}">${5:Tab 2}</ui-tabs-trigger>',
        '  </ui-tabs-list>',
        '  <ui-tabs-content value="${2:tab1}">${6:Content 1}</ui-tabs-content>',
        '  <ui-tabs-content value="${4:tab2}">${7:Content 2}</ui-tabs-content>',
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
        '  <img uiAvatarImage [src]="${1:url}" [alt]="${2:User}" />',
        '  <ui-avatar-fallback>${3:JD}</ui-avatar-fallback>',
        '</ui-avatar>',
      ],
    },
    'Volt UI Tooltip': {
      prefix: ['volt-tooltip', 'ui-tooltip'],
      description: 'Volt UI Tooltip',
      body: [
        '<button uiTooltip [uiTooltip]="tooltipTpl">${1:Hover me}</button>',
        '<ng-template #tooltipTpl>',
        '  <ui-tooltip-content>${2:Tooltip text}</ui-tooltip-content>',
        '</ng-template>',
      ],
    },
    'Volt UI Badge': {
      prefix: ['volt-badge', 'ui-badge'],
      description: 'Volt UI Badge',
      body: [
        '<ui-badge variant="${1|default,secondary,outline,destructive|}">${2:Label}</ui-badge>',
      ],
    },
    'Volt UI Dialog': {
      prefix: ['volt-dialog', 'ui-dialog'],
      description: 'Volt UI Dialog',
      body: [
        '<button [uiDialog]="${1:dialogTpl}">${2:Open Dialog}</button>',
        '<ng-template #${1:dialogTpl} let-close="close">',
        '  <div uiDialogOverlay></div>',
        '  <div uiDialogContent>',
        '    <h2 uiDialogTitle>${3:Title}</h2>',
        '    <p uiDialogDescription>${4:Description}</p>',
        '  </div>',
        '</ng-template>',
      ],
    },
    'Volt UI Popover': {
      prefix: ['volt-popover', 'ui-popover'],
      description: 'Volt UI Popover',
      body: [
        '<button uiPopover [uiPopover]="${1:popoverTpl}">${2:Open}</button>',
        '<ng-template #${1:popoverTpl}>',
        '  <ui-popover-content>${3:Content}</ui-popover-content>',
        '</ng-template>',
      ],
    },
    'Volt UI Dropdown Menu': {
      prefix: ['volt-dropdown-menu', 'ui-dropdown-menu'],
      description: 'Volt UI Dropdown Menu',
      body: [
        '<button [uiDropdownMenu]="${1:menuTpl}">${2:Menu}</button>',
        '<ng-template #${1:menuTpl}>',
        '  <ui-dropdown-menu>',
        '    <ui-dropdown-menu-item>${3:Item}</ui-dropdown-menu-item>',
        '  </ui-dropdown-menu>',
        '</ng-template>',
      ],
    },
    'Volt UI Slider': {
      prefix: ['volt-slider', 'ui-slider'],
      description: 'Volt UI Slider',
      body: ['<ui-slider [min]="${1:0}" [max]="${2:100}" [(value)]="${3:value}" />'],
    },
    'Volt UI Range Slider': {
      prefix: ['volt-range-slider', 'ui-range-slider'],
      description: 'Volt UI Range Slider',
      body: [
        '<ui-range-slider [min]="${1:0}" [max]="${2:100}" [(low)]="${3:low}" [(high)]="${4:high}" />',
      ],
    },
    'Volt UI Progress': {
      prefix: ['volt-progress', 'ui-progress'],
      description: 'Volt UI Progress',
      body: [
        '<ui-progress [value]="${1:60}" [max]="${2:100}">',
        '  <ui-progress-label>${3:Loading}</ui-progress-label>',
        '  <ui-progress-value>${1:60}%</ui-progress-value>',
        '</ui-progress>',
      ],
    },
    'Volt UI Skeleton': {
      prefix: ['volt-skeleton', 'ui-skeleton'],
      description: 'Volt UI Skeleton',
      body: [
        '<ui-skeleton variant="${1|text,circle,rectangle|}" width="${2:120px}" height="${3:16px}" />',
      ],
    },
    'Volt UI Table': {
      prefix: ['volt-table', 'ui-table'],
      description: 'Volt UI Table',
      body: [
        '<ui-table>',
        '  <ui-table-header>',
        '    <ui-table-row>',
        '      <ui-table-head>${1:Column}</ui-table-head>',
        '    </ui-table-row>',
        '  </ui-table-header>',
        '  <ui-table-body>',
        '    <ui-table-row>',
        '      <ui-table-cell>${2:Cell}</ui-table-cell>',
        '    </ui-table-row>',
        '  </ui-table-body>',
        '</ui-table>',
      ],
    },
    'Volt Theme Provider': {
      prefix: ['volt-theme', 'provide-volt-theme'],
      description: 'Provide Volt theme in app config',
      body: [
        "import { provideVoltTheme } from '@voltui/components';",
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

  return { CURSOR_RULES, COPILOT_INSTRUCTIONS, WINDSURF_RULES, VOLT_UI_SKILLS, VSCODE_SNIPPETS };
}

module.exports = { DEFAULT_MCP_URL, buildContent };
