import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

const FALLBACK_COLOR = '#7c5cff';
/** How quickly the bend follows the pointer (per second): slow, so it reads as a current, not a cursor. */
const EASE_PER_SECOND = 1.1;
/** The most a line moves for the pointer, in CSS pixels. */
const BEND = 12;

/**
 * Recipes' hero background: fine horizontal lines that drift like a slow tide, a scanning band that
 * sweeps up and down and lights the lines it crosses, and a soft bulge where the pointer is.
 *
 * The sibling of the docs site's threads: drawn on a 2D canvas in the active theme's `--primary`, so
 * it re-colors with every preset; browser-only (the canvas is empty in the server render), paused off
 * screen and in background tabs, and a single still frame under `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-scan-lines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pointer-events-none absolute inset-0 block', 'aria-hidden': 'true' },
  template: `<canvas #canvas class="h-full w-full"></canvas>`,
})
export class ScanLines {
  /** How many lines. */
  readonly count = input(26, { transform: numberAttribute });

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => destroyRef.onDestroy(this.start()));
  }

  /** Sets everything up and returns the teardown. */
  private start(): () => void {
    const view = this.document.defaultView;
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!view || !context) {
      return () => undefined;
    }

    const root = this.document.documentElement;
    const reduceMotion = view.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = Array.from({ length: this.count() }, (_, i) => ({
      phase: i * 0.7,
      speed: 0.18 + (i % 5) * 0.035,
      amplitude: 5 + (i % 4) * 2.5,
    }));

    let width = 0;
    let height = 0;
    let color = FALLBACK_COLOR;
    let dark = true;
    let frame = 0;
    let visible = false;
    let start = view.performance.now();
    // The pointer, eased: x/y in CSS pixels, and how strongly it bends (0 when it has left).
    let pointerX = 0;
    let pointerY = 0;
    let pull = 0;
    let targetX = 0;
    let targetY = 0;
    let targetPull = 0;

    const readTheme = () => {
      dark = root.classList.contains('dark');
      const primary = view.getComputedStyle(root).getPropertyValue('--primary').trim();
      context.strokeStyle = FALLBACK_COLOR;
      context.strokeStyle = primary || FALLBACK_COLOR;
      // An unparseable value leaves strokeStyle untouched, which is how support is detected.
      color = primary && context.strokeStyle !== FALLBACK_COLOR ? primary : FALLBACK_COLOR;
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(view.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reduceMotion || !visible) {
        draw(start + 4000);
      }
    };

    const lineY = (base: number, line: (typeof lines)[number], x: number, time: number) => {
      const u = x / Math.max(width, 1);
      // A gentle sag across the width, a slow tide along each line, and a bulge away from the pointer.
      const sag = Math.sin(u * Math.PI) * height * 0.035;
      const tide = Math.sin(u * Math.PI * 2.2 + line.phase + time * line.speed) * line.amplitude;
      // A soft swell around the pointer: lines ease apart above and below it, with no seam at the
      // pointer itself (dy / √(dy² + k²) passes through zero smoothly, where a sign() would split).
      const dx = (x - pointerX) / (width * 0.3);
      const dy = base - pointerY;
      const swell = Math.exp(-dx * dx) * Math.exp(-(dy * dy) / (2 * 140 * 140));
      const bulge = pull * BEND * swell * (dy / Math.sqrt(dy * dy + 70 * 70));
      return base + sag + tide + bulge;
    };

    const stroke = (base: number, line: (typeof lines)[number], time: number) => {
      context.beginPath();
      for (let x = 0; x <= width + 8; x += 8) {
        const y = lineY(base, line, x, time);
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.stroke();
    };

    const draw = (now: number) => {
      const time = (now - start) / 1000;
      // The scan band glides up and down, never quite reaching the edges.
      const scan = height * (0.5 + 0.36 * Math.sin(time * 0.32));
      const reach = height * 0.11;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      context.lineCap = 'round';

      // The band's own soft light, behind the lines.
      const band = context.createLinearGradient(0, scan - reach * 2, 0, scan + reach * 2);
      band.addColorStop(0, 'transparent');
      band.addColorStop(0.5, color);
      band.addColorStop(1, 'transparent');
      context.globalAlpha = dark ? 0.08 : 0.05;
      context.fillStyle = band;
      context.fillRect(0, scan - reach * 2, width, reach * 4);

      const gap = height / (lines.length + 1);
      lines.forEach((line, index) => {
        const base = gap * (index + 1);
        // Lit by the scan band, and a little by the pointer, so there is something to notice.
        const near = pull * 0.35 * Math.exp(-((base - pointerY) ** 2) / (2 * 80 * 80));
        const lit = Math.min(1, Math.exp(-(((base - scan) / reach) ** 2)) + near);
        context.strokeStyle = color;

        context.globalAlpha = (dark ? 0.04 : 0.03) + lit * (dark ? 0.22 : 0.12);
        context.lineWidth = 5;
        stroke(base, line, time);

        context.globalAlpha = (dark ? 0.16 : 0.12) + lit * 0.7;
        context.lineWidth = 1.1;
        stroke(base, line, time);

        // A hot core on the lines inside the band.
        if (lit > 0.25) {
          context.strokeStyle = dark ? '#ffffff' : color;
          context.globalAlpha = lit * (dark ? 0.75 : 0.5);
          context.lineWidth = 0.7;
          stroke(base, line, time);
        }
      });

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    };

    let previous = view.performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      // Exponential easing on real elapsed time: the same glide at 60 Hz and 120 Hz.
      const ease = 1 - Math.exp(-delta * EASE_PER_SECOND);
      pointerX += (targetX - pointerX) * ease;
      pointerY += (targetY - pointerY) * ease;
      pull += (targetPull - pull) * ease;
      draw(now);
      frame = view.requestAnimationFrame(tick);
    };

    const run = () => {
      view.cancelAnimationFrame(frame);
      if (visible && !reduceMotion && !this.document.hidden) {
        previous = view.performance.now();
        frame = view.requestAnimationFrame(tick);
      }
    };

    const area = this.host.nativeElement.parentElement ?? this.host.nativeElement;
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      targetX = event.clientX - box.left;
      targetY = event.clientY - box.top;
      targetPull = 1;
    };
    const onLeave = () => {
      targetPull = 0;
    };

    readTheme();
    const themeChanges = new MutationObserver(() => {
      readTheme();
      if (reduceMotion) {
        draw(start + 4000);
      }
    });
    themeChanges.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-color', 'style'],
    });

    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    onScreen.observe(canvas);

    const onVisibility = () => run();
    this.document.addEventListener('visibilitychange', onVisibility);

    if (!reduceMotion) {
      area.addEventListener('pointermove', onMove);
      area.addEventListener('pointerleave', onLeave);
    }

    start = view.performance.now();
    resize();

    return () => {
      view.cancelAnimationFrame(frame);
      themeChanges.disconnect();
      sizes.disconnect();
      onScreen.disconnect();
      this.document.removeEventListener('visibilitychange', onVisibility);
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
    };
  }
}
