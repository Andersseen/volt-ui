import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltCheckbox,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogTitle,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuSeparator,
  VoltDropdownMenuTrigger,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltLabel,
  VoltNativeButton,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSkeleton,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
} from 'volt';
import type { PreviewState } from './preview-state';

interface Invoice {
  id: string;
  customer: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  amount: string;
}

/**
 * Sample application: a selectable table with row menus and an edit dialog holding a select. The
 * menu, the dialog and the select's listbox are portalled, and carry the preview's theme with them.
 */
@Component({
  selector: 'app-preview-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltCheckbox,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogRoot,
    VoltDialogTitle,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuSeparator,
    VoltDropdownMenuTrigger,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltLabel,
    VoltNativeButton,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSkeleton,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
  ],
  template: `
    <div class="space-y-3 p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-lg font-semibold">Invoices</h3>
        <span class="text-xs text-muted-foreground" aria-live="polite"
          >{{ selected().size }} selected</span
        >
      </div>

      @if (state() === 'error') {
        <volt-alert variant="destructive" role="alert">
          <volt-alert-title>Invoices could not be loaded</volt-alert-title>
          <volt-alert-description>Check your connection and reload.</volt-alert-description>
        </volt-alert>
      } @else if (state() === 'empty') {
        <volt-empty-state>
          <volt-empty-state-title>No invoices</volt-empty-state-title>
          <volt-empty-state-description
            >Invoices appear here once a customer is billed.</volt-empty-state-description
          >
        </volt-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <volt-table [attr.aria-busy]="state() === 'loading'">
            <volt-table-header>
              <volt-table-row>
                <volt-table-head class="w-8"><span class="sr-only">Select</span></volt-table-head>
                <volt-table-head>Invoice</volt-table-head>
                <volt-table-head>Customer</volt-table-head>
                <volt-table-head>Status</volt-table-head>
                <volt-table-head class="text-right">Amount</volt-table-head>
                <volt-table-head><span class="sr-only">Actions</span></volt-table-head>
              </volt-table-row>
            </volt-table-header>
            <volt-table-body>
              @for (row of invoices; track row.id) {
                <volt-table-row [attr.data-state]="selected().has(row.id) ? 'selected' : null">
                  @if (state() === 'loading') {
                    <volt-table-cell colspan="6"
                      ><volt-skeleton variant="text" width="100%" height="20px"
                    /></volt-table-cell>
                  } @else {
                    <volt-table-cell>
                      <volt-checkbox
                        [ariaLabel]="'Select ' + row.id"
                        [checked]="selected().has(row.id)"
                        [disabled]="state() === 'disabled'"
                        (checkedChange)="toggle(row.id, $event)"
                      />
                    </volt-table-cell>
                    <volt-table-cell class="font-medium">{{ row.id }}</volt-table-cell>
                    <volt-table-cell>{{ row.customer }}</volt-table-cell>
                    <volt-table-cell>
                      <volt-badge [variant]="badge[row.status]">{{ row.status }}</volt-badge>
                    </volt-table-cell>
                    <volt-table-cell class="text-right">{{ row.amount }}</volt-table-cell>
                    <volt-table-cell>
                      <button
                        voltButton
                        size="sm"
                        variant="ghost"
                        [attr.aria-label]="'Actions for ' + row.id"
                        [voltDropdownMenu]="menu"
                        [disabled]="state() === 'disabled'"
                      >
                        ⋯
                      </button>
                      <ng-template #menu>
                        <volt-dropdown-menu>
                          <volt-dropdown-menu-item (click)="edit(row)"
                            >Edit</volt-dropdown-menu-item
                          >
                          <volt-dropdown-menu-item>Download PDF</volt-dropdown-menu-item>
                          <volt-dropdown-menu-separator />
                          <volt-dropdown-menu-item>Void invoice</volt-dropdown-menu-item>
                        </volt-dropdown-menu>
                      </ng-template>
                    </volt-table-cell>
                  }
                </volt-table-row>
              }
            </volt-table-body>
          </volt-table>
        </div>
      }
    </div>

    <ng-template
      voltDialogRoot
      [open]="editing() !== null"
      (openChange)="$event || editing.set(null)"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <form voltDialogContent (submit)="$event.preventDefault(); close()">
        <h2 voltDialogTitle>Edit {{ editing()?.id }}</h2>
        <p voltDialogDescription>Change the status of this invoice.</p>
        <volt-label htmlFor="preview-status" class="mt-4 block">Status</volt-label>
        <volt-select
          id="preview-status"
          class="mt-2"
          ariaLabel="Status"
          [value]="editing()?.status"
        >
          <volt-select-content>
            <volt-select-item value="Paid">Paid</volt-select-item>
            <volt-select-item value="Pending">Pending</volt-select-item>
            <volt-select-item value="Overdue">Overdue</volt-select-item>
          </volt-select-content>
        </volt-select>
        <div class="mt-4 flex justify-end gap-2">
          <button voltButton type="button" variant="outline" (click)="close()">Cancel</button>
          <button voltButton type="submit">Save</button>
        </div>
      </form>
    </ng-template>
  `,
})
export class PreviewData {
  readonly state = input<PreviewState>('default');

  protected readonly invoices: Invoice[] = [
    { id: 'INV-1042', customer: 'Northwind', status: 'Paid', amount: '$1,250.00' },
    { id: 'INV-1043', customer: 'Globex', status: 'Pending', amount: '$860.40' },
    { id: 'INV-1044', customer: 'Initech', status: 'Overdue', amount: '$2,310.00' },
  ];
  protected readonly badge = {
    Paid: 'success',
    Pending: 'secondary',
    Overdue: 'destructive',
  } as const;
  protected readonly selected = signal(new Set<string>(['INV-1043']));
  protected readonly editing = signal<Invoice | null>(null);
  protected readonly count = computed(() => this.selected().size);

  protected toggle(id: string, checked: boolean): void {
    this.selected.update(set => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected edit(row: Invoice): void {
    this.editing.set(row);
  }
}
