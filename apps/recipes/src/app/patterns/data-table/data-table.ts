import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltInput,
  VoltNativeButton,
  VoltPagination,
  VoltPaginationButton,
  VoltPaginationNext,
  VoltPaginationPrevious,
  VoltSkeleton,
  VoltSpinner,
  VoltTable,
  VoltTableBody,
  VoltTableCaption,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
} from 'volt';

/**
 * RECIPE — Data table with loading, sort, filter, pagination, empty and error states.
 *
 * Volt gives you the table's structure and styling. Everything that makes a list *behave* is a
 * few signals here, and that is the point: there is no `VoltDataTable`, because the logic is
 * small, specific to your data, and yours to change.
 *
 * Read the template top to bottom as a state machine:
 *
 *   first load            skeleton rows
 *   data                  the table
 *   reloading             the *previous* rows stay, dimmed, `aria-busy`; no flash to a skeleton
 *   dataset is empty      empty state with a way forward ("Add invoice")
 *   filter has no match   a different empty state with "Clear filter" — empty ≠ no results
 *   request failed        an alert with Retry; stale rows stay visible if there are any
 *
 * Accessibility decisions:
 *   - Sorting lives in a real <button> inside the column header; the header carries `aria-sort`
 *     so the state is announced, and only the active column has an ascending/descending value.
 *   - The table scrolls horizontally inside a focusable, labelled region, so keyboard users can
 *     scroll it and no critical column is clipped on a phone.
 *   - A filter change resets to page 1; a shrinking result clamps the page, so you can never
 *     land on page 4 of 2.
 *
 * Replace `fakeFetch` with your service call; keep the request shape (query, sort, page).
 */

export interface Invoice {
  id: string;
  customer: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
}

export type SortKey = 'customer' | 'status' | 'amount';
export type SortDirection = 'asc' | 'desc';

export interface InvoiceQuery {
  filter: string;
  sort: SortKey;
  direction: SortDirection;
  page: number;
  pageSize: number;
}

export interface InvoicePage {
  rows: Invoice[];
  /** Matches for the current filter. */
  total: number;
  /** Rows in the whole dataset, to tell "empty" from "no results". */
  datasetSize: number;
}

export type FetchInvoices = (query: InvoiceQuery) => Promise<InvoicePage>;

const DATA: Invoice[] = [
  { id: 'INV-001', customer: 'Acme Corp', status: 'paid', amount: 250 },
  { id: 'INV-002', customer: 'Borealis Ltd', status: 'pending', amount: 150.5 },
  { id: 'INV-003', customer: 'Cinder Studio', status: 'overdue', amount: 350 },
  { id: 'INV-004', customer: 'Delta Works', status: 'paid', amount: 450 },
  { id: 'INV-005', customer: 'Ember & Co', status: 'pending', amount: 550.25 },
  { id: 'INV-006', customer: 'Fjord Labs', status: 'paid', amount: 75 },
  { id: 'INV-007', customer: 'Glacier Foods', status: 'overdue', amount: 1200 },
];

/** REPLACE ME. Filters "fail" to the empty dataset case; "error" rejects. */
export const fakeFetch: FetchInvoices = ({ filter, sort, direction, page, pageSize }) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (filter.trim().toLowerCase() === 'error') {
        reject(new Error('The invoices service returned 503.'));
        return;
      }
      const q = filter.trim().toLowerCase();
      const matches = DATA.filter(row => !q || row.customer.toLowerCase().includes(q));
      const sorted = [...matches].sort((a, b) => {
        const order = sort === 'amount' ? a.amount - b.amount : a[sort].localeCompare(b[sort]);
        return direction === 'asc' ? order : -order;
      });
      resolve({
        rows: sorted.slice((page - 1) * pageSize, page * pageSize),
        total: sorted.length,
        datasetSize: DATA.length,
      });
    }, 300)
  );

@Component({
  selector: 'app-data-table-recipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltInput,
    VoltNativeButton,
    VoltPagination,
    VoltPaginationButton,
    VoltPaginationNext,
    VoltPaginationPrevious,
    VoltSkeleton,
    VoltSpinner,
    VoltTable,
    VoltTableBody,
    VoltTableCaption,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <volt-input
          class="w-64"
          aria-label="Filter invoices by customer"
          placeholder="Filter by customer"
          [value]="filter()"
          (input)="setFilter($any($event.target).value)"
        />
        @if (loading()) {
          <span class="inline-flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <volt-spinner size="sm" />
            Loading invoices…
          </span>
        }
      </div>

      @if (error(); as message) {
        <volt-alert variant="destructive" role="alert">
          <volt-alert-title>Invoices could not be loaded</volt-alert-title>
          <volt-alert-description>{{ message }}</volt-alert-description>
          <button
            slot="action"
            voltButton
            variant="outline"
            size="sm"
            type="button"
            (click)="load()"
          >
            Retry
          </button>
        </volt-alert>
      }

      @if (firstLoad()) {
        <div class="space-y-2" aria-hidden="true">
          @for (n of [1, 2, 3]; track n) {
            <volt-skeleton height="2.5rem" />
          }
        </div>
      } @else if (rows().length) {
        <!-- Focusable so the keyboard can scroll it; labelled so it is announced as a region. -->
        <div
          class="overflow-x-auto rounded-lg border border-border transition-opacity"
          [class.opacity-60]="loading()"
          role="region"
          aria-label="Invoices"
          tabindex="0"
          [attr.aria-busy]="loading()"
        >
          <volt-table>
            <volt-table-caption class="sr-only">
              Invoices, sorted by {{ sort() }}
              {{ direction() === 'asc' ? 'ascending' : 'descending' }}
            </volt-table-caption>
            <volt-table-header>
              <volt-table-row>
                <volt-table-head [attr.aria-sort]="ariaSort('customer')">
                  <button
                    voltButton
                    variant="ghost"
                    size="sm"
                    type="button"
                    (click)="sortBy('customer')"
                  >
                    Customer
                  </button>
                </volt-table-head>
                <volt-table-head [attr.aria-sort]="ariaSort('status')">
                  <button
                    voltButton
                    variant="ghost"
                    size="sm"
                    type="button"
                    (click)="sortBy('status')"
                  >
                    Status
                  </button>
                </volt-table-head>
                <volt-table-head class="text-right" [attr.aria-sort]="ariaSort('amount')">
                  <button
                    voltButton
                    variant="ghost"
                    size="sm"
                    type="button"
                    (click)="sortBy('amount')"
                  >
                    Amount
                  </button>
                </volt-table-head>
              </volt-table-row>
            </volt-table-header>
            <volt-table-body>
              @for (row of rows(); track row.id) {
                <volt-table-row>
                  <volt-table-cell class="font-medium">{{ row.customer }}</volt-table-cell>
                  <volt-table-cell>
                    <volt-badge [variant]="badge(row.status)">{{ row.status }}</volt-badge>
                  </volt-table-cell>
                  <volt-table-cell class="text-right tabular-nums">
                    {{ row.amount.toFixed(2) }}
                  </volt-table-cell>
                </volt-table-row>
              }
            </volt-table-body>
          </volt-table>
        </div>

        <volt-pagination [page]="page()" [pageCount]="pageCount()" (pageChange)="goTo($event)">
          <volt-pagination-previous />
          @for (n of pages(); track n) {
            <volt-pagination-button [page]="n" />
          }
          <volt-pagination-next />
        </volt-pagination>
      } @else if (!loading() && !error()) {
        @if (datasetSize() === 0) {
          <volt-empty-state>
            <volt-empty-state-title>No invoices yet</volt-empty-state-title>
            <volt-empty-state-description
              >Invoices you create will show up here.</volt-empty-state-description
            >
            <div slot="actions"><button voltButton type="button">Add invoice</button></div>
          </volt-empty-state>
        } @else {
          <volt-empty-state>
            <volt-empty-state-title>No invoices match "{{ filter() }}"</volt-empty-state-title>
            <volt-empty-state-description
              >Try a different customer name.</volt-empty-state-description
            >
            <div slot="actions">
              <button voltButton variant="outline" type="button" (click)="setFilter('')">
                Clear filter
              </button>
            </div>
          </volt-empty-state>
        }
      }
    </div>
  `,
})
export class DataTableRecipe implements OnInit {
  /** The one thing you swap for a real call. */
  readonly fetch = input<FetchInvoices>(fakeFetch);
  readonly pageSize = input(3);

  protected readonly rows = signal<Invoice[]>([]);
  protected readonly total = signal(0);
  protected readonly datasetSize = signal(-1);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly filter = signal('');
  protected readonly sort = signal<SortKey>('customer');
  protected readonly direction = signal<SortDirection>('asc');
  protected readonly page = signal(1);

  protected readonly firstLoad = computed(() => this.loading() && this.datasetSize() < 0);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1)
  );

  /** Latest-wins ticket, so a slow response cannot overwrite a newer one. */
  private ticket = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ticket++);
  }

  /** Not the constructor: signal inputs (`fetch`, `pageSize`) are only set by this point. */
  ngOnInit(): void {
    void this.load();
  }

  protected setFilter(value: string): void {
    this.filter.set(value);
    this.page.set(1);
    void this.load();
  }

  protected sortBy(key: SortKey): void {
    const same = this.sort() === key;
    this.sort.set(key);
    this.direction.set(same && this.direction() === 'asc' ? 'desc' : 'asc');
    this.page.set(1);
    void this.load();
  }

  protected goTo(page: number): void {
    this.page.set(page);
    void this.load();
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sort() !== key) return 'none';
    return this.direction() === 'asc' ? 'ascending' : 'descending';
  }

  protected badge(status: Invoice['status']): 'success' | 'warning' | 'destructive' {
    return status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'destructive';
  }

  protected async load(): Promise<void> {
    const mine = ++this.ticket;
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.fetch()({
        filter: this.filter(),
        sort: this.sort(),
        direction: this.direction(),
        page: this.page(),
        pageSize: this.pageSize(),
      });
      if (mine !== this.ticket) return;
      this.rows.set(result.rows);
      this.total.set(result.total);
      this.datasetSize.set(result.datasetSize);
      // The result shrank under us (rows deleted elsewhere): clamp instead of showing nothing.
      const last = Math.max(1, Math.ceil(result.total / this.pageSize()));
      if (this.page() > last) {
        this.page.set(last);
        void this.load();
        return;
      }
      this.loading.set(false);
    } catch (error) {
      if (mine !== this.ticket) return;
      this.error.set((error as Error).message);
      this.loading.set(false);
    }
  }
}
