import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltBadge,
  VoltButton,
  VoltCard,
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
  VoltProgress,
  VoltInput,
} from 'volt';
import {
  IconAvatar,
  IconComponents,
  IconHome,
  IconMail,
  IconMenu,
  IconSearch,
  IconSettings,
} from '../../../../icons';

@Component({
  selector: 'app-admin-dashboard-demo',
  imports: [
    VoltSidebar,
    VoltSidebarContent,
    VoltSidebarFooter,
    VoltSidebarGroup,
    VoltSidebarHeader,
    VoltSidebarItem,
    VoltAvatar,
    VoltAvatarImage,
    VoltAvatarFallback,
    VoltSeparator,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltProgress,
    VoltInput,
    IconHome,
    IconSettings,
    IconMail,
    IconAvatar,
    IconComponents,
    IconMenu,
    IconSearch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-[700px] border border-border rounded-lg overflow-hidden flex bg-background relative"
    >
      <!-- Mobile trigger -->
      <div class="absolute top-4 left-4 z-10 md:hidden">
        <button volt-button variant="outline" size="icon" (click)="sidebarService.toggleMobile()">
          <icon-menu class="h-4 w-4" />
        </button>
      </div>

      <!-- Sidebar -->
      <volt-sidebar>
        <volt-sidebar-header>
          <div class="flex items-center w-full justify-between gap-2 h-full">
            <div class="flex items-center gap-2 overflow-hidden">
              <div
                class="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0"
              >
                A
              </div>
              @if (!sidebarService.isCollapsed()) {
                <span class="font-semibold text-sm truncate">Admin Pro</span>
              }
            </div>
          </div>
        </volt-sidebar-header>

        <volt-sidebar-content>
          <volt-sidebar-group label="Overview">
            <volt-sidebar-item
              routerLink="/docs/layouts/admin-dashboard"
              [exact]="true"
              label="Dashboard"
            >
              <icon-home slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/admin-dashboard" label="Analytics">
              <icon-components slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
          </volt-sidebar-group>

          <div class="px-3 my-2">
            <volt-separator />
          </div>

          <volt-sidebar-group label="Management">
            <volt-sidebar-item routerLink="/docs/layouts/admin-dashboard" label="Users">
              <icon-avatar slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/admin-dashboard" label="Messages">
              <icon-mail slot="icon" class="h-4 w-4" />
              <div
                slot="trailing"
                class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
              >
                12
              </div>
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/admin-dashboard" label="Settings">
              <icon-settings slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
          </volt-sidebar-group>
        </volt-sidebar-content>

        <volt-sidebar-footer>
          <div class="flex items-center gap-3">
            <volt-avatar>
              <img voltAvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
              <volt-avatar-fallback>AD</volt-avatar-fallback>
            </volt-avatar>
            @if (!sidebarService.isCollapsed()) {
              <div class="flex flex-col truncate">
                <span class="text-sm font-medium">Admin User</span>
                <span class="text-xs text-muted-foreground">admin&#64;example.com</span>
              </div>
            }
          </div>
        </volt-sidebar-footer>
      </volt-sidebar>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto bg-muted/20">
        <!-- Header -->
        <div class="h-14 border-b border-border flex items-center justify-between px-4 md:px-6">
          <div class="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <button
              volt-button
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              (click)="sidebarService.toggleCollapse()"
            >
              <icon-menu class="h-4 w-4" />
            </button>
            <volt-separator orientation="vertical" class="h-4 mx-2" />
            <span>Dashboard</span>
            <span>/</span>
            <span class="text-foreground font-medium">Overview</span>
          </div>
          <div class="flex items-center gap-2 ml-auto">
            <volt-input placeholder="Search..." class="w-48 h-8 text-xs" />
            <volt-button variant="outline" size="sm">
              <icon-search class="h-3.5 w-3.5 mr-1" />
              Search
            </volt-button>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div class="p-6 space-y-6">
          <!-- Stats Cards -->
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <volt-card class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Total Revenue</p>
                  <p class="text-2xl font-bold mt-1">$45,231</p>
                  <p class="text-xs text-success mt-1">+20.1% from last month</p>
                </div>
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-lg">💰</span>
                </div>
              </div>
            </volt-card>

            <volt-card class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Active Users</p>
                  <p class="text-2xl font-bold mt-1">2,350</p>
                  <p class="text-xs text-success mt-1">+180 this week</p>
                </div>
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-lg">👥</span>
                </div>
              </div>
            </volt-card>

            <volt-card class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Orders</p>
                  <p class="text-2xl font-bold mt-1">1,247</p>
                  <p class="text-xs text-destructive mt-1">-5.2% from last month</p>
                </div>
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-lg">📦</span>
                </div>
              </div>
            </volt-card>

            <volt-card class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Conversion</p>
                  <p class="text-2xl font-bold mt-1">3.24%</p>
                  <p class="text-xs text-success mt-1">+0.8% improvement</p>
                </div>
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-lg">📈</span>
                </div>
              </div>
            </volt-card>
          </div>

          <!-- Recent Activity Table -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Recent Orders</h2>
              <volt-button variant="outline" size="sm">View All</volt-button>
            </div>
            <volt-card class="overflow-hidden">
              <div class="overflow-x-auto">
                <volt-table>
                  <volt-table-header>
                    <volt-table-row>
                      <volt-table-head>Order ID</volt-table-head>
                      <volt-table-head>Customer</volt-table-head>
                      <volt-table-head>Status</volt-table-head>
                      <volt-table-head>Amount</volt-table-head>
                      <volt-table-head class="text-right">Progress</volt-table-head>
                    </volt-table-row>
                  </volt-table-header>
                  <volt-table-body>
                    <volt-table-row>
                      <volt-table-cell class="font-medium">#ORD-7352</volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-2">
                          <volt-avatar>
                            <img
                              voltAvatarImage
                              src="https://i.pravatar.cc/150?u=1"
                              alt="John Doe"
                            />
                            <volt-avatar-fallback>JD</volt-avatar-fallback>
                          </volt-avatar>
                          <span class="text-sm">John Doe</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell>
                        <volt-badge variant="solid">Completed</volt-badge>
                      </volt-table-cell>
                      <volt-table-cell>$250.00</volt-table-cell>
                      <volt-table-cell class="text-right">
                        <volt-progress [value]="100" class="w-24 ml-auto" />
                      </volt-table-cell>
                    </volt-table-row>
                    <volt-table-row>
                      <volt-table-cell class="font-medium">#ORD-7353</volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-2">
                          <volt-avatar>
                            <img
                              voltAvatarImage
                              src="https://i.pravatar.cc/150?u=2"
                              alt="Sarah Miller"
                            />
                            <volt-avatar-fallback>SM</volt-avatar-fallback>
                          </volt-avatar>
                          <span class="text-sm">Sarah Miller</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell>
                        <volt-badge variant="secondary">Processing</volt-badge>
                      </volt-table-cell>
                      <volt-table-cell>$150.00</volt-table-cell>
                      <volt-table-cell class="text-right">
                        <volt-progress [value]="60" class="w-24 ml-auto" />
                      </volt-table-cell>
                    </volt-table-row>
                    <volt-table-row>
                      <volt-table-cell class="font-medium">#ORD-7354</volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-2">
                          <volt-avatar>
                            <img
                              voltAvatarImage
                              src="https://i.pravatar.cc/150?u=3"
                              alt="Mike Kim"
                            />
                            <volt-avatar-fallback>MK</volt-avatar-fallback>
                          </volt-avatar>
                          <span class="text-sm">Mike Kim</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell>
                        <volt-badge variant="destructive">Cancelled</volt-badge>
                      </volt-table-cell>
                      <volt-table-cell>$450.00</volt-table-cell>
                      <volt-table-cell class="text-right">
                        <volt-progress [value]="0" class="w-24 ml-auto" />
                      </volt-table-cell>
                    </volt-table-row>
                    <volt-table-row>
                      <volt-table-cell class="font-medium">#ORD-7355</volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-2">
                          <volt-avatar>
                            <img
                              voltAvatarImage
                              src="https://i.pravatar.cc/150?u=4"
                              alt="Anna Lee"
                            />
                            <volt-avatar-fallback>AL</volt-avatar-fallback>
                          </volt-avatar>
                          <span class="text-sm">Anna Lee</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell>
                        <volt-badge variant="solid">Completed</volt-badge>
                      </volt-table-cell>
                      <volt-table-cell>$890.00</volt-table-cell>
                      <volt-table-cell class="text-right">
                        <volt-progress [value]="100" class="w-24 ml-auto" />
                      </volt-table-cell>
                    </volt-table-row>
                    <volt-table-row>
                      <volt-table-cell class="font-medium">#ORD-7356</volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-2">
                          <volt-avatar>
                            <img
                              voltAvatarImage
                              src="https://i.pravatar.cc/150?u=5"
                              alt="Robert Johnson"
                            />
                            <volt-avatar-fallback>RJ</volt-avatar-fallback>
                          </volt-avatar>
                          <span class="text-sm">Robert Johnson</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell>
                        <volt-badge variant="outline">Pending</volt-badge>
                      </volt-table-cell>
                      <volt-table-cell>$75.00</volt-table-cell>
                      <volt-table-cell class="text-right">
                        <volt-progress [value]="25" class="w-24 ml-auto" />
                      </volt-table-cell>
                    </volt-table-row>
                  </volt-table-body>
                </volt-table>
              </div>
            </volt-card>
          </div>
        </div>
      </div>
    </div>
  `,
})
class AdminDashboardDemo {
  sidebarService = inject(VoltSidebarService);
}

@Component({
  selector: 'app-docs-admin-dashboard',
  imports: [AdminDashboardDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A complete admin dashboard layout with sidebar navigation, stats cards, and data tables.
      </p>

      <app-admin-dashboard-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout combines the <code>VoltSidebar</code> component with stats cards, data tables,
          and progress indicators. Copy the code and adapt it to your needs. The sidebar service
          handles responsive behavior automatically.
        </p>
      </div>
    </div>
  `,
})
export default class DocsAdminDashboard {}
