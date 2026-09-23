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
- **Two first-class consumption modes** — pick per project, both are supported for the whole 1.x line:
  1. **Package mode**: `npm install @voltui/components`, import `VoltXxx` from `'@voltui/components'`. Centralized updates, shared behavior, one version across apps.
  2. **Copy-and-own mode**: `npx @voltui/cli add button` copies source into the project (default `src/app/ui`) as editable `UiXxx` code with no long-term coupling.
- Volt provides **atoms** (Button, Input, Card, Badge, Tabs, FormField, Alert…). The app keeps its own layouts, icons, motion, state and domain components.

## Naming conventions

| Context        | Selector                                       | Class name | Import path            |
| -------------- | ---------------------------------------------- | ---------- | ---------------------- |
| Library source | `volt-*` (component) / `[voltXxx]` (directive) | `VoltXxx`  | `'@voltui/components'` |
| After CLI copy | `ui-*` (component) / `[uiXxx]` (directive)     | `UiXxx`    | `'./ui/<component>'`   |

Note: `'volt'` is only a workspace-internal path alias used inside the volt-ui monorepo itself (mapped in `tsconfig`) — it is never available in a consumer project.

Match the project's mode: if it imports from `'@voltui/components'`, generate `volt-*` / `VoltXxx`; if it has copied source under `./ui`, generate `ui-*` / `UiXxx`. The examples below use the copy-and-own names.

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

| Component    | Import (CLI)        | Selector                                                                                                                                        | Type                  | Key inputs                                                                                        |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| Button       | `./ui/button`       | `<button uiButton>`, `<a uiButton>` (directive, preferred); `<ui-button>` (wrapper)                                                             | Directive + Component | `variant`, `size`, `disabled`, `class`; wrapper also `type`, `aria-*`                             |
| Badge        | `./ui/badge`        | `<ui-badge>`                                                                                                                                    | Component             | `variant` (`solid`, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`), `class` |
| Card         | `./ui/card`         | `<ui-card>` + header/title/description/content/footer                                                                                           | Component             | `class` on every part                                                                             |
| Checkbox     | `./ui/checkbox`     | `<ui-checkbox>`                                                                                                                                 | Component (CVA)       | `checked`, `disabled`, `indeterminate`                                                            |
| Form Field   | `./ui/form-field`   | `<ui-form-field>`, `<ui-label>`, `<ui-hint>`, `<ui-error>`                                                                                      | Components            | `htmlFor` on label outside a field; `class`                                                       |
| Input        | `./ui/input`        | `<ui-input>`                                                                                                                                    | Component (CVA)       | `type`, `placeholder`, `disabled`, `size`, `state`, `class`, `aria-label`                         |
| Radio        | `./ui/radio`        | `<ui-radio-group>`, `<ui-radio-item>`                                                                                                           | Components (CVA)      | `value`, `disabled`                                                                               |
| Separator    | `./ui/separator`    | `<ui-separator>`                                                                                                                                | Component             | `orientation`                                                                                     |
| Skeleton     | `./ui/skeleton`     | `<ui-skeleton>`                                                                                                                                 | Component             | `variant`, `width`, `height`                                                                      |
| Slider       | `./ui/slider`       | `<ui-slider>`                                                                                                                                   | Component (CVA)       | `value`, `min`, `max`, `step`                                                                     |
| Range Slider | `./ui/range-slider` | `<ui-range-slider>`                                                                                                                             | Component (CVA)       | `low`, `high`, `min`, `max`, `step`                                                               |
| Switch       | `./ui/switch`       | `<ui-switch>`                                                                                                                                   | Component (CVA)       | `checked`, `disabled`                                                                             |
| Textarea     | `./ui/textarea`     | `<ui-textarea>`                                                                                                                                 | Component (CVA)       | `rows`, `variant`, `size`, `state`, `class`                                                       |
| Toggle       | `./ui/toggle`       | `<ui-toggle>`                                                                                                                                   | Component (CVA)       | `pressed`, `disabled`                                                                             |
| Toggle Group | `./ui/toggle-group` | `<ui-toggle-group>`, `<ui-toggle-group-item>`                                                                                                   | Components (CVA)      | `value`, `type`, `orientation`                                                                    |
| Avatar       | `./ui/avatar`       | `<ui-avatar>`, `<img uiAvatarImage>`, `<ui-avatar-fallback>`                                                                                    | Mixed                 | `src`, `alt`, `delayMs`                                                                           |
| Breadcrumbs  | `./ui/breadcrumbs`  | `<ui-breadcrumbs>`, `<ui-breadcrumb-list>`, `<ui-breadcrumb-item>`, `<ui-breadcrumb-link>`, `<ui-breadcrumb-page>`, `<ui-breadcrumb-separator>` | Components            | `href` on link                                                                                    |
| Meter        | `./ui/meter`        | `<ui-meter>`, `<ui-meter-label>`, `<ui-meter-value>`, `<ui-meter-track>`, `<ui-meter-indicator>`                                                | Components            | `value`, `min`, `max`                                                                             |
| Progress     | `./ui/progress`     | `<ui-progress>`, `<ui-progress-label>`, `<ui-progress-value>`                                                                                   | Components            | `value`, `min`, `max`, `valueLabel`                                                               |

Known upstream caveats in `ng-primitives`: meter currently exposes `aria-valuenow` as a percentage for non-0..100 ranges, and progress currently reports `aria-valuemin="0"` even when `min` is customized.

### Beta components

| Component     | Import (CLI)         | Selector                                                                                                                                           | Type                 | Key inputs                                                            |
| ------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------- |
| Alert         | `./ui/alert`         | `<ui-alert>`, `<ui-alert-title>`, `<ui-alert-description>`; `[slot=icon]`, `[slot=action]`                                                         | Components           | `variant`, `role` (`status` / `alert`, opt-in)                        |
| Accordion     | `./ui/accordion`     | `<ui-accordion>`, `<ui-accordion-item>`, `<ui-accordion-trigger>`, `<ui-accordion-content>`                                                        | Components           | `type`, `collapsible`                                                 |
| Dialog        | `./ui/dialog`        | `[uiDialog]`, `ng-template[uiDialogRoot]`, `[uiDialogOverlay]`, `[uiDialogContent]`, `[uiDialogTitle]`, `[uiDialogDescription]`; `UiDialogService` | Directives + service | `closeOnEscape`; root: `[(open)]`, `role`, `closeOnClick`, `(closed)` |
| Drawer        | `./ui/drawer`        | `[uiDrawer]`, `[uiDrawerOverlay]`, `[uiDrawerContent]`, `[uiDrawerTitle]`, `[uiDrawerDescription]`, `<ui-drawer-close>`                            | Mixed                | `side`                                                                |
| Dropdown Menu | `./ui/dropdown-menu` | `[uiDropdownMenu]`, `<ui-dropdown-menu>`, `<ui-dropdown-menu-item>`, `<ui-dropdown-menu-label>`, `<ui-dropdown-menu-separator>`                    | Mixed                | `placement`, `triggers`, `disabled`                                   |
| Input OTP     | `./ui/input-otp`     | `<ui-input-otp>`, `<ui-input-otp-slot>`                                                                                                            | Components           | `value`, `length`, `pattern`                                          |
| Pagination    | `./ui/pagination`    | `<ui-pagination>`, `<ui-pagination-button>`, `<ui-pagination-first>`, `<ui-pagination-previous>`, `<ui-pagination-next>`, `<ui-pagination-last>`   | Components           | `page`, `pageCount`                                                   |
| Popover       | `./ui/popover`       | `[uiPopover]`, `<ui-popover-content>`                                                                                                              | Mixed                | `placement`, `offset`, `disabled`                                     |
| Spinner       | `./ui/spinner`       | `<ui-spinner>`                                                                                                                                     | Component            | `size`, `label` (makes it `role="status"`)                            |
| Search        | `./ui/search`        | `<ui-search>`, `<ui-search-clear>`                                                                                                                 | Components           | —                                                                     |
| Select        | `./ui/select`        | `<ui-select>`, `<ui-native-select>`, `<ui-select-content>`, `<ui-select-item>`, `<ui-select-label>`, `<ui-select-separator>`                       | Components (CVA)     | `value`, `placeholder`, `disabled`                                    |
| Table         | `./ui/table`         | `<ui-table>` + header/body/row/head/cell/caption/footer                                                                                            | Components           | —                                                                     |
| Tabs          | `./ui/tabs`          | `<ui-tabs>`, `<ui-tabs-list>`, `<ui-tabs-trigger>`, `<ui-tabs-content>`                                                                            | Components           | `value` (model), `orientation`                                        |
| Toast         | `./ui/toast`         | `UiToastService` (`show`, `success`, `error`, `warning`, `info`, `dismissAll`); `<ui-toast>` + title/description/close for custom content          | Service + Components | `title`, `description`, `variant`, `duration`, `placement`            |
| Toolbar       | `./ui/toolbar`       | `<ui-toolbar>`, `<button uiToolbarButton>`                                                                                                         | Components           | `orientation`                                                         |
| Tooltip       | `./ui/tooltip`       | `[uiTooltip]`, `<ui-tooltip-content>`                                                                                                              | Mixed                | `placement`, `delay`, `closeDelay`, `disabled`                        |

### Additional components

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

- Element selectors are used for presentational containers: `<ui-card>`, `<ui-input>`, `<ui-alert>`.
- Buttons and links: put `uiButton` on the native element — `<button uiButton>`, `<a uiButton routerLink>`, `<a uiButton href>`. Never nest `<ui-button>` inside `<a>`.
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
  <ui-label>Email</ui-label>
  <ui-input [formControl]="email" type="email" />
  <ui-hint>We'll only use this for account updates.</ui-hint>
  @if (email.touched && email.invalid) {
  <ui-error>Enter a valid email.</ui-error>
  }
</ui-form-field>

<ui-checkbox [formControl]="accepted">Accept terms</ui-checkbox>
```

## Common patterns

### Buttons and links

```html
<button uiButton type="submit">Save</button>
<a uiButton variant="outline" routerLink="/docs">Documentation</a>
<a uiButton variant="ghost" href="https://github.com/…" target="_blank" rel="noopener">GitHub</a>

<!-- Icon-only: the name goes on the element that is focused -->
<button uiButton variant="ghost" size="icon" aria-label="Switch theme">
  <svg aria-hidden="true">…</svg>
</button>

<!-- Loading -->
<button uiButton [disabled]="saving()">@if (saving()) { <ui-spinner size="sm" /> } Save</button>
```

`<ui-button>` is still supported and forwards `aria-label`, `aria-labelledby`, `aria-describedby`,
`aria-expanded`, `aria-pressed`, `aria-controls` and `aria-haspopup` to its inner `<button>` (bind
them as `[aria-expanded]`, not `[attr.aria-expanded]`). `customClass` is deprecated — use `class`.
`<a uiButton>` has no disabled state: HTML links cannot be disabled.

### Styling contract

`class` on any Volt component is merged with `cn()` (tailwind-merge) over the defaults and applied to
the element that owns the styles, so conflicting utilities replace the default:

```html
<ui-card-content class="p-3 md:p-4">…</ui-card-content>
<!-- replaces p-6 pt-0 -->
<ui-input size="sm" class="w-24 font-mono" />
<!-- styles the native <input> -->
<select uiNativeSelect class="h-8 text-xs">
  …
</select>
```

Wrappers around one native control (`ui-input`, `ui-textarea`, `ui-select`, `ui-label`, `ui-hint`,
`ui-error`) move a static `class`, `id` and `aria-label` from the host to that control.

### Feedback

```ts
private readonly toast = inject(UiToastService);

save() {
  this.toast.success('Changes saved', { description: 'Your workspace has been updated.' });
}
```

```html
<ui-badge variant="success">Connected</ui-badge>
<ui-badge variant="warning">Needs attention</ui-badge>

<ui-alert variant="warning">
  <svg slot="icon" aria-hidden="true">…</svg>
  <ui-alert-title>Connection needs attention</ui-alert-title>
  <ui-alert-description>Reconnect your Cloudflare account.</ui-alert-description>
</ui-alert>

<ui-spinner label="Loading projects" />
```

Alerts have no live-region role by default; add `role="status"` (polite) or `role="alert"`
(assertive) only when the alert appears in response to something. A spinner without `label` is
decorative (`aria-hidden`).

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
    <button uiButton (click)="close()">Confirm</button>
  </div>
</ng-template>
```

State-controlled (no trigger element) — for CRUD forms driven by application state:

```html
<ng-template uiDialogRoot [(open)]="editing" (closed)="onClosed($event)" let-close="close">
  <div uiDialogOverlay></div>
  <form uiDialogContent (submit)="$event.preventDefault(); close('saved')">
    <h2 uiDialogTitle>Edit profile</h2>
    …
  </form>
</ng-template>
```

Imperative confirm:

```ts
const confirmed = await inject(UiDialogService).open<boolean>(this.confirmTpl(), {
  role: 'alertdialog',
}).closed;
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
3. Import from the project's mode: `'./ui/<component>'` for copied source, `'@voltui/components'` for package mode. Never `'volt'`.
4. Use semantic Tailwind utilities (`bg-primary`, `text-foreground`, `rounded-md`) instead of hard-coded `var()` utilities.
5. Boolean inputs must use `booleanAttribute`; number inputs should use `numberAttribute` when appropriate.
6. For overlays, always use the attribute-directive trigger + `<ng-template>` pattern.
7. Do not invent inputs. If unsure, check the source file under `projects/volt/src/lib/components/<name>/` or call the MCP `get_component` tool.
8. Never nest interactive elements: links styled as buttons are `<a uiButton>`.
9. Customize with `class` (merged by `cn()`); do not re-implement Card, Alert or form chrome with raw Tailwind.
10. `ToggleGroup` keeps `value: string[]` even with `type="single"` in 1.x.
