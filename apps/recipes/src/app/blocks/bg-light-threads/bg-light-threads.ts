import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { VoltBadge, VoltButton } from 'volt';

/** The drawing is authored on this box and stretched to the section, so a focus given in
 * fractions lands on the same spot as the glow positioned in percentages. */
const WIDTH = 1200;
const HEIGHT = 600;

export interface Thread {
  readonly d: string;
  /** Seconds before this thread's pulse sets off, so they never fire in step. */
  readonly delay: number;
  readonly duration: number;
  readonly opacity: number;
}

/**
 * Threads that start spread along both edges and pinch through one point. Deterministic, so the
 * server and the browser draw the same picture and hydration has nothing to correct.
 */
export function buildThreads(count: number, focusX: number, focusY: number): Thread[] {
  const fx = WIDTH * focusX;
  const fy = HEIGHT * focusY;

  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    // Spread past the box on both sides, so no thread starts visibly inside it.
    const startY = -HEIGHT * 0.25 + t * HEIGHT * 1.5;
    const endY = HEIGHT * 1.2 - t * HEIGHT * 1.4 + Math.sin(i * 1.7) * 40;
    const bend = 140 + (i % 4) * 30;

    const d = [
      `M -20 ${startY.toFixed(1)}`,
      `C ${(fx * 0.45).toFixed(1)} ${startY.toFixed(1)}, ${(fx - bend).toFixed(1)} ${fy.toFixed(1)}, ${fx.toFixed(1)} ${fy.toFixed(1)}`,
      `S ${(WIDTH - 60).toFixed(1)} ${endY.toFixed(1)}, ${WIDTH + 20} ${endY.toFixed(1)}`,
    ].join(' ');

    return {
      d,
      delay: (i * 0.73) % 6,
      duration: 5 + (i % 5) * 0.8,
      opacity: 0.25 + 0.5 * (1 - Math.abs(t - 0.5) * 2),
    };
  });
}

/**
 * A section backed by threads of light that converge on one bright point and fan out again,
 * with pulses travelling along them.
 *
 * It is pure SVG and CSS: the paths are computed once from the inputs, and each pulse is a short
 * dash moved along its path with `stroke-dashoffset`. No canvas, no animation loop, nothing that
 * waits for hydration — the effect is already running in the server-rendered HTML.
 *
 * Whatever you project sits in front of the threads; with nothing projected, a demo heading
 * shows the effect behind real copy. Under `prefers-reduced-motion: reduce` the threads and the
 * glow stay, and the pulses stop.
 */
@Component({
  selector: 'app-bg-light-threads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltButton],
  host: { class: 'block' },
  template: `
    <section
      class="@container relative isolate flex min-h-[28rem] items-center overflow-hidden bg-background px-4 py-20 @2xl:px-6"
    >
      <svg
        class="threads pointer-events-none absolute inset-0 h-full w-full"
        [attr.viewBox]="viewBox"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        @for (thread of threads(); track $index) {
          <path class="rail" [attr.d]="thread.d" [attr.opacity]="thread.opacity * 0.45" />
          <path
            class="pulse"
            [attr.d]="thread.d"
            pathLength="1000"
            [style.animation-delay.s]="-thread.delay"
            [style.animation-duration.s]="thread.duration"
            [attr.opacity]="thread.opacity"
          />
        }
      </svg>
      <div
        class="glow pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        [style.left.%]="focusX() * 100"
        [style.top.%]="focusY() * 100"
        aria-hidden="true"
      ></div>

      <div class="relative w-full max-w-xl">
        <ng-content>
          <volt-badge variant="outline" class="bg-background/80 font-mono backdrop-blur"
            >Background · light threads</volt-badge
          >
          <h2
            class="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground @3xl:text-6xl"
          >
            Ship interfaces you can own.
          </h2>
          <p class="mt-5 max-w-md text-lg text-muted-foreground">
            Every thread meets at one point. Move it with an input to sit behind your preview.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <volt-button size="lg">Get started</volt-button>
            <volt-button size="lg" variant="outline">See the source</volt-button>
          </div>
        </ng-content>
      </div>
    </section>
  `,
  styles: `
    .rail,
    .pulse {
      stroke: var(--primary);
      stroke-width: 1.2;
      vector-effect: non-scaling-stroke;
    }

    /* A short bright dash on a long gap: one pulse per thread at a time. */
    .pulse {
      stroke-width: 2;
      stroke-linecap: round;
      stroke-dasharray: 70 930;
      stroke-dashoffset: 1000;
      filter: drop-shadow(0 0 4px var(--primary));
    }

    .glow {
      background: radial-gradient(
        circle,
        color-mix(in oklch, var(--primary) 45%, white) 0%,
        color-mix(in oklch, var(--primary) 40%, transparent) 30%,
        transparent 70%
      );
      filter: blur(6px);
    }

    @media (prefers-reduced-motion: no-preference) {
      .pulse {
        animation: travel linear infinite;
      }
      .glow {
        animation: breathe 4s ease-in-out infinite;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .pulse {
        display: none;
      }
    }

    @keyframes travel {
      to {
        stroke-dashoffset: 0;
      }
    }

    /* scale, not transform: the centring translate is already on the element, and a
       transform keyframe would shift the glow off the point where the threads meet. */
    @keyframes breathe {
      50% {
        opacity: 0.7;
        scale: 0.85;
      }
    }
  `,
})
export class BgLightThreads {
  /** How many threads to draw. */
  readonly count = input(18, { transform: numberAttribute });
  /** Where the threads meet, as fractions of the section's width and height. */
  readonly focusX = input(0.55, { transform: numberAttribute });
  readonly focusY = input(0.55, { transform: numberAttribute });

  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
  protected readonly threads = computed(() =>
    buildThreads(Math.max(1, Math.round(this.count())), this.focusX(), this.focusY())
  );
}
