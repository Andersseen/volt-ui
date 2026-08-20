import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltProgress,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltTabs,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';

interface Kpi {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly direction: 'up' | 'down';
}

interface Source {
  readonly name: string;
  readonly share: number;
}

/**
 * Analytics: a filter bar over a KPI row over deliberately unequal panels.
 *
 * The arrangement is the argument. Filters go at the top because they apply to everything
 * beneath them, and a filter that sits beside one panel looks like it only changes that
 * panel. KPIs come next, as one scannable row. Then the grid, where the chart is given
 * twice the width of the list beside it — equal panels would say the two matter equally,
 * and on a metrics page they never do.
 *
 * There is no charting library here. Which one you use is your decision and a real
 * dependency; the panel is sized and labelled, and the plot area is a slot you fill.
 * A layout that picked a chart library for you would be a layout you had to gut.
 */
@Component({
  selector: 'app-analytics-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltProgress,
    VoltButton,
  ],
  template: `
    <div class="h-[640px] overflow-auto bg-muted/20">
      <!-- Filters apply to the whole page, so they sit above all of it. -->
      <header
        class="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur"
      >
        <div class="mr-auto">
          <h1 class="text-lg font-semibold tracking-tight">Analytics</h1>
          <p class="text-sm text-muted-foreground">Last updated 4 minutes ago</p>
        </div>

        <div class="w-40">
          <volt-select
            [value]="range()"
            (valueChange)="onRangeChange($event)"
            ariaLabel="Date range"
          >
            <volt-select-content>
              @for (option of ranges; track option) {
                <volt-select-item [value]="option">{{ option }}</volt-select-item>
              }
            </volt-select-content>
          </volt-select>
        </div>

        <volt-button variant="outline" size="sm">Export</volt-button>
      </header>

      <div class="space-y-6 p-6">
        <!-- One scannable row. Four is about the limit before it stops being scannable. -->
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (kpi of kpis; track kpi.label) {
            <volt-card class="p-4">
              <p class="text-sm text-muted-foreground">{{ kpi.label }}</p>
              <p class="mt-1 text-2xl font-bold tracking-tight tabular-nums">{{ kpi.value }}</p>
              <p
                class="mt-1 text-xs"
                [class]="kpi.direction === 'up' ? 'text-success' : 'text-destructive'"
              >
                {{ kpi.delta }}
              </p>
            </volt-card>
          }
        </section>

        <!-- Unequal on purpose: two thirds for the plot, one third for the breakdown. -->
        <section class="grid gap-4 lg:grid-cols-3">
          <volt-card class="p-5 lg:col-span-2">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="font-medium tracking-tight">Traffic</h2>
              <volt-tabs value="visitors">
                <volt-tabs-list>
                  <volt-tabs-trigger value="visitors">Visitors</volt-tabs-trigger>
                  <volt-tabs-trigger value="sessions">Sessions</volt-tabs-trigger>
                </volt-tabs-list>
              </volt-tabs>
            </div>

            <!-- Your chart goes here. Sized and labelled so the layout holds its shape
                 before a charting library is anywhere near the project. -->
            <div
              class="mt-5 flex h-56 items-end gap-1.5 rounded-md border border-dashed border-border p-4"
              role="img"
              aria-label="Traffic chart placeholder"
            >
              @for (bar of plot; track $index) {
                <div class="flex-1 rounded-sm bg-primary/25" [style.height.%]="bar"></div>
              }
            </div>
          </volt-card>

          <volt-card class="p-5">
            <h2 class="font-medium tracking-tight">Top sources</h2>
            <ul class="mt-5 space-y-4">
              @for (source of sources; track source.name) {
                <li>
                  <div class="flex items-baseline justify-between gap-3 text-sm">
                    <span>{{ source.name }}</span>
                    <span class="tabular-nums text-muted-foreground">{{ source.share }}%</span>
                  </div>
                  <volt-progress class="mt-2" [value]="source.share" />
                </li>
              }
            </ul>
          </volt-card>
        </section>
      </div>
    </div>
  `,
})
export class AnalyticsLayout {
  protected readonly range = signal('Last 30 days');
  protected readonly ranges = ['Last 7 days', 'Last 30 days', 'Last quarter', 'Year to date'];

  protected readonly kpis: readonly Kpi[] = [
    { label: 'Visitors', value: '128.4k', delta: '+12.3% vs previous', direction: 'up' },
    { label: 'Sessions', value: '204.1k', delta: '+8.1% vs previous', direction: 'up' },
    { label: 'Bounce rate', value: '38.2%', delta: '+1.4pp vs previous', direction: 'down' },
    { label: 'Avg. duration', value: '3m 12s', delta: '+22s vs previous', direction: 'up' },
  ];

  protected readonly sources: readonly Source[] = [
    { name: 'Organic search', share: 46 },
    { name: 'Direct', share: 24 },
    { name: 'Referral', share: 18 },
    { name: 'Social', share: 12 },
  ];

  /** Bar heights as percentages — placeholder geometry, not data. */
  protected readonly plot: readonly number[] = [
    32, 45, 38, 52, 61, 48, 57, 70, 64, 78, 72, 85, 79, 92, 88,
  ];

  protected onRangeChange(value: unknown): void {
    this.range.set(typeof value === 'string' ? value : 'Last 30 days');
  }
}
