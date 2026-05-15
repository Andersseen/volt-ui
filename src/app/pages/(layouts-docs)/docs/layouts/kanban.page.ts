import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltAvatar, VoltAvatarFallback, VoltAvatarImage, VoltBadge, VoltButton } from 'volt';

// ==========================================
// 1. Task Card
// ==========================================
@Component({
  selector: 'app-kanban-task',
  imports: [VoltAvatar, VoltAvatarFallback, VoltAvatarImage, VoltBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="p-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-grab"
    >
      <div class="flex items-start justify-between gap-2 mb-2">
        <volt-badge [variant]="priorityVariant()">{{ priority() }}</volt-badge>
        <button class="text-muted-foreground hover:text-foreground">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
      </div>
      <p class="text-sm font-medium mb-3">{{ title() }}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <svg
            class="h-3.5 w-3.5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="text-xs text-muted-foreground">{{ dueDate() }}</span>
        </div>
        <div class="flex -space-x-1.5">
          @for (assignee of assignees(); track assignee.id) {
            <volt-avatar class="h-5 w-5 border border-background">
              <img voltAvatarImage [src]="assignee.avatar" [alt]="assignee.initials" />
              <volt-avatar-fallback>{{ assignee.initials }}</volt-avatar-fallback>
            </volt-avatar>
          }
        </div>
      </div>
    </div>
  `,
})
export class KanbanTask {
  readonly title = input.required<string>();
  readonly priority = input.required<string>();
  readonly priorityVariant = input<'solid' | 'secondary' | 'destructive' | 'outline'>('secondary');
  readonly dueDate = input.required<string>();
  readonly assignees = input<{ id: number; avatar: string; initials: string }[]>([]);
}

// ==========================================
// 2. Kanban Column
// ==========================================
@Component({
  selector: 'app-kanban-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-80 shrink-0">
      <!-- Column Header -->
      <div class="flex items-center justify-between mb-3 px-1">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold">{{ title() }}</h3>
          <span
            class="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium"
            >{{ count() }}</span
          >
        </div>
        <button class="text-muted-foreground hover:text-foreground p-1 rounded">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <!-- Tasks -->
      <div class="flex-1 space-y-3 min-h-[100px]">
        <ng-content />
      </div>
    </div>
  `,
})
export class KanbanColumn {
  readonly title = input.required<string>();
  readonly count = input.required<number>();
}

// ==========================================
// 3. Kanban Demo
// ==========================================
@Component({
  selector: 'app-kanban-demo',
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltBadge,
    VoltButton,
    KanbanTask,
    KanbanColumn,
  ],
  standalone: true,

  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-[700px] border border-border rounded-lg overflow-hidden flex flex-col bg-background relative"
    >
      <!-- Header -->
      <header
        class="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0"
      >
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold">Project Board</h2>
          <volt-badge variant="outline">Sprint 42</volt-badge>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex -space-x-2 mr-2">
            <volt-avatar class="h-7 w-7 border-2 border-background">
              <img voltAvatarImage src="https://i.pravatar.cc/150?u=1" alt="JD" />
              <volt-avatar-fallback>JD</volt-avatar-fallback>
            </volt-avatar>
            <volt-avatar class="h-7 w-7 border-2 border-background">
              <img voltAvatarImage src="https://i.pravatar.cc/150?u=2" alt="SM" />
              <volt-avatar-fallback>SM</volt-avatar-fallback>
            </volt-avatar>
            <volt-avatar class="h-7 w-7 border-2 border-background">
              <img voltAvatarImage src="https://i.pravatar.cc/150?u=3" alt="MK" />
              <volt-avatar-fallback>MK</volt-avatar-fallback>
            </volt-avatar>
            <div
              class="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium"
            >
              +2
            </div>
          </div>
          <volt-button size="sm">New Task</volt-button>
        </div>
      </header>

      <!-- Board -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden bg-muted/20 p-4">
        <div class="flex gap-4 h-full min-w-max">
          <!-- Todo Column -->
          <app-kanban-column title="To Do" [count]="3">
            <app-kanban-task
              title="Design system tokens"
              priority="Low"
              priorityVariant="outline"
              dueDate="Dec 20"
              [assignees]="[{ id: 1, avatar: 'https://i.pravatar.cc/150?u=1', initials: 'JD' }]"
            />
            <app-kanban-task
              title="Update dependencies"
              priority="Medium"
              priorityVariant="secondary"
              dueDate="Dec 22"
              [assignees]="[{ id: 2, avatar: 'https://i.pravatar.cc/150?u=2', initials: 'SM' }]"
            />
            <app-kanban-task
              title="Write API documentation"
              priority="High"
              priorityVariant="destructive"
              dueDate="Dec 18"
              [assignees]="[
                { id: 1, avatar: 'https://i.pravatar.cc/150?u=1', initials: 'JD' },
                { id: 3, avatar: 'https://i.pravatar.cc/150?u=3', initials: 'MK' },
              ]"
            />
          </app-kanban-column>

          <!-- In Progress Column -->
          <app-kanban-column title="In Progress" [count]="2">
            <app-kanban-task
              title="Implement auth flow"
              priority="High"
              priorityVariant="destructive"
              dueDate="Dec 15"
              [assignees]="[{ id: 3, avatar: 'https://i.pravatar.cc/150?u=3', initials: 'MK' }]"
            />
            <app-kanban-task
              title="Dashboard widgets"
              priority="Medium"
              priorityVariant="secondary"
              dueDate="Dec 19"
              [assignees]="[
                { id: 2, avatar: 'https://i.pravatar.cc/150?u=2', initials: 'SM' },
                { id: 4, avatar: 'https://i.pravatar.cc/150?u=4', initials: 'AL' },
              ]"
            />
          </app-kanban-column>

          <!-- Review Column -->
          <app-kanban-column title="Review" [count]="2">
            <app-kanban-task
              title="Unit tests for utils"
              priority="Medium"
              priorityVariant="secondary"
              dueDate="Dec 14"
              [assignees]="[{ id: 5, avatar: 'https://i.pravatar.cc/150?u=5', initials: 'RJ' }]"
            />
            <app-kanban-task
              title="Accessibility audit"
              priority="High"
              priorityVariant="destructive"
              dueDate="Dec 16"
              [assignees]="[
                { id: 1, avatar: 'https://i.pravatar.cc/150?u=1', initials: 'JD' },
                { id: 2, avatar: 'https://i.pravatar.cc/150?u=2', initials: 'SM' },
              ]"
            />
          </app-kanban-column>

          <!-- Done Column -->
          <app-kanban-column title="Done" [count]="3">
            <app-kanban-task
              title="Setup CI/CD pipeline"
              priority="High"
              priorityVariant="solid"
              dueDate="Dec 10"
              [assignees]="[{ id: 3, avatar: 'https://i.pravatar.cc/150?u=3', initials: 'MK' }]"
            />
            <app-kanban-task
              title="Project scaffolding"
              priority="Medium"
              priorityVariant="solid"
              dueDate="Dec 08"
              [assignees]="[{ id: 4, avatar: 'https://i.pravatar.cc/150?u=4', initials: 'AL' }]"
            />
            <app-kanban-task
              title="Initial design mockups"
              priority="Low"
              priorityVariant="solid"
              dueDate="Dec 05"
              [assignees]="[{ id: 2, avatar: 'https://i.pravatar.cc/150?u=2', initials: 'SM' }]"
            />
          </app-kanban-column>
        </div>
      </div>
    </div>
  `,
})
export class KanbanDemo {}

// ==========================================
// 4. Docs Page
// ==========================================
@Component({
  selector: 'app-docs-kanban',
  standalone: true,
  imports: [KanbanDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Kanban Board</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A drag-and-drop style board layout with columns and task cards for project management.
      </p>

      <app-kanban-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout uses horizontal scrollable columns with task cards showing priority badges,
          due dates, and assignee avatars. Perfect for agile boards, project tracking, and task
          management.
        </p>
      </div>
    </div>
  `,
})
export default class DocsKanban {}
