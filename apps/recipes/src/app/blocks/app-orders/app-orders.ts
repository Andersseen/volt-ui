import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LmnDownloadIcon, LmnSearchIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltButton,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltInput,
  VoltSearch,
  VoltTable,
  VoltTableBody,
  VoltTableCaption,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

type Status = 'paid' | 'pending' | 'refunded';
type Filter = Status | 'all';

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly email: string;
  readonly date: string;
  readonly status: Status;
  readonly total: number;
}

const BADGE: Record<Status, 'success' | 'warning' | 'secondary'> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'secondary',
};

const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' });

/**
 * The orders screen of an admin: a search, a status filter, the table and a running total.
 *
 * Search and filter combine, and both are plain signals feeding one `computed`, so the table, the
 * count and the total can never disagree. The count sentence is a polite live region — typing in
 * the search announces "3 of 10 orders" without moving focus. When nothing matches, the table gives
 * way to an empty state with the one action that helps: clear the filters.
 *
 * On a narrow container the order number, email and date are hidden (the customer and total are what a
 * phone needs) and the table scrolls inside its own labelled region rather than the page.
 *
 * The region is `relative` on purpose: the visually hidden caption is absolutely positioned, and
 * without a containing block inside the scroller it would sit at the table's far edge and widen
 * the whole page.
 */
@Component({
  selector: 'app-app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltButton,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltInput,
    VoltSearch,
    VoltTable,
    VoltTableBody,
    VoltTableCaption,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltToggleGroup,
    VoltToggleGroupItem,
    LmnDownloadIcon,
    LmnSearchIcon,
  ],
  template: `
    <section class="@container bg-muted/20 px-4 py-10 @3xl:px-6">
      <div class="mx-auto max-w-5xl rounded-xl border border-border bg-background shadow-sm">
        <header class="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div class="mr-auto">
            <h2 class="text-lg font-semibold tracking-tight">Orders</h2>
            <p class="text-sm text-muted-foreground" aria-live="polite">
              {{ visible().length }} of {{ orders.length }} orders ·
              <span class="tabular-nums">{{ total() }}</span>
            </p>
          </div>
          <volt-button variant="outline" size="sm">
            <lmn-download slot="leading" [size]="16" />
            Export CSV
          </volt-button>
        </header>

        <div class="flex flex-col gap-3 p-4 @2xl:flex-row @2xl:items-center">
          <volt-search class="relative flex-1">
            <lmn-search
              [size]="16"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <volt-input
              type="search"
              size="sm"
              class="pl-9"
              placeholder="Search by customer or order"
              ariaLabel="Search orders"
              [value]="query()"
              (valueChange)="query.set($event)"
            />
          </volt-search>
          <volt-toggle-group
            type="single"
            [allowDeselection]="false"
            [value]="[filter()]"
            (valueChange)="pick($event)"
            aria-label="Status"
            class="self-start @2xl:self-auto"
          >
            @for (option of filters; track option.value) {
              <volt-toggle-group-item [value]="option.value" size="sm">{{
                option.label
              }}</volt-toggle-group-item>
            }
          </volt-toggle-group>
        </div>

        @if (visible().length) {
          <div
            class="relative overflow-x-auto"
            tabindex="0"
            role="region"
            aria-label="Orders table"
          >
            <volt-table>
              <volt-table-caption class="sr-only">Orders, newest first</volt-table-caption>
              <volt-table-header>
                <volt-table-row>
                  <volt-table-head class="hidden @2xl:table-cell">Order</volt-table-head>
                  <volt-table-head>Customer</volt-table-head>
                  <volt-table-head class="hidden @3xl:table-cell">Date</volt-table-head>
                  <volt-table-head>Status</volt-table-head>
                  <volt-table-head class="text-right">Total</volt-table-head>
                </volt-table-row>
              </volt-table-header>
              <volt-table-body>
                @for (order of visible(); track order.id) {
                  <volt-table-row class="hover:bg-muted/40">
                    <volt-table-cell class="hidden font-mono text-xs @2xl:table-cell">{{
                      order.id
                    }}</volt-table-cell>
                    <volt-table-cell>
                      <span class="block font-medium">{{ order.customer }}</span>
                      <span class="hidden text-xs text-muted-foreground @2xl:block">{{
                        order.email
                      }}</span>
                    </volt-table-cell>
                    <volt-table-cell class="hidden text-muted-foreground @3xl:table-cell">{{
                      order.date
                    }}</volt-table-cell>
                    <volt-table-cell>
                      <volt-badge [variant]="badge(order.status)" class="capitalize">{{
                        order.status
                      }}</volt-badge>
                    </volt-table-cell>
                    <volt-table-cell class="text-right tabular-nums">{{
                      format(order.total)
                    }}</volt-table-cell>
                  </volt-table-row>
                }
              </volt-table-body>
            </volt-table>
          </div>
        } @else {
          <volt-empty-state class="border-t border-border py-14">
            <volt-empty-state-title>No orders match</volt-empty-state-title>
            <volt-empty-state-description>
              Try another name, or look across every status.
            </volt-empty-state-description>
            <volt-button variant="outline" size="sm" class="mt-4" (click)="reset()">
              Clear filters
            </volt-button>
          </volt-empty-state>
        }
      </div>
    </section>
  `,
})
export class AppOrders {
  protected readonly filters: readonly { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'refunded', label: 'Refunded' },
  ];

  protected readonly orders: readonly Order[] = [
    {
      id: '#3210',
      customer: 'Olivia Martin',
      email: 'olivia@globex.com',
      date: '21 Nov',
      status: 'paid',
      total: 1999,
    },
    {
      id: '#3209',
      customer: 'Jackson Lee',
      email: 'jackson@initech.io',
      date: '21 Nov',
      status: 'pending',
      total: 39,
    },
    {
      id: '#3208',
      customer: 'Isabella Nguyen',
      email: 'bella@hooli.dev',
      date: '20 Nov',
      status: 'paid',
      total: 299,
    },
    {
      id: '#3207',
      customer: 'William Kim',
      email: 'will@umbrella.co',
      date: '19 Nov',
      status: 'refunded',
      total: 99,
    },
    {
      id: '#3206',
      customer: 'Sofia Davis',
      email: 'sofia@stark.com',
      date: '19 Nov',
      status: 'paid',
      total: 450,
    },
    {
      id: '#3205',
      customer: 'Liam Brown',
      email: 'liam@soylent.com',
      date: '18 Nov',
      status: 'pending',
      total: 120,
    },
    {
      id: '#3204',
      customer: 'Mia Johnson',
      email: 'mia@vandelay.com',
      date: '17 Nov',
      status: 'paid',
      total: 75,
    },
    {
      id: '#3203',
      customer: 'Noah Wilson',
      email: 'noah@northwind.com',
      date: '16 Nov',
      status: 'paid',
      total: 640,
    },
  ];

  protected readonly query = signal('');
  protected readonly filter = signal<Filter>('all');

  protected readonly visible = computed(() => {
    const query = this.query().trim().toLowerCase();
    const filter = this.filter();
    return this.orders.filter(
      order =>
        (filter === 'all' || order.status === filter) &&
        (!query || `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query))
    );
  });

  protected readonly total = computed(() =>
    money.format(this.visible().reduce((sum, order) => sum + order.total, 0))
  );

  protected pick(value: readonly string[]): void {
    const option = this.filters.find(entry => entry.value === value[0]);
    if (option) this.filter.set(option.value);
  }

  protected reset(): void {
    this.query.set('');
    this.filter.set('all');
  }

  protected badge(status: Status) {
    return BADGE[status];
  }

  protected format(value: number): string {
    return money.format(value);
  }
}
