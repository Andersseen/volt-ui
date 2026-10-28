import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * A number that counts to its value the first time it scrolls into view — up from zero, or down
 * from a larger `from` when the point is that the number is small.
 *
 * The server renders the final value, so crawlers, no-JS readers and reduced-motion visitors
 * always see the real number; the count only runs in the browser.
 */
@Component({
  selector: 'app-count-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tabular-nums' },
  template: `{{ shown() ?? to() }}`,
})
export class CountUp {
  readonly to = input.required({ transform: numberAttribute });
  readonly from = input(0, { transform: numberAttribute });
  readonly duration = input(1400, { transform: numberAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  /** The animated value; `null` until the browser takes over, so the server shows `to`. */
  protected readonly shown = signal<number | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view || view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      let frame = 0;
      const run = () => {
        const start = view.performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / this.duration(), 1);
          const eased = 1 - (1 - progress) ** 3;
          this.shown.set(Math.round(this.from() + (this.to() - this.from()) * eased));
          if (progress < 1) {
            frame = view.requestAnimationFrame(step);
          }
        };
        frame = view.requestAnimationFrame(step);
      };

      // Off screen: start from `from` now, so the reader never sees the final value jump back.
      this.shown.set(this.from());
      const watcher = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            watcher.disconnect();
            run();
          }
        },
        { threshold: 0.6 }
      );
      watcher.observe(this.host.nativeElement);

      destroyRef.onDestroy(() => {
        watcher.disconnect();
        view.cancelAnimationFrame(frame);
      });
    });
  }
}
