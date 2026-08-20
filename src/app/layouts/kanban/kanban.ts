import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnPlusIcon } from 'lumen-icons';
import { VoltAvatar, VoltAvatarFallback, VoltBadge, VoltButton, VoltCard } from 'volt';

interface Task {
  readonly title: string;
  readonly tag: string;
  readonly assignee: string;
}

interface Column {
  readonly title: string;
  readonly tasks: readonly Task[];
}

/**
 * Kanban board: the two-axis scrolling problem, solved.
 *
 * A board scrolls sideways through its columns, and each column scrolls its own cards
 * vertically. Getting that wrong is the usual failure — one scroll container for
 * everything, so the header scrolls away and a long column drags the whole board with it.
 *
 * The arrangement that works: the board is a horizontally scrolling flex row of
 * fixed-width columns; each column is a flex column whose card list is the only part that
 * scrolls, with `min-h-0` so it can actually shrink below its content. Column headers and
 * footers stay put because they are outside that scroller.
 *
 * No drag and drop here on purpose. That is a behaviour with real decisions in it —
 * pointer versus keyboard, where a dropped card lands, what gets announced — and burying
 * a particular answer inside a layout would make it the wrong starting point for anyone
 * who needs a different one.
 */
@Component({
  selector: 'app-kanban-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard, VoltBadge, VoltButton, VoltAvatar, VoltAvatarFallback, LmnPlusIcon],
  template: `
    <div class="flex h-[640px] flex-col bg-muted/20">
      <header
        class="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6 py-4"
      >
        <div>
          <h1 class="text-lg font-semibold tracking-tight">Platform board</h1>
          <p class="text-sm text-muted-foreground">Sprint 24 · 12 open</p>
        </div>
        <volt-button size="sm">
          <lmn-plus slot="leading" [size]="16" />
          New task
        </volt-button>
      </header>

      <!-- The board scrolls sideways. Nothing inside it may scroll sideways too. -->
      <div class="min-h-0 flex-1 overflow-x-auto">
        <div class="flex h-full gap-4 p-4">
          @for (column of columns; track column.title) {
            <!-- Fixed width, full height, and a flex column so the list below can own the
                 vertical scroll on its own. -->
            <section class="flex h-full w-72 shrink-0 flex-col rounded-lg bg-background/60">
              <header class="flex shrink-0 items-center justify-between gap-2 px-3 py-3">
                <h2 class="text-sm font-medium">{{ column.title }}</h2>
                <volt-badge variant="secondary" class="tabular-nums">
                  {{ column.tasks.length }}
                </volt-badge>
              </header>

              <!-- min-h-0 is what lets this shrink below its content and scroll, instead
                   of stretching the column and pushing the footer off the board. -->
              <ul class="min-h-0 flex-1 space-y-2 overflow-y-auto px-3">
                @for (task of column.tasks; track task.title) {
                  <li>
                    <volt-card class="cursor-grab p-3 transition-shadow hover:shadow-md">
                      <p class="text-sm font-medium leading-snug">{{ task.title }}</p>
                      <div class="mt-3 flex items-center justify-between gap-2">
                        <volt-badge variant="outline" class="text-[10px]">
                          {{ task.tag }}
                        </volt-badge>
                        <volt-avatar class="h-6 w-6">
                          <volt-avatar-fallback class="text-[10px]">
                            {{ task.assignee }}
                          </volt-avatar-fallback>
                        </volt-avatar>
                      </div>
                    </volt-card>
                  </li>
                }
              </ul>

              <div class="shrink-0 p-3">
                <volt-button variant="ghost" size="sm" class="w-full justify-start">
                  <lmn-plus slot="leading" [size]="14" />
                  Add task
                </volt-button>
              </div>
            </section>
          }
        </div>
      </div>
    </div>
  `,
})
export class KanbanLayout {
  protected readonly columns: readonly Column[] = [
    {
      title: 'Backlog',
      tasks: [
        { title: 'Split the deploy pipeline per environment', tag: 'infra', assignee: 'AL' },
        { title: 'Audit the icon bundle size', tag: 'perf', assignee: 'MK' },
        { title: 'Document the rollback procedure', tag: 'docs', assignee: 'DO' },
      ],
    },
    {
      title: 'In progress',
      tasks: [
        { title: 'Move the router to standalone APIs', tag: 'refactor', assignee: 'AL' },
        { title: 'Add container queries to the footer', tag: 'ui', assignee: 'PR' },
      ],
    },
    {
      title: 'In review',
      tasks: [
        { title: 'Fix hydration mismatch on the gallery', tag: 'bug', assignee: 'TV' },
        { title: 'Theme popover keyboard path', tag: 'a11y', assignee: 'SL' },
      ],
    },
    {
      title: 'Done',
      tasks: [
        { title: 'Generate the version from package.json', tag: 'chore', assignee: 'IF' },
        { title: 'Collapse blocks and layouts into one tab', tag: 'ui', assignee: 'AL' },
      ],
    },
  ];
}
