import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VoltBadge, VoltButton } from 'volt';

/** Strands per ribbon, and the gap between them, in CSS pixels. */
const STRANDS = 14;
const STRAND_GAP = 5;
/** Horizontal distance between two particles on a strand. */
const STEP = 7;
/** The ribbons redraw at about 30 frames a second; a slow swell does not need sixty. */
const FRAME_MS = 33;

interface Ribbon {
  /** Vertical centre, as a fraction of the height. */
  readonly y: number;
  /** How far the ribbon climbs from left to right, as a fraction of the height. */
  readonly tilt: number;
  readonly amplitude: number;
  readonly wavelength: number;
  readonly phase: number;
  readonly alpha: number;
}

const RIBBONS: readonly Ribbon[] = [
  { y: 0.72, tilt: -0.42, amplitude: 46, wavelength: 520, phase: 0, alpha: 0.95 },
  { y: 0.58, tilt: -0.3, amplitude: 34, wavelength: 680, phase: 2.1, alpha: 0.6 },
  { y: 0.86, tilt: -0.22, amplitude: 28, wavelength: 420, phase: 4.2, alpha: 0.4 },
];

/**
 * A section backed by ribbons of particles that swell slowly across it, like light caught in
 * silk.
 *
 * Every particle is a one-pixel square on one `<canvas>`, so thousands of them cost a single
 * element and no change detection. Each ribbon is a set of parallel strands following the same
 * sine wave; the strands nearest the middle are brightest, which is what gives the band depth
 * without any 3D maths.
 *
 * Whatever you project is drawn above the field; with nothing projected, a demo heading shows
 * what the effect looks like behind real copy.
 *
 * - Nothing touches the canvas until `afterNextRender`, in a browser, so SSR renders the
 *   section and its content without the field.
 * - The loop pauses while the section is off screen.
 * - Under `prefers-reduced-motion: reduce` the ribbons are drawn once and left still.
 * - The colour is read from `--primary`, so the field follows the theme preset.
 */
@Component({
  selector: 'app-bg-particle-wave',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltButton],
  host: { class: 'block' },
  template: `
    <section
      #section
      class="@container relative isolate flex min-h-[28rem] items-center overflow-hidden bg-background px-4 py-20 @2xl:px-6"
    >
      <canvas
        #field
        class="field pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      ></canvas>

      <div class="relative mx-auto w-full max-w-3xl text-center">
        <ng-content>
          <volt-badge variant="outline" class="bg-background/80 font-mono backdrop-blur"
            >Background · particle wave</volt-badge
          >
          <h2
            class="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground @3xl:text-6xl"
          >
            Motion that follows your state.
          </h2>
          <p class="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Put any content here. The field stays behind it, quiet enough to read over.
          </p>
          <div class="mt-8 flex flex-wrap gap-3 justify-center">
            <volt-button size="lg">Get started</volt-button>
            <volt-button size="lg" variant="outline">See the source</volt-button>
          </div>
        </ng-content>
      </div>
    </section>
  `,
  styles: `
    /* Keeps the band away from the centre of the copy, where the headline sits. */
    .field {
      mask-image: radial-gradient(ellipse 45% 35% at 50% 45%, transparent 30%, black 75%);
    }
  `,
})
export class BgParticleWave {
  /** 1 is the designed pace; 0.5 is half as fast, 2 twice. */
  readonly speed = input(1, { transform: numberAttribute });

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('field');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Analog's dev server runs after-render hooks during SSR too, where there is no canvas.
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    afterNextRender(() => {
      if (!isBrowser) return;
      const stop = startWave(this.canvas().nativeElement, this.section().nativeElement, () =>
        this.speed()
      );
      destroyRef.onDestroy(stop);
    });
  }
}

/** Runs the ribbons on a canvas until the returned function is called. */
function startWave(
  canvas: HTMLCanvasElement,
  observed: HTMLElement,
  speed: () => number
): () => void {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;
  let time = 0;
  let visible = true;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const box = canvas.getBoundingClientRect();
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  };

  const draw = () => {
    const colour = getComputedStyle(canvas).getPropertyValue('--primary').trim() || 'gray';
    context.clearRect(0, 0, width, height);
    context.fillStyle = colour;

    for (const ribbon of RIBBONS) {
      for (let strand = 0; strand < STRANDS; strand++) {
        // Brightest in the middle strands, fading towards both edges of the band.
        const centre = 1 - Math.abs(strand - (STRANDS - 1) / 2) / (STRANDS / 2);
        const offset = (strand - STRANDS / 2) * STRAND_GAP;

        for (let x = -STEP; x <= width + STEP; x += STEP) {
          const along = x / Math.max(width, 1);
          const wave =
            Math.sin((x + strand * 9) / (ribbon.wavelength / (2 * Math.PI)) + time + ribbon.phase) *
            ribbon.amplitude *
            (0.6 + along * 0.8);
          const y = height * (ribbon.y + ribbon.tilt * along) + wave + offset * (0.6 + along);
          // A slow shimmer travelling along the strand, so it never reads as a static stripe.
          const shimmer = 0.55 + 0.45 * Math.sin(x * 0.02 - time * 2 + strand);

          context.globalAlpha = ribbon.alpha * centre * shimmer;
          context.fillRect(x, y, 1.8, 1.8);
        }
      }
    }
    context.globalAlpha = 1;
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (!visible || now - last < FRAME_MS) return;
    time += ((now - (last || now)) / 1000) * 0.45 * speed();
    last = now;
    draw();
  };

  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  const viewport = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  viewport.observe(observed);

  resize();
  if (!still) frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    resizer.disconnect();
    viewport.disconnect();
  };
}
