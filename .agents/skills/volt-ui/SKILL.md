---
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
- You see imports from `'volt'`, `'@voltui/components'`, `'./ui/button'`, etc.
- You need to generate markup, fix selectors, wire Reactive Forms, or theme the app.
- The user asks about available components, CLI commands, or MCP tools.

## What Volt UI is

- **Angular 21**, zoneless, standalone components, OnPush, signals (`input()`, `output()`, `model()`).
- **Tailwind CSS v4** with semantic tokens (`bg-primary`, `text-foreground`, `rounded-md`).
- **ng-primitives** provides accessible behavior (keyboard, focus, overlays, CVA).
- **class-variance-authority (CVA)** drives component variants.
- **Two consumption modes**:
  1. **CLI / source-ownership (recommended)**: `npx @voltui/cli add button`. Files are copied into the consumer project (default `src/app/ui`) and become editable local code.
  2. **NPM package**: `npm install @voltui/components` for shared themes/utilities.

## Naming conventions

| Context        | Selector                                       | Class name | Import path            |
| -------------- | ---------------------------------------------- | ---------- | ---------------------- |
| Library source | `volt-*` (component) / `[voltXxx]` (directive) | `VoltXxx`  | `'@voltui/components'` |
| After CLI copy | `ui-*` (component) / `[uiXxx]` (directive)     | `UiXxx`    | `'./ui/<component>'`   |

Note: `'volt'` is only a workspace-internal path alias used inside the volt-ui monorepo itself (mapped in `tsconfig`) — it is never available in a consumer project.

Always prefer the CLI prefix (`ui-*` / `UiXxx`) when generating code for a consumer project unless the user explicitly imports from the npm package.

## Adding components to a consumer project

```bash
npx @voltui/cli init              # scaffolds src/app/ui
npx @voltui/cli add button card form-field input
npx @voltui/cli add dialog ./src/app/shared/ui --dry-run
```

Runtime dependencies (installed once):

```bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
```

## Theme setup

In the app's global CSS:

```css
@import 'tailwindcss';
@import '@voltui/components/themes.css';
```

In `app.config.ts`:

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

Color presets: `volt`, `ember`, `sage`, `dusk`, `glacier`.
Style presets: `sharp`, `soft`, `brutal`, `ghost`, `retro`.

## Component catalog

### Stable components

| Component    | Import (CLI)        | Selector                                                                                                                                        | Type             | Key inputs                             |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------- |
| Button       | `./ui/button`       | `<ui-button>`                                                                                                                                   | Component        | `variant`, `size`, `disabled`, `type`  |
| Badge        | `./ui/badge`        | `<ui-badge>`                                                                                                                                    | Component        | `variant`                              |
| Card         | `./ui/card`         | `<ui-card>` + header/content/footer                                                                                                             | Component        | —                                      |
| Checkbox     | `./ui/checkbox`     | `<ui-checkbox>`                                                                                                                                 | Component (CVA)  | `checked`, `disabled`, `indeterminate` |
| Form Field   | `./ui/form-field`   | `<ui-form-field>`, `<ui-form-field-label>`, `<ui-form-field-hint>`, `<ui-form-field-error>`                                                     | Components       | —                                      |
| Input        | `./ui/input`        | `<ui-input>`                                                                                                                                    | Component (CVA)  | `type`, `placeholder`, `disabled`      |
| Radio        | `./ui/radio`        | `<ui-radio-group>`, `<ui-radio-item>`                                                                                                           | Components (CVA) | `value`, `disabled`                    |
| Separator    | `./ui/separator`    | `<ui-separator>`                                                                                                                                | Component        | `orientation`                          |
| Skeleton     | `./ui/skeleton`     | `<ui-skeleton>`                                                                                                                                 | Component        | `variant`, `width`, `height`           |
| Slider       | `./ui/slider`       | `<ui-slider>`                                                                                                                                   | Component (CVA)  | `value`, `min`, `max`, `step`          |
| Switch       | `./ui/switch`       | `<ui-switch>`                                                                                                                                   | Component (CVA)  | `checked`, `disabled`                  |
| Textarea     | `./ui/textarea`     | `<ui-textarea>`                                                                                                                                 | Component (CVA)  | `rows`, `placeholder`, `disabled`      |
| Toggle       | `./ui/toggle`       | `<ui-toggle>`                                                                                                                                   | Component (CVA)  | `pressed`, `disabled`                  |
| Toggle Group | `./ui/toggle-group` | `<ui-toggle-group>`, `<ui-toggle-group-item>`                                                                                                   | Components (CVA) | `value`, `type`, `orientation`         |
| Avatar       | `./ui/avatar`       | `<ui-avatar>`, `<img uiAvatarImage>`, `<ui-avatar-fallback>`                                                                                    | Mixed            | `src`, `alt`, `delayMs`                |
| Breadcrumbs  | `./ui/breadcrumbs`  | `<ui-breadcrumbs>`, `<ui-breadcrumb-list>`, `<ui-breadcrumb-item>`, `<ui-breadcrumb-link>`, `<ui-breadcrumb-page>`, `<ui-breadcrumb-separator>` | Components       | `href` on link                         |
| Meter        | `./ui/meter`        | `<ui-meter>`, `<ui-meter-label>`, `<ui-meter-value>`, `<ui-meter-track>`, `<ui-meter-indicator>`                                                | Components       | `value`, `min`, `max`                  |
| Progress     | `./ui/progress`     | `<ui-progress>`, `<ui-progress-label>`, `<ui-progress-value>`                                                                                   | Components       | `value`, `min`, `max`, `valueLabel`    |

Known upstream caveats in `ng-primitives`: meter currently exposes `aria-valuenow` as a percentage for non-0..100 ranges, and progress currently reports `aria-valuemin="0"` even when `min` is customized.

### Beta components

| Component     | Import (CLI)         | Selector                                                                                                                                         | Type             | Key inputs                                     |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------- |
| Accordion     | `./ui/accordion`     | `<ui-accordion>`, `<ui-accordion-item>`, `<ui-accordion-trigger>`, `<ui-accordion-content>`                                                      | Components       | `type`, `collapsible`                          |
| Dialog        | `./ui/dialog`        | `[uiDialog]`, `[uiDialogOverlay]`, `[uiDialogContent]`, `[uiDialogTitle]`, `[uiDialogDescription]`                                               | Directives       | `modal`, `closeOnEscape`                       |
| Drawer        | `./ui/drawer`        | `[uiDrawer]`, `[uiDrawerOverlay]`, `[uiDrawerContent]`, `[uiDrawerTitle]`, `[uiDrawerDescription]`, `<ui-drawer-close>`                          | Mixed            | `side`                                         |
| Dropdown Menu | `./ui/dropdown-menu` | `[uiDropdownMenu]`, `<ui-dropdown-menu>`, `<ui-dropdown-menu-item>`, `<ui-dropdown-menu-label>`, `<ui-dropdown-menu-separator>`                  | Mixed            | `placement`, `triggers`, `disabled`            |
| Input OTP     | `./ui/input-otp`     | `<ui-input-otp>`, `<ui-input-otp-slot>`                                                                                                          | Components       | `value`, `length`, `pattern`                   |
| Pagination    | `./ui/pagination`    | `<ui-pagination>`, `<ui-pagination-button>`, `<ui-pagination-first>`, `<ui-pagination-previous>`, `<ui-pagination-next>`, `<ui-pagination-last>` | Components       | `page`, `pageCount`                            |
| Popover       | `./ui/popover`       | `[uiPopover]`, `<ui-popover-content>`                                                                                                            | Mixed            | `placement`, `offset`, `disabled`              |
| Search        | `./ui/search`        | `<ui-search>`, `<ui-search-clear>`                                                                                                               | Components       | —                                              |
| Select        | `./ui/select`        | `<ui-select>`, `<ui-native-select>`, `<ui-select-content>`, `<ui-select-item>`, `<ui-select-label>`, `<ui-select-separator>`                     | Components (CVA) | `value`, `placeholder`, `disabled`             |
| Table         | `./ui/table`         | `<ui-table>` + header/body/row/head/cell/caption/footer                                                                                          | Components       | —                                              |
| Tabs          | `./ui/tabs`          | `<ui-tabs>`, `<ui-tabs-list>`, `<ui-tabs-trigger>`, `<ui-tabs-content>`                                                                          | Components       | `value` (model), `orientation`                 |
| Toast         | `./ui/toast`         | `<ui-toast>`, `<ui-toast-title>`, `<ui-toast-description>`, `<ui-toast-close>`                                                                   | Components       | `variant`                                      |
| Toolbar       | `./ui/toolbar`       | `<ui-toolbar>`, `<button uiToolbarButton>`                                                                                                       | Components       | `orientation`                                  |
| Tooltip       | `./ui/tooltip`       | `[uiTooltip]`, `<ui-tooltip-content>`                                                                                                            | Mixed            | `placement`, `delay`, `closeDelay`, `disabled` |

### Additional beta components

| Component       | Import (CLI)           | Selector                                                                             | Type             | Key inputs                             |
| --------------- | ---------------------- | ------------------------------------------------------------------------------------ | ---------------- | -------------------------------------- |
| Autofill        | `./ui/autofill`        | `[uiAutofill]` directive                                                             | Directive        | `autofillChange` output                |
| Combobox        | `./ui/combobox`        | `<ui-combobox>` + input/button/dropdown/option                                       | Components       | `value`, `items`, `multiple`           |
| Date Picker     | `./ui/date-picker`     | `<ui-date-picker>`, `<ui-date-range-picker>` + label/grid/cell/etc.                  | Components (CVA) | `date`, `min`, `max`, `firstDayOfWeek` |
| File Upload     | `./ui/file-upload`     | `<ui-file-upload>`, `<ui-file-dropzone>`                                             | Components       | `multiple`, `fileTypes`                |
| Listbox         | `./ui/listbox`         | `<ui-listbox>`, `<ui-listbox-option>`, `<ui-listbox-section>`, `<ui-listbox-header>` | Components       | `value`, `mode`                        |
| Navigation Menu | `./ui/navigation-menu` | `<ui-navigation-menu>` + list/item/trigger/content/link                              | Components/Mixed | —                                      |
| Resizable       | `./ui/resizable`       | `<ui-resizable>`, `<ui-resizable-panel>`, `<ui-resizable-handle>`                    | Components       | `orientation`                          |
| Sidebar         | `./ui/sidebar`         | Layout component group                                                               | Components       | `collapsed`                            |
| Theme           | `./ui/theme`           | `provideVoltTheme`, `applyVoltTheme`                                                 | Utilities        | `color`, `style`, `dark`               |

## Component / directive selector rules

- Element selectors are used for presentational containers: `<ui-card>`, `<ui-button>`, `<ui-input>`.
- Attribute directives are used when the primitive is applied to an existing host element:
  - Dialog trigger: `<button [uiDialog]="tpl">`
  - Drawer trigger: `<button [uiDrawer]="tpl">`
  - Popover trigger: `<button uiPopover [uiPopover]="tpl">`
  - Tooltip trigger: `<button uiTooltip [uiTooltip]="tpl">`
  - Dropdown trigger: `<button [uiDropdownMenu]="tpl">`
  - Avatar image: `<img uiAvatarImage>`
  - Navigation link: `<a uiNavigationMenuLink>`
- Overlays (dialog, drawer, popover, tooltip, dropdown-menu) are declared inside an `<ng-template>` and referenced by the trigger.

## Reactive Forms

Most CVA components expose `formControl` directly:

```ts
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UiInput, UiCheckbox, UiSwitch, UiRadioGroup, UiRadioItem } from './ui';

email = new FormControl('', { nonNullable: true });
accepted = new FormControl(false, { nonNullable: true });
```

```html
<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input [formControl]="email" type="email" />
  <ui-form-field-hint>We'll only use this for account updates.</ui-form-field-hint>
</ui-form-field>

<ui-checkbox [formControl]="accepted">Accept terms</ui-checkbox>
```

## Common patterns

### Button with icon slots

```html
<ui-button>
  <lmn-mail slot="leading" [size]="16" />
  Login with Email
</ui-button>
```

### Card

```html
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
```

### Dialog

```html
<button [uiDialog]="dialogTpl">Open</button>
<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Confirm</h2>
    <p uiDialogDescription>Are you sure?</p>
    <ui-button (click)="close()">Confirm</ui-button>
  </div>
</ng-template>
```

### Tabs

```html
<ui-tabs [(value)]="activeTab">
  <ui-tabs-list>
    <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
    <ui-tabs-trigger value="password">Password</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="account">Account settings.</ui-tabs-content>
  <ui-tabs-content value="password">Password settings.</ui-tabs-content>
</ui-tabs>
```

## AI tools integration

- **MCP server**: `https://volt-ui.pages.dev/api/mcp` is a spec-compliant Streamable HTTP MCP server. It exposes tools, resources, and prompts:
  - Tools: `list_components`, `get_component`, `get_usage_example`, `get_theme_info`, `get_project_info`, `generate_cli_command`.
  - Resources: `component://<name>`, `theme://info`, `project://info`.
  - Prompts: `generate-volt-ui-component`, `volt-ui-troubleshooting`.
- **Local setup**: `npx volt-ui-mcp claude` writes the project-level MCP config to `.mcp.json` (Claude Code's `http` transport) and installs this skill at `.claude/skills/volt-ui/SKILL.md` in the consumer project. Other targets (`cursor`, `windsurf`, `copilot`, `vscode`) write their own MCP/rules/snippet files.
- **Local skill**: this file is not auto-discovered on its own — it must be installed into a location the agent scans (`.claude/skills/volt-ui/SKILL.md` for Claude Code, `.agents/skills/volt-ui/SKILL.md` for OpenCode) via `npx volt-ui-mcp` or by copying it manually.
- **CLI**: `npx @voltui/cli list` shows available components; `npx @voltui/cli add <name>` copies source.

## Rules for generating Volt UI code

1. Prefer standalone components with signal inputs; avoid NgModules.
2. Use OnPush change detection in new components that extend Volt UI.
3. Import copied components from `'./ui/<component>'` (or the local barrel), not from `'@voltui/components'`, unless the consumer explicitly uses the npm package workflow.
4. Use semantic Tailwind utilities (`bg-primary`, `text-foreground`, `rounded-md`) instead of hard-coded `var()` utilities.
5. Boolean inputs must use `booleanAttribute`; number inputs should use `numberAttribute` when appropriate.
6. For overlays, always use the attribute-directive trigger + `<ng-template>` pattern.
7. Do not invent inputs. If unsure, check the source file under `projects/volt/src/lib/components/<name>/` or call the MCP `get_component` tool.
