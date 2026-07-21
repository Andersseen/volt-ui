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

Volt UI is an Angular component library inspired by shadcn/ui, built on top of ng-primitives for accessible, copyable components.

## Stack
- Angular v21 · zoneless change detection · standalone components
- Tailwind CSS v4 with semantic tokens
- class-variance-authority (CVA) for variants
- ng-primitives for accessibility / interaction primitives
- Signals: input(), output(), model(), computed()

## Naming
| Context | Selector | Class |
|---------|----------|-------|
| Source (library) | \`volt-*\` (component) / \`[voltXxx]\` (directive) | \`Volt*\` |
| CLI output (user project) | \`ui-*\` (component) / \`[uiXxx]\` (directive) | \`Ui*\` |

## Components
button · badge · card · input · autofill · search · textarea · checkbox · radio · switch · toggle ·
select · tabs · accordion · avatar · separator · tooltip · navigation-menu · form-field ·
dialog · popover · dropdown-menu · slider · progress · breadcrumbs · sidebar ·
toggle-group · meter · pagination · toast · input-otp · file-upload · combobox ·
date-picker · listbox · toolbar · skeleton · table · resizable · theme

## Component import (CLI)
\`\`\`ts
import { UiButton } from './ui/button';
import { UiCard, UiCardHeader, UiCardContent, UiCardFooter } from './ui/card';
import { UiFormField, UiFormFieldLabel, UiFormFieldHint } from './ui/form-field';
\`\`\`

## Template selectors
\`\`\`html
<!-- Components -->
<ui-button variant="solid|outline|ghost|link|destructive" size="sm|md|lg|icon">
<ui-card> <ui-card-header> <ui-card-title> <ui-card-content> <ui-card-footer>
<ui-form-field> <ui-form-field-label> <ui-input> <ui-form-field-hint>
<ui-tabs [(value)]="activeTab"> <ui-tabs-list> <ui-tabs-trigger value="x"> <ui-tabs-content value="x">
<ui-accordion type="single|multiple" [collapsible]="true">
<ui-select placeholder="…"> <ui-select-content> <ui-select-item value="x">
<ui-table> <ui-table-header> <ui-table-body> <ui-table-row> <ui-table-head> <ui-table-cell>
<ui-skeleton variant="circle|text|rectangle" width="…" height="…">

<!-- Attribute directives (overlays) -->
<button [uiDialog]="tpl"> + <ng-template> with <div uiDialogContent>
<button [uiDrawer]="tpl"> + <ng-template> with <div uiDrawerContent side="left|right|top|bottom">
<button uiPopover [uiPopover]="tpl"> + <ng-template> with <ui-popover-content>
<button uiTooltip [uiTooltip]="tpl"> + <ng-template> with <ui-tooltip-content>
<button [uiDropdownMenu]="tpl"> + <ng-template> with <ui-dropdown-menu>
<img uiAvatarImage>
<a uiNavigationMenuLink>
\`\`\`

## Theme
\`\`\`ts
import { provideVoltTheme } from '@voltui/components';
// colors: volt | ember | sage | dusk | glacier
// styles: sharp | soft | brutal | ghost | retro
provideVoltTheme({ color: 'ember', style: 'soft', dark: false })
\`\`\`

## CLI
\`\`\`bash
npx @voltui/cli init           # scaffold ui/ folder
npx @voltui/cli add button     # add a component
npx @voltui/cli list           # list all components
\`\`\`

## Code guidelines
1. Use standalone components with \`imports\` array.
2. Use OnPush change detection.
3. Use signal inputs: \`readonly x = input<T>(default)\`.
4. Boolean inputs must use \`booleanAttribute\`.
5. Import copied components from \`'./ui/<component>'\`.
6. Overlays are attribute-directive triggers + \`<ng-template>\` — never use \`<ui-dialog>\`, \`<ui-tooltip>\`, \`<ui-popover-trigger>\`, or \`<ui-dropdown-menu-trigger>\`.

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
- **ng-primitives** for accessibility and interaction behavior

## Naming
- Library source: \`volt-*\` element selectors and \`[voltXxx]\` attribute directives, \`Volt*\` classes
- After CLI copy: \`ui-*\` element selectors and \`[uiXxx]\` attribute directives, \`Ui*\` classes
- Import from: \`'./ui/<component>'\`

## Available components

| Component | Import | Selectors | Notes |
|-----------|--------|-----------|-------|
| Button | \`./ui/button\` | \`ui-button\` | Variants: solid, outline, ghost, link, destructive |
| Badge | \`./ui/badge\` | \`ui-badge\` | Variants: default, secondary, outline, destructive |
| Autofill | \`./ui/autofill\` | \`[uiAutofill]\` directive | Emits \`autofillChange\` |
| Card | \`./ui/card\` | \`ui-card\` + header/title/description/content/footer | Presentational |
| Input | \`./ui/input\` | \`ui-input\` | CVA |
| Textarea | \`./ui/textarea\` | \`ui-textarea\` | CVA |
| Checkbox | \`./ui/checkbox\` | \`ui-checkbox\` | CVA |
| Radio | \`./ui/radio\` | \`ui-radio-group\`, \`ui-radio-item\` | CVA |
| Switch | \`./ui/switch\` | \`ui-switch\` | CVA |
| Toggle | \`./ui/toggle\` | \`ui-toggle\` | CVA |
| Toggle Group | \`./ui/toggle-group\` | \`ui-toggle-group\`, \`ui-toggle-group-item\` | CVA |
| Select | \`./ui/select\` | \`ui-select\` + content/item/label/separator/native-select | CVA |
| Tabs | \`./ui/tabs\` | \`ui-tabs\` + list/trigger/content | Use \`value\` model, not \`defaultValue\` |
| Accordion | \`./ui/accordion\` | \`ui-accordion\` + item/trigger/content | \`type\`, \`collapsible\` |
| Avatar | \`./ui/avatar\` | \`ui-avatar\`, \`<img uiAvatarImage>\`, \`ui-avatar-fallback\` | Image is directive |
| Breadcrumbs | \`./ui/breadcrumbs\` | \`ui-breadcrumbs\` + singular \`breadcrumb-*\` sub-components | |
| Separator | \`./ui/separator\` | \`ui-separator\` | \`orientation\` |
| Skeleton | \`./ui/skeleton\` | \`ui-skeleton\` | \`variant\`, \`width\`, \`height\` |
| Meter | \`./ui/meter\` | \`ui-meter\` + track/indicator | |
| Progress | \`./ui/progress\` | \`ui-progress\` | |
| Slider | \`./ui/slider\` | \`ui-slider\` | CVA |
| Form Field | \`./ui/form-field\` | \`ui-form-field\` + label/hint/error | |
| Pagination | \`./ui/pagination\` | \`ui-pagination\` + first/previous/next/last/button | |
| Table | \`./ui/table\` | \`ui-table\` + header/body/footer/row/head/cell/caption | |
| Toolbar | \`./ui/toolbar\` | \`ui-toolbar\` | |
| Search | \`./ui/search\` | \`ui-search\`, \`ui-search-clear\` | |
| Input OTP | \`./ui/input-otp\` | \`ui-input-otp\`, \`ui-input-otp-slot\` | |
| Combobox | \`./ui/combobox\` | \`ui-combobox\` + input/button/dropdown/option | |
| Date Picker | \`./ui/date-picker\` | \`ui-date-picker\`, \`ui-date-range-picker\` + sub-components | CVA |
| File Upload | \`./ui/file-upload\` | \`ui-file-upload\`, \`ui-file-dropzone\` | |
| Listbox | \`./ui/listbox\` | \`ui-listbox\` + option/section/header | |
| Navigation Menu | \`./ui/navigation-menu\` | \`ui-navigation-menu\` + list/item/trigger/content/link | Link is \`a[uiNavigationMenuLink]\` |
| Resizable | \`./ui/resizable\` | \`ui-resizable\` + panel/handle | |
| Sidebar | \`./ui/sidebar\` | \`ui-sidebar\` layout group | |
| Theme | \`./ui/theme\` | \`provideVoltTheme\`, \`applyVoltTheme\` | |
| Dialog | \`./ui/dialog\` | \`[uiDialog]\`, \`[uiDialogOverlay]\`, \`[uiDialogContent]\`, \`[uiDialogTitle]\`, \`[uiDialogDescription]\` | Template-based overlay |
| Drawer | \`./ui/drawer\` | \`[uiDrawer]\`, \`[uiDrawerOverlay]\`, \`[uiDrawerContent]\`, \`[uiDrawerTitle]\`, \`[uiDrawerDescription]\`, \`ui-drawer-close\` | Template-based overlay |
| Popover | \`./ui/popover\` | \`[uiPopover]\`, \`ui-popover-content\` | Template-based overlay |
| Tooltip | \`./ui/tooltip\` | \`[uiTooltip]\`, \`ui-tooltip-content\` | Template-based overlay |
| Dropdown Menu | \`./ui/dropdown-menu\` | \`[uiDropdownMenu]\`, \`ui-dropdown-menu\` + item/label/separator | Template-based overlay |
| Toast | \`./ui/toast\` | \`ui-toast\` + title/description/close | Use \`NgpToastManager\` |

## Overlay pattern
Overlays are never used as element selectors. Use an attribute-directive trigger that references an \`<ng-template>\`:

\`\`\`html
<button [uiDialog]="dialogTpl">Open</button>
<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Title</h2>
    <p uiDialogDescription>Description</p>
    <ui-button (click)="close()">Close</ui-button>
  </div>
</ng-template>
\`\`\`

## Button variants
\`\`\`html
<ui-button variant="solid|outline|ghost|link|destructive" size="sm|md|lg|icon">
\`\`\`

## Card pattern
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

## Tabs pattern
\`\`\`html
<ui-tabs [(value)]="activeTab">
  <ui-tabs-list>
    <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
    <ui-tabs-trigger value="password">Password</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="account">Account settings.</ui-tabs-content>
  <ui-tabs-content value="password">Password settings.</ui-tabs-content>
</ui-tabs>
\`\`\`

## Theme system
\`\`\`ts
import { provideVoltTheme } from '@voltui/components';
// colors: volt | ember | sage | dusk | glacier
// styles: sharp | soft | brutal | ghost | retro
providers: [provideVoltTheme({ color: 'ember', style: 'soft', dark: false })]
\`\`\`

## CLI
\`\`\`bash
npx @voltui/cli init
npx @voltui/cli add button card form-field input
npx @voltui/cli list
\`\`\`

## Code guidelines
1. Use standalone components with \`imports\` array.
2. Use OnPush change detection.
3. Use signal inputs (\`readonly x = input<T>(default)\`).
4. Use \`computed()\` for derived values.
5. Boolean inputs must use \`booleanAttribute\`.
6. Import from \`'./ui/<component>'\`.
7. Never use \`<ui-dialog>\`, \`<ui-tooltip>\`, \`<ui-popover-trigger>\`, or \`<ui-dropdown-menu-trigger>\`.
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
    body: ['<ui-badge variant="${1|default,secondary,outline,destructive|}">${2:Label}</ui-badge>'],
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
  'Volt UI Progress': {
    prefix: ['volt-progress', 'ui-progress'],
    description: 'Volt UI Progress',
    body: ['<ui-progress [value]="${1:60}" [max]="${2:100}" />'],
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

const VOLT_UI_SKILL = `---
name: volt-ui
description: >
  Understand and integrate Volt UI components into Angular projects.
  Volt UI is an Angular component library inspired by shadcn/ui, built on
  ng-primitives, Tailwind CSS v4, standalone signals components and CVA.
  Use when the project consumes @voltui/components, @voltui/cli, or copied
  Volt UI source under src/app/ui.
---

# Volt UI — AI Integration Skill

## When to use this skill

- The user is adding, editing or debugging Volt UI components in an Angular app.
- You see imports from \`'@voltui/components'\`, \`'./ui/button'\`, etc.
- You need to generate markup, fix selectors, wire Reactive Forms, or theme the app.
- The user asks about available components, CLI commands, or MCP tools.

## What Volt UI is

- **Angular 21**, zoneless, standalone components, OnPush, signals (\`input()\`, \`output()\`, \`model()\`).
- **Tailwind CSS v4** with semantic tokens (\`bg-primary\`, \`text-foreground\`, \`rounded-md\`).
- **ng-primitives** provides accessible behavior (keyboard, focus, overlays, CVA).
- **class-variance-authority (CVA)** drives component variants.
- **Two consumption modes**:
  1. **CLI / source-ownership (recommended)**: \`npx @voltui/cli add button\`. Files are copied into the consumer project (default \`src/app/ui\`) and become editable local code.
  2. **NPM package**: \`npm install @voltui/components\` for shared themes/utilities.

## Naming conventions

| Context        | Selector                                       | Class name | Import path                        |
| -------------- | ----------------------------------------------- | ---------- | ----------------------------------- |
| Library source | \`volt-*\` (component) / \`[voltXxx]\` (directive) | \`VoltXxx\`  | \`'@voltui/components'\`              |
| After CLI copy | \`ui-*\` (component) / \`[uiXxx]\` (directive)     | \`UiXxx\`    | \`'./ui/<component>'\`                |

Always prefer the CLI prefix (\`ui-*\` / \`UiXxx\`) when generating code for this project unless it explicitly imports from the npm package.

## Adding components to this project

\`\`\`bash
npx @voltui/cli init              # scaffolds src/app/ui
npx @voltui/cli add button card form-field input
npx @voltui/cli add dialog ./src/app/shared/ui --dry-run
\`\`\`

Runtime dependencies (installed once):

\`\`\`bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
\`\`\`

## Theme setup

In the app's global CSS:

\`\`\`css
@import 'tailwindcss';
@import '@voltui/components/themes.css';
\`\`\`

In \`app.config.ts\`:

\`\`\`ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
\`\`\`

Color presets: \`volt\`, \`ember\`, \`sage\`, \`dusk\`, \`glacier\`.
Style presets: \`sharp\`, \`soft\`, \`brutal\`, \`ghost\`, \`retro\`.

## Component / directive selector rules

- Element selectors are used for presentational containers: \`<ui-card>\`, \`<ui-button>\`, \`<ui-input>\`.
- Attribute directives are used when the primitive is applied to an existing host element:
  - Dialog trigger: \`<button [uiDialog]="tpl">\`
  - Drawer trigger: \`<button [uiDrawer]="tpl">\`
  - Popover trigger: \`<button uiPopover [uiPopover]="tpl">\`
  - Tooltip trigger: \`<button uiTooltip [uiTooltip]="tpl">\`
  - Dropdown trigger: \`<button [uiDropdownMenu]="tpl">\`
  - Avatar image: \`<img uiAvatarImage>\`
  - Navigation link: \`<a uiNavigationMenuLink>\`
- Overlays (dialog, drawer, popover, tooltip, dropdown-menu) are declared inside an \`<ng-template>\` and referenced by the trigger.

## Reactive Forms

Most CVA components expose \`formControl\` directly:

\`\`\`ts
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UiInput, UiCheckbox, UiSwitch, UiRadioGroup, UiRadioItem } from './ui';

email = new FormControl('', { nonNullable: true });
accepted = new FormControl(false, { nonNullable: true });
\`\`\`

\`\`\`html
<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input [formControl]="email" type="email" />
  <ui-form-field-hint>We'll only use this for account updates.</ui-form-field-hint>
</ui-form-field>

<ui-checkbox [formControl]="accepted">Accept terms</ui-checkbox>
\`\`\`

## Common patterns

### Card

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

### Dialog

\`\`\`html
<button [uiDialog]="dialogTpl">Open</button>
<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Confirm</h2>
    <p uiDialogDescription>Are you sure?</p>
    <ui-button (click)="close()">Confirm</ui-button>
  </div>
</ng-template>
\`\`\`

### Tabs

\`\`\`html
<ui-tabs [(value)]="activeTab">
  <ui-tabs-list>
    <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
    <ui-tabs-trigger value="password">Password</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="account">Account settings.</ui-tabs-content>
  <ui-tabs-content value="password">Password settings.</ui-tabs-content>
</ui-tabs>
\`\`\`

## AI tools integration

- **MCP server**: \`${MCP_URL}\` is a spec-compliant Streamable HTTP MCP server, already configured in this project's \`.mcp.json\` by \`npx volt-ui-mcp\`. It exposes tools, resources, and prompts:
  - Tools: \`list_components\`, \`get_component\`, \`get_usage_example\`, \`get_theme_info\`, \`get_project_info\`, \`generate_cli_command\`.
  - Resources: \`component://<name>\`, \`theme://info\`, \`project://info\`.
  - Prompts: \`generate-volt-ui-component\`, \`volt-ui-troubleshooting\`.
- **CLI**: \`npx @voltui/cli list\` shows available components; \`npx @voltui/cli add <name>\` copies source.
- Prefer calling the MCP \`get_component\` tool over guessing inputs — this file lists the common patterns, but the MCP server always reflects the current component metadata.

## Rules for generating Volt UI code

1. Prefer standalone components with signal inputs; avoid NgModules.
2. Use OnPush change detection in new components that extend Volt UI.
3. Import copied components from \`'./ui/<component>'\` (or the local barrel), not from \`'@voltui/components'\`, unless this project explicitly uses the npm package workflow.
4. Use semantic Tailwind utilities (\`bg-primary\`, \`text-foreground\`, \`rounded-md\`) instead of hard-coded \`var()\` utilities.
5. Boolean inputs must use \`booleanAttribute\`; number inputs should use \`numberAttribute\` when appropriate.
6. For overlays, always use the attribute-directive trigger + \`<ng-template>\` pattern.
7. Do not invent inputs. If unsure, call the MCP \`get_component\` tool.
`;

// Cursor / Windsurf accept a bare `url` entry.
const MCP_ENTRY = { type: 'url', url: MCP_URL };
// Claude Code's project-level `.mcp.json` uses the `http` transport type.
const MCP_ENTRY_CLAUDE = { type: 'http', url: MCP_URL };

const agentSetups: Record<string, AgentSetup> = {
  claude: {
    label: 'Claude Code',
    description:
      'Connects Claude Code to the Volt UI MCP server and installs the Volt UI skill so it can query components, examples, and theme info.',
    mcpNative: true,
    files: [
      {
        path: '.mcp.json',
        description:
          'Claude Code project-level MCP config, read from the repo root (merge into existing file if it exists)',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY_CLAUDE } },
        format: 'json',
      },
      {
        path: '.claude/skills/volt-ui/SKILL.md',
        description: 'Volt UI skill, auto-discovered by Claude Code from .claude/skills/<name>/',
        content: VOLT_UI_SKILL,
        format: 'text',
      },
    ],
    notes: [
      'Restart Claude Code for the MCP server and skill to load.',
      'Claude Desktop: remote MCP servers are added via Settings -> Connectors, not by editing claude_desktop_config.json.',
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
