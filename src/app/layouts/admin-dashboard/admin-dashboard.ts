import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LmnGridIcon,
  LmnHomeIcon,
  LmnMailIcon,
  LmnMenuIcon,
  LmnSettingsIcon,
  LmnUserIcon,
} from 'lumen-icons';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltInput,
  VoltSeparator,
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarFooter,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSidebarService,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
} from 'volt';

interface NavItem {
  readonly label: string;
  readonly icon: 'home' | 'grid' | 'user' | 'mail' | 'settings';
  readonly route: string;
  readonly badge?: string;
}

interface Stat {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly direction: 'up' | 'down';
}

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly initials: string;
  readonly status: 'Completed' | 'Processing' | 'Cancelled';
  readonly amount: string;
}

/**
 * Admin shell: collapsible sidebar, top bar, and a content area with a stat row and a
 * table.
 *
 * This is a layout, not a finished product. It is the arrangement — where navigation
 * lives, what the content area is responsible for, which Volt components fit each slot —
 * with the styling kept to the theme's own tokens so that dropping your screens into it
 * does not mean unpicking someone else's decoration first.
 *
 * Everything variable is a plain array at the bottom. Replace those with your data and
 * the template stops being an example and starts being your dashboard; the alternative,
 * four hand-written stat cards, means editing the same markup four times to change it
 * once.
 *
 * Avatars use initials rather than photographs on purpose. A layout that reaches out to
 * an avatar service the moment it renders is a network dependency and a privacy leak
 * that you inherit by copying it, for placeholder faces nobody keeps.
 */
@Component({
  selector: 'app-admin-dashboard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltSidebar,
    VoltSidebarHeader,
    VoltSidebarContent,
    VoltSidebarGroup,
    VoltSidebarItem,
    VoltSidebarFooter,
    VoltAvatar,
    VoltAvatarFallback,
    VoltSeparator,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltInput,
    VoltTable,
    VoltTableHeader,
    VoltTableBody,
    VoltTableRow,
    VoltTableHead,
    VoltTableCell,
    LmnHomeIcon,
    LmnGridIcon,
    LmnUserIcon,
    LmnMailIcon,
    LmnSettingsIcon,
    LmnMenuIcon,
  ],
  template: `
    <!-- A fixed height and a border because this renders inside a documentation page. In
         your app the shell is the page: use h-screen and drop the border. -->
    <div class="relative flex h-[640px] overflow-hidden border border-border bg-background">
      <div class="absolute left-4 top-3 z-10 md:hidden">
        <button volt-button variant="outline" size="icon" (click)="sidebar.toggleMobile()">
          <lmn-menu [size]="16" />
        </button>
      </div>

      <volt-sidebar>
        <volt-sidebar-header>
          <div class="flex h-full items-center gap-2 overflow-hidden">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            >
              A
            </span>
            @if (!sidebar.isCollapsed()) {
              <span class="truncate text-sm font-semibold">Acme Admin</span>
            }
          </div>
        </volt-sidebar-header>

        <volt-sidebar-content>
          @for (group of navigation; track group.heading; let last = $last) {
            <volt-sidebar-group [label]="group.heading">
              @for (item of group.items; track item.label) {
                <!-- Point these at your own routes. They resolve to this page here so the
                     demo has somewhere to go. -->
                <volt-sidebar-item [routerLink]="item.route" [label]="item.label">
                  @switch (item.icon) {
                    @case ('home') {
                      <lmn-home slot="icon" [size]="16" />
                    }
                    @case ('grid') {
                      <lmn-grid slot="icon" [size]="16" />
                    }
                    @case ('user') {
                      <lmn-user slot="icon" [size]="16" />
                    }
                    @case ('mail') {
                      <lmn-mail slot="icon" [size]="16" />
                    }
                    @case ('settings') {
                      <lmn-settings slot="icon" [size]="16" />
                    }
                  }
                  @if (item.badge) {
                    <span
                      slot="trailing"
                      class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
                    >
                      {{ item.badge }}
                    </span>
                  }
                </volt-sidebar-item>
              }
            </volt-sidebar-group>

            @if (!last) {
              <div class="my-2 px-3"><volt-separator /></div>
            }
          }
        </volt-sidebar-content>

        <volt-sidebar-footer>
          <div class="flex items-center gap-3">
            <volt-avatar>
              <volt-avatar-fallback class="text-xs">AD</volt-avatar-fallback>
            </volt-avatar>
            @if (!sidebar.isCollapsed()) {
              <div class="flex flex-col truncate">
                <span class="truncate text-sm font-medium">Admin User</span>
                <span class="truncate text-xs text-muted-foreground">admin&#64;acme.com</span>
              </div>
            }
          </div>
        </volt-sidebar-footer>
      </volt-sidebar>

      <div class="flex min-w-0 flex-1 flex-col">
        <!-- Top bar: collapse control, breadcrumb, and whatever your app puts on the right. -->
        <header class="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:px-6">
          <button
            volt-button
            variant="ghost"
            size="icon"
            class="hidden h-8 w-8 md:inline-flex"
            aria-label="Toggle sidebar"
            (click)="sidebar.toggleCollapse()"
          >
            <lmn-menu [size]="16" />
          </button>

          <nav class="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <span>Dashboard</span>
            <span aria-hidden="true">/</span>
            <span class="font-medium text-foreground">Overview</span>
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <volt-input class="hidden w-56 sm:block" placeholder="Search…" ariaLabel="Search" />
            <volt-avatar class="md:hidden">
              <volt-avatar-fallback class="text-xs">AD</volt-avatar-fallback>
            </volt-avatar>
          </div>
        </header>

        <!-- Content area. This is the part you replace. -->
        <main class="min-h-0 flex-1 space-y-6 overflow-auto bg-muted/20 p-4 md:p-6">
          <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            @for (stat of stats; track stat.label) {
              <volt-card class="p-4">
                <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
                <p class="mt-1 text-2xl font-bold tracking-tight tabular-nums">{{ stat.value }}</p>
                <p
                  class="mt-1 text-xs"
                  [class]="stat.direction === 'up' ? 'text-success' : 'text-destructive'"
                >
                  {{ stat.delta }}
                </p>
              </volt-card>
            }
          </section>

          <section class="space-y-4">
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold tracking-tight">Recent orders</h2>
              <volt-button variant="outline" size="sm">View all</volt-button>
            </div>

            <volt-card class="overflow-hidden">
              <div class="overflow-x-auto">
                <volt-table>
                  <volt-table-header>
                    <volt-table-row>
                      <volt-table-head>Order</volt-table-head>
                      <volt-table-head>Customer</volt-table-head>
                      <volt-table-head>Status</volt-table-head>
                      <volt-table-head class="text-right">Amount</volt-table-head>
                    </volt-table-row>
                  </volt-table-header>
                  <volt-table-body>
                    @for (order of orders; track order.id) {
                      <volt-table-row>
                        <volt-table-cell class="font-medium">{{ order.id }}</volt-table-cell>
                        <volt-table-cell>
                          <div class="flex items-center gap-2">
                            <volt-avatar class="h-7 w-7">
                              <volt-avatar-fallback class="text-[10px]">
                                {{ order.initials }}
                              </volt-avatar-fallback>
                            </volt-avatar>
                            <span class="text-sm">{{ order.customer }}</span>
                          </div>
                        </volt-table-cell>
                        <volt-table-cell>
                          <volt-badge [variant]="badgeVariant(order.status)">
                            {{ order.status }}
                          </volt-badge>
                        </volt-table-cell>
                        <volt-table-cell class="text-right tabular-nums">
                          {{ order.amount }}
                        </volt-table-cell>
                      </volt-table-row>
                    }
                  </volt-table-body>
                </volt-table>
              </div>
            </volt-card>
          </section>
        </main>
      </div>
    </div>
  `,
})
export class AdminDashboardLayout {
  protected readonly sidebar = inject(VoltSidebarService);

  protected readonly navigation: readonly { heading: string; items: readonly NavItem[] }[] = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/docs/layouts/admin-dashboard' },
        { label: 'Analytics', icon: 'grid', route: '/docs/layouts/analytics' },
      ],
    },
    {
      heading: 'Management',
      items: [
        { label: 'Customers', icon: 'user', route: '/docs/layouts/profile' },
        { label: 'Messages', icon: 'mail', route: '/docs/layouts/chat', badge: '12' },
        { label: 'Settings', icon: 'settings', route: '/docs/layouts/settings' },
      ],
    },
  ];

  protected readonly stats: readonly Stat[] = [
    { label: 'Total revenue', value: '$45,231', delta: '+20.1% from last month', direction: 'up' },
    { label: 'Active users', value: '2,350', delta: '+180 this week', direction: 'up' },
    { label: 'Orders', value: '1,247', delta: '-5.2% from last month', direction: 'down' },
    { label: 'Conversion', value: '3.24%', delta: '+0.8% improvement', direction: 'up' },
  ];

  protected readonly orders: readonly Order[] = [
    {
      id: '#ORD-7352',
      customer: 'John Doe',
      initials: 'JD',
      status: 'Completed',
      amount: '$250.00',
    },
    {
      id: '#ORD-7353',
      customer: 'Sarah Miller',
      initials: 'SM',
      status: 'Processing',
      amount: '$150.00',
    },
    {
      id: '#ORD-7354',
      customer: 'Mike Kim',
      initials: 'MK',
      status: 'Cancelled',
      amount: '$450.00',
    },
    {
      id: '#ORD-7355',
      customer: 'Anna Lee',
      initials: 'AL',
      status: 'Completed',
      amount: '$890.00',
    },
  ];

  protected badgeVariant(status: Order['status']): 'solid' | 'secondary' | 'destructive' {
    switch (status) {
      case 'Completed':
        return 'solid';
      case 'Processing':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
    }
  }
}
