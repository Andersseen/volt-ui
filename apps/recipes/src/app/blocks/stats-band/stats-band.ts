import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { VoltCard, VoltSeparator } from 'volt';

interface Stat {
  readonly value: number;
  readonly decimals: number;
  readonly suffix: string;
  readonly label: string;
}

/** Long enough to register as counting, short enough not to make anyone wait for the number. */
const DURATION = 1400;
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Four figures that count up once, the first time the band is scrolled into view.
 *
 * The server renders the final numbers, so the page is correct before (and without) JavaScript.
 * In the browser the band starts at zero only if it is not on screen yet and motion is allowed; an
 * `IntersectionObserver` then runs the count a single time and disconnects. Reduced motion skips the
 * count altogether.
 *
 * What a screen reader hears never changes: each figure has a visually hidden final value, and the
 * animated digits are `aria-hidden`, so nothing is announced twelve times a second.
 */
@Component({
  selector: 'app-stats-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard, VoltSeparator],
  template: `
    <section class="@container bg-background px-4 py-20 @3xl:px-6">
      <volt-card #band class="mx-auto max-w-5xl overflow-hidden p-0">
        <div class="grid @2xl:grid-cols-[1.1fr_2fr]">
          <div class="border-b border-border bg-muted/40 p-8 @2xl:border-b-0 @2xl:border-r">
            <h2 class="text-2xl font-bold tracking-tight">Numbers we are proud of</h2>
            <p class="mt-3 text-sm leading-6 text-muted-foreground">
              Measured across every workspace over the last twelve months, not a single good week.
            </p>
          </div>

          <dl class="grid grid-cols-2">
            @for (stat of stats; track stat.label; let i = $index) {
              <div class="flex flex-col-reverse justify-end gap-2 p-6 @4xl:px-8">
                <dt class="text-sm text-muted-foreground">{{ stat.label }}</dt>
                <dd
                  class="whitespace-nowrap text-3xl font-bold tracking-tight tabular-nums @4xl:text-4xl"
                >
                  <span class="sr-only">{{ format(stat, stat.value) }}</span>
                  <span aria-hidden="true">{{ format(stat, shown()[i]) }}</span>
                </dd>
              </div>
            }
          </dl>
        </div>
        <volt-separator />
        <p class="px-8 py-3 text-xs text-muted-foreground">Last updated 1 November.</p>
      </volt-card>
    </section>
  `,
})
export class StatsBand {
  private readonly band = viewChild.required('band', { read: ElementRef });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stats: readonly Stat[] = [
    { value: 12.4, decimals: 1, suffix: 'M', label: 'Builds a month' },
    { value: 99.99, decimals: 2, suffix: '%', label: 'Uptime' },
    { value: 38, decimals: 0, suffix: ' ms', label: 'Median deploy' },
    { value: 4.9, decimals: 1, suffix: '/5', label: 'Support rating' },
  ];

  /** The figures on screen; the final values until a count starts. */
  protected readonly shown = signal(this.stats.map(stat => stat.value));

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const element = this.band().nativeElement as HTMLElement;
      const box = element.getBoundingClientRect();
      // Already on screen: counting now would only make visible numbers jump back to zero.
      if (box.top < innerHeight && box.bottom > 0) return;

      this.shown.set(this.stats.map(() => 0));
      const observer = new IntersectionObserver(
        entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          observer.disconnect();
          this.count();
        },
        { threshold: 0.4 }
      );
      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected format(stat: Stat, value: number): string {
    const number = value.toLocaleString('en', {
      minimumFractionDigits: stat.decimals,
      maximumFractionDigits: stat.decimals,
    });
    return `${number}${stat.suffix}`;
  }

  private count(): void {
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      this.shown.set(this.stats.map(stat => stat.value * easeOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(frame));
  }
}
