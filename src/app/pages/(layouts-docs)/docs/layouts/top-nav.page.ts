import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltSeparator,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltInput,
} from 'volt';
import { LmnSearchIcon } from 'lumen-icons';

@Component({
  selector: 'app-top-nav-demo',
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltSeparator,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltInput,
    LmnSearchIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-[700px] border border-border rounded-lg overflow-hidden flex flex-col bg-background relative"
    >
      <!-- Top Navigation Bar -->
      <header
        class="h-16 border-b border-border bg-card/50 flex items-center justify-between px-4 md:px-6 shrink-0"
      >
        <div class="flex items-center gap-8">
          <!-- Logo -->
          <div class="flex items-center gap-2">
            <div
              class="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm"
            >
              T
            </div>
            <span class="font-semibold text-lg hidden sm:block">TopNav App</span>
          </div>

          <!-- Nav Links -->
          <nav class="hidden md:flex items-center gap-1">
            <button volt-button variant="ghost" size="sm" class="text-foreground font-medium">
              Dashboard
            </button>
            <button volt-button variant="ghost" size="sm">Projects</button>
            <button volt-button variant="ghost" size="sm">Team</button>
            <button volt-button variant="ghost" size="sm">Reports</button>
          </nav>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <volt-input placeholder="Search..." class="w-40 h-8 text-xs hidden sm:block" />
          <volt-button variant="outline" size="sm" class="hidden sm:inline-flex">
            <lmn-search class="h-3.5 w-3.5 mr-1" />
            Search
          </volt-button>
          <volt-separator orientation="vertical" class="h-6 hidden sm:block" />
          <volt-button variant="ghost" size="icon" class="h-8 w-8 relative">
            <span
              class="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background"
            ></span>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </volt-button>
          <volt-avatar class="h-8 w-8">
            <img voltAvatarImage src="https://i.pravatar.cc/150?u=user" alt="User" />
            <volt-avatar-fallback>US</volt-avatar-fallback>
          </volt-avatar>
        </div>
      </header>

      <!-- Sub Navigation / Breadcrumbs -->
      <div class="h-10 border-b border-border bg-muted/30 flex items-center px-4 md:px-6 shrink-0">
        <nav class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="hover:text-foreground cursor-pointer">Home</span>
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span class="hover:text-foreground cursor-pointer">Projects</span>
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span class="text-foreground font-medium">Project Alpha</span>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto bg-muted/20 p-6">
        <div class="space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Project Overview</h1>
              <p class="text-sm text-muted-foreground mt-1">
                Manage your project tasks and team progress.
              </p>
            </div>
            <div class="flex gap-2">
              <volt-button variant="outline" size="sm">Export</volt-button>
              <volt-button size="sm">New Task</volt-button>
            </div>
          </div>

          <!-- Tabs -->
          <volt-tabs defaultValue="overview">
            <volt-tabs-list class="w-full justify-start">
              <volt-tabs-trigger value="overview">Overview</volt-tabs-trigger>
              <volt-tabs-trigger value="tasks">Tasks</volt-tabs-trigger>
              <volt-tabs-trigger value="team">Team</volt-tabs-trigger>
              <volt-tabs-trigger value="settings">Settings</volt-tabs-trigger>
            </volt-tabs-list>

            <volt-tabs-content value="overview" class="space-y-4 mt-4">
              <!-- Stats Row -->
              <div class="grid gap-4 md:grid-cols-3">
                <volt-card class="p-4">
                  <p class="text-sm text-muted-foreground">Total Tasks</p>
                  <p class="text-3xl font-bold mt-1">48</p>
                  <div class="flex items-center gap-2 mt-2">
                    <volt-badge variant="solid">12 done</volt-badge>
                    <volt-badge variant="secondary">36 left</volt-badge>
                  </div>
                </volt-card>
                <volt-card class="p-4">
                  <p class="text-sm text-muted-foreground">In Progress</p>
                  <p class="text-3xl font-bold mt-1">18</p>
                  <div class="flex items-center gap-2 mt-2">
                    <volt-badge variant="outline">High: 5</volt-badge>
                  </div>
                </volt-card>
                <volt-card class="p-4">
                  <p class="text-sm text-muted-foreground">Team Members</p>
                  <p class="text-3xl font-bold mt-1">7</p>
                  <div class="flex -space-x-2 mt-2">
                    <volt-avatar class="h-6 w-6 border-2 border-background">
                      <img voltAvatarImage src="https://i.pravatar.cc/150?u=1" alt="A" />
                      <volt-avatar-fallback>A</volt-avatar-fallback>
                    </volt-avatar>
                    <volt-avatar class="h-6 w-6 border-2 border-background">
                      <img voltAvatarImage src="https://i.pravatar.cc/150?u=2" alt="B" />
                      <volt-avatar-fallback>B</volt-avatar-fallback>
                    </volt-avatar>
                    <volt-avatar class="h-6 w-6 border-2 border-background">
                      <img voltAvatarImage src="https://i.pravatar.cc/150?u=3" alt="C" />
                      <volt-avatar-fallback>C</volt-avatar-fallback>
                    </volt-avatar>
                    <div
                      class="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium"
                    >
                      +4
                    </div>
                  </div>
                </volt-card>
              </div>

              <!-- Recent Activity -->
              <volt-card class="p-4">
                <h3 class="font-semibold mb-4">Recent Activity</h3>
                <div class="space-y-3">
                  @for (activity of activities(); track activity.id) {
                    <div class="flex items-start gap-3">
                      <volt-avatar class="h-8 w-8 mt-0.5">
                        <img voltAvatarImage [src]="activity.avatar" [alt]="activity.initials" />
                        <volt-avatar-fallback>{{ activity.initials }}</volt-avatar-fallback>
                      </volt-avatar>
                      <div class="flex-1">
                        <p class="text-sm">
                          <span class="font-medium">{{ activity.user }}</span>
                          {{ activity.action }}
                          <span class="font-medium text-primary">{{ activity.target }}</span>
                        </p>
                        <p class="text-xs text-muted-foreground mt-0.5">{{ activity.time }}</p>
                      </div>
                      <volt-badge [variant]="activity.statusVariant">{{
                        activity.status
                      }}</volt-badge>
                    </div>
                    @if (!$last) {
                      <volt-separator />
                    }
                  }
                </div>
              </volt-card>
            </volt-tabs-content>

            <volt-tabs-content value="tasks" class="mt-4">
              <volt-card class="overflow-hidden">
                <div class="overflow-x-auto">
                  <volt-table>
                    <volt-table-header>
                      <volt-table-row>
                        <volt-table-head>Task</volt-table-head>
                        <volt-table-head>Assignee</volt-table-head>
                        <volt-table-head>Priority</volt-table-head>
                        <volt-table-head>Status</volt-table-head>
                      </volt-table-row>
                    </volt-table-header>
                    <volt-table-body>
                      <volt-table-row>
                        <volt-table-cell class="font-medium">Design System</volt-table-cell>
                        <volt-table-cell>
                          <div class="flex items-center gap-2">
                            <volt-avatar class="h-6 w-6">
                              <img voltAvatarImage src="https://i.pravatar.cc/150?u=1" alt="JD" />
                              <volt-avatar-fallback>JD</volt-avatar-fallback>
                            </volt-avatar>
                            <span class="text-sm">John Doe</span>
                          </div>
                        </volt-table-cell>
                        <volt-table-cell
                          ><volt-badge variant="destructive">High</volt-badge></volt-table-cell
                        >
                        <volt-table-cell
                          ><volt-badge variant="solid">Done</volt-badge></volt-table-cell
                        >
                      </volt-table-row>
                      <volt-table-row>
                        <volt-table-cell class="font-medium">API Integration</volt-table-cell>
                        <volt-table-cell>
                          <div class="flex items-center gap-2">
                            <volt-avatar class="h-6 w-6">
                              <img voltAvatarImage src="https://i.pravatar.cc/150?u=2" alt="SM" />
                              <volt-avatar-fallback>SM</volt-avatar-fallback>
                            </volt-avatar>
                            <span class="text-sm">Sarah Miller</span>
                          </div>
                        </volt-table-cell>
                        <volt-table-cell
                          ><volt-badge variant="secondary">Medium</volt-badge></volt-table-cell
                        >
                        <volt-table-cell
                          ><volt-badge variant="secondary">In Progress</volt-badge></volt-table-cell
                        >
                      </volt-table-row>
                      <volt-table-row>
                        <volt-table-cell class="font-medium">User Testing</volt-table-cell>
                        <volt-table-cell>
                          <div class="flex items-center gap-2">
                            <volt-avatar class="h-6 w-6">
                              <img voltAvatarImage src="https://i.pravatar.cc/150?u=3" alt="MK" />
                              <volt-avatar-fallback>MK</volt-avatar-fallback>
                            </volt-avatar>
                            <span class="text-sm">Mike Kim</span>
                          </div>
                        </volt-table-cell>
                        <volt-table-cell
                          ><volt-badge variant="outline">Low</volt-badge></volt-table-cell
                        >
                        <volt-table-cell
                          ><volt-badge variant="outline">Pending</volt-badge></volt-table-cell
                        >
                      </volt-table-row>
                    </volt-table-body>
                  </volt-table>
                </div>
              </volt-card>
            </volt-tabs-content>

            <volt-tabs-content value="team" class="mt-4">
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                @for (member of teamMembers(); track member.id) {
                  <volt-card class="p-4">
                    <div class="flex items-center gap-3">
                      <volt-avatar>
                        <img voltAvatarImage [src]="member.avatar" [alt]="member.initials" />
                        <volt-avatar-fallback>{{ member.initials }}</volt-avatar-fallback>
                      </volt-avatar>
                      <div>
                        <p class="font-medium text-sm">{{ member.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ member.role }}</p>
                      </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                      <volt-badge [variant]="member.status === 'Active' ? 'solid' : 'secondary'">{{
                        member.status
                      }}</volt-badge>
                      <span class="text-xs text-muted-foreground">{{ member.tasks }} tasks</span>
                    </div>
                  </volt-card>
                }
              </div>
            </volt-tabs-content>

            <volt-tabs-content value="settings" class="mt-4">
              <volt-card class="p-6 max-w-lg">
                <h3 class="font-semibold mb-4">Project Settings</h3>
                <div class="space-y-4">
                  <div>
                    <label for="project-name" class="text-sm font-medium">Project Name</label>
                    <volt-input id="project-name" value="Project Alpha" class="mt-1" />
                  </div>
                  <div>
                    <label for="project-description" class="text-sm font-medium">Description</label>
                    <volt-input
                      id="project-description"
                      value="Main product development"
                      class="mt-1"
                    />
                  </div>
                  <div class="flex items-center justify-between pt-2">
                    <span class="text-sm">Public Project</span>
                    <volt-button variant="outline" size="sm">Toggle</volt-button>
                  </div>
                  <volt-separator />
                  <div class="flex justify-end gap-2">
                    <volt-button variant="outline" size="sm">Cancel</volt-button>
                    <volt-button size="sm">Save Changes</volt-button>
                  </div>
                </div>
              </volt-card>
            </volt-tabs-content>
          </volt-tabs>
        </div>
      </div>
    </div>
  `,
})
class TopNavDemo {
  readonly activities = signal([
    {
      id: 1,
      user: 'John Doe',
      action: 'completed task',
      target: 'Design System',
      time: '2 minutes ago',
      status: 'Done',
      statusVariant: 'solid' as const,
      avatar: 'https://i.pravatar.cc/150?u=1',
      initials: 'JD',
    },
    {
      id: 2,
      user: 'Sarah Miller',
      action: 'commented on',
      target: 'API Integration',
      time: '15 minutes ago',
      status: 'New',
      statusVariant: 'secondary' as const,
      avatar: 'https://i.pravatar.cc/150?u=2',
      initials: 'SM',
    },
    {
      id: 3,
      user: 'Mike Kim',
      action: 'created task',
      target: 'User Testing',
      time: '1 hour ago',
      status: 'Open',
      statusVariant: 'outline' as const,
      avatar: 'https://i.pravatar.cc/150?u=3',
      initials: 'MK',
    },
    {
      id: 4,
      user: 'Anna Lee',
      action: 'updated',
      target: 'Project Timeline',
      time: '3 hours ago',
      status: 'Done',
      statusVariant: 'solid' as const,
      avatar: 'https://i.pravatar.cc/150?u=4',
      initials: 'AL',
    },
  ]);

  readonly teamMembers = signal([
    {
      id: 1,
      name: 'John Doe',
      role: 'Lead Developer',
      status: 'Active',
      tasks: 12,
      avatar: 'https://i.pravatar.cc/150?u=1',
      initials: 'JD',
    },
    {
      id: 2,
      name: 'Sarah Miller',
      role: 'Designer',
      status: 'Active',
      tasks: 8,
      avatar: 'https://i.pravatar.cc/150?u=2',
      initials: 'SM',
    },
    {
      id: 3,
      name: 'Mike Kim',
      role: 'Backend Dev',
      status: 'Away',
      tasks: 5,
      avatar: 'https://i.pravatar.cc/150?u=3',
      initials: 'MK',
    },
    {
      id: 4,
      name: 'Anna Lee',
      role: 'Product Owner',
      status: 'Active',
      tasks: 15,
      avatar: 'https://i.pravatar.cc/150?u=4',
      initials: 'AL',
    },
    {
      id: 5,
      name: 'Robert Johnson',
      role: 'QA Engineer',
      status: 'Active',
      tasks: 6,
      avatar: 'https://i.pravatar.cc/150?u=5',
      initials: 'RJ',
    },
    {
      id: 6,
      name: 'Lisa Chen',
      role: 'Frontend Dev',
      status: 'Away',
      tasks: 9,
      avatar: 'https://i.pravatar.cc/150?u=6',
      initials: 'LC',
    },
  ]);
}

@Component({
  selector: 'app-docs-top-nav',
  imports: [TopNavDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Top Navigation</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A dashboard layout with a fixed top navigation bar, sub-navigation breadcrumbs, and tabbed
        content.
      </p>

      <app-top-nav-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout uses a fixed header with navigation links, breadcrumbs, and notification
          icons. The main content area uses tabs to organize different views. Ideal for SaaS
          applications and project management tools.
        </p>
      </div>
    </div>
  `,
})
export default class DocsTopNav {}
