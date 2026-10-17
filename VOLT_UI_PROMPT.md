# Volt UI — AI Prompt Reference

Use this prompt when you want an AI assistant to write, review, or refactor Angular code that uses **Volt UI**, an Angular component library inspired by shadcn/ui and built on top of [ng-primitives](https://ng-primitives.dev).

---

## Context

You are working in an Angular application that consumes **Volt UI** components.

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

Generated from the library source and `COMPONENT_STATUS.md` (`pnpm generate:agent-skills`); the names
are the copy-and-own ones the CLI produces. In package mode write `volt-*` / `[voltXxx]` / `VoltXxx`
instead and import from `@voltui/components`.

<!-- volt:catalog:start -->

| Component       | Status | Import (copy mode)     | Selectors                                                                                                                                                                                                                  |
| --------------- | ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button          | stable | `./ui/button`          | `<a uiButton>`, `<button uiButton>`, `<ui-button>`                                                                                                                                                                         |
| Badge           | stable | `./ui/badge`           | `<ui-badge>`                                                                                                                                                                                                               |
| Input           | stable | `./ui/input`           | `<ui-input>`                                                                                                                                                                                                               |
| Search          | stable | `./ui/search`          | `<ui-search-clear>`, `<ui-search>`                                                                                                                                                                                         |
| Autofill        | stable | `./ui/autofill`        | `[uiAutofill]`                                                                                                                                                                                                             |
| Textarea        | stable | `./ui/textarea`        | `<ui-textarea>`                                                                                                                                                                                                            |
| Card            | stable | `./ui/card`            | `<ui-card-content>`, `<ui-card-description>`, `<ui-card-footer>`, `<ui-card-header>`, `<ui-card-title>`, `<ui-card>`                                                                                                       |
| Checkbox        | stable | `./ui/checkbox`        | `<ui-checkbox>`                                                                                                                                                                                                            |
| Radio           | stable | `./ui/radio`           | `<ui-radio-group>`, `<ui-radio-item>`                                                                                                                                                                                      |
| Switch          | stable | `./ui/switch`          | `<ui-switch>`                                                                                                                                                                                                              |
| Toggle          | stable | `./ui/toggle`          | `<ui-toggle>`                                                                                                                                                                                                              |
| Form Field      | stable | `./ui/form-field`      | `<ui-error>`, `<ui-form-field>`, `<ui-hint>`, `<ui-label>`                                                                                                                                                                 |
| Tooltip         | stable | `./ui/tooltip`         | `<ui-tooltip-arrow>`, `<ui-tooltip-content>`, `[uiTooltip]`                                                                                                                                                                |
| Avatar          | stable | `./ui/avatar`          | `<img uiAvatarImage>`, `<ui-avatar-fallback>`, `<ui-avatar>`                                                                                                                                                               |
| Separator       | stable | `./ui/separator`       | `<ui-separator>`                                                                                                                                                                                                           |
| Accordion       | stable | `./ui/accordion`       | `<ui-accordion-content>`, `<ui-accordion-item>`, `<ui-accordion-trigger>`, `<ui-accordion>`                                                                                                                                |
| Tabs            | stable | `./ui/tabs`            | `<ui-tabs-content>`, `<ui-tabs-list>`, `<ui-tabs-trigger>`, `<ui-tabs>`                                                                                                                                                    |
| Select          | stable | `./ui/select`          | `<select uiNativeSelect>`, `<ui-select-content>`, `<ui-select-item>`, `<ui-select-label>`, `<ui-select-separator>`, `<ui-select>`                                                                                          |
| Navigation Menu | stable | `./ui/navigation-menu` | `<a uiNavigationMenuLink>`, `<ui-navigation-menu-content-item>`, `<ui-navigation-menu-content>`, `<ui-navigation-menu-item>`, `<ui-navigation-menu-list>`, `<ui-navigation-menu-trigger>`, `<ui-navigation-menu>`          |
| Dialog          | stable | `./ui/dialog`          | `<ng-template uiDialogRoot>`, `[uiDialogContent]`, `[uiDialogDescription]`, `[uiDialogOverlay]`, `[uiDialogTitle]`, `[uiDialog]`                                                                                           |
| Drawer          | stable | `./ui/drawer`          | `<ui-drawer-close>`, `[uiDrawerContent]`, `[uiDrawerDescription]`, `[uiDrawerOverlay]`, `[uiDrawerTitle]`, `[uiDrawer]`                                                                                                    |
| Popover         | stable | `./ui/popover`         | `<ui-popover-arrow>`, `<ui-popover-content>`, `[uiPopover]`                                                                                                                                                                |
| Dropdown Menu   | stable | `./ui/dropdown-menu`   | `<ui-dropdown-menu-item>`, `<ui-dropdown-menu-label>`, `<ui-dropdown-menu-separator>`, `<ui-dropdown-menu-submenu-trigger>`, `<ui-dropdown-menu>`, `[uiDropdownMenu]`                                                      |
| Progress        | stable | `./ui/progress`        | `<ui-progress-label>`, `<ui-progress-value>`, `<ui-progress>`                                                                                                                                                              |
| Slider          | stable | `./ui/slider`          | `<ui-slider>`                                                                                                                                                                                                              |
| Range Slider    | stable | `./ui/range-slider`    | `<ui-range-slider>`                                                                                                                                                                                                        |
| Breadcrumbs     | stable | `./ui/breadcrumbs`     | `<a uiBreadcrumbLink>`, `<ui-breadcrumb-ellipsis>`, `<ui-breadcrumb-item>`, `<ui-breadcrumb-link>`, `<ui-breadcrumb-list>`, `<ui-breadcrumb-page>`, `<ui-breadcrumb-separator>`, `<ui-breadcrumbs>`                        |
| Toggle Group    | stable | `./ui/toggle-group`    | `<ui-toggle-group-item>`, `<ui-toggle-group>`                                                                                                                                                                              |
| Meter           | stable | `./ui/meter`           | `<ui-meter-indicator>`, `<ui-meter-label>`, `<ui-meter-track>`, `<ui-meter-value>`, `<ui-meter>`                                                                                                                           |
| Pagination      | stable | `./ui/pagination`      | `<ui-pagination-button>`, `<ui-pagination-first>`, `<ui-pagination-last>`, `<ui-pagination-next>`, `<ui-pagination-previous>`, `<ui-pagination>`                                                                           |
| Toast           | stable | `./ui/toast`           | `<ui-toast-close>`, `<ui-toast-description>`, `<ui-toast-message>`, `<ui-toast-title>`, `<ui-toast>`                                                                                                                       |
| Input OTP       | stable | `./ui/input-otp`       | `<ui-input-otp-slot>`, `<ui-input-otp>`                                                                                                                                                                                    |
| File Upload     | stable | `./ui/file-upload`     | `<ui-file-dropzone>`, `[uiFileUpload]`                                                                                                                                                                                     |
| Combobox        | stable | `./ui/combobox`        | `<input uiComboboxInput>`, `<ui-combobox-button>`, `<ui-combobox-dropdown>`, `<ui-combobox-option>`, `<ui-combobox>`                                                                                                       |
| Date Picker     | stable | `./ui/date-picker`     | `<ui-date-picker-cell>`, `<ui-date-picker-date-button>`, `<ui-date-picker-grid>`, `<ui-date-picker-label>`, `<ui-date-picker-next-month>`, `<ui-date-picker-previous-month>`, `<ui-date-picker>`, `<ui-date-range-picker>` |
| Listbox         | stable | `./ui/listbox`         | `<ui-listbox-header>`, `<ui-listbox-option>`, `<ui-listbox-section>`, `<ui-listbox>`, `[uiListboxTrigger]`                                                                                                                 |
| Toolbar         | stable | `./ui/toolbar`         | `<ui-toolbar>`, `[uiToolbarButton]`                                                                                                                                                                                        |
| Skeleton        | stable | `./ui/skeleton`        | `<ui-skeleton>`                                                                                                                                                                                                            |
| Table           | stable | `./ui/table`           | `<ui-table-body>`, `<ui-table-caption>`, `<ui-table-cell>`, `<ui-table-footer>`, `<ui-table-head>`, `<ui-table-header>`, `<ui-table-row>`, `<ui-table>`                                                                    |
| Resizable       | stable | `./ui/resizable`       | `<ui-resizable-handle>`, `<ui-resizable-panel>`, `<ui-resizable>`                                                                                                                                                          |
| Alert           | stable | `./ui/alert`           | `<ui-alert-description>`, `<ui-alert-title>`, `<ui-alert>`                                                                                                                                                                 |
| Spinner         | beta   | `./ui/spinner`         | `<ui-spinner>`                                                                                                                                                                                                             |
| Empty State     | beta   | `./ui/empty-state`     | `<ui-empty-state-description>`, `<ui-empty-state-title>`, `<ui-empty-state>`                                                                                                                                               |
| Sidebar         | stable | `./ui/sidebar`         | `<ui-sidebar-content>`, `<ui-sidebar-footer>`, `<ui-sidebar-group>`, `<ui-sidebar-header>`, `<ui-sidebar-item>`, `<ui-sidebar>`                                                                                            |

<!-- volt:catalog:end -->

Services and helpers (not elements): `UiToastService`, `UiDialogService`, `provideVoltTheme`,
`applyVoltTheme`.

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

While a request is pending, pin the dialog and put focus on the safe action:

```html
<ng-template
  uiDialogRoot
  role="alertdialog"
  [(open)]="deleting"
  [dismissible]="!pending()"
  initialFocus="[data-cancel]"
  let-close="close"
  >…</ng-template
>
```

`[dismissible]` is live (Escape and overlay click do nothing while `false`); `close()` always works.
`closeOnEscape`/`closeOnClick` are only read when the dialog opens.

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

### Search and navigation

Local list → the default. Server/API search → `filterMode="manual"` plus `(queryChange)`. Never pass
server results to the default local filter: it hides rows whose label does not contain the typed text.

```html
<!-- A list you already have: Ui narrows it by label as the user types. -->
<ui-combobox [(value)]="framework" [items]="frameworks" />

<!-- A server decides what matches: items are rendered exactly as supplied. -->
<ui-combobox
  label="Owner"
  filterMode="manual"
  [items]="results()"
  [loading]="loading()"
  loadingText="Searching…"
  [emptyText]="'No matches for ' + query()"
  [itemLabel]="label"
  [compareWith]="sameId"
  [(value)]="owner"
  (queryChange)="search($event)"
/>
```

`(queryChange)` is the text the user typed — not the value, and not the label written back after a
selection, so it is safe to start a request from. The application owns the request: debounce it, make
the latest response win, show errors. The combobox never fetches. `loading` shows a row and is
announced once through the combobox's own live region; do not add a second `role="status"`.

Angular Router breadcrumbs: put the directive on your own anchor so `routerLink` owns navigation.

```html
<a uiBreadcrumbLink routerLink="/admin" [queryParams]="{ tab: 'users' }">Admin</a>
<ui-breadcrumb-link href="/docs">Docs</ui-breadcrumb-link>
<!-- plain URL only -->
```

Prefer native HTML where the browser already has the right primitive: `<select uiNativeSelect>` (an
attribute on a real `<select>`; there is no `<ui-native-select>` element), `<details>`/`<summary>`,
`<input type="file">`. Use Ui when it adds reusable styling or behaviour you would otherwise copy.

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

Volt UI exposes a **spec-compliant MCP server** over Streamable HTTP at `https://voltui.dev/api/mcp`.

- **Setup helper**: `npx @voltui/agent <agent>` writes the MCP config, skill and rules for `claude`, `cursor`, `windsurf`, `copilot`, `codex`, `gemini`, `opencode` or `vscode` (snippets). It is safe to re-run, and `--uninstall` removes only what it wrote.
- **Check the setup**: `npx @voltui/agent doctor` reports outdated or missing files and tests that the MCP endpoint answers.
- **CLI**: `npx @voltui/cli`
- **Skill**: installed by `npx @voltui/agent claude` (to `.claude/skills/volt-ui/`) or `codex` / `opencode` (to `.agents/skills/volt-ui/`), auto-discovered by those agents
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

## Blocks, Layouts and Recipes are copied, not imported

They live on the docs site (`/docs/blocks`, `/docs/layouts`, `/docs/recipes/*`), not in
`@voltui/components`. Copy the source into the app and import Volt from `@voltui/components`. Never
write `import { … } from '@voltui/components'` for an `AppDashboard`, `SettingsLayout` or
`SettingsFormRecipe`. Recipes (settings form, async search, data table) show behaviour — validation,
pending, failure, retry — using ordinary Angular signals around the atoms.

Blocked-but-focusable actions use `aria-disabled="true"` (+ `aria-describedby` for the reason) on
`uiButton`; Volt only dims it, so guard the handler yourself (`if (blocked()) return;`). Use `disabled`
when the control should leave the tab order.
