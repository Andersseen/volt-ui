import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { LmnArrowRightIcon, LmnCheckIcon, LmnLoaderIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
} from 'volt';

interface Step {
  readonly label: string;
  readonly detail: string;
}

const STEPS: readonly Step[] = [
  { label: 'Installing dependencies', detail: '142 packages' },
  { label: 'Building library', detail: 'ng-packagr' },
  { label: 'Running tests', detail: '394 passed' },
  { label: 'Deployed to production', detail: 'edge, 14 regions' },
];

/** How long each step holds before the panel advances. */
const STEP_MS = 2200;

/**
 * Split hero: the argument on the left, a product doing something on the right.
 *
 * The panel advances through a deploy on its own, which is the point — a screenshot of a
 * dashboard says the product exists, a dashboard that is mid-deploy says it works. The
 * timer only ever starts in the browser, from `afterNextRender`, and stops on destroy;
 * starting one in a field initialiser would run it during server rendering, where it can
 * never fire and never be cleaned up.
 *
 * It also does not start at all under `prefers-reduced-motion`. An auto-advancing panel
 * is motion the visitor did not ask for and cannot pause, which is exactly the category
 * that preference exists for, so the panel simply shows its finished state instead.
 */
@Component({
  selector: 'app-hero-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    LmnArrowRightIcon,
    LmnCheckIcon,
    LmnLoaderIcon,
  ],
  host: {
    class: 'block',
    '(pointermove)': 'straighten()',
    '(pointerleave)': 'tilt()',
  },
  template: `
    <section
      class="@container relative overflow-hidden bg-background px-4 py-20 @2xl:px-6 @2xl:py-28"
    >
      <div class="hero-wash pointer-events-none absolute inset-0" aria-hidden="true"></div>

      <div
        class="relative mx-auto grid max-w-6xl items-center gap-12 @4xl:grid-cols-[1.05fr_0.95fr]"
      >
        <div class="min-w-0">
          <volt-badge variant="outline" class="border-primary/30 text-primary">
            Ships on every push
          </volt-badge>

          <h1
            class="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight @2xl:text-5xl @4xl:text-6xl"
          >
            From commit to production without the ceremony.
          </h1>

          <p class="mt-6 max-w-lg text-balance text-lg leading-8 text-muted-foreground">
            Push a branch and get a URL. No pipeline to maintain, no console to learn, no meeting
            about who owns the deploy.
          </p>

          <div class="mt-9 flex flex-col gap-3 @md:flex-row">
            <volt-button size="lg" class="group w-full min-w-44 @md:w-auto">
              Deploy your repo
              <lmn-arrow-right
                slot="trailing"
                [size]="16"
                class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
              />
            </volt-button>
            <volt-button variant="outline" size="lg" class="w-full min-w-44 @md:w-auto">
              Read the docs
            </volt-button>
          </div>

          <dl class="mt-12 grid max-w-md grid-cols-3 gap-6">
            @for (stat of stats; track stat.label) {
              <div>
                <dt class="text-xs uppercase tracking-wider text-muted-foreground">
                  {{ stat.label }}
                </dt>
                <dd class="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {{ stat.value }}
                </dd>
              </div>
            }
          </dl>
        </div>

        <!-- The panel is a real card composition, not an image, so it inherits the theme
             and stays sharp on every display. -->
        <div class="panel-stage">
          <volt-card class="panel relative overflow-hidden p-5 shadow-lg">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="live h-2 w-2 rounded-full bg-success" aria-hidden="true"></span>
                <p class="text-sm font-medium">acme/storefront</p>
              </div>
              <volt-badge variant="secondary" class="font-mono text-[10px]">main</volt-badge>
            </div>

            <volt-progress class="mt-5" [value]="progress()">
              <volt-progress-label class="text-xs text-muted-foreground">
                {{ done() ? 'Deployed' : 'Deploying' }}
              </volt-progress-label>
              <volt-progress-value class="text-xs tabular-nums text-muted-foreground">
                {{ progress() }}%
              </volt-progress-value>
            </volt-progress>

            <!-- aria-live so the announcement matches what the panel is showing, rather
                 than four list items silently swapping icons. -->
            <ol class="mt-5 space-y-1" aria-live="polite">
              @for (step of steps; track step.label; let i = $index) {
                <li
                  class="flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-300"
                  [class]="i === active() ? 'bg-muted/60' : ''"
                >
                  <span class="flex h-5 w-5 shrink-0 items-center justify-center">
                    @if (i < active() || done()) {
                      <span
                        class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success"
                      >
                        <lmn-check [size]="12" />
                      </span>
                    } @else if (i === active()) {
                      <lmn-loader [size]="14" class="spin text-primary" />
                    } @else {
                      <span class="h-1.5 w-1.5 rounded-full bg-border"></span>
                    }
                  </span>
                  <span
                    class="flex-1 text-sm transition-colors duration-300"
                    [class]="i <= active() || done() ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ step.label }}
                  </span>
                  <span class="font-mono text-[11px] text-muted-foreground">{{ step.detail }}</span>
                </li>
              }
            </ol>
          </volt-card>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-wash {
      background:
        radial-gradient(
          60% 50% at 85% 20%,
          color-mix(in oklch, var(--primary) 12%, transparent),
          transparent 70%
        ),
        radial-gradient(
          40% 40% at 10% 90%,
          color-mix(in oklch, var(--info) 10%, transparent),
          transparent 70%
        );
    }

    /* The tilt is on a child of the perspective holder, because perspective applies to an
       element's children rather than to itself. */
    .panel-stage {
      perspective: 1600px;
    }

    .panel {
      transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Only tilt where there is room for it. On a stacked layout the panel is the whole
       width and a rotation just makes one edge blurry. Container query, not a media one:
       what decides is how wide this section is, not how wide the window is. */
    @container (min-width: 56rem) {
      .panel {
        transform: rotateY(-7deg) rotateX(3deg);
      }

      .panel-stage.is-near .panel {
        transform: rotateY(0deg) rotateX(0deg);
      }
    }

    .live {
      animation: pulse 2s ease-in-out infinite;
    }

    .spin {
      animation: spin 900ms linear infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        scale: 1;
      }
      50% {
        opacity: 0.45;
        scale: 0.85;
      }
    }

    @keyframes spin {
      to {
        rotate: 360deg;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .panel {
        transition: none;
        transform: none;
      }

      .live,
      .spin {
        animation: none;
      }
    }
  `,
})
export class HeroSplit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly steps = STEPS;
  protected readonly stats = [
    { label: 'Deploys', value: '2.4M' },
    { label: 'p95 build', value: '38s' },
    { label: 'Uptime', value: '99.99%' },
  ];

  protected readonly active = signal(0);
  /** One extra tick past the last step, which is the "everything finished" state. */
  protected readonly done = computed(() => this.active() >= STEPS.length);
  protected readonly progress = computed(() =>
    Math.min(100, Math.round((this.active() / STEPS.length) * 100))
  );

  constructor() {
    // afterNextRender never runs on the server, which is the guard: an interval started
    // during server rendering would neither fire nor be cleaned up.
    afterNextRender(() => this.run());
  }

  private run(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.active.set(STEPS.length);
      return;
    }

    const timer = window.setInterval(() => {
      this.active.update(step => (step >= STEPS.length ? 0 : step + 1));
    }, STEP_MS);

    this.destroyRef.onDestroy(() => window.clearInterval(timer));
  }

  /** Straightening the panel as the pointer arrives reads as the product turning to face you. */
  protected straighten(): void {
    this.host.nativeElement.querySelector('.panel-stage')?.classList.add('is-near');
  }

  protected tilt(): void {
    this.host.nativeElement.querySelector('.panel-stage')?.classList.remove('is-near');
  }
}
