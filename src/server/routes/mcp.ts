/**
 * Volt UI MCP Server — spec-compliant Streamable HTTP transport
 *
 * Built with the official MCP TypeScript SDK so AI assistants can query
 * Volt UI components, resources, and prompts over HTTP.
 *
 * Supported clients: Claude Desktop, Cursor, Windsurf, GitHub Copilot, etc.
 *
 * Endpoint: https://volt-ui.pages.dev/api/mcp
 * Setup:    npx volt-ui-mcp
 */

import {
  defineEventHandler,
  getMethod,
  getRequestHeader,
  sendWebResponse,
  setHeaders,
  toWebRequest,
} from 'h3';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Component metadata (inlined — CF Workers have no filesystem access)
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
      `<ui-card>
  <ui-card-header>
    <ui-card-title>Title</ui-card-title>
    <ui-card-description>Description</ui-card-description>
  </ui-card-header>
  <ui-card-content>Content</ui-card-content>
  <ui-card-footer>Footer</ui-card-footer>
</ui-card>`,
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
  search: {
    name: 'Search',
    description: 'Search field wrapper with a clear action',
    dependencies: ['ng-primitives/search', 'ng-primitives/input'],
    subComponents: ['search-clear'],
    examples: [
      `<ui-search>
  <ui-input type="search" placeholder="Search..." />
  <ui-search-clear>Clear</ui-search-clear>
</ui-search>`,
    ],
  },
  autofill: {
    name: 'Autofill',
    description: 'Directive for detecting browser autofill state on form controls',
    dependencies: ['ng-primitives/autofill'],
    examples: [
      `<input uiAutofill autocomplete="email" (autofillChange)="autofilled.set($event)" />`,
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
      `<ui-radio-group [(value)]="selectedValue">
  <ui-radio-item value="option1">Option 1</ui-radio-item>
  <ui-radio-item value="option2">Option 2</ui-radio-item>
</ui-radio-group>`,
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
      `<ui-select placeholder="Select option">
  <ui-select-label>Choose one</ui-select-label>
  <ui-select-content>
    <ui-select-item value="1">Option 1</ui-select-item>
    <ui-select-item value="2">Option 2</ui-select-item>
  </ui-select-content>
</ui-select>`,
    ],
  },
  tabs: {
    name: 'Tabs',
    description: 'Tabbed interface',
    dependencies: ['ng-primitives/tab'],
    subComponents: ['tabs-list', 'tabs-trigger', 'tabs-content'],
    inputs: [{ name: 'value', type: 'string' }],
    examples: [
      `<ui-tabs [(value)]="activeTab">
  <ui-tabs-list>
    <ui-tabs-trigger value="tab1">Tab 1</ui-tabs-trigger>
    <ui-tabs-trigger value="tab2">Tab 2</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="tab1">Content 1</ui-tabs-content>
  <ui-tabs-content value="tab2">Content 2</ui-tabs-content>
</ui-tabs>`,
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
      `<ui-accordion type="single" [collapsible]="true">
  <ui-accordion-item value="item1">
    <ui-accordion-trigger>Question</ui-accordion-trigger>
    <ui-accordion-content>Answer</ui-accordion-content>
  </ui-accordion-item>
</ui-accordion>`,
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
      `<ui-avatar>
  <img uiAvatarImage [src]="user.avatar" [alt]="user.name" />
  <ui-avatar-fallback>{{ user.initials }}</ui-avatar-fallback>
</ui-avatar>`,
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
      { name: 'placement', type: 'string', default: 'top' },
      { name: 'delay', type: 'number', default: 300 },
      { name: 'closeDelay', type: 'number', default: 100 },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<button uiTooltip [uiTooltip]="tooltipTpl">Hover me</button>
<ng-template #tooltipTpl>
  <ui-tooltip-content>More info</ui-tooltip-content>
</ng-template>`,
    ],
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
      `<ui-navigation-menu>
  <ui-navigation-menu-list>
    <ui-navigation-menu-item>
      <ui-navigation-menu-trigger>Item</ui-navigation-menu-trigger>
      <ui-navigation-menu-content>...</ui-navigation-menu-content>
    </ui-navigation-menu-item>
  </ui-navigation-menu-list>
</ui-navigation-menu>`,
    ],
  },
  'form-field': {
    name: 'Form Field',
    description: 'Form field wrapper with label, hint, and error',
    dependencies: ['ng-primitives/form-field'],
    subComponents: ['form-field-label', 'form-field-hint', 'form-field-error'],
    examples: [
      `<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input type="email" />
  <ui-form-field-hint>We'll never share your email</ui-form-field-hint>
  <ui-form-field-error>Invalid email</ui-form-field-error>
</ui-form-field>`,
    ],
  },
  dialog: {
    name: 'Dialog',
    description: 'Modal dialog with overlay, title, description and content',
    dependencies: ['ng-primitives/dialog'],
    subComponents: ['dialog-overlay', 'dialog-content', 'dialog-title', 'dialog-description'],
    inputs: [
      { name: 'modal', type: 'boolean', default: true },
      { name: 'closeOnEscape', type: 'boolean', default: true },
    ],
    examples: [
      `<button [uiDialog]="dialogTpl">Open Dialog</button>
<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Confirm</h2>
    <p uiDialogDescription>Are you sure?</p>
    <ui-button (click)="close()">Confirm</ui-button>
  </div>
</ng-template>`,
    ],
  },
  popover: {
    name: 'Popover',
    description: 'Floating popover anchored to a trigger element',
    dependencies: ['ng-primitives/popover'],
    subComponents: ['popover-trigger', 'popover-content'],
    inputs: [
      { name: 'placement', type: 'string', default: 'bottom' },
      { name: 'offset', type: 'number', default: 8 },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<button uiPopover [uiPopover]="popoverTpl">Open</button>
<ng-template #popoverTpl>
  <ui-popover-content>Popover content</ui-popover-content>
</ng-template>`,
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
      `<button [uiDropdownMenu]="menuTpl">Menu</button>
<ng-template #menuTpl>
  <ui-dropdown-menu>
    <ui-dropdown-menu-label>Account</ui-dropdown-menu-label>
    <ui-dropdown-menu-item>Profile</ui-dropdown-menu-item>
    <ui-dropdown-menu-separator />
    <ui-dropdown-menu-item>Logout</ui-dropdown-menu-item>
  </ui-dropdown-menu>
</ng-template>`,
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
  'range-slider': {
    name: 'Range Slider',
    description: 'Dual-thumb range slider for selecting a [low, high] value pair',
    dependencies: ['ng-primitives/slider'],
    subComponents: ['range-slider-track', 'range-slider-range', 'range-slider-thumb'],
    inputs: [
      { name: 'low', type: 'number', default: 0 },
      { name: 'high', type: 'number', default: 100 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: ['<ui-range-slider [min]="0" [max]="500" [(low)]="min" [(high)]="max" />'],
  },
  progress: {
    name: 'Progress',
    description: 'Progress bar with track and indicator',
    dependencies: ['ng-primitives/progress'],
    subComponents: ['progress-label', 'progress-value', 'progress-track', 'progress-indicator'],
    inputs: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'valueLabel', type: '(value: number, max: number) => string' },
    ],
    examples: [
      `<ui-progress [value]="60" [max]="100">
  <ui-progress-label>Loading</ui-progress-label>
  <ui-progress-value>60%</ui-progress-value>
</ui-progress>`,
    ],
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
      `<ui-breadcrumbs>
  <ui-breadcrumb-item><ui-breadcrumb-link href="/">Home</ui-breadcrumb-link></ui-breadcrumb-item>
  <ui-breadcrumb-separator />
  <ui-breadcrumb-item><ui-breadcrumb-page>Current</ui-breadcrumb-page></ui-breadcrumb-item>
</ui-breadcrumbs>`,
    ],
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
      `<ui-sidebar>
  <ui-sidebar-header>Logo</ui-sidebar-header>
  <ui-sidebar-content>
    <ui-sidebar-group label="Main">
      <ui-sidebar-item>Dashboard</ui-sidebar-item>
    </ui-sidebar-group>
  </ui-sidebar-content>
  <ui-sidebar-footer>User</ui-sidebar-footer>
</ui-sidebar>`,
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
      `<ui-toggle-group type="single" [(value)]="selected">
  <ui-toggle-group-item value="bold">Bold</ui-toggle-group-item>
  <ui-toggle-group-item value="italic">Italic</ui-toggle-group-item>
</ui-toggle-group>`,
    ],
  },
  meter: {
    name: 'Meter',
    description: 'Meter component for displaying a value within a known range',
    dependencies: ['ng-primitives/meter'],
    subComponents: ['meter-label', 'meter-value', 'meter-track', 'meter-indicator'],
    inputs: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
    ],
    examples: [
      `<ui-meter [value]="75" [max]="100">
  <ui-meter-label>Storage</ui-meter-label>
  <ui-meter-value>75%</ui-meter-value>
  <ui-meter-track><ui-meter-indicator /></ui-meter-track>
</ui-meter>`,
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
      `<ui-pagination [pageCount]="10" [(page)]="currentPage">
  <ui-pagination-first />
  <ui-pagination-previous />
  <ui-pagination-button *ngFor="let p of pages" [page]="p" />
  <ui-pagination-next />
  <ui-pagination-last />
</ui-pagination>`,
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
      `<ui-toast>
  <ui-toast-title>Success</ui-toast-title>
  <ui-toast-description>Your changes have been saved.</ui-toast-description>
</ui-toast>`,
    ],
  },
  'input-otp': {
    name: 'Input OTP',
    description: 'One-time code / PIN input with slots',
    dependencies: ['ng-primitives/input-otp'],
    subComponents: ['input-otp-slot'],
    inputs: [
      { name: 'value', type: 'string', default: '' },
      { name: 'length', type: 'number', default: 6 },
      { name: 'pattern', type: 'string', default: '[0-9]' },
      { name: 'inputMode', type: 'string', default: 'numeric' },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'placeholder', type: 'string', default: '○' },
    ],
    examples: ['<ui-input-otp [(value)]="otp" [length]="6" />'],
  },
  'file-upload': {
    name: 'File Upload',
    description: 'File upload trigger and dropzone',
    dependencies: ['ng-primitives/file-upload'],
    subComponents: ['file-dropzone'],
    inputs: [
      { name: 'fileTypes', type: 'string | string[]' },
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'directory', type: 'boolean', default: false },
      { name: 'dragDrop', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      '<button ui-file-upload (selected)="onFiles($event)">Upload</button>',
      '<ui-file-dropzone (selected)="onDrop($event)">Drop files here</ui-file-dropzone>',
    ],
  },
  combobox: {
    name: 'Combobox',
    description: 'Autocomplete / searchable select with dropdown and options',
    dependencies: ['ng-primitives/combobox'],
    subComponents: ['combobox-input', 'combobox-button', 'combobox-dropdown', 'combobox-option'],
    inputs: [
      { name: 'value', type: 'any' },
      { name: 'items', type: 'any[]', default: [] },
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'placeholder', type: 'string', default: 'Select...' },
      {
        name: 'dropdownPlacement',
        type: 'string',
        default: 'bottom',
        options: ['top', 'bottom', 'left', 'right'],
      },
    ],
    examples: [
      `<ui-combobox [(value)]="selected" [items]="items">
  <ng-template let-item>{{ item.label }}</ng-template>
</ui-combobox>`,
    ],
  },
  'date-picker': {
    name: 'Date Picker',
    description: 'Calendar date picker and date range picker primitives',
    dependencies: ['ng-primitives/date-picker', 'ng-primitives/date-time'],
    subComponents: [
      'date-range-picker',
      'date-picker-label',
      'date-picker-grid',
      'date-picker-cell',
      'date-picker-date-button',
      'date-picker-next-month',
      'date-picker-previous-month',
    ],
    inputs: [
      { name: 'date', type: 'Date | undefined' },
      { name: 'focusedDate', type: 'Date', default: 'new Date()' },
      { name: 'min', type: 'Date | undefined' },
      { name: 'max', type: 'Date | undefined' },
      { name: 'disabled', type: 'boolean', default: false },
      {
        name: 'firstDayOfWeek',
        type: 'number',
        default: 7,
        options: ['1', '2', '3', '4', '5', '6', '7'],
      },
    ],
    examples: [
      `<ui-date-picker [(date)]="selectedDate" [(focusedDate)]="focusedDate">
  <div class="flex items-center justify-between">
    <ui-date-picker-previous-month aria-label="Previous month">Prev</ui-date-picker-previous-month>
    <ui-date-picker-label>{{ monthLabel() }}</ui-date-picker-label>
    <ui-date-picker-next-month aria-label="Next month">Next</ui-date-picker-next-month>
  </div>
  <ui-date-picker-grid>
    <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
      <ui-date-picker-cell *ngpDatePickerCellRender="let day">
        <ui-date-picker-date-button>{{ day.getDate() }}</ui-date-picker-date-button>
      </ui-date-picker-cell>
    </div>
  </ui-date-picker-grid>
</ui-date-picker>`,
      `<ui-date-range-picker [(startDate)]="start" [(endDate)]="end">...</ui-date-range-picker>`,
    ],
  },
  listbox: {
    name: 'Listbox',
    description: 'Accessible single or multiple selection listbox',
    dependencies: ['ng-primitives/listbox'],
    subComponents: ['listbox-option', 'listbox-section', 'listbox-header'],
    inputs: [
      { name: 'mode', type: 'string', default: 'single', options: ['single', 'multiple'] },
      { name: 'value', type: 'unknown[]', default: [] },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    examples: [
      `<ui-listbox [(value)]="selected">
  <ui-listbox-option value="angular">Angular</ui-listbox-option>
  <ui-listbox-option value="react">React</ui-listbox-option>
</ui-listbox>`,
    ],
  },
  toolbar: {
    name: 'Toolbar',
    description: 'Accessible toolbar container for grouped controls with roving focus',
    dependencies: ['ng-primitives/toolbar', 'ng-primitives/roving-focus'],
    inputs: [
      {
        name: 'orientation',
        type: 'string',
        default: 'horizontal',
        options: ['horizontal', 'vertical'],
      },
    ],
    examples: [
      `<ui-toolbar>
  <button uiToolbarButton>Bold</button>
  <button uiToolbarButton>Italic</button>
  <button uiToolbarButton>Save</button>
</ui-toolbar>`,
    ],
  },
  drawer: {
    name: 'Drawer',
    description: 'Slide-in panel built on top of the dialog primitive',
    dependencies: ['ng-primitives/dialog'],
    subComponents: [
      'drawer-overlay',
      'drawer-content',
      'drawer-title',
      'drawer-description',
      'drawer-close',
    ],
    inputs: [
      {
        name: 'side',
        type: 'string',
        default: 'right',
        options: ['left', 'right', 'top', 'bottom'],
      },
    ],
    examples: [
      `<button [uiDrawer]="drawerTpl">Open Drawer</button>
<ng-template #drawerTpl let-close="close">
  <div uiDrawerOverlay></div>
  <div uiDrawerContent side="right">
    <h2 uiDrawerTitle>Menu</h2>
    <nav uiDrawerDescription>...</nav>
    <ui-drawer-close><lmn-x [size]="16" /></ui-drawer-close>
  </div>
</ng-template>`,
    ],
  },
  skeleton: {
    name: 'Skeleton',
    description: 'Loading placeholder with shape variants',
    dependencies: [],
    inputs: [
      {
        name: 'variant',
        type: 'string',
        default: 'text',
        options: ['text', 'circle', 'rectangle'],
      },
      { name: 'width', type: 'string' },
      { name: 'height', type: 'string' },
    ],
    examples: [
      `<ui-skeleton variant="circle" width="40px" height="40px" />`,
      `<ui-skeleton variant="text" width="120px" height="16px" />`,
    ],
  },
  table: {
    name: 'Table',
    description: 'Semantic data table with sub-components for header, body, rows and cells',
    dependencies: [],
    subComponents: [
      'table-header',
      'table-body',
      'table-footer',
      'table-row',
      'table-head',
      'table-cell',
      'table-caption',
    ],
    examples: [
      `<ui-table>
  <ui-table-caption>Invoices</ui-table-caption>
  <ui-table-header>
    <ui-table-row>
      <ui-table-head>Invoice</ui-table-head>
      <ui-table-head>Status</ui-table-head>
    </ui-table-row>
  </ui-table-header>
  <ui-table-body>
    <ui-table-row>
      <ui-table-cell>INV001</ui-table-cell>
      <ui-table-cell>Paid</ui-table-cell>
    </ui-table-row>
  </ui-table-body>
</ui-table>`,
    ],
  },
  resizable: {
    name: 'Resizable',
    description: 'Resizable panel group with drag handles',
    dependencies: [],
    subComponents: ['resizable-panel', 'resizable-handle'],
    inputs: [
      {
        name: 'orientation',
        type: 'string',
        default: 'horizontal',
        options: ['horizontal', 'vertical'],
      },
    ],
    examples: [
      `<ui-resizable orientation="horizontal">
  <ui-resizable-panel>Left</ui-resizable-panel>
  <ui-resizable-handle />
  <ui-resizable-panel>Right</ui-resizable-panel>
</ui-resizable>`,
    ],
  },
  theme: {
    name: 'Theme',
    description: 'Document-level theme provider and toggle utilities',
    dependencies: [],
    inputs: [
      {
        name: 'color',
        type: 'string',
        default: 'volt',
        options: ['volt', 'ember', 'sage', 'dusk', 'glacier'],
      },
      {
        name: 'style',
        type: 'string',
        default: 'sharp',
        options: ['sharp', 'soft', 'brutal', 'ghost', 'retro'],
      },
      { name: 'dark', type: 'boolean', default: false },
    ],
    examples: [
      `provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })`,
      `applyVoltTheme({ color: 'ember', style: 'soft', dark: true })`,
    ],
  },
};

const componentKeys = Object.keys(components);

// ---------------------------------------------------------------------------
// Shared data helpers
// ---------------------------------------------------------------------------

const overlayComponents = new Set(['dialog', 'drawer', 'popover', 'tooltip', 'dropdown-menu']);
const cvaComponents = new Set([
  'button',
  'badge',
  'checkbox',
  'input',
  'radio',
  'select',
  'switch',
  'textarea',
  'toggle',
  'slider',
  'range-slider',
  'toggle-group',
]);

function buildSystemContext(): string {
  const componentList = Object.entries(components)
    .map(([key, comp]) => `- ${key} (${comp.name})`)
    .join('\n');

  return [
    'You are an expert Angular assistant working with Volt UI.',
    '',
    '## Project context',
    '',
    '- Volt UI is an Angular 21 component library inspired by shadcn/ui and built on top of ng-primitives.',
    '- Components are standalone, use OnPush change detection, and prefer signals (`input()`, `output()`, `model()`, `computed()`).',
    '- Styling uses Tailwind CSS v4 with semantic tokens such as `bg-primary`, `text-foreground`, `rounded-md`, `shadow-sm`.',
    '- Variant logic uses class-variance-authority (CVA).',
    '- Components are typically copied into the project via the CLI (`npx @voltui/cli`) and become editable local code.',
    '',
    '## Installation',
    '',
    '### CLI / source-ownership workflow (recommended)',
    '',
    '```bash',
    'npx @voltui/cli init                    # creates src/app/ui',
    'npx @voltui/cli add button card input',
    'npx @voltui/cli add dialog ./src/app/shared/ui --dry-run',
    '```',
    '',
    'After copying, import from the local UI folder:',
    '',
    '```ts',
    "import { UiButton } from './ui/button';",
    "import { UiCard, UiCardContent, UiCardHeader } from './ui/card';",
    '```',
    '',
    '### NPM package workflow',
    '',
    '```bash',
    'npm install @voltui/components',
    '```',
    '',
    '```css',
    "@import 'tailwindcss';",
    "@import '@voltui/components/themes.css';",
    '```',
    '',
    '```ts',
    "import { provideVoltTheme } from '@voltui/components';",
    '',
    'bootstrapApplication(AppComponent, {',
    "  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],",
    '});',
    '```',
    '',
    'Runtime dependencies required by copied components:',
    '',
    '```bash',
    'npm install ng-primitives class-variance-authority clsx tailwind-merge',
    '```',
    '',
    '## Naming conventions',
    '',
    '| Context | Selector | Class name | Import path |',
    '|---------|----------|------------|-------------|',
    "| Library source | `volt-*` / `[voltXxx]` | `VoltXxx` | `'volt'` / `'@voltui/components'` |",
    "| After CLI copy | `ui-*` / `[uiXxx]` | `UiXxx` | `'./ui/<component>'` |",
    '',
    'When generating code for a consumer project, always use the CLI prefix (`ui-*` / `UiXxx`).',
    '',
    '## Theme system',
    '',
    'Color presets: `volt`, `ember`, `sage`, `dusk`, `glacier`.',
    'Style presets: `sharp`, `soft`, `brutal`, `ghost`, `retro`.',
    '',
    '```ts',
    "provideVoltTheme({ color: 'ember', style: 'soft', dark: false });",
    "applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });",
    '```',
    '',
    'Components use semantic Tailwind utilities; do not write `bg-[var(--primary)]`.',
    '',
    '## Component catalog',
    '',
    componentList,
    '',
    '## Rules for generating Volt UI code',
    '',
    '1. Prefer standalone components with signal inputs; avoid NgModules.',
    '2. Use OnPush change detection in new components that extend Volt UI.',
    "3. Import copied components from `'./ui/<component>'` (or the local barrel), not from `'volt'`.",
    '4. Use semantic Tailwind utilities (`bg-primary`, `text-foreground`, `rounded-md`) instead of hard-coded `var()` utilities.',
    '5. Boolean inputs must use `booleanAttribute`; number inputs should use `numberAttribute` when appropriate.',
    '6. For overlays, always use the attribute-directive trigger + `<ng-template>` pattern.',
    '7. Do not invent inputs. If unsure, check the source file under `projects/volt/src/lib/components/<name>/` or call the MCP `get_component` tool.',
    '8. Do not invent selectors such as `<ui-dialog>` or `<ui-tooltip>`; overlays are directives, not elements.',
    '',
    '## Overlay pattern',
    '',
    'Overlays (dialog, drawer, popover, tooltip, dropdown-menu) are attribute directives applied to a trigger element. The content lives in an `<ng-template>` that receives a `close` context.',
    '',
    '```html',
    '<button [uiDialog]="dialogTpl">Open</button>',
    '<ng-template #dialogTpl let-close="close">',
    '  <div uiDialogOverlay></div>',
    '  <div uiDialogContent>',
    '    <h2 uiDialogTitle>Title</h2>',
    '    <p uiDialogDescription>Description</p>',
    '    <ui-button (click)="close()">Confirm</ui-button>',
    '  </div>',
    '</ng-template>',
    '```',
    '',
    '## Reactive Forms',
    '',
    'CVA components (checkbox, input, radio, select, switch, textarea, slider, toggle, etc.) work with `formControlName` or `[(ngModel)]`. Make sure the consumer imports `ReactiveFormsModule`.',
    '',
    '## Troubleshooting checklist',
    '',
    '- **Class not found**: the component was not copied. Run `npx @voltui/cli add <name>`.',
    '- **Overlay does not open**: verify the trigger uses the attribute selector and references an `<ng-template>`.',
    '- **Form value not updating**: ensure the component is a CVA component and `ReactiveFormsModule` is imported.',
    '- **Styles missing**: import `@voltui/components/themes.css` after Tailwind.',
    '- **Dark mode not working**: `provideVoltTheme` toggles the `.dark` class; Tailwind `dark:` variant follows it.',
  ].join('\n');
}

const projectInfo = {
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
};

const themeInfo = {
  colors: ['volt', 'ember', 'sage', 'dusk', 'glacier'],
  styles: ['sharp', 'soft', 'brutal', 'ghost', 'retro'],
  provider: 'provideVoltTheme',
  dynamic: 'applyVoltTheme',
  import: `import { provideVoltTheme, applyVoltTheme } from '@voltui/components';`,
  usage: {
    provider: `provideVoltTheme({ color: 'ember', style: 'soft', dark: false })`,
    dynamic: `applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true })`,
  },
};

function getComponent(key: string): ComponentMeta | undefined {
  return components[key];
}

function getComponentClassName(comp: ComponentMeta): string {
  return `Ui${comp.name.replace(/\s/g, '')}`;
}

function getUsageExample(key: string) {
  const comp = getComponent(key);
  if (!comp) return undefined;
  const className = getComponentClassName(comp);
  return {
    component: key,
    imports: {
      npm: `import { ${className} } from '@voltui/components';`,
      cli: `import { ${className} } from './ui/${key}';`,
    },
    examples: comp.examples ?? [],
  };
}

// ---------------------------------------------------------------------------
// MCP server factory
// ---------------------------------------------------------------------------

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'volt-ui',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: {},
      },
      instructions:
        'Volt UI is an Angular component library inspired by shadcn/ui and built on top of ng-primitives. ' +
        'Use the tools, resources, and prompts here to generate correct selectors, import paths, and usage examples.',
    }
  );

  // Tools
  server.registerTool(
    'list_components',
    {
      description: 'List all available Volt UI components with their names and descriptions.',
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            Object.entries(components).map(([key, comp]) => ({
              name: key,
              displayName: comp.name,
              description: comp.description,
            })),
            null,
            2
          ),
        },
      ],
    })
  );

  server.registerTool(
    'get_component',
    {
      description:
        'Get detailed information about a specific Volt UI component including inputs, variants, subcomponents, and usage examples.',
      inputSchema: {
        name: z
          .string()
          .describe('Component key (e.g. "button", "card", "form-field")')
          .refine(val => componentKeys.includes(val), {
            message: `Unknown component. Valid: ${componentKeys.join(', ')}`,
          }),
      },
    },
    async ({ name }) => {
      const comp = getComponent(name);
      if (!comp) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Component "${name}" not found.` }, null, 2),
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(comp, null, 2) }],
      };
    }
  );

  server.registerTool(
    'get_usage_example',
    {
      description: 'Get Angular template usage examples and import path for a Volt UI component.',
      inputSchema: {
        component: z
          .string()
          .describe('Component key (e.g. "button", "accordion")')
          .refine(val => componentKeys.includes(val), {
            message: `Unknown component. Valid: ${componentKeys.join(', ')}`,
          }),
      },
    },
    async ({ component }) => {
      const example = getUsageExample(component);
      if (!example) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Component "${component}" not found.` }, null, 2),
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(example, null, 2) }],
      };
    }
  );

  server.registerTool(
    'get_theme_info',
    {
      description: 'Get available Volt UI themes, colors, and how to configure them.',
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(themeInfo, null, 2) }],
    })
  );

  server.registerTool(
    'get_project_info',
    {
      description:
        'Get general information about the Volt UI project: framework, architecture, naming conventions.',
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(projectInfo, null, 2) }],
    })
  );

  server.registerTool(
    'generate_cli_command',
    {
      description: 'Generate the npx command to scaffold or add a Volt UI component to a project.',
      inputSchema: {
        action: z
          .enum(['init', 'add', 'list'])
          .describe(
            '"init" to set up Volt UI, "add" to add a component, "list" to list components.'
          ),
        component: z
          .string()
          .optional()
          .describe('Component name — required when action is "add".'),
        targetDir: z.string().optional().describe('Target directory (optional).'),
      },
    },
    async ({ action, component, targetDir }) => {
      if (action === 'add' && !component) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { error: 'component is required for the "add" action' },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      const suffix = targetDir ? ` ${targetDir}` : '';
      const command =
        action === 'init'
          ? `npx @voltui/cli init${suffix}`
          : action === 'add'
            ? `npx @voltui/cli add ${component}${suffix}`
            : 'npx @voltui/cli list';

      return {
        content: [{ type: 'text', text: JSON.stringify({ command }, null, 2) }],
      };
    }
  );

  // Resources
  server.registerResource(
    'component',
    new ResourceTemplate('component://{name}', {
      list: async () => ({
        resources: Object.entries(components).map(([key, comp]) => ({
          uri: `component://${key}`,
          name: comp.name,
          mimeType: 'application/json',
          description: comp.description,
        })),
      }),
    }),
    {
      mimeType: 'application/json',
      description: 'Detailed metadata for a single Volt UI component.',
    },
    async uri => {
      const name = uri.hostname;
      const comp = getComponent(name);
      if (!comp) {
        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Component "${name}" not found.` }, null, 2),
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(comp, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    'theme',
    'theme://info',
    {
      mimeType: 'application/json',
      description: 'Volt UI theme colors, styles, and configuration helpers.',
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(themeInfo, null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'project',
    'project://info',
    {
      mimeType: 'application/json',
      description: 'General information about the Volt UI project.',
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(projectInfo, null, 2),
        },
      ],
    })
  );

  // Prompts
  server.registerPrompt(
    'generate-volt-ui-component',
    {
      description: 'Prompt for generating a Volt UI component usage example.',
      argsSchema: {
        component: z
          .string()
          .describe('Component key (e.g. "button", "form-field")')
          .refine(val => componentKeys.includes(val), {
            message: `Unknown component. Valid: ${componentKeys.join(', ')}`,
          }),
        context: z
          .string()
          .optional()
          .describe('Extra context about what the component should do.'),
      },
    },
    async ({ component, context }) => {
      const comp = getComponent(component);
      const example = getUsageExample(component);
      const isOverlay = overlayComponents.has(component);
      const isCva = cvaComponents.has(component);

      const requirements = [
        'Generate a complete, production-ready Angular example using the component above.',
        'Use standalone components and OnPush change detection.',
        "Import copied components from './ui/<component>' using the `ui-*` / `UiXxx` naming.",
        'Use semantic Tailwind utilities such as `bg-primary`, `text-foreground`, `rounded-md`, `shadow-sm`.',
        isOverlay
          ? 'This is an OVERLAY component: use an attribute-directive trigger on a native element and place the overlay content inside an `<ng-template>` that receives a `close` context. Never use a `<ui-' +
            component +
            '>` element selector.'
          : '',
        isCva
          ? 'This component implements ControlValueAccessor: show Reactive Forms wiring with `formControlName` and mention that `ReactiveFormsModule` must be imported.'
          : '',
        'Apply the current theme via `provideVoltTheme` or `applyVoltTheme` when relevant.',
        'Do not invent inputs, outputs, or selectors that are not listed in the metadata.',
      ]
        .filter(Boolean)
        .join('\n');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                buildSystemContext(),
                '',
                '---',
                '',
                `Generate a complete Angular example using the Volt UI ${comp?.name ?? component} component.`,
                '',
                'Component metadata:',
                JSON.stringify(comp, null, 2),
                '',
                example ? `Usage example:\n${JSON.stringify(example, null, 2)}` : '',
                '',
                'Requirements:',
                requirements,
                '',
                context ? `Additional context: ${context}` : '',
              ]
                .filter(Boolean)
                .join('\n'),
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'volt-ui-troubleshooting',
    {
      description: 'Prompt for troubleshooting common Volt UI mistakes.',
      argsSchema: {
        issue: z.string().describe('Description of the issue or error message.'),
      },
    },
    async ({ issue }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              buildSystemContext(),
              '',
              '---',
              '',
              'The user is experiencing an issue with Volt UI.',
              '',
              `Issue description:\n${issue}`,
              '',
              'Please diagnose the problem step by step. Use the following checklist:',
              '',
              '1. **Naming conventions** — is the code using `ui-*` / `UiXxx` for copied components and `volt-*` / `VoltXxx` only for imports from `@voltui/components`?',
              '2. **Overlay pattern** — if the issue involves dialog, drawer, popover, tooltip, or dropdown-menu, verify the trigger uses an attribute directive and the content is inside an `<ng-template>` with a `close` context.',
              '3. **Reactive Forms wiring** — if the component is a CVA (checkbox, input, radio, select, switch, textarea, slider, toggle, etc.), verify `ReactiveFormsModule` is imported and the component is bound with `formControlName`.',
              '4. **Theme setup** — confirm `@voltui/components/themes.css` is imported after Tailwind and `provideVoltTheme` is configured.',
              '5. **Component copied** — if the class is not found, the component may not have been copied via `npx @voltui/cli add <name>`.',
              '6. **Standalone / OnPush / signals** — ensure new components are standalone, use OnPush, and prefer signals over zone-based patterns.',
              '',
              'If you need more data, call the MCP `get_component` tool or read the `component://<name>` resource before proposing a fix.',
            ].join('\n'),
          },
        },
      ],
    })
  );

  return server;
}

// ---------------------------------------------------------------------------
// CORS / security
// ---------------------------------------------------------------------------

const allowedOrigins = new Set([
  'https://volt-ui.pages.dev',
  'https://volt-ui.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]);

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // server-to-server or same-origin
  return allowedOrigins.has(origin);
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
};

// ---------------------------------------------------------------------------
// Human-readable discovery response
// ---------------------------------------------------------------------------

function discoveryResponse(): Response {
  const base = 'https://volt-ui.pages.dev/api/mcp';
  return new Response(
    JSON.stringify(
      {
        name: 'Volt UI MCP Server',
        protocol: 'Model Context Protocol (Streamable HTTP)',
        transport: 'Streamable HTTP',
        setup: {
          cli: 'npx volt-ui-mcp',
          configUrl: `${base}/setup`,
          agents: ['claude', 'cursor', 'windsurf', 'copilot', 'vscode'].map(agent => ({
            agent,
            configUrl: `${base}/setup?agent=${agent}`,
          })),
        },
        tools: [
          { name: 'list_components', description: 'List all Volt UI components' },
          { name: 'get_component', description: 'Get detailed component metadata' },
          { name: 'get_usage_example', description: 'Get Angular usage examples' },
          { name: 'get_theme_info', description: 'Get theme configuration info' },
          { name: 'get_project_info', description: 'Get project overview' },
          { name: 'generate_cli_command', description: 'Generate Volt UI CLI commands' },
        ],
        resources: [
          { uri: 'component://{name}', description: 'Component metadata' },
          { uri: 'theme://info', description: 'Theme info' },
          { uri: 'project://info', description: 'Project info' },
        ],
        prompts: [
          { name: 'generate-volt-ui-component', description: 'Generate component usage' },
          { name: 'volt-ui-troubleshooting', description: 'Troubleshoot Volt UI issues' },
        ],
      },
      null,
      2
    ),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// ---------------------------------------------------------------------------
// Analog / Nitro event handler
// ---------------------------------------------------------------------------

export default defineEventHandler(async event => {
  setHeaders(event, corsHeaders);

  const method = getMethod(event);

  if (method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    return null;
  }

  const origin = getRequestHeader(event, 'origin') ?? undefined;
  if (!isOriginAllowed(origin)) {
    event.node.res.statusCode = 403;
    return { error: 'Origin not allowed' };
  }

  // GET is used by humans browsing the endpoint; return discovery JSON.
  if (method === 'GET') {
    return sendWebResponse(event, discoveryResponse());
  }

  // POST/DELETE are handled by the MCP transport.
  const request = toWebRequest(event);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
    enableJsonResponse: true, // return JSON instead of SSE for POSTs
  });
  const server = createMcpServer();
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  return sendWebResponse(event, response);
});
