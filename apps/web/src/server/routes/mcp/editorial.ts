/**
 * What the MCP server says about each component that cannot be read from the source: a one-line
 * description and short template examples. Everything technical — selectors, exports, inputs,
 * outputs, variants, npm packages — comes from mcp/api.generated.ts; what a component is for comes
 * from mcp/responsibilities.generated.ts. Do not add API facts here.
 *
 * Written in the package names (`volt-*`, `volt*`, `Volt*`); the server renames them for a
 * CLI-copy project. Every example is compiled under strict templates by scripts/check-examples.mjs,
 * in both modes, inside a documented host: templates in a standalone component that imports every
 * Volt directive plus the Angular forms, router and common modules, with untyped members for the
 * bindings it uses; code in a component class (`member`) or one of its methods (`statement`).
 */
export interface McpCodeExample {
  /**
   * Where it goes in a consumer's component: `member` is class-body code (fields and methods),
   * `statement` runs inside a method of a component that has those members.
   */
  placement: 'member' | 'statement';
  source: string;
}

export interface McpEditorial {
  description: string;
  /** Template fragments. */
  examples: string[];
  /** TypeScript that goes with the component (services, providers). */
  code?: McpCodeExample[];
}

export const EDITORIAL: Record<string, McpEditorial> = {
  button: {
    description:
      'Button styles for native elements (`button[voltButton]`, `a[voltButton]`) and the `<volt-button>` wrapper. Use `a[voltButton]` for links — never nest a button in a link.',
    examples: [
      '<button voltButton type="submit">Save</button>',
      '<a voltButton variant="outline" routerLink="/docs">Documentation</a>',
      '<button voltButton size="icon" aria-label="Switch theme"><svg aria-hidden="true">…</svg></button>',
      '<volt-button variant="destructive" [disabled]="isLoading()">Delete</volt-button>',
    ],
  },
  badge: {
    description: 'Badge component for labels and counts',
    examples: [
      '<volt-badge>New</volt-badge>',
      '<volt-badge variant="success">Connected</volt-badge>',
      '<volt-badge variant="warning">Needs attention</volt-badge>',
    ],
  },
  card: {
    description: 'Card container with header, content, and footer',
    examples: [
      '<volt-card-content class="p-3 md:p-4">Every part merges class with cn()</volt-card-content>',
      `<volt-card>
  <volt-card-header>
    <volt-card-title>Title</volt-card-title>
    <volt-card-description>Description</volt-card-description>
  </volt-card-header>
  <volt-card-content>Content</volt-card-content>
  <volt-card-footer>Footer</volt-card-footer>
</volt-card>`,
    ],
  },
  input: {
    description: 'Text input field',
    examples: [
      '<volt-input placeholder="Enter email" aria-label="Email" />',
      '<volt-input size="sm" class="w-24 font-mono" aria-label="Quantity" />',
      '<volt-input type="password" [disabled]="isDisabled()" />',
    ],
  },
  search: {
    description: 'Search field wrapper with a clear action',
    examples: [
      `<volt-search>
  <volt-input type="search" placeholder="Search..." />
  <volt-search-clear>Clear</volt-search-clear>
</volt-search>`,
    ],
  },
  autofill: {
    description: 'Directive for detecting browser autofill state on form controls',
    examples: [
      '<input voltAutofill autocomplete="email" (autofillChange)="autofilled.set($event)" />',
    ],
  },
  textarea: {
    description: 'Multi-line text input',
    examples: ['<volt-textarea placeholder="Enter message" [rows]="5" class="font-mono" />'],
  },
  checkbox: {
    description: 'Checkbox input with indeterminate state',
    examples: [
      '<volt-checkbox [(checked)]="isChecked">Accept terms</volt-checkbox>',
      '<volt-checkbox [indeterminate]="isIndeterminate">Select all</volt-checkbox>',
    ],
  },
  radio: {
    description: 'Radio group and radio items',
    examples: [
      `<volt-radio-group [(value)]="selectedValue">
  <volt-radio-item value="option1">Option 1</volt-radio-item>
  <volt-radio-item value="option2">Option 2</volt-radio-item>
</volt-radio-group>`,
    ],
  },
  switch: {
    description: 'Toggle switch component',
    examples: ['<volt-switch [(checked)]="isEnabled">Enable notifications</volt-switch>'],
  },
  toggle: {
    description: 'Toggle button (pressed state)',
    examples: ['<volt-toggle [(pressed)]="isBold">Bold</volt-toggle>'],
  },
  select: {
    description:
      'Dropdown select with options. For a real <select> use the `select[voltNativeSelect]` attribute directive (NOT a <volt-native-select> element) — the browser already has the right primitive.',
    examples: [
      `<volt-select placeholder="Select option">
  <volt-select-label>Choose one</volt-select-label>
  <volt-select-content>
    <volt-select-item value="1">Option 1</volt-select-item>
    <volt-select-item value="2">Option 2</volt-select-item>
  </volt-select-content>
</volt-select>`,
      `<select voltNativeSelect aria-label="Status" [formControl]="status">
  <option value="all">All</option>
  <option value="open">Open</option>
</select>`,
    ],
  },
  tabs: {
    description: 'Tabbed interface',
    examples: [
      `<volt-tabs [(value)]="activeTab">
  <volt-tabs-list>
    <volt-tabs-trigger value="tab1">Tab 1</volt-tabs-trigger>
    <volt-tabs-trigger value="tab2">Tab 2</volt-tabs-trigger>
  </volt-tabs-list>
  <volt-tabs-content value="tab1">Content 1</volt-tabs-content>
  <volt-tabs-content value="tab2">Content 2</volt-tabs-content>
</volt-tabs>`,
    ],
  },
  accordion: {
    description:
      'Collapsible accordion panels. Arrow keys (Up/Down, Left/Right when horizontal), Home and End move focus between headers.',
    examples: [
      `<volt-accordion type="single" [collapsible]="true">
  <volt-accordion-item value="item1">
    <volt-accordion-trigger>Question</volt-accordion-trigger>
    <volt-accordion-content>Answer</volt-accordion-content>
  </volt-accordion-item>
</volt-accordion>`,
    ],
  },
  avatar: {
    description: 'User avatar with image and fallback',
    examples: [
      `<volt-avatar>
  <img voltAvatarImage [src]="user.avatar" [alt]="user.name" />
  <volt-avatar-fallback>{{ user.initials }}</volt-avatar-fallback>
</volt-avatar>`,
    ],
  },
  separator: {
    description: 'Visual divider line',
    examples: ['<volt-separator />', '<volt-separator orientation="vertical" />'],
  },
  tooltip: {
    description:
      'Floating tooltip on hover and keyboard focus, also on components that render their own button (volt-toggle, volt-switch). `context` reaches the template as a signal: read it as `label()`, not `label`.',
    examples: [
      `<button voltTooltip [voltTooltip]="tooltipTpl">Hover me</button>
<ng-template #tooltipTpl>
  <volt-tooltip-content>More info</volt-tooltip-content>
</ng-template>`,
      `<button voltButton [voltTooltip]="tip" [context]="item.name">Edit</button>
<ng-template #tip let-name>
  <volt-tooltip-content>Edit {{ name() }}</volt-tooltip-content>
</ng-template>`,
    ],
  },
  'navigation-menu': {
    description: 'Navigation menu with dropdowns',
    examples: [
      '<a voltNavigationMenuLink [active]="section() === \'about\'" current="location" href="#about">About</a>',
      `<volt-navigation-menu>
  <volt-navigation-menu-list>
    <volt-navigation-menu-item>
      <volt-navigation-menu-trigger [content]="productsPanel">Products</volt-navigation-menu-trigger>
      <ng-template #productsPanel>
        <volt-navigation-menu-content>...</volt-navigation-menu-content>
      </ng-template>
    </volt-navigation-menu-item>
  </volt-navigation-menu-list>
</volt-navigation-menu>`,
    ],
  },
  'form-field': {
    description: 'Form field wrapper with label, hint, and error',
    examples: [
      `<volt-form-field>
  <volt-label>Email</volt-label>
  <volt-input type="email" />
  <volt-hint>We'll never share your email</volt-hint>
  <volt-error>Invalid email</volt-error>
</volt-form-field>`,
      '<volt-label htmlFor="team">Team</volt-label> <volt-input id="team" />',
    ],
  },
  dialog: {
    description: 'Modal dialog with overlay, title, description and content',
    examples: [
      '<ng-template voltDialogRoot role="alertdialog" [(open)]="deleting" [dismissible]="!pending()" initialFocus="[data-cancel]" let-close="close">…</ng-template>',
      `<ng-template voltDialogRoot [(open)]="editing" (closed)="onClosed($event)" let-close="close">
  <div voltDialogOverlay></div>
  <div voltDialogContent>
    <h2 voltDialogTitle>Edit profile</h2>
    <button voltButton (click)="close('saved')">Save</button>
  </div>
</ng-template>`,
      `<button [voltDialog]="dialogTpl">Open Dialog</button>
<ng-template #dialogTpl let-close="close">
  <div voltDialogOverlay></div>
  <div voltDialogContent>
    <h2 voltDialogTitle>Confirm</h2>
    <p voltDialogDescription>Are you sure?</p>
    <volt-button (click)="close()">Confirm</volt-button>
  </div>
</ng-template>`,
    ],
    code: [
      {
        placement: 'member',
        source: `private readonly dialog = inject(VoltDialogService);
readonly confirmTpl = viewChild.required<TemplateRef<VoltDialogContext<boolean>>>('confirmTpl');
async confirmDelete() {
  const confirmed = await this.dialog.open<boolean>(this.confirmTpl(), { role: 'alertdialog' }).closed;
  if (confirmed) { /* delete */ }
}`,
      },
    ],
  },
  popover: {
    description: 'Floating popover anchored to a trigger element',
    examples: [
      `<button voltButton variant="outline" type="button" [voltPopover]="popoverTpl">Open</button>
<ng-template #popoverTpl>
  <volt-popover-content>Popover content</volt-popover-content>
</ng-template>`,
    ],
  },
  'dropdown-menu': {
    description: 'Dropdown menu with items, labels and separators',
    examples: [
      `<button [voltDropdownMenu]="menuTpl">Menu</button>
<ng-template #menuTpl>
  <volt-dropdown-menu>
    <volt-dropdown-menu-label>Account</volt-dropdown-menu-label>
    <volt-dropdown-menu-item>Profile</volt-dropdown-menu-item>
    <volt-dropdown-menu-separator />
    <volt-dropdown-menu-item>Logout</volt-dropdown-menu-item>
  </volt-dropdown-menu>
</ng-template>`,
    ],
  },
  slider: {
    description: 'Range slider input with track and thumb',
    examples: ['<volt-slider [min]="0" [max]="100" [(value)]="volume" />'],
  },
  'range-slider': {
    description: 'Dual-thumb range slider for selecting a [low, high] value pair',
    examples: ['<volt-range-slider [min]="0" [max]="500" [(low)]="min" [(high)]="max" />'],
  },
  progress: {
    description: 'Progress bar with track and indicator',
    examples: [
      `<volt-progress [value]="60" [max]="100">
  <volt-progress-label>Loading</volt-progress-label>
  <volt-progress-value>60%</volt-progress-value>
</volt-progress>`,
    ],
  },
  breadcrumbs: {
    description:
      'Navigation breadcrumbs with items, links, ellipsis and separators. <volt-breadcrumb-link href> is for plain URLs; put `a[voltBreadcrumbLink]` on your own anchor when RouterLink (or any anchor directive) must own navigation.',
    examples: [
      `<volt-breadcrumbs>
  <volt-breadcrumb-item><volt-breadcrumb-link href="/">Home</volt-breadcrumb-link></volt-breadcrumb-item>
  <volt-breadcrumb-separator />
  <volt-breadcrumb-item><volt-breadcrumb-page>Current</volt-breadcrumb-page></volt-breadcrumb-item>
</volt-breadcrumbs>`,
      `<!-- Angular Router: the anchor is yours, so routerLink / queryParams / fragment / routerLinkActive just work -->
<volt-breadcrumb-item>
  <a voltBreadcrumbLink routerLink="/admin" [queryParams]="{ tab: 'users' }" routerLinkActive ariaCurrentWhenActive="page">Admin</a>
</volt-breadcrumb-item>`,
    ],
  },
  sidebar: {
    description: 'Application sidebar layout with header, content, groups, items and footer',
    examples: [
      `<volt-sidebar>
  <volt-sidebar-header>Logo</volt-sidebar-header>
  <volt-sidebar-content>
    <volt-sidebar-group label="Main">
      <volt-sidebar-item routerLink="/dashboard" label="Dashboard" />
    </volt-sidebar-group>
  </volt-sidebar-content>
  <volt-sidebar-footer>User</volt-sidebar-footer>
</volt-sidebar>`,
    ],
  },
  'toggle-group': {
    description: 'Group of toggle buttons with single or multiple selection',
    examples: [
      `<volt-toggle-group type="single" [(value)]="selected">
  <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
  <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
</volt-toggle-group>`,
      `<volt-toggle-group-item value="p1" aria-label="Photo 1" buttonClass="h-auto p-0 overflow-hidden">
  <img src="p1.jpg" alt="" />
</volt-toggle-group-item>`,
    ],
  },
  meter: {
    description: 'Meter component for displaying a value within a known range',
    examples: [
      `<volt-meter [value]="75" [max]="100">
  <volt-meter-label>Storage</volt-meter-label>
  <volt-meter-value>75%</volt-meter-value>
  <volt-meter-track><volt-meter-indicator /></volt-meter-track>
</volt-meter>`,
    ],
  },
  pagination: {
    description: 'Pagination controls with first, previous, next, last and page buttons',
    examples: [
      `<volt-pagination [pageCount]="10" [(page)]="currentPage">
  <volt-pagination-first />
  <volt-pagination-previous />
  <volt-pagination-button *ngFor="let p of pages" [page]="p" />
  <volt-pagination-next />
  <volt-pagination-last />
</volt-pagination>`,
    ],
  },
  toast: {
    description:
      'Toast notifications. Show them with VoltToastService (show/success/error/warning/info/dismissAll); provideVoltToast() sets defaults.',
    examples: [],
    code: [
      {
        placement: 'member',
        source: `private readonly toast = inject(VoltToastService);
save() { this.toast.success('Changes saved', { description: 'Your workspace has been updated.' }); }`,
      },
      { placement: 'statement', source: "this.toast.error('Could not save');" },
    ],
  },
  'input-otp': {
    description: 'One-time code / PIN input with slots',
    examples: ['<volt-input-otp [(value)]="otp" [length]="6" />'],
  },
  'file-upload': {
    description: 'File upload trigger and dropzone',
    examples: [
      '<button voltButton voltFileUpload multiple (selected)="onFiles($event)">Upload</button>',
      '<volt-file-dropzone (selected)="onDrop($event)">Drop files here</volt-file-dropzone>',
    ],
  },
  combobox: {
    description:
      'Autocomplete / searchable select with dropdown and options. Default `filterMode="local"` narrows `items` by label as the user types. For server/API search use `filterMode="manual"` + `(queryChange)`: items are rendered exactly as supplied and the application owns the request (never combine server results with the local filter).',
    examples: [
      `<volt-combobox [(value)]="selected" [items]="items">
  <ng-template let-item>{{ item.label }}</ng-template>
</volt-combobox>`,
      `<!-- Server-side search: (queryChange) is the typed text only; fetch, debounce and latest-wins are yours -->
<volt-combobox
  label="Owner"
  filterMode="manual"
  [items]="results()"
  [loading]="loading()"
  [emptyText]="'No matches for ' + query()"
  [itemLabel]="label"
  [compareWith]="sameId"
  [(value)]="owner"
  (queryChange)="search($event)"
/>`,
    ],
  },
  'date-picker': {
    description: 'Calendar date picker and date range picker primitives',
    examples: [
      `<volt-date-picker [(date)]="selectedDate" [(focusedDate)]="focusedDate">
  <div class="flex items-center justify-between">
    <volt-date-picker-previous-month aria-label="Previous month">Prev</volt-date-picker-previous-month>
    <volt-date-picker-label>{{ monthLabel() }}</volt-date-picker-label>
    <volt-date-picker-next-month aria-label="Next month">Next</volt-date-picker-next-month>
  </div>
  <volt-date-picker-grid>
    <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
      <volt-date-picker-cell *ngpDatePickerCellRender="let day">
        <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
      </volt-date-picker-cell>
    </div>
  </volt-date-picker-grid>
</volt-date-picker>`,
      '<volt-date-range-picker [(startDate)]="start" [(endDate)]="end">...</volt-date-range-picker>',
    ],
  },
  listbox: {
    description: 'Accessible single or multiple selection listbox',
    examples: [
      `<volt-listbox [(value)]="selected">
  <volt-listbox-option value="angular">Angular</volt-listbox-option>
  <volt-listbox-option value="react">React</volt-listbox-option>
</volt-listbox>`,
    ],
  },
  toolbar: {
    description: 'Accessible toolbar container for grouped controls with roving focus',
    examples: [
      `<volt-toolbar>
  <button voltToolbarButton>Bold</button>
  <button voltToolbarButton>Italic</button>
  <button voltToolbarButton>Save</button>
</volt-toolbar>`,
    ],
  },
  drawer: {
    description: 'Slide-in panel built on top of the dialog primitive',
    examples: [
      `<button [voltDrawer]="drawerTpl">Open Drawer</button>
<ng-template #drawerTpl let-close="close">
  <div voltDrawerOverlay></div>
  <div voltDrawerContent side="right">
    <h2 voltDrawerTitle>Menu</h2>
    <nav voltDrawerDescription>...</nav>
    <volt-drawer-close><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" /></svg></volt-drawer-close>
  </div>
</ng-template>`,
    ],
  },
  skeleton: {
    description: 'Loading placeholder with shape variants',
    examples: [
      '<volt-skeleton variant="circle" width="40px" height="40px" />',
      '<volt-skeleton variant="text" width="120px" height="16px" />',
    ],
  },
  table: {
    description: 'Semantic data table with sub-components for header, body, rows and cells',
    examples: [
      `<volt-table>
  <volt-table-caption>Invoices</volt-table-caption>
  <volt-table-header>
    <volt-table-row>
      <volt-table-head>Invoice</volt-table-head>
      <volt-table-head>Status</volt-table-head>
    </volt-table-row>
  </volt-table-header>
  <volt-table-body>
    <volt-table-row>
      <volt-table-cell>INV001</volt-table-cell>
      <volt-table-cell>Paid</volt-table-cell>
    </volt-table-row>
  </volt-table-body>
</volt-table>`,
    ],
  },
  resizable: {
    description: 'Resizable panel group with drag handles',
    examples: [
      `<volt-resizable orientation="horizontal">
  <volt-resizable-panel>Left</volt-resizable-panel>
  <volt-resizable-handle />
  <volt-resizable-panel>Right</volt-resizable-panel>
</volt-resizable>`,
    ],
  },
  theme: {
    description: 'Document-level theme provider and toggle utilities',
    examples: [],
    code: [
      {
        placement: 'statement',
        source: `// In bootstrapApplication(App, { providers: [...] }):
const providers = [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })];`,
      },
      {
        placement: 'statement',
        source: "applyVoltTheme({ color: 'ember', style: 'soft', dark: true });",
      },
      {
        placement: 'statement',
        source: 'persistVoltTheme({ dark: true }); // stores the choice and applies it',
      },
      {
        placement: 'statement',
        source: `// No flash of the wrong theme with SSR: inline the script's output at the top of <head>
// (index.html or your server template), and store choices with persistVoltTheme.
const script = voltThemeInitScript({ defaults: { color: 'volt' } });`,
      },
    ],
  },
  alert: {
    description:
      'Inline feedback panel with optional icon and action. No live-region role by default; set role="status" or role="alert" when it appears after an action.',
    examples: [
      `<volt-alert variant="warning">
  <svg slot="icon" aria-hidden="true">…</svg>
  <volt-alert-title>Connection needs attention</volt-alert-title>
  <volt-alert-description>Reconnect your Cloudflare account.</volt-alert-description>
  <button slot="action" voltButton variant="outline" size="sm">Reconnect</button>
</volt-alert>`,
    ],
  },
  'empty-state': {
    description:
      'Centred panel for an empty collection or a search with no results: optional icon, title, description and actions. Plain content (no live-region role) and not an error state — pair with Alert for failures.',
    examples: [
      `<volt-empty-state>
  <svg slot="icon" aria-hidden="true">…</svg>
  <volt-empty-state-title>No projects yet</volt-empty-state-title>
  <volt-empty-state-description>Create your first project to get started.</volt-empty-state-description>
  <div slot="actions"><button voltButton>Create project</button></div>
</volt-empty-state>`,
    ],
  },
  spinner: {
    description:
      'Indeterminate loading indicator in the current text colour. Decorative by default; with a label it becomes role="status".',
    examples: [
      '<button voltButton disabled><volt-spinner size="sm" /> Saving…</button>',
      '<volt-spinner size="lg" label="Loading projects" />',
    ],
  },
};
