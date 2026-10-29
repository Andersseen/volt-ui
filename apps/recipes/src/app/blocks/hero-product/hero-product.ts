import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { LmnArrowRightIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSwitch,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

export interface HeroProductTask {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly done: boolean;
}

type TaskFilter = 'all' | 'open' | 'done';

const DEFAULT_TASKS: readonly HeroProductTask[] = [
  { id: 'a', title: 'Review the migration plan', owner: 'Ana', done: true },
  { id: 'b', title: 'Ship the billing webhook', owner: 'Leo', done: false },
  { id: 'c', title: 'Write the rollout note', owner: 'Mira', done: false },
  { id: 'd', title: 'Archive last sprint', owner: 'Ana', done: false },
];

/**
 * Product hero whose preview is the product: a small task board you can actually use.
 *
 * Everything a copy of this block needs to change is an input — the eyebrow, headline,
 * description, the two action labels and the tasks themselves (a `model`, so a parent can
 * bind `[(tasks)]`). The actions emit instead of navigating, so the block carries no routing.
 * The only motion is a CSS entrance and a pulsing "live" dot, both switched off under
 * `prefers-reduced-motion`; the preview works the same without them.
 */
@Component({
  selector: 'app-hero-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LmnArrowRightIcon,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSwitch,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  host: { class: 'block' },
  template: `
    <section
      class="@container relative overflow-hidden bg-background px-4 py-16 @2xl:px-6 @2xl:py-24"
    >
      <div class="wash pointer-events-none absolute inset-0" aria-hidden="true"></div>

      <div class="relative mx-auto max-w-6xl">
        <div class="enter mx-auto max-w-2xl text-center">
          <volt-badge variant="outline" class="border-primary/30 text-primary">
            {{ eyebrow() }}
          </volt-badge>
          <h1
            class="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight @2xl:text-6xl"
          >
            {{ headline() }}
          </h1>
          <p class="mx-auto mt-5 max-w-xl text-balance text-lg leading-8 text-muted-foreground">
            {{ description() }}
          </p>
          <div class="mt-8 flex flex-col justify-center gap-3 @md:flex-row">
            <volt-button size="lg" class="group w-full @md:w-auto" (click)="primary.emit()">
              {{ primaryLabel() }}
              <lmn-arrow-right
                slot="trailing"
                [size]="16"
                class="transition-transform motion-safe:group-hover:translate-x-1"
              />
            </volt-button>
            <volt-button
              variant="outline"
              size="lg"
              class="w-full @md:w-auto"
              (click)="secondary.emit()"
            >
              {{ secondaryLabel() }}
            </volt-button>
          </div>
        </div>

        <!-- A real, working card — the filter, the switches and the progress are all
             driven by the same signals, so the preview proves the product claim. -->
        <volt-card class="enter enter-late mx-auto mt-14 max-w-3xl overflow-hidden shadow-xl">
          <div class="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="live h-2 w-2 rounded-full bg-success" aria-hidden="true"></span>
              <p class="text-sm font-medium">Sprint board</p>
            </div>
            <volt-toggle-group
              type="single"
              [value]="[filter()]"
              (valueChange)="setFilter($event)"
              aria-label="Filter tasks"
            >
              <volt-toggle-group-item value="all" size="sm">All</volt-toggle-group-item>
              <volt-toggle-group-item value="open" size="sm">Open</volt-toggle-group-item>
              <volt-toggle-group-item value="done" size="sm">Done</volt-toggle-group-item>
            </volt-toggle-group>
          </div>

          <div class="px-5 pt-4">
            <volt-progress [value]="percent()">
              <volt-progress-label class="text-xs text-muted-foreground">
                {{ doneCount() }} of {{ tasks().length }} complete
              </volt-progress-label>
              <volt-progress-value class="text-xs tabular-nums text-muted-foreground">
                {{ percent() }}%
              </volt-progress-value>
            </volt-progress>
          </div>

          <ul class="px-3 py-3" aria-live="polite">
            @for (task of visible(); track task.id) {
              <li class="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/50">
                <volt-switch
                  [checked]="task.done"
                  (checkedChange)="toggle(task.id, $event)"
                  [ariaLabel]="'Mark ' + task.title + ' as done'"
                />
                <span
                  class="flex-1 text-sm"
                  [class]="task.done ? 'text-muted-foreground line-through' : ''"
                >
                  {{ task.title }}
                </span>
                <volt-badge variant="secondary">{{ task.owner }}</volt-badge>
              </li>
            } @empty {
              <li class="px-2 py-6 text-center text-sm text-muted-foreground">
                Nothing in this view.
              </li>
            }
          </ul>
        </volt-card>
      </div>
    </section>
  `,
  styles: `
    .wash {
      background:
        radial-gradient(
          55% 45% at 50% 0%,
          color-mix(in oklch, var(--primary) 14%, transparent),
          transparent 70%
        ),
        radial-gradient(
          35% 35% at 90% 80%,
          color-mix(in oklch, var(--info) 8%, transparent),
          transparent 70%
        );
    }

    @media (prefers-reduced-motion: no-preference) {
      .enter {
        animation: rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .enter-late {
        animation-delay: 160ms;
      }
      .live {
        animation: pulse 2s ease-in-out infinite;
      }
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
    }

    @keyframes pulse {
      50% {
        opacity: 0.35;
      }
    }
  `,
})
export class HeroProduct {
  readonly eyebrow = input('Now in public beta');
  readonly headline = input('Plan the sprint where the work already is.');
  readonly description = input(
    'One board for tasks, owners and progress. Everything below is live — try it.'
  );
  readonly primaryLabel = input('Start for free');
  readonly secondaryLabel = input('Book a demo');
  readonly tasks = model<readonly HeroProductTask[]>(DEFAULT_TASKS);

  readonly primary = output<void>();
  readonly secondary = output<void>();

  protected readonly filter = signal<TaskFilter>('all');

  protected readonly visible = computed(() => {
    const filter = this.filter();
    return this.tasks().filter(
      task => filter === 'all' || (filter === 'done' ? task.done : !task.done)
    );
  });
  protected readonly doneCount = computed(() => this.tasks().filter(task => task.done).length);
  protected readonly percent = computed(() =>
    this.tasks().length === 0 ? 0 : Math.round((this.doneCount() / this.tasks().length) * 100)
  );

  protected setFilter(value: readonly string[]): void {
    // A single-selection group reports an empty array when the active item is pressed again.
    this.filter.set((value[0] as TaskFilter | undefined) ?? 'all');
  }

  protected toggle(id: string, done: boolean): void {
    this.tasks.update(tasks => tasks.map(task => (task.id === id ? { ...task, done } : task)));
  }
}
