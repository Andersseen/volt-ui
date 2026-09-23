import { describeClassContract } from '../../testing/class-contract';
import { VoltAlert, VoltAlertDescription, VoltAlertTitle } from './components/alert';
import { VoltBadge } from './components/badge';
import { VoltBreadcrumbLink } from './components/breadcrumbs';
import { VoltButton, VoltNativeButton } from './components/button';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
} from './components/card';
import { VoltError, VoltFormField, VoltHint, VoltLabel } from './components/form-field';
import { VoltInput } from './components/input';
import { VoltSearch, VoltSearchClear } from './components/search';
import { VoltNativeSelect, VoltSelect } from './components/select';
import { VoltSeparator } from './components/separator';
import { VoltSkeleton } from './components/skeleton';
import { VoltSpinner } from './components/spinner';
import { VoltTable, VoltTableCell } from './components/table';
import { VoltTabs, VoltTabsList, VoltTabsTrigger } from './components/tabs';
import { VoltTextarea } from './components/textarea';

const q = (selector: string) => (root: HTMLElement) => root.querySelector(selector);

// Host-styled atoms: the host is the visual element.
describeClassContract({
  name: 'VoltCard',
  template: cls => `<volt-card class="${cls}">x</volt-card>`,
  imports: [VoltCard],
  target: q('volt-card'),
  conflict: ['rounded-md', 'rounded-xl'],
  keep: ['border', 'bg-surface'],
});

describeClassContract({
  name: 'VoltCardHeader',
  template: cls => `<volt-card-header class="${cls}">x</volt-card-header>`,
  imports: [VoltCardHeader],
  target: q('volt-card-header'),
  conflict: ['p-3', 'p-6'],
  keep: ['flex', 'flex-col'],
});

describeClassContract({
  name: 'VoltCardTitle',
  template: cls => `<volt-card-title class="${cls}">x</volt-card-title>`,
  imports: [VoltCardTitle],
  target: q('volt-card-title'),
  conflict: ['text-base', 'text-lg'],
  keep: ['font-semibold'],
});

describeClassContract({
  name: 'VoltCardDescription',
  template: cls => `<volt-card-description class="${cls}">x</volt-card-description>`,
  imports: [VoltCardDescription],
  target: q('volt-card-description'),
  conflict: ['text-xs', 'text-sm'],
  keep: ['text-muted-foreground'],
});

describeClassContract({
  name: 'VoltCardContent',
  template: cls => `<volt-card-content class="${cls}">x</volt-card-content>`,
  imports: [VoltCardContent],
  target: q('volt-card-content'),
  // `p-3` must beat both `p-6` and the later `pt-0`.
  conflict: ['p-3', 'pt-0'],
  keep: ['block'],
});

describeClassContract({
  name: 'VoltCardFooter',
  template: cls => `<volt-card-footer class="${cls}">x</volt-card-footer>`,
  imports: [VoltCardFooter],
  target: q('volt-card-footer'),
  conflict: ['p-3', 'p-6'],
  keep: ['flex', 'items-center'],
});

describeClassContract({
  name: 'VoltBadge',
  template: cls => `<volt-badge class="${cls}">x</volt-badge>`,
  imports: [VoltBadge],
  target: q('volt-badge'),
  conflict: ['rounded-md', 'rounded-full'],
  keep: ['inline-flex', 'bg-primary'],
});

describeClassContract({
  name: 'VoltAlert',
  template: cls => `<volt-alert variant="success" class="${cls}">x</volt-alert>`,
  imports: [VoltAlert],
  target: q('volt-alert'),
  conflict: ['p-6', 'px-4'],
  keep: ['flex', 'bg-success/10'],
});

describeClassContract({
  name: 'VoltAlertTitle',
  template: cls => `<volt-alert-title class="${cls}">x</volt-alert-title>`,
  imports: [VoltAlertTitle],
  target: q('volt-alert-title'),
  conflict: ['font-semibold', 'font-medium'],
  keep: ['block'],
});

describeClassContract({
  name: 'VoltAlertDescription',
  template: cls => `<volt-alert-description class="${cls}">x</volt-alert-description>`,
  imports: [VoltAlertDescription],
  target: q('volt-alert-description'),
  conflict: ['text-xs', 'text-sm'],
  keep: ['block'],
});

describeClassContract({
  name: 'VoltSpinner',
  template: cls => `<volt-spinner class="${cls}" />`,
  imports: [VoltSpinner],
  target: q('volt-spinner'),
  conflict: ['size-10', 'size-5'],
  keep: ['inline-flex'],
});

describeClassContract({
  name: 'VoltSkeleton',
  template: cls => `<volt-skeleton class="${cls}" />`,
  imports: [VoltSkeleton],
  target: q('volt-skeleton'),
  conflict: ['rounded-none', 'rounded-md'],
  keep: ['animate-pulse', 'bg-muted'],
});

describeClassContract({
  name: 'VoltSeparator',
  template: cls => `<volt-separator class="${cls}" />`,
  imports: [VoltSeparator],
  target: q('volt-separator'),
  conflict: ['bg-primary', 'bg-border'],
  keep: ['shrink-0'],
});

describeClassContract({
  name: 'VoltTable',
  template: cls => `<volt-table class="${cls}"></volt-table>`,
  imports: [VoltTable],
  target: q('volt-table'),
  conflict: ['text-xs', 'text-sm'],
  keep: ['table', 'w-full'],
});

describeClassContract({
  name: 'VoltTableCell',
  template: cls => `<volt-table-cell class="${cls}">x</volt-table-cell>`,
  imports: [VoltTableCell],
  target: q('volt-table-cell'),
  conflict: ['p-2', 'p-4'],
  keep: ['table-cell'],
});

describeClassContract({
  name: 'VoltFormField',
  template: cls => `<volt-form-field class="${cls}"></volt-form-field>`,
  imports: [VoltFormField],
  target: q('volt-form-field'),
  conflict: ['space-y-1', 'space-y-2'],
  keep: ['block'],
});

describeClassContract({
  name: 'VoltSearch',
  template: cls => `<volt-search class="${cls}"></volt-search>`,
  imports: [VoltSearch],
  target: q('volt-search'),
  conflict: ['w-64', 'w-full'],
  keep: ['relative'],
});

describeClassContract({
  name: 'VoltTabsTrigger',
  template: cls => `
    <volt-tabs value="a">
      <volt-tabs-list>
        <volt-tabs-trigger value="a" class="${cls}">A</volt-tabs-trigger>
      </volt-tabs-list>
    </volt-tabs>
  `,
  imports: [VoltTabs, VoltTabsList, VoltTabsTrigger],
  target: q('volt-tabs-trigger'),
  conflict: ['px-6', 'px-3'],
  keep: ['inline-flex'],
});

// Native-element directives: the element is both host and visual element.
describeClassContract({
  name: 'VoltNativeButton',
  template: cls => `<button voltButton class="${cls}">Save</button>`,
  imports: [VoltNativeButton],
  target: q('button'),
  conflict: ['h-9', 'h-10'],
  keep: ['inline-flex', 'bg-primary'],
});

describeClassContract({
  name: 'VoltNativeSelect',
  template: cls => `<select voltNativeSelect class="${cls}"><option>a</option></select>`,
  imports: [VoltNativeSelect],
  target: q('select'),
  conflict: ['h-8', 'h-10'],
  keep: ['border', 'w-full'],
});

// Wrappers: the consumer class belongs to the native element, not the host.
describeClassContract({
  name: 'VoltButton',
  template: cls => `<volt-button class="${cls}">Save</volt-button>`,
  imports: [VoltButton],
  target: q('volt-button > button'),
  conflict: ['h-9', 'h-10'],
  keep: ['inline-flex', 'bg-primary'],
  // No `host` check: for 1.x compatibility <volt-button> keeps the static class on the host too.
});

describeClassContract({
  name: 'VoltInput',
  template: cls => `<volt-input class="${cls}" />`,
  imports: [VoltInput],
  target: q('volt-input > input'),
  host: q('volt-input'),
  conflict: ['px-2.5', 'px-3'],
  keep: ['border', 'rounded-lg'],
});

describeClassContract({
  name: 'VoltTextarea',
  template: cls => `<volt-textarea class="${cls}" />`,
  imports: [VoltTextarea],
  target: q('volt-textarea > textarea'),
  host: q('volt-textarea'),
  conflict: ['px-2', 'px-4'],
  keep: ['border', 'w-full'],
});

describeClassContract({
  name: 'VoltSelect',
  template: cls => `<volt-select class="${cls}"></volt-select>`,
  imports: [VoltSelect],
  target: q('volt-select > button'),
  host: q('volt-select'),
  conflict: ['h-8', 'h-10'],
  keep: ['border', 'justify-between'],
});

describeClassContract({
  name: 'VoltLabel',
  template: cls => `<volt-label class="${cls}">Name</volt-label>`,
  imports: [VoltLabel],
  target: q('volt-label > label'),
  host: q('volt-label'),
  conflict: ['text-xs', 'text-sm'],
  keep: ['font-medium'],
});

describeClassContract({
  name: 'VoltHint',
  template: cls => `<volt-hint class="${cls}">Help</volt-hint>`,
  imports: [VoltHint],
  target: q('volt-hint > span'),
  host: q('volt-hint'),
  conflict: ['text-xs', 'text-sm'],
  keep: ['text-muted-foreground'],
});

describeClassContract({
  name: 'VoltError',
  template: cls => `<volt-error class="${cls}">Required</volt-error>`,
  imports: [VoltError],
  target: q('volt-error > span'),
  host: q('volt-error'),
  conflict: ['text-xs', 'text-sm'],
  keep: ['text-error'],
});

describeClassContract({
  name: 'VoltSearchClear',
  template: cls =>
    `<volt-search><volt-search-clear class="${cls}">×</volt-search-clear></volt-search>`,
  imports: [VoltSearch, VoltSearchClear],
  target: q('volt-search-clear > button'),
  host: q('volt-search-clear'),
  conflict: ['h-6', 'h-8'],
  keep: ['inline-flex'],
});

describeClassContract({
  name: 'VoltBreadcrumbLink',
  template: cls => `<volt-breadcrumb-link href="/docs" class="${cls}">Docs</volt-breadcrumb-link>`,
  imports: [VoltBreadcrumbLink],
  target: q('volt-breadcrumb-link > a'),
  host: q('volt-breadcrumb-link'),
  conflict: ['transition-none', 'transition-colors'],
  keep: [],
});
