import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';

/** Which small live demo a step shows. Each one proves its own claim, so none is a picture. */
export type TourDemo = 'press' | 'state' | 'presence' | 'stagger';

export interface TourStep {
  readonly id: string;
  /** Short name for the tab. */
  readonly label: string;
  readonly title: string;
  readonly body: string;
  readonly demo: TourDemo;
  /** File name shown above the snippet. */
  readonly file: string;
  readonly code: string;
}

const DEFAULT_STEPS: readonly TourStep[] = [
  {
    id: 'press',
    label: 'Hover & press',
    title: 'Feel it under the pointer',
    body: 'Feedback while something is true: the pointer is over it, it is pressed. Touch gets press feedback, not a sticky hover.',
    demo: 'press',
    file: 'save-button.html',
    code: '<button class="lift press">Save</button>',
  },
  {
    id: 'state',
    label: 'State',
    title: 'Follow the value, not the event',
    body: 'Bind the element to a piece of state and let it move whenever that state changes — from a click, a socket or a timer.',
    demo: 'state',
    file: 'status.html',
    code: '<span [class.active]="enabled()">{{ enabled() ? "active" : "idle" }}</span>',
  },
  {
    id: 'presence',
    label: 'Presence',
    title: 'Arrive without a jump',
    body: 'New rows animate in where they land, so the eye follows them instead of hunting for what changed.',
    demo: 'presence',
    file: 'list.html',
    code: '@for (row of rows(); track row.id) {\n  <li class="enter">{{ row.name }}</li>\n}',
  },
  {
    id: 'stagger',
    label: 'Stagger',
    title: 'Let a group read in order',
    body: 'A small delay per item turns a block of content into a sequence, without a timeline to maintain.',
    demo: 'stagger',
    file: 'grid.css',
    code: '.tile {\n  animation: rise 400ms both;\n  animation-delay: calc(var(--i) * 60ms);\n}',
  },
];

/**
 * A guided tour of a product's capabilities: what each one is on the left, the thing itself
 * working on the right.
 *
 * One `active` signal drives both halves. The tabs are the control — they bring keyboard
 * arrows, roving focus and the tab/tabpanel wiring from Volt — and the narrative column is a
 * live region that follows them, so a screen reader hears the explanation when the demo
 * changes. The rail beside the narrative shows how far through the tour the visitor is.
 *
 * Every demo is a few lines of CSS on real elements. They are there to be touched: a tour
 * that only plays recordings asks the visitor to take the claim on trust.
 */
@Component({
  selector: 'app-feature-tour',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCard,
    VoltSwitch,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
  ],
  host: { class: 'block' },
  template: `
    <section class="@container bg-background px-4 py-16 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto max-w-6xl">
        <h2 class="max-w-2xl text-balance text-3xl font-bold tracking-tight @3xl:text-5xl">
          {{ heading() }}
        </h2>
        <p class="mt-4 max-w-2xl text-lg text-muted-foreground">{{ description() }}</p>

        <div
          class="mt-12 grid gap-10 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @4xl:items-center"
        >
          <!-- Narrative. The rail fills as the tour advances. -->
          <div class="relative pl-8" aria-live="polite">
            <div class="absolute inset-y-0 left-0 w-px bg-border" aria-hidden="true">
              <div class="rail w-px bg-primary" [style.height.%]="progress()"></div>
            </div>
            <span
              class="dot absolute -left-[5px] h-[11px] w-[11px] rounded-full border-2 border-background bg-primary"
              [style.top.%]="progress()"
              aria-hidden="true"
            ></span>

            @let step = current();
            <p class="font-mono text-sm text-primary">{{ marker() }} · {{ step.label }}</p>
            <h3 class="mt-3 text-2xl font-semibold tracking-tight">{{ step.title }}</h3>
            <p class="mt-4 leading-7 text-muted-foreground">{{ step.body }}</p>
            <div class="mt-6 flex flex-wrap gap-2">
              <volt-button variant="outline" size="sm" (click)="guide.emit(step)">
                {{ guideLabel() }}
              </volt-button>
              <volt-button variant="ghost" size="sm" (click)="playground.emit(step)">
                {{ playgroundLabel() }}
              </volt-button>
            </div>
          </div>

          <volt-card class="overflow-hidden shadow-xl">
            <volt-tabs [(value)]="active">
              <div class="overflow-x-auto border-b border-border bg-muted/40 px-3 py-2">
                <volt-tabs-list class="bg-transparent">
                  @for (item of steps(); track item.id) {
                    <volt-tabs-trigger [value]="item.id">{{ item.label }}</volt-tabs-trigger>
                  }
                </volt-tabs-list>
              </div>

              @for (item of steps(); track item.id) {
                <volt-tabs-content [value]="item.id" class="mt-0 space-y-4 p-4 @2xl:p-6">
                  <div
                    class="stage flex min-h-56 flex-col items-center justify-center gap-4 rounded-lg border border-border p-6"
                  >
                    @switch (item.demo) {
                      @case ('press') {
                        <volt-button size="lg" class="lift" (click)="presses.set(presses() + 1)">
                          Hover or press me
                        </volt-button>
                        <p class="text-sm tabular-nums text-muted-foreground">
                          Pressed {{ presses() }}×
                        </p>
                      }
                      @case ('state') {
                        <div class="flex items-center gap-5">
                          <volt-switch
                            [checked]="enabled()"
                            (checkedChange)="enabled.set($event)"
                            ariaLabel="Enable sync"
                          />
                          <span
                            class="state rounded-md border px-4 py-2 font-mono text-sm"
                            [class.on]="enabled()"
                          >
                            {{ enabled() ? 'active' : 'idle' }}
                          </span>
                        </div>
                      }
                      @case ('presence') {
                        <ul class="w-full max-w-xs space-y-2" aria-label="Rows">
                          @for (row of rows(); track row) {
                            <li
                              class="enter rounded-md border border-border bg-card px-3 py-2 text-sm"
                            >
                              Row {{ row }}
                            </li>
                          }
                        </ul>
                        <div class="flex gap-2">
                          <volt-button size="sm" (click)="addRow()">Add row</volt-button>
                          <volt-button
                            size="sm"
                            variant="outline"
                            [disabled]="rows().length === 0"
                            (click)="removeRow()"
                          >
                            Remove
                          </volt-button>
                        </div>
                      }
                      @case ('stagger') {
                        <!-- Tracking on the round number re-creates the tiles, which replays them. -->
                        @for (round of [round()]; track round) {
                          <div class="grid grid-cols-3 gap-2" aria-hidden="true">
                            @for (tile of tiles; track tile) {
                              <span
                                class="tile h-10 w-16 rounded-md bg-primary/20"
                                [style.--i]="tile"
                              ></span>
                            }
                          </div>
                        }
                        <volt-button size="sm" variant="outline" (click)="round.set(round() + 1)">
                          Replay
                        </volt-button>
                      }
                    }
                  </div>

                  <div class="rounded-lg border border-border bg-muted/30">
                    <p
                      class="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground"
                    >
                      {{ item.file }}
                    </p>
                    <pre
                      class="overflow-x-auto px-4 py-3 font-mono text-sm"
                    ><code>{{ item.code }}</code></pre>
                  </div>
                </volt-tabs-content>
              }
            </volt-tabs>
          </volt-card>
        </div>
      </div>
    </section>
  `,
  styles: `
    .stage {
      background-image: radial-gradient(
        color-mix(in oklch, var(--muted-foreground) 25%, transparent) 1px,
        transparent 1px
      );
      background-size: 18px 18px;
    }

    .state.on {
      border-color: var(--primary);
      background: color-mix(in oklch, var(--primary) 14%, transparent);
      color: var(--primary);
    }

    @media (prefers-reduced-motion: no-preference) {
      .rail,
      .dot {
        transition:
          height 500ms cubic-bezier(0.22, 1, 0.36, 1),
          top 500ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .lift {
        transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .lift:hover {
        transform: translateY(-3px);
      }
      .lift:active {
        transform: translateY(0) scale(0.96);
      }

      .state {
        transition:
          background-color 300ms ease,
          border-color 300ms ease,
          color 300ms ease,
          transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .state.on {
        transform: translateX(6px) scale(1.05);
      }

      .enter {
        animation: rise 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .tile {
        animation: rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-delay: calc(var(--i) * 60ms);
      }
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }
    }
  `,
})
export class FeatureTour {
  readonly heading = input('Four things that are awkward to build by hand.');
  readonly description = input('Each one is running live. Pick a tab, then try it.');
  readonly steps = input<readonly TourStep[]>(DEFAULT_STEPS);
  readonly guideLabel = input('Read the guide');
  readonly playgroundLabel = input('Open playground');

  readonly guide = output<TourStep>();
  readonly playground = output<TourStep>();

  /**
   * The selected step's id, two-way bound to the tabs. Linked to the steps so it opens on the
   * first one, and starts over if a different set of steps arrives.
   */
  readonly active = linkedSignal<string | undefined>(() => this.steps()[0]?.id);

  protected readonly index = computed(() =>
    Math.max(
      0,
      this.steps().findIndex(step => step.id === this.active())
    )
  );
  protected readonly current = computed(() => this.steps()[this.index()]);
  protected readonly marker = computed(() => String(this.index() + 1).padStart(2, '0'));
  protected readonly progress = computed(() => ((this.index() + 1) / this.steps().length) * 100);

  // Demo state, kept here so switching tabs does not reset what the visitor just did.
  protected readonly presses = signal(0);
  protected readonly enabled = signal(false);
  protected readonly rows = signal<readonly number[]>([1, 2]);
  protected readonly round = signal(0);
  protected readonly tiles = [0, 1, 2, 3, 4, 5];
  private nextRow = 3;

  protected addRow(): void {
    this.rows.update(rows => [...rows, this.nextRow++].slice(-4));
  }

  protected removeRow(): void {
    this.rows.update(rows => rows.slice(1));
  }
}
