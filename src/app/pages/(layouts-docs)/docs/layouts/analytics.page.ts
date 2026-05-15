import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltProgress,
  VoltSeparator,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltInput,
} from 'volt';

@Component({
  selector: 'app-analytics-demo',
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltProgress,
    VoltSeparator,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-[700px] border border-border rounded-lg overflow-hidden flex flex-col bg-background relative"
    >
      <!-- Compact Header -->
      <header
        class="h-14 border-b border-border bg-card/50 flex items-center justify-between px-4 md:px-6 shrink-0"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div
              class="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs"
            >
              A
            </div>
            <span class="font-semibold hidden sm:block">Analytics</span>
          </div>
          <volt-separator orientation="vertical" class="h-5 hidden sm:block" />
          <nav class="hidden md:flex items-center gap-1">
            <button volt-button variant="ghost" size="sm" class="text-foreground font-medium">
              Overview
            </button>
            <button volt-button variant="ghost" size="sm">Realtime</button>
            <button volt-button variant="ghost" size="sm">Audience</button>
          </nav>
        </div>
        <div class="flex items-center gap-2">
          <volt-input placeholder="Search metrics..." class="w-36 h-8 text-xs hidden sm:block" />
          <volt-button variant="outline" size="sm">Last 7 days</volt-button>
          <volt-avatar class="h-8 w-8">
            <img voltAvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
            <volt-avatar-fallback>AD</volt-avatar-fallback>
          </volt-avatar>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto bg-muted/20 p-4 md:p-6">
        <div class="space-y-6">
          <!-- KPI Grid -->
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Metric 1 -->
            <volt-card class="p-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-3 opacity-10">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                  />
                </svg>
              </div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Page Views
              </p>
              <p class="text-2xl font-bold mt-1">124.5K</p>
              <div class="flex items-center gap-1 mt-2">
                <svg
                  class="h-3 w-3 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span class="text-xs text-success font-medium">+12.5%</span>
                <span class="text-xs text-muted-foreground">vs last week</span>
              </div>
            </volt-card>

            <!-- Metric 2 -->
            <volt-card class="p-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-3 opacity-10">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </svg>
              </div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Conversions
              </p>
              <p class="text-2xl font-bold mt-1">3,842</p>
              <div class="flex items-center gap-1 mt-2">
                <svg
                  class="h-3 w-3 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span class="text-xs text-success font-medium">+8.2%</span>
                <span class="text-xs text-muted-foreground">vs last week</span>
              </div>
            </volt-card>

            <!-- Metric 3 -->
            <volt-card class="p-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-3 opacity-10">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Active Users
              </p>
              <p class="text-2xl font-bold mt-1">8,932</p>
              <div class="flex items-center gap-1 mt-2">
                <svg
                  class="h-3 w-3 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span class="text-xs text-destructive font-medium">-2.1%</span>
                <span class="text-xs text-muted-foreground">vs last week</span>
              </div>
            </volt-card>

            <!-- Metric 4 -->
            <volt-card class="p-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-3 opacity-10">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                  />
                </svg>
              </div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Avg. Session
              </p>
              <p class="text-2xl font-bold mt-1">4m 32s</p>
              <div class="flex items-center gap-1 mt-2">
                <svg
                  class="h-3 w-3 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span class="text-xs text-success font-medium">+18.4%</span>
                <span class="text-xs text-muted-foreground">vs last week</span>
              </div>
            </volt-card>
          </div>

          <!-- Two Column Layout -->
          <div class="grid gap-4 lg:grid-cols-3">
            <!-- Traffic Sources -->
            <volt-card class="p-4 lg:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">Traffic Sources</h3>
                <volt-button variant="ghost" size="sm">View Report</volt-button>
              </div>
              <div class="space-y-4">
                @for (source of trafficSources(); track source.name) {
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">{{ source.name }}</span>
                        <volt-badge variant="outline" class="text-[10px]"
                          >{{ source.percentage }}%</volt-badge
                        >
                      </div>
                      <span class="text-sm text-muted-foreground">{{ source.visits }} visits</span>
                    </div>
                    <volt-progress [value]="source.percentage" />
                  </div>
                }
              </div>
            </volt-card>

            <!-- Top Pages -->
            <volt-card class="p-4">
              <h3 class="font-semibold mb-4">Top Pages</h3>
              <div class="space-y-3">
                @for (page of topPages(); track page.path) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xs text-muted-foreground w-5">{{ $index + 1 }}</span>
                      <span class="text-sm truncate">{{ page.path }}</span>
                    </div>
                    <span class="text-sm font-medium">{{ page.views }}</span>
                  </div>
                  @if (!$last) {
                    <volt-separator />
                  }
                }
              </div>
            </volt-card>
          </div>

          <!-- Recent Users Table -->
          <volt-card class="overflow-hidden">
            <div class="p-4 border-b border-border flex items-center justify-between">
              <h3 class="font-semibold">Recent Users</h3>
              <volt-button variant="outline" size="sm">Export CSV</volt-button>
            </div>
            <div class="overflow-x-auto">
              <volt-table>
                <volt-table-header>
                  <volt-table-row>
                    <volt-table-head>User</volt-table-head>
                    <volt-table-head>Location</volt-table-head>
                    <volt-table-head>Device</volt-table-head>
                    <volt-table-head>Status</volt-table-head>
                    <volt-table-head class="text-right">Session</volt-table-head>
                  </volt-table-row>
                </volt-table-header>
                <volt-table-body>
                  @for (user of recentUsers(); track user.id) {
                    <volt-table-row>
                      <volt-table-cell>
                        <div class="flex items-center gap-2">
                          <volt-avatar class="h-7 w-7">
                            <img voltAvatarImage [src]="user.avatar" [alt]="user.initials" />
                            <volt-avatar-fallback>{{ user.initials }}</volt-avatar-fallback>
                          </volt-avatar>
                          <div>
                            <p class="text-sm font-medium">{{ user.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                          </div>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell class="text-sm">{{ user.location }}</volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-1.5">
                          <svg
                            class="h-3.5 w-3.5 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            @if (user.device === 'Desktop') {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            } @else {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            }
                          </svg>
                          <span class="text-sm">{{ user.device }}</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell>
                        <div class="flex items-center gap-1.5">
                          <span
                            class="h-2 w-2 rounded-full"
                            [class.bg-success]="user.status === 'Online'"
                            [class.bg-muted]="user.status === 'Offline'"
                          ></span>
                          <span class="text-sm">{{ user.status }}</span>
                        </div>
                      </volt-table-cell>
                      <volt-table-cell class="text-right text-sm">{{
                        user.session
                      }}</volt-table-cell>
                    </volt-table-row>
                  }
                </volt-table-body>
              </volt-table>
            </div>
          </volt-card>
        </div>
      </div>
    </div>
  `,
})
class AnalyticsDemo {
  readonly trafficSources = signal([
    { name: 'Direct', percentage: 42, visits: '52,290' },
    { name: 'Organic Search', percentage: 28, visits: '34,860' },
    { name: 'Social Media', percentage: 18, visits: '22,410' },
    { name: 'Referral', percentage: 8, visits: '9,960' },
    { name: 'Email', percentage: 4, visits: '4,980' },
  ]);

  readonly topPages = signal([
    { path: '/home', views: '45.2K' },
    { path: '/products', views: '32.1K' },
    { path: '/pricing', views: '18.7K' },
    { path: '/blog/getting-started', views: '12.4K' },
    { path: '/docs', views: '9.8K' },
  ]);

  readonly recentUsers = signal([
    {
      id: 1,
      name: 'Alice Cooper',
      email: 'alice@example.com',
      location: 'New York, USA',
      device: 'Desktop',
      status: 'Online',
      session: '12m 34s',
      avatar: 'https://i.pravatar.cc/150?u=11',
      initials: 'AC',
    },
    {
      id: 2,
      name: 'Bob Martin',
      email: 'bob@example.com',
      location: 'London, UK',
      device: 'Mobile',
      status: 'Offline',
      session: '5m 12s',
      avatar: 'https://i.pravatar.cc/150?u=12',
      initials: 'BM',
    },
    {
      id: 3,
      name: 'Carol White',
      email: 'carol@example.com',
      location: 'Toronto, CA',
      device: 'Desktop',
      status: 'Online',
      session: '28m 45s',
      avatar: 'https://i.pravatar.cc/150?u=13',
      initials: 'CW',
    },
    {
      id: 4,
      name: 'David Lee',
      email: 'david@example.com',
      location: 'Sydney, AU',
      device: 'Mobile',
      status: 'Online',
      session: '3m 22s',
      avatar: 'https://i.pravatar.cc/150?u=14',
      initials: 'DL',
    },
    {
      id: 5,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      location: 'Berlin, DE',
      device: 'Desktop',
      status: 'Offline',
      session: '15m 08s',
      avatar: 'https://i.pravatar.cc/150?u=15',
      initials: 'EW',
    },
  ]);
}

@Component({
  selector: 'app-docs-analytics',
  imports: [AnalyticsDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A compact analytics layout with KPI cards, traffic breakdowns, and user activity tables.
      </p>

      <app-analytics-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout features a compact header with a date range selector, KPI metric cards with
          trend indicators, progress bars for traffic sources, and a detailed user activity table.
          Great for analytics and monitoring dashboards.
        </p>
      </div>
    </div>
  `,
})
export default class DocsAnalytics {}
