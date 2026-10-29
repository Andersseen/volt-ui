import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltButton } from 'volt';

/** The characters the field is drawn from: the punctuation of code, not letters. */
const GLYPHS = '{}[]()<>/;:=+*.01';
const CELL = 18;
/** The field redraws at about 24 frames a second — glyphs flickering do not need sixty. */
const FRAME_MS = 42;

interface Cell {
  glyph: string;
  /** 0 – 1. A cell lights up, then cools back towards the row's resting brightness. */
  heat: number;
}

/**
 * Hero set over a field of code glyphs that settles towards the bottom edge.
 *
 * The field is one `<canvas>`, so a thousand flickering characters cost one element and
 * no change detection. It is decorative and `aria-hidden`; the headline, copy and actions
 * are ordinary markup above it, and the page reads the same without it.
 *
 * - Nothing touches the canvas until `afterNextRender`, in a browser, so the server renders
 *   the hero without the field and nothing breaks under SSR.
 * - The loop only runs while the hero is on screen (an `IntersectionObserver` pauses it),
 *   and `requestAnimationFrame` already stops in a background tab.
 * - Under `prefers-reduced-motion: reduce` the field is drawn once and left still.
 * - Colours are read from the theme tokens at draw time, so the field follows the active
 *   preset and dark mode instead of carrying its own palette.
 */
@Component({
  selector: 'app-hero-glyphs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltButton, LmnArrowRightIcon],
  host: { class: 'block' },
  template: `
    <section
      #section
      class="@container relative isolate overflow-hidden bg-background px-4 pb-44 pt-20 @2xl:px-6 @2xl:pb-56 @2xl:pt-28"
    >
      <canvas
        #field
        class="field pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
        aria-hidden="true"
      ></canvas>

      <div class="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <p
          class="rounded-md border border-border bg-background/80 px-3 py-1 font-mono text-xs font-semibold text-muted-foreground backdrop-blur"
        >
          {{ eyebrow() }}
        </p>

        <h1
          class="mt-8 text-balance text-5xl font-bold leading-[0.95] tracking-[-0.055em] text-foreground @3xl:text-7xl"
        >
          <!-- The space between lines keeps them apart in the accessible name. -->
          @for (line of headline(); track $index) {
            <span class="block">{{ line }}</span
            >{{ $last ? '' : ' ' }}
          }
        </h1>

        <p class="mt-8 max-w-2xl text-balance text-lg leading-8 text-muted-foreground">
          {{ description() }}
        </p>

        <div class="mt-9 flex w-full flex-col gap-3 @md:w-auto @md:flex-row">
          <volt-button size="lg" class="group w-full min-w-44 @md:w-auto" (click)="primary.emit()">
            {{ primaryLabel() }}
            <lmn-arrow-right
              slot="trailing"
              [size]="16"
              class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </volt-button>
          <volt-button
            variant="outline"
            size="lg"
            class="w-full min-w-44 @md:w-auto"
            (click)="secondary.emit()"
          >
            {{ secondaryLabel() }}
          </volt-button>
        </div>

        @if (stack().length) {
          <ul
            class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            @for (item of stack(); track item) {
              <li class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true"></span>
                {{ item }}
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    /* The field fades out upwards, so it reads as ground under the copy, never behind it. */
    .field {
      mask-image: linear-gradient(to top, black 15%, transparent 95%);
    }
  `,
})
export class HeroGlyphs {
  readonly eyebrow = input('Open source · 1.0 · stable');
  /** One entry per line; the break is part of the rhythm, so it is not left to wrapping. */
  readonly headline = input<readonly string[]>(['Your content.', 'Your code. Your stack.']);
  readonly description = input(
    'The code-first platform that feels at home in your application. Model in TypeScript, give editors a real admin, and keep the site yours.'
  );
  readonly primaryLabel = input('Start building');
  readonly secondaryLabel = input('Explore the live demo');
  readonly stack = input<readonly string[]>([
    'Angular + Analog',
    'Edge database',
    'Portable storage',
  ]);

  readonly primary = output<void>();
  readonly secondary = output<void>();

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('field');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Analog's dev server runs after-render hooks during SSR too, where there is no canvas.
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    afterNextRender(() => {
      if (!isBrowser) return;
      const stop = startField(this.canvas().nativeElement, this.section().nativeElement);
      destroyRef.onDestroy(stop);
    });
  }
}

/**
 * Runs the glyph field on a canvas until the returned function is called. Kept outside the
 * class so the component stays about the hero, and the drawing reads top to bottom.
 */
function startField(canvas: HTMLCanvasElement, observed: HTMLElement): () => void {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cells: Cell[][] = [];
  let frame = 0;
  let last = 0;
  let visible = true;

  const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const columns = Math.ceil(width / CELL);
    const rows = Math.ceil(height / CELL);
    cells = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ glyph: randomGlyph(), heat: 0 }))
    );
    draw();
  };

  const draw = () => {
    const styles = getComputedStyle(canvas);
    const ink = styles.getPropertyValue('--muted-foreground').trim() || 'gray';
    const spark = styles.getPropertyValue('--primary').trim() || ink;
    const { width, height } = canvas.getBoundingClientRect();

    context.clearRect(0, 0, width, height);
    context.font = `${CELL - 6}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    cells.forEach((row, y) => {
      // Denser and brighter towards the bottom edge, so the field has a floor.
      const depth = (y + 1) / cells.length;
      row.forEach((cell, x) => {
        const resting = depth * depth * 0.55;
        // Thin the upper rows out: a cell only shows if it is warm or deep enough.
        if (cell.heat < 0.05 && ((x * 7 + y * 13) % 10) / 10 > depth) return;

        context.globalAlpha = Math.min(1, resting + cell.heat);
        context.fillStyle = cell.heat > 0.35 ? spark : ink;
        context.fillText(cell.glyph, x * CELL + CELL / 2, y * CELL + CELL / 2);
      });
    });
    context.globalAlpha = 1;
  };

  const step = () => {
    for (const row of cells) {
      for (const cell of row) {
        cell.heat *= 0.9;
        if (Math.random() < 0.012) cell.glyph = randomGlyph();
      }
    }
    // A handful of new sparks each frame, biased towards the lower half.
    for (let i = 0; i < 4 && cells.length; i++) {
      const y = cells.length - 1 - Math.floor(Math.random() ** 2 * cells.length);
      const row = cells[y];
      const cell = row[Math.floor(Math.random() * row.length)];
      if (cell) cell.heat = 1;
    }
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (!visible || now - last < FRAME_MS) return;
    last = now;
    step();
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
