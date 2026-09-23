# Volt UI — AI Prompt Reference

Use this prompt when you want an AI assistant to write, review, or refactor Angular code that uses **Volt UI**, an Angular component library inspired by shadcn/ui and built on top of [ng-primitives](https://ng-primitives.dev).

---

## Context

You are working in an Angular 21 application that consumes **Volt UI** components.

- Components are **standalone**, use **OnPush**, and rely on **signals** (`input()`, `output()`, `model()`, `computed()`).
- Styling is **Tailwind CSS v4** with semantic tokens such as `bg-primary`, `text-foreground`, `rounded-md`, `shadow-sm`.
- Variant logic uses **class-variance-authority (CVA)**.
- Accessibility and interaction behavior come from **ng-primitives**.
- Volt provides UI **atoms** (buttons, inputs, cards, badges, alerts…). The application keeps its own layouts, icons, motion, state and domain components.
- Two first-class ways to consume it: the **package** (`@voltui/components`, `VoltXxx`, `volt-*`) or **copy-and-own** via the CLI (`npx @voltui/cli`, `UiXxx`, `ui-*`). Match whatever the project already does.

---

## How to add Volt UI to a project

### 1. Copy-and-own workflow (CLI)

```bash
npx @voltui/cli init                    # creates src/app/ui
npx @voltui/cli add button card input
npx @voltui/cli add dialog ./src/app/shared/ui --dry-run
```

After copying, import from the local UI folder:

```ts
import { UiButton } from './ui/button';
import { UiCard, UiCardContent, UiCardHeader } from './ui/card';
```

### 2. Package workflow (npm)

Centralized updates and one shared version across apps. Import components directly:

```ts
import { VoltCard, VoltNativeButton, VoltToastService } from '@voltui/components';
```

```bash
npm install @voltui/components
```

```css
@import 'tailwindcss';
@import '@voltui/components/themes.css';
```

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

Runtime dependencies required by copied components:

```bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
```

---

## Naming conventions

| Context        | Selector               | Class name | Import path                       |
| -------------- | ---------------------- | ---------- | --------------------------------- |
| Library source | `volt-*` / `[voltXxx]` | `VoltXxx`  | `'volt'` / `'@voltui/components'` |
| After CLI copy | `ui-*` / `[uiXxx]`     | `UiXxx`    | `'./ui/<component>'`              |

When generating code for a consumer project, always use the **CLI prefix** (`ui-*` / `UiXxx`).

---

## Theme system

Color presets: `volt`, `ember`, `sage`, `dusk`, `glacier`.
Style presets: `sharp`, `soft`, `brutal`, `ghost`, `retro`.

```ts
provideVoltTheme({ color: 'ember', style: 'soft', dark: false });
applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });
```

Components use semantic Tailwind utilities; do not write `bg-[var(--primary)]`.

---

## Component catalog

### Stable components

| Component    | Import              | Selectors                                                                                                                                       | Notes                                                                                                                    |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Button       | `./ui/button`       | `<button uiButton>`, `<a uiButton>` (preferred), `<ui-button>`                                                                                  | Variants: `solid`, `outline`, `ghost`, `link`, `destructive`. Sizes: `sm`, `md`, `lg`, `icon`. Links use `<a uiButton>`. |
| Badge        | `./ui/badge`        | `<ui-badge>`                                                                                                                                    | Variants: `solid`, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`.                                  |
| Card         | `./ui/card`         | `<ui-card>`, `<ui-card-header>`, `<ui-card-title>`, `<ui-card-description>`, `<ui-card-content>`, `<ui-card-footer>`                            | Presentational container.                                                                                                |
| Checkbox     | `./ui/checkbox`     | `<ui-checkbox>`                                                                                                                                 | CVA. Inputs: `checked`, `disabled`, `indeterminate`.                                                                     |
| Form Field   | `./ui/form-field`   | `<ui-form-field>`, `<ui-label>`, `<ui-hint>`, `<ui-error>`                                                                                      | Wires label and hint ids to the control. Outside a field use `<ui-label htmlFor>`.                                       |
| Input        | `./ui/input`        | `<ui-input>`                                                                                                                                    | CVA. Inputs: `type`, `placeholder`, `disabled`, `size`, `state`, `class` (styles the native input).                      |
| Radio        | `./ui/radio`        | `<ui-radio-group>`, `<ui-radio-item>`                                                                                                           | CVA. Use `value` on group.                                                                                               |
| Separator    | `./ui/separator`    | `<ui-separator>`                                                                                                                                | `orientation` input.                                                                                                     |
| Skeleton     | `./ui/skeleton`     | `<ui-skeleton>`                                                                                                                                 | `variant`, `width`, `height`.                                                                                            |
| Slider       | `./ui/slider`       | `<ui-slider>`                                                                                                                                   | CVA. `value`, `min`, `max`, `step`.                                                                                      |
| Range Slider | `./ui/range-slider` | `<ui-range-slider>`                                                                                                                             | CVA, dual-thumb. `low`, `high`, `min`, `max`, `step`.                                                                    |
| Switch       | `./ui/switch`       | `<ui-switch>`                                                                                                                                   | CVA. `checked`, `disabled`.                                                                                              |
| Textarea     | `./ui/textarea`     | `<ui-textarea>`                                                                                                                                 | CVA. `rows`, `placeholder`, `disabled`.                                                                                  |
| Toggle       | `./ui/toggle`       | `<ui-toggle>`                                                                                                                                   | CVA. `pressed`, `disabled`.                                                                                              |
| Toggle Group | `./ui/toggle-group` | `<ui-toggle-group>`, `<ui-toggle-group-item>`                                                                                                   | CVA. `value`, `type`, `orientation`.                                                                                     |
| Avatar       | `./ui/avatar`       | `<ui-avatar>`, `<img uiAvatarImage>`, `<ui-avatar-fallback>`                                                                                    | Image is an attribute directive on `<img>`.                                                                              |
| Breadcrumbs  | `./ui/breadcrumbs`  | `<ui-breadcrumbs>`, `<ui-breadcrumb-list>`, `<ui-breadcrumb-item>`, `<ui-breadcrumb-link>`, `<ui-breadcrumb-page>`, `<ui-breadcrumb-separator>` | Note singular `breadcrumb` in sub-selectors.                                                                             |
| Meter        | `./ui/meter`        | `<ui-meter>`, `<ui-meter-label>`, `<ui-meter-value>`, `<ui-meter-track>`, `<ui-meter-indicator>`                                                | `value`, `min`, `max`.                                                                                                   |
| Progress     | `./ui/progress`     | `<ui-progress>`, `<ui-progress-label>`, `<ui-progress-value>`                                                                                   | `value`, `min`, `max`, `valueLabel`.                                                                                     |

Known upstream caveats in `ng-primitives`: meter currently exposes `aria-valuenow` as a percentage for non-0..100 ranges, and progress currently reports `aria-valuemin="0"` even when `min` is customized.

### Beta components

| Component     | Import               | Selectors                                                                                                                                               | Notes                                                                                             |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Alert         | `./ui/alert`         | `<ui-alert>`, `<ui-alert-title>`, `<ui-alert-description>`; `[slot=icon]`, `[slot=action]`                                                              | `variant`: `default`, `info`, `success`, `warning`, `destructive`. `role` is opt-in.              |
| Accordion     | `./ui/accordion`     | `<ui-accordion>`, `<ui-accordion-item>`, `<ui-accordion-trigger>`, `<ui-accordion-content>`                                                             | `type` (`single`/`multiple`), `collapsible`.                                                      |
| Dialog        | `./ui/dialog`        | `[uiDialog]`, `ng-template[uiDialogRoot]`, `[uiDialogOverlay]`, `[uiDialogContent]`, `[uiDialogTitle]`, `[uiDialogDescription]`; `UiDialogService`      | Trigger, `[(open)]`-controlled, or `UiDialogService.open()`. Content lives in an `<ng-template>`. |
| Drawer        | `./ui/drawer`        | `[uiDrawer]`, `[uiDrawerOverlay]`, `[uiDrawerContent]`, `[uiDrawerTitle]`, `[uiDrawerDescription]`, `<ui-drawer-close>`                                 | `side`: `left`, `right`, `top`, `bottom`.                                                         |
| Dropdown Menu | `./ui/dropdown-menu` | `[uiDropdownMenu]`, `<ui-dropdown-menu>`, `<ui-dropdown-menu-item>`, `<ui-dropdown-menu-label>`, `<ui-dropdown-menu-separator>`                         | Trigger references the menu template.                                                             |
| Input OTP     | `./ui/input-otp`     | `<ui-input-otp>`, `<ui-input-otp-slot>`                                                                                                                 | `value`, `length`, `pattern`.                                                                     |
| Pagination    | `./ui/pagination`    | `<ui-pagination>`, `<ui-pagination-button>`, `<ui-pagination-first>`, `<ui-pagination-previous>`, `<ui-pagination-next>`, `<ui-pagination-last>`        | `page`, `pageCount`.                                                                              |
| Popover       | `./ui/popover`       | `[uiPopover]`, `<ui-popover-content>`                                                                                                                   | Trigger references content template.                                                              |
| Spinner       | `./ui/spinner`       | `<ui-spinner>`                                                                                                                                          | `size`; `label` makes it an announced `role="status"`.                                            |
| Search        | `./ui/search`        | `<ui-search>`, `<ui-search-clear>`                                                                                                                      | Wrapper around an input.                                                                          |
| Select        | `./ui/select`        | `<ui-select>`, `<ui-native-select>`, `<ui-select-content>`, `<ui-select-item>`, `<ui-select-label>`, `<ui-select-separator>`                            | CVA. `value`, `placeholder`, `disabled`.                                                          |
| Table         | `./ui/table`         | `<ui-table>`, `<ui-table-header>`, `<ui-table-body>`, `<ui-table-footer>`, `<ui-table-row>`, `<ui-table-head>`, `<ui-table-cell>`, `<ui-table-caption>` | Semantic table.                                                                                   |
| Tabs          | `./ui/tabs`          | `<ui-tabs>`, `<ui-tabs-list>`, `<ui-tabs-trigger>`, `<ui-tabs-content>`                                                                                 | Use `value` model, not `defaultValue`.                                                            |
| Toast         | `./ui/toast`         | `UiToastService`; `<ui-toast>`, `<ui-toast-title>`, `<ui-toast-description>`, `<ui-toast-close>` for custom content                                     | `inject(UiToastService).success('Saved')`.                                                        |
| Toolbar       | `./ui/toolbar`       | `<ui-toolbar>`, `<button uiToolbarButton>`                                                                                                              | `orientation`.                                                                                    |
| Tooltip       | `./ui/tooltip`       | `[uiTooltip]`, `<ui-tooltip-content>`                                                                                                                   | Trigger references content template.                                                              |

### Additional components

| Component       | Import                 | Selectors                                                                                                        | Notes                                          |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Autofill        | `./ui/autofill`        | `[uiAutofill]`                                                                                                   | Directive on an input. Emits `autofillChange`. |
| Combobox        | `./ui/combobox`        | `<ui-combobox>`, `<ui-combobox-input>`, `<ui-combobox-button>`, `<ui-combobox-dropdown>`, `<ui-combobox-option>` | `value`, `items`, `multiple`.                  |
| Date Picker     | `./ui/date-picker`     | `<ui-date-picker>`, `<ui-date-range-picker>` + label/grid/cell/date-button/next/previous                         | CVA. `date`, `min`, `max`, `firstDayOfWeek`.   |
| File Upload     | `./ui/file-upload`     | `<ui-file-upload>`, `<ui-file-dropzone>`                                                                         | `multiple`, `fileTypes`, `directory`.          |
| Listbox         | `./ui/listbox`         | `<ui-listbox>`, `<ui-listbox-option>`, `<ui-listbox-section>`, `<ui-listbox-header>`                             | `value`, `mode`.                               |
| Navigation Menu | `./ui/navigation-menu` | `<ui-navigation-menu>` + list/item/trigger/content/link                                                          | Link is `a[uiNavigationMenuLink]`.             |
| Resizable       | `./ui/resizable`       | `<ui-resizable>`, `<ui-resizable-panel>`, `<ui-resizable-handle>`                                                | `orientation`.                                 |
| Sidebar         | `./ui/sidebar`         | Layout group                                                                                                     | `collapsed`.                                   |
| Theme           | `./ui/theme`           | `provideVoltTheme`, `applyVoltTheme`                                                                             | Theme utilities.                               |

---

## Critical rules for overlay components

Overlays (dialog, drawer, popover, tooltip, dropdown-menu) are **template-based**. The trigger is an attribute directive that points to an `<ng-template>` containing the overlay content.

### Dialog

```html
<button [uiDialog]="dialogTpl">Open Dialog</button>

<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Confirm</h2>
    <p uiDialogDescription>Are you sure?</p>
    <button uiButton (click)="close()">Confirm</button>
  </div>
</ng-template>
```

Controlled by application state (no trigger element):

```html
<ng-template uiDialogRoot [(open)]="editing" (closed)="onClosed($event)" let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Edit profile</h2>
    <button uiButton (click)="close('saved')">Save</button>
  </div>
</ng-template>
```

Imperative confirm:

```ts
const ok = await inject(UiDialogService).open<boolean>(confirmTpl, { role: 'alertdialog' }).closed;
```

### Drawer

```html
<button [uiDrawer]="drawerTpl">Open Drawer</button>

<ng-template #drawerTpl let-close="close">
  <div uiDrawerOverlay></div>
  <div uiDrawerContent side="right">
    <h2 uiDrawerTitle>Menu</h2>
    <nav uiDrawerDescription>...</nav>
    <ui-drawer-close (click)="close()"><lmn-x [size]="16" /></ui-drawer-close>
  </div>
</ng-template>
```

### Popover

```html
<button uiPopover [uiPopover]="popoverTpl">Open</button>

<ng-template #popoverTpl>
  <ui-popover-content>
    <p>Popover content</p>
  </ui-popover-content>
</ng-template>
```

### Tooltip

```html
<button uiTooltip [uiTooltip]="tooltipTpl">Hover me</button>

<ng-template #tooltipTpl>
  <ui-tooltip-content>
    <p>Tooltip text</p>
  </ui-tooltip-content>
</ng-template>
```

### Dropdown Menu

```html
<button [uiDropdownMenu]="menuTpl">Menu</button>

<ng-template #menuTpl>
  <ui-dropdown-menu>
    <ui-dropdown-menu-label>Account</ui-dropdown-menu-label>
    <ui-dropdown-menu-separator />
    <ui-dropdown-menu-item>Profile</ui-dropdown-menu-item>
    <ui-dropdown-menu-item>Logout</ui-dropdown-menu-item>
  </ui-dropdown-menu>
</ng-template>
```

---

## Reactive Forms examples

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UiInput, UiCheckbox, UiSwitch, UiRadioGroup, UiRadioItem } from './ui';

@Component({
  imports: [ReactiveFormsModule, UiInput, UiCheckbox, UiSwitch, UiRadioGroup, UiRadioItem],
  template: `
    <ui-input [formControl]="email" type="email" placeholder="you@example.com" />
    <ui-checkbox [formControl]="accepted">Accept terms</ui-checkbox>
    <ui-switch [formControl]="enabled">Airplane mode</ui-switch>
    <ui-radio-group [formControl]="plan">
      <ui-radio-item value="basic">Basic</ui-radio-item>
      <ui-radio-item value="pro">Pro</ui-radio-item>
    </ui-radio-group>
  `,
})
export class ExampleComponent {
  email = new FormControl('', { nonNullable: true });
  accepted = new FormControl(false, { nonNullable: true });
  enabled = new FormControl(false, { nonNullable: true });
  plan = new FormControl('basic', { nonNullable: true });
}
```

---

## Common complete examples

### Buttons and links

```html
<button uiButton type="submit">Save</button>
<a uiButton variant="outline" routerLink="/docs">Documentation</a>
<button uiButton variant="ghost" size="icon" aria-label="Switch theme">
  <svg aria-hidden="true">…</svg>
</button>
```

Never write `<a routerLink><ui-button>…</ui-button></a>` — it nests two interactive elements.

### Feedback

```ts
private readonly toast = inject(UiToastService);
this.toast.success('Changes saved');
```

```html
<ui-badge variant="warning">Needs attention</ui-badge>
<ui-alert variant="destructive" role="alert">
  <ui-alert-title>Payment failed</ui-alert-title>
  <ui-alert-description>Update your card.</ui-alert-description>
</ui-alert>
<ui-spinner label="Loading projects" />
```

### Card

```html
<ui-card>
  <ui-card-header>
    <ui-card-title>Upgrade plan</ui-card-title>
    <ui-card-description>Choose the best plan for your team.</ui-card-description>
  </ui-card-header>
  <ui-card-content>
    <p>Plan details here.</p>
  </ui-card-content>
  <ui-card-footer>
    <ui-button variant="outline">Cancel</ui-button>
    <ui-button>Continue</ui-button>
  </ui-card-footer>
</ui-card>
```

### Form field

```html
<ui-form-field>
  <ui-label>Email</ui-label>
  <ui-input [formControl]="email" type="email" placeholder="you@example.com" />
  <ui-hint>We'll only use this for account updates.</ui-hint>
  <ui-error>Invalid email</ui-error>
</ui-form-field>
```

### Select

```html
<ui-select placeholder="Select a fruit" [formControl]="selected">
  <ui-select-content>
    <ui-select-label>Fruits</ui-select-label>
    <ui-select-item value="apple">Apple</ui-select-item>
    <ui-select-item value="banana">Banana</ui-select-item>
    <ui-select-separator />
    <ui-select-label>Vegetables</ui-select-label>
    <ui-select-item value="carrot">Carrot</ui-select-item>
  </ui-select-content>
</ui-select>
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

### Table

```html
<ui-table>
  <ui-table-caption>A list of your recent invoices.</ui-table-caption>
  <ui-table-header>
    <ui-table-row>
      <ui-table-head>Invoice</ui-table-head>
      <ui-table-head>Status</ui-table-head>
      <ui-table-head class="text-right">Amount</ui-table-head>
    </ui-table-row>
  </ui-table-header>
  <ui-table-body>
    <ui-table-row>
      <ui-table-cell class="font-medium">INV001</ui-table-cell>
      <ui-table-cell>Paid</ui-table-cell>
      <ui-table-cell class="text-right">$250.00</ui-table-cell>
    </ui-table-row>
  </ui-table-body>
</ui-table>
```

---

## AI assistant rules

1. **Match the project's mode**: `ui-*` / `UiXxx` from `./ui` for copied source, `volt-*` / `VoltXxx` from `@voltui/components` for package mode.
2. **Do not invent inputs or outputs.** If unsure, check the source files or call the Volt UI MCP `get_component` tool.
3. **Overlays are template-based.** Never write `<ui-dialog>`, `<ui-tooltip>`, `<ui-popover-trigger>`, or `<ui-dropdown-menu-trigger>` as element selectors.
4. **Prefer signals** for component state and `model()` for two-way inputs.
5. **Use semantic Tailwind tokens**; avoid `bg-[var(--foo)]`.
6. **Boolean inputs** must use `booleanAttribute`; **number inputs** should use `numberAttribute` when appropriate.
7. **Add `ReactiveFormsModule`** when wiring CVA components to `FormControl`.
8. **Never nest interactive elements**: links that look like buttons are `<a uiButton>`.
9. **Customize with `class`**: it is merged with `cn()` onto the element that owns the styles (`<ui-card-content class="p-3">`, `<ui-input class="w-24">`).
10. **Run checks** after changes: `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, `pnpm build:lib`.

---

## MCP / AI tools

Volt UI exposes a **spec-compliant MCP server** over Streamable HTTP at `https://volt-ui.pages.dev/api/mcp`.

- **Setup helper**: `npx volt-ui-mcp` (installs config for Claude, Cursor, Windsurf, Copilot, VS Code)
- **CLI**: `npx @voltui/cli`
- **Local skill**: `.agents/skills/volt-ui/SKILL.md` (auto-discovered by OpenCode / Claude Code)
- **Prompt reference**: `VOLT_UI_PROMPT.md` (this file)

Available MCP tools:

- `list_components` — list all components
- `get_component` — inputs, outputs, sub-components, examples
- `get_usage_example` — import paths and snippets
- `get_theme_info` — colors, styles, provider API
- `get_project_info` — architecture and naming conventions
- `generate_cli_command` — produce `npx @voltui/cli ...` commands

Available MCP resources:

- `component://<name>` — full metadata for a single component
- `theme://info` — theme colors, styles, and helpers
- `project://info` — project overview and naming conventions

Available MCP prompts:

- `generate-volt-ui-component` — pre-filled prompt for generating a component usage example
- `volt-ui-troubleshooting` — pre-filled prompt for diagnosing common mistakes

When unsure, call the MCP `get_component` tool or read the `component://<name>` resource before inventing APIs.

---

## Troubleshooting

- **Class not found**: the component was not copied. Run `npx @voltui/cli add <name>`.
- **Overlay does not open**: verify the trigger uses the attribute selector and references an `<ng-template>`.
- **Form value not updating**: ensure the component is a CVA component and `ReactiveFormsModule` is imported.
- **Styles missing**: import `@voltui/components/themes.css` after Tailwind.
- **Dark mode not working**: `provideVoltTheme` toggles the `.dark` class; Tailwind `dark:` variant follows it.
