import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VoltBadge, VoltButton } from 'volt';

const GLYPHS = '{}[]()<>/;:=+*.01';
const CELL = 20;
const FRAME_MS = 42;
/** Radius of the pointer's light, in CSS pixels. */
const LAMP = 150;

/**
 * A section backed by a grid of code glyphs that light up around the pointer and flicker
 * quietly everywhere else.
 *
 * One `<canvas>`, no change detection: the pointer position is kept in a plain variable the
 * draw loop reads, so moving the mouse never re-renders the template. On touch, or with no
 * pointer over the section, a slow light drifts on its own so the field never looks dead.
 *
 * Whatever you project sits above the field; with nothing projected, a demo heading shows the
 * effect behind real copy.
 *
 * - Nothing touches the canvas until `afterNextRender`, in a browser, so SSR is unaffected.
 * - The loop pauses while the section is off screen.
 * - Under `prefers-reduced-motion: reduce` the field is drawn once, without the drifting light,
 *   and only redraws when the pointer moves.
 * - Colours come from `--muted-foreground` and `--primary`, so the field follows the theme.
 */
@Component({
  selector: 'app-bg-glyph-field',
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
            >Background · glyph field</volt-badge
          >
          <h2
            class="mt-6 text-balance text-4xl font-bold leading-[0.95] tracking-[-0.05em] text-foreground @3xl:text-6xl"
          >
            Your content. Your code.
          </h2>
          <p class="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Move the pointer across the section — the code underneath answers.
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
    /* Clears a calm area behind the copy so the glyphs never fight the headline. */
    .field {
      mask-image: radial-gradient(ellipse 38% 32% at 50% 50%, transparent 40%, black 95%);
    }
  `,
})
export class BgGlyphField {
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

/** Runs the field on a canvas until the returned function is called. */
function startField(canvas: HTMLCanvasElement, section: HTMLElement): () => void {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let glyphs: string[][] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;
  let visible = true;
  /** The pointer, in canvas pixels; `null` while it is elsewhere. */
  let pointer: { x: number; y: number } | null = null;

  const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const box = canvas.getBoundingClientRect();
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    glyphs = Array.from({ length: Math.ceil(height / CELL) }, () =>
      Array.from({ length: Math.ceil(width / CELL) }, randomGlyph)
    );
    draw(0);
  };

  const draw = (time: number) => {
    const styles = getComputedStyle(canvas);
    const ink = styles.getPropertyValue('--muted-foreground').trim() || 'gray';
    const lit = styles.getPropertyValue('--primary').trim() || ink;
    // Without a pointer the light wanders on a slow figure of eight.
    const lamp =
      pointer ??
      (still
        ? null
        : {
            x: width * (0.5 + 0.35 * Math.sin(time / 4200)),
            y: height * (0.5 + 0.3 * Math.sin(time / 2100)),
          });

    context.clearRect(0, 0, width, height);
    context.font = `${CELL - 8}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    glyphs.forEach((row, y) =>
      row.forEach((glyph, x) => {
        const cx = x * CELL + CELL / 2;
        const cy = y * CELL + CELL / 2;
        const near = lamp ? Math.max(0, 1 - Math.hypot(cx - lamp.x, cy - lamp.y) / LAMP) : 0;

        context.globalAlpha = 0.14 + near * 0.86;
        context.fillStyle = near > 0.3 ? lit : ink;
        context.fillText(glyph, cx, cy);
      })
    );
    context.globalAlpha = 1;
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (!visible || now - last < FRAME_MS) return;
    last = now;
    for (const row of glyphs) {
      for (let x = 0; x < row.length; x++) if (Math.random() < 0.01) row[x] = randomGlyph();
    }
    draw(now);
  };

  const move = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    if (still) draw(0);
  };
  const leave = () => {
    pointer = null;
    if (still) draw(0);
  };
  section.addEventListener('pointermove', move);
  section.addEventListener('pointerleave', leave);

  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  const viewport = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  viewport.observe(section);

  resize();
  if (!still) frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    section.removeEventListener('pointermove', move);
    section.removeEventListener('pointerleave', leave);
    resizer.disconnect();
    viewport.disconnect();
  };
}
