import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  LmnArrowDownIcon,
  LmnArrowUpIcon,
  LmnGridIcon,
  LmnHomeIcon,
  LmnMailIcon,
  LmnSettingsIcon,
  LmnUserIcon,
  LmnZapIcon,
} from 'lumen-icons';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarFooter,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSidebarService,
} from 'volt';

interface NavItem {
  readonly label: string;
  readonly icon: 'home' | 'grid' | 'user' | 'mail' | 'settings';
  readonly route: string;
  readonly badge?: string;
}

interface Kpi {
  readonly label: string;
  /** Counted up to, rather than printed. */
  readonly target: number;
  readonly prefix: string;
  readonly suffix: string;
  readonly decimals: number;
  readonly delta: string;
  readonly direction: 'up' | 'down';
  readonly spark: readonly number[];
}

interface Event {
  readonly who: string;
  readonly initials: string;
  readonly what: string;
  readonly when: string;
}

/** How long the figures take to arrive at their value. */
const COUNT_MS = 1100;

/** Twelve months of visitors, in thousands. Real numbers make a real curve. */
const SERIES: readonly number[] = [42, 48, 44, 57, 63, 59, 71, 78, 74, 86, 92, 104];

/**
 * The dashboard as a finished product, not as an arrangement.
 *
 * The layouts tab has this same shell reduced to its structure: a neutral sidebar, stat
 * cards that are a label and a number, and a panel with the plot area left empty because
 * choosing a charting library for you would be choosing a dependency for you. That one is
 * the thing you fill in. This is the thing you would demo.
 *
 * The difference is doing work, not adding gloss. The figures count up the first time the
 * row is scrolled into view — once, then never again, because a number that re-animates
 * every time it scrolls past is a number nobody can read. The chart is a real SVG drawn
 * from the series below and stroked on as it arrives, so a dashboard block does not need
 * a charting library to stop looking like a placeholder.
 *
 * Both the counters and the draw are skipped entirely under `prefers-reduced-motion`: the
 * figures start at their value and the chart starts drawn. Neither is decoration you can
 * pause, so neither should start without being asked for.
 */
@Component({
  selector: 'app-app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltSidebar,
    VoltSidebarHeader,
    VoltSidebarContent,
    VoltSidebarGroup,
    VoltSidebarItem,
    VoltSidebarFooter,
    VoltCard,
    VoltBadge,
    VoltButton,
    VoltAvatar,
    VoltAvatarFallback,
    LmnHomeIcon,
    LmnGridIcon,
    LmnUserIcon,
    LmnMailIcon,
    LmnSettingsIcon,
    LmnZapIcon,
    LmnArrowUpIcon,
    LmnArrowDownIcon,
  ],
  template: `
    <section class="@container bg-background">
      <div class="flex h-[720px] overflow-hidden">
        <!-- The library's sidebar, wearing a brand. The layout version shows the same
             component with nothing on it. -->
        <div class="brand-rail hidden shrink-0 @3xl:block">
          <volt-sidebar>
            <volt-sidebar-header>
              <div class="flex h-full items-center gap-2 overflow-hidden">
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
                >
                  <lmn-zap [size]="14" />
                </span>
                @if (!sidebar.isCollapsed()) {
                  <span class="truncate text-sm font-semibold tracking-tight">Northwind</span>
                }
              </div>
            </volt-sidebar-header>

            <volt-sidebar-content>
              @for (group of navigation; track group.heading) {
                <volt-sidebar-group [label]="group.heading">
                  @for (item of group.items; track item.label) {
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
              }
            </volt-sidebar-content>

            <volt-sidebar-footer>
              <div class="flex items-center gap-3">
                <volt-avatar>
                  <volt-avatar-fallback class="text-xs">AL</volt-avatar-fallback>
                </volt-avatar>
                @if (!sidebar.isCollapsed()) {
                  <div class="flex flex-col truncate">
                    <span class="truncate text-sm font-medium">Ada Lovelace</span>
                    <span class="truncate text-xs text-muted-foreground">Owner</span>
                  </div>
                }
              </div>
            </volt-sidebar-footer>
          </volt-sidebar>
        </div>

        <div class="flex min-w-0 flex-1 flex-col">
          <header
            class="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-3 @2xl:px-6"
          >
            <div class="mr-auto min-w-0">
              <h1 class="truncate text-base font-semibold tracking-tight">Overview</h1>
              <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span class="live h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true"></span>
                Live · updated just now
              </p>
            </div>

            <div class="hidden items-center gap-1 rounded-md border border-border p-0.5 @xl:flex">
              @for (range of ranges; track range) {
                <button
                  type="button"
                  class="rounded-sm px-2.5 py-1 text-xs transition-colors"
                  [class]="
                    range === activeRange()
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  "
                  [attr.aria-pressed]="range === activeRange()"
                  (click)="activeRange.set(range)"
                >
                  {{ range }}
                </button>
              }
            </div>

            <volt-button variant="outline" size="sm">Export</volt-button>
          </header>

          <main class="min-h-0 flex-1 space-y-4 overflow-auto bg-muted/20 p-4 @2xl:p-6">
            <!-- The row the observer watches. -->
            <div #figures class="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4">
              @for (kpi of kpis; track kpi.label) {
                <volt-card class="kpi overflow-hidden p-4">
                  <p class="text-xs uppercase tracking-wider text-muted-foreground">
                    {{ kpi.label }}
                  </p>
                  <p class="mt-1.5 text-2xl font-bold tracking-tight tabular-nums">
                    {{ display(kpi) }}
                  </p>
                  <div class="mt-2 flex items-end justify-between gap-3">
                    <span
                      class="inline-flex items-center gap-1 text-xs"
                      [class]="kpi.direction === 'up' ? 'text-success' : 'text-destructive'"
                    >
                      @if (kpi.direction === 'up') {
                        <lmn-arrow-up [size]="12" />
                      } @else {
                        <lmn-arrow-down [size]="12" />
                      }
                      {{ kpi.delta }}
                    </span>

                    <svg
                      class="h-8 w-20 shrink-0 overflow-visible"
                      viewBox="0 0 100 32"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        [attr.d]="spark(kpi.spark)"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                        [class]="kpi.direction === 'up' ? 'text-success' : 'text-destructive'"
                      />
                    </svg>
                  </div>
                </volt-card>
              }
            </div>

            <div class="grid gap-4 @4xl:grid-cols-3">
              <volt-card class="p-5 @4xl:col-span-2">
                <div class="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h2 class="font-medium tracking-tight">Visitors</h2>
                    <p class="text-xs text-muted-foreground">Thousands per month</p>
                  </div>
                  <volt-badge variant="secondary" class="tabular-nums">
                    {{ activeRange() }}
                  </volt-badge>
                </div>

                <!-- A real chart, drawn from the series. No charting library, because at
                     this shape one is not worth a dependency. -->
                <svg
                  class="chart mt-5 h-56 w-full"
                  [class.is-drawn]="drawn()"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Monthly visitors, rising from 42 to 104 thousand"
                >
                  <defs>
                    <linearGradient id="dashboard-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="currentColor" stop-opacity="0.28" />
                      <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    class="chart-area text-primary"
                    [attr.d]="area()"
                    fill="url(#dashboard-fill)"
                  />
                  <path
                    class="chart-line text-primary"
                    [attr.d]="line()"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
              </volt-card>

              <volt-card class="p-5">
                <h2 class="font-medium tracking-tight">Activity</h2>
                <ul class="mt-5 space-y-4">
                  @for (event of events; track event.when) {
                    <li class="flex gap-3">
                      <volt-avatar class="h-8 w-8 shrink-0">
                        <volt-avatar-fallback class="text-[10px]">
                          {{ event.initials }}
                        </volt-avatar-fallback>
                      </volt-avatar>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm leading-snug">
                          <span class="font-medium">{{ event.who }}</span>
                          <span class="text-muted-foreground"> {{ event.what }}</span>
                        </p>
                        <p class="mt-0.5 text-xs text-muted-foreground">{{ event.when }}</p>
                      </div>
                    </li>
                  }
                </ul>
              </volt-card>
            </div>
          </main>
        </div>
      </div>
    </section>
  `,
  styles: `
    /* The brand sits on the rail rather than inside the sidebar component, so the
       component keeps its own tokens and this stays a skin over it. */
    .brand-rail {
      background: linear-gradient(
        180deg,
        color-mix(in oklch, var(--primary) 10%, var(--surface)),
        var(--surface)
      );
      border-inline-end: 1px solid var(--border);
    }

    .kpi {
      transition: box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .kpi:hover {
      box-shadow: var(--volt-shadow-md);
    }

    /* The line is hidden by its own length and reveals as the offset unwinds. */
    .chart-line {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      pathlength: 1;
      transition: stroke-dashoffset 1400ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .chart-area {
      opacity: 0;
      transition: opacity 900ms 400ms ease;
    }

    .chart.is-drawn .chart-line {
      stroke-dashoffset: 0;
    }

    .chart.is-drawn .chart-area {
      opacity: 1;
    }

    .live {
      animation: live-pulse 2s ease-in-out infinite;
    }

    @keyframes live-pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.35;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .kpi,
      .chart-line,
      .chart-area {
        transition: none;
      }

      .live {
        animation: none;
      }
    }
  `,
})
export class AppDashboard {
  protected readonly sidebar = inject(VoltSidebarService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly figures = viewChild.required<ElementRef<HTMLElement>>('figures');

  protected readonly activeRange = signal('12m');
  protected readonly ranges = ['7d', '30d', '12m'];

  /** 0 to 1, driving every counter at once so the row lands together. */
  private readonly progress = signal(0);
  protected readonly drawn = signal(false);

  protected readonly navigation: readonly { heading: string; items: readonly NavItem[] }[] = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/docs/blocks/dashboard' },
        { label: 'Analytics', icon: 'grid', route: '/docs/layouts/analytics' },
      ],
    },
    {
      heading: 'Workspace',
      items: [
        { label: 'Customers', icon: 'user', route: '/docs/layouts/profile' },
        { label: 'Inbox', icon: 'mail', route: '/docs/layouts/chat', badge: '9' },
        { label: 'Settings', icon: 'settings', route: '/docs/layouts/settings' },
      ],
    },
  ];

  protected readonly kpis: readonly Kpi[] = [
    {
      label: 'Revenue',
      target: 45231,
      prefix: '$',
      suffix: '',
      decimals: 0,
      delta: '20.1%',
      direction: 'up',
      spark: [12, 18, 15, 22, 26, 24, 31, 35],
    },
    {
      label: 'Active users',
      target: 2350,
      prefix: '',
      suffix: '',
      decimals: 0,
      delta: '180 this week',
      direction: 'up',
      spark: [8, 11, 10, 14, 13, 17, 19, 24],
    },
    {
      label: 'Orders',
      target: 1247,
      prefix: '',
      suffix: '',
      decimals: 0,
      delta: '5.2%',
      direction: 'down',
      spark: [30, 28, 31, 26, 24, 25, 21, 18],
    },
    {
      label: 'Conversion',
      target: 3.24,
      prefix: '',
      suffix: '%',
      decimals: 2,
      delta: '0.8pp',
      direction: 'up',
      spark: [2, 3, 2.6, 3.4, 3.1, 3.6, 3.9, 4.2],
    },
  ];

  protected readonly events: readonly Event[] = [
    { who: 'Marta Ibáñez', initials: 'MI', what: 'deployed storefront', when: '2 minutes ago' },
    { who: 'Dan Okoro', initials: 'DO', what: 'approved invoice #4821', when: '18 minutes ago' },
    { who: 'Priya Raman', initials: 'PR', what: 'added 3 team members', when: '1 hour ago' },
    { who: 'Tomás Vidal', initials: 'TV', what: 'closed incident INC-233', when: '3 hours ago' },
  ];

  protected readonly line = computed(() => this.plot(SERIES, false));
  protected readonly area = computed(() => this.plot(SERIES, true));

  constructor() {
    // Browser only: afterNextRender never runs during server rendering, which is where
    // both the observer and the animation frame would otherwise be created.
    afterNextRender(() => this.arm());
  }

  private arm(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.progress.set(1);
      this.drawn.set(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          // Once. A figure that re-counts every time it scrolls past cannot be read.
          observer.disconnect();
          this.count();
          this.drawn.set(true);
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(this.figures().nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private count(): void {
    const started = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const elapsed = Math.min(1, (now - started) / COUNT_MS);
      // Ease out cubic: fast enough to feel responsive, slow at the end so the final
      // digits settle instead of snapping.
      this.progress.set(1 - Math.pow(1 - elapsed, 3));

      if (elapsed < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(frame));
  }

  /** The figure as it should read right now, mid-count or finished. */
  protected display(kpi: Kpi): string {
    const value = kpi.target * this.progress();
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: kpi.decimals,
      maximumFractionDigits: kpi.decimals,
    });

    return `${kpi.prefix}${formatted}${kpi.suffix}`;
  }

  protected spark(values: readonly number[]): string {
    return this.plot(values, false, 100, 32);
  }

  /**
   * Maps a series onto the viewBox. Pure, so the server and the browser draw the same
   * path and hydration has nothing to disagree about.
   */
  private plot(values: readonly number[], close: boolean, width = 100, height = 40): string {
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const span = highest - lowest || 1;
    const padding = height * 0.12;

    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - padding - ((value - lowest) / span) * (height - padding * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const line = `M${points.join(' L')}`;

    return close ? `${line} L${width},${height} L0,${height} Z` : line;
  }
}
