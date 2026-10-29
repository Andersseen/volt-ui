import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge, VoltSkeleton } from 'volt';

/**
 * A layout in miniature: the admin dashboard shell, with a sidebar, KPI tiles and a chart that grows.
 *
 * A specimen of the Admin Dashboard layout on Volt UI Recipes; its labels are sample data, not copy.
 */
@Component({
  selector: 'app-layout-mini',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltSkeleton],
  host: { class: 'block' },
  template: `
    <div class="grid grid-cols-[5.5rem_1fr] text-[10px]">
      <aside class="space-y-1.5 border-r border-border/70 bg-muted/30 p-2.5">
        <div class="mb-3 h-3 w-12 rounded bg-primary/70"></div>
        @for (item of nav; track item; let first = $first) {
          <div
            class="rounded px-1.5 py-1"
            [class]="first ? 'bg-primary/15 font-medium text-primary' : 'text-muted-foreground'"
          >
            {{ item }}
          </div>
        }
      </aside>
      <div class="space-y-3 p-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold">Overview</span>
          <volt-skeleton class="h-4 w-16" />
        </div>
        <div class="grid grid-cols-3 gap-2">
          @for (kpi of kpis; track kpi.label) {
            <div class="rounded-md border border-border/70 p-2">
              <p class="text-muted-foreground">{{ kpi.label }}</p>
              <p class="mt-0.5 text-sm font-semibold tabular-nums">{{ kpi.value }}</p>
              <volt-badge variant="secondary" class="mt-1 px-1 py-0 text-[9px]">{{
                kpi.delta
              }}</volt-badge>
            </div>
          }
        </div>
        <div class="flex h-20 items-end gap-1.5 rounded-md border border-border/70 p-2">
          @for (bar of bars; track $index; let i = $index) {
            <div
              class="bar flex-1 rounded-sm bg-primary/70"
              [style.height.%]="bar"
              [style.animation-delay.ms]="i * 90"
            ></div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .bar {
      transform-origin: bottom;
      animation: grow 2.8s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
    }

    @keyframes grow {
      from {
        transform: scaleY(0.35);
        opacity: 0.6;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .bar {
        animation: none;
      }
    }
  `,
})
export class LayoutMini {
  protected readonly nav = ['Dashboard', 'Orders', 'Customers', 'Reports', 'Settings'];
  protected readonly kpis = [
    { label: 'Revenue', value: '$48.2k', delta: '+12%' },
    { label: 'Orders', value: '1,284', delta: '+4%' },
    { label: 'Churn', value: '1.9%', delta: '−0.3' },
  ];
  protected readonly bars = [42, 58, 35, 72, 64, 88, 54, 76, 95, 68, 82, 60];
}
