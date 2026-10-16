import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  numberAttribute,
  booleanAttribute,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface Thread {
  readonly amplitude: number;
  readonly frequency: number;
  readonly speed: number;
  readonly phase: number;
  readonly tilt: number;
}

interface Spark {
  thread: number;
  /** Distance travelled from the pinch, in CSS pixels. */
  distance: number;
  readonly direction: 1 | -1;
  readonly speed: number;
}

const FALLBACK_COLOR = '#7c5cff';
const SPARK_EVERY_MS = 1400;

/** Deterministic pseudo-random numbers, so the composition is the same on every visit. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Volt's signature effect: threads of current that converge on a charged point, lean toward the
 * pointer, and carry sparks outward — one every so often, a burst on click.
 *
 * Drawn on a 2D canvas in the active theme's `--primary`, so it re-colors with every preset like
 * the components do. Browser-only (the canvas is empty in the server render), paused off screen
 * and in background tabs, and a single still frame under `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-volt-threads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pointer-events-none absolute inset-0 block', 'aria-hidden': 'true' },
  template: `<canvas #canvas class="h-full w-full"></canvas>`,
})
export class VoltThreads {
  /** How many threads. */
  readonly count = input(7, { transform: numberAttribute });
  /** Overall brightness, 0–1. */
  readonly intensity = input(1, { transform: numberAttribute });
  /** Where the threads converge, as fractions of the box. */
  readonly pinchX = input(0.62, { transform: numberAttribute });
  readonly pinchY = input(0.5, { transform: numberAttribute });
  /** A color to draw in instead of the page's `--primary` (any CSS color). */
  readonly color = input<string | null>(null);
  /** Follow the pointer and burst on click. */
  readonly interactive = input<boolean, unknown>(true, { transform: booleanAttribute });

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
    const random = seeded(7);
    const threads: Thread[] = Array.from({ length: this.count() }, () => ({
      amplitude: 0.16 + random() * 0.26,
      frequency: 1.1 + random() * 1.8,
      speed: 0.18 + random() * 0.32,
      phase: random() * Math.PI * 2,
      tilt: (random() - 0.5) * 0.5,
    }));
    const sparks: Spark[] = [];

    let width = 0;
    let height = 0;
    let themeColor = FALLBACK_COLOR;
    let color = FALLBACK_COLOR;
    let dark = true;
    let pinchX = 0;
    let pinchY = 0;
    let targetX = 0;
    let targetY = 0;
    let surge = 0;
    let lastSpark = 0;
    let frame = 0;
    let visible = false;
    let start = view.performance.now();

    const readTheme = () => {
      dark = root.classList.contains('dark');
      const primary = view.getComputedStyle(root).getPropertyValue('--primary').trim();
      context.fillStyle = FALLBACK_COLOR;
      context.fillStyle = primary || FALLBACK_COLOR;
      // An unparseable value leaves fillStyle untouched, which is how support is detected.
      themeColor = primary && context.fillStyle !== FALLBACK_COLOR ? primary : FALLBACK_COLOR;
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(view.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      pinchX = targetX = width * this.pinchX();
      pinchY = targetY = height * this.pinchY();
      if (reduceMotion || !visible) {
        draw(start + 2000);
      }
    };

    const threadY = (thread: Thread, x: number, time: number) => {
      const reach = Math.max(width * 0.5, 1);
      const offset = x - pinchX;
      // 0 at the pinch, 1 at the edges: every thread is squeezed through the same point.
      const envelope = Math.min(1, Math.abs(offset) / reach) ** 1.15;
      const wave = Math.sin(
        (x / width) * thread.frequency * Math.PI * 2 + thread.phase + time * thread.speed
      );
      return pinchY + envelope * (wave * thread.amplitude * height + thread.tilt * offset * 0.35);
    };

    const strokeThread = (thread: Thread, time: number, from: number, to: number) => {
      context.beginPath();
      for (let x = from; x <= to; x += 6) {
        const y = threadY(thread, x, time);
        if (x === from) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.stroke();
    };

    const draw = (now: number) => {
      const time = (now - start) / 1000;
      const strength = this.intensity() * (1 + surge * 0.8);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      context.lineCap = 'round';
      // An explicit color wins over the page's; read every frame, so it follows live edits.
      color = this.color() ?? themeColor;
      context.strokeStyle = color;

      // Glow, then the thread itself, then (in the dark) a white-hot core.
      for (const thread of threads) {
        context.globalAlpha = (dark ? 0.12 : 0.07) * strength;
        context.lineWidth = 6;
        strokeThread(thread, time, 0, width);
        context.globalAlpha = (dark ? 0.75 : 0.5) * strength;
        context.lineWidth = 1.4;
        strokeThread(thread, time, 0, width);
      }
      if (dark) {
        context.strokeStyle = '#ffffff';
        context.globalAlpha = 0.28 * strength;
        context.lineWidth = 0.6;
        threads.forEach(thread => strokeThread(thread, time, 0, width));
        context.strokeStyle = color;
      }

      // The charged point.
      const radius = Math.min(width, height) * (0.12 + 0.03 * Math.sin(time * 2.2) + surge * 0.1);
      const glow = context.createRadialGradient(pinchX, pinchY, 0, pinchX, pinchY, radius);
      glow.addColorStop(0, dark ? '#ffffff' : color);
      glow.addColorStop(0.18, color);
      glow.addColorStop(1, 'transparent');
      context.globalAlpha = (dark ? 0.55 : 0.25) * strength;
      context.fillStyle = glow;
      context.fillRect(pinchX - radius, pinchY - radius, radius * 2, radius * 2);

      // Sparks: a bright head with a short trail of lit thread behind it.
      for (const spark of sparks) {
        const thread = threads[spark.thread];
        const x = pinchX + spark.direction * spark.distance;
        const tail = pinchX + spark.direction * Math.max(0, spark.distance - 90);
        context.globalAlpha = 0.9 * strength;
        context.lineWidth = 2.2;
        context.strokeStyle = dark ? '#ffffff' : color;
        strokeThread(thread, time, Math.min(x, tail), Math.max(x, tail));
        context.strokeStyle = color;
        const head = context.createRadialGradient(
          x,
          threadY(thread, x, time),
          0,
          x,
          threadY(thread, x, time),
          14
        );
        head.addColorStop(0, dark ? '#ffffff' : color);
        head.addColorStop(1, 'transparent');
        context.fillStyle = head;
        context.fillRect(x - 14, threadY(thread, x, time) - 14, 28, 28);
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    };

    const spawn = (count: number) => {
      for (let i = 0; i < count; i++) {
        sparks.push({
          thread: Math.floor(Math.random() * threads.length),
          distance: 0,
          direction: Math.random() < 0.5 ? -1 : 1,
          speed: 380 + Math.random() * 320,
        });
      }
    };

    let previous = view.performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      pinchX += (targetX - pinchX) * 0.06;
      pinchY += (targetY - pinchY) * 0.06;
      surge *= 0.94;
      if (now - lastSpark > SPARK_EVERY_MS) {
        lastSpark = now;
        spawn(1);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].distance += sparks[i].speed * delta;
        if (sparks[i].distance > width) {
          sparks.splice(i, 1);
        }
      }
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
      const baseX = width * this.pinchX();
      const baseY = height * this.pinchY();
      // Lean toward the pointer without following it all the way.
      targetX = baseX + (event.clientX - box.left - baseX) * 0.25;
      targetY = baseY + (event.clientY - box.top - baseY) * 0.25;
    };
    const onLeave = () => {
      targetX = width * this.pinchX();
      targetY = height * this.pinchY();
    };
    const onPress = () => {
      surge = 1;
      spawn(6);
    };

    readTheme();
    const themeChanges = new MutationObserver(() => {
      readTheme();
      if (reduceMotion) {
        draw(start + 2000);
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

    if (this.interactive() && !reduceMotion) {
      area.addEventListener('pointermove', onMove);
      area.addEventListener('pointerleave', onLeave);
      area.addEventListener('pointerdown', onPress);
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
      area.removeEventListener('pointerdown', onPress);
    };
  }
}
