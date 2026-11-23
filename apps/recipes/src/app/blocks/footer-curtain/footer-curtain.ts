import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import {
  LmnCameraIcon,
  LmnGithubIcon,
  LmnMailIcon,
  LmnMapPinIcon,
  LmnMessageCircleIcon,
  LmnPhoneIcon,
} from 'lumen-icons';
import { VoltNativeButton, VoltSeparator, VoltTooltip, VoltTooltipContent } from 'volt';

/** Grid spacing, dot size and share of glowing dots, matched to the Contact Map's dots. */
const GAP = 16;
const RADIUS = 1;
const GLOW_SHARE = 0.1;
/** How often the theme colour is read again, so a theme switch shows up without a reload. */
const COLOR_REFRESH_MS = 1000;

interface Dot {
  readonly x: number;
  readonly y: number;
  readonly base: number;
  readonly glow: boolean;
  readonly speed: number;
  readonly phase: number;
}

const EXPLORE = ['About', 'Services', 'Work', 'Contact'];
const SERVICES = ['Site surveys', 'Aerial mapping', 'Field photography'];
const SOCIAL = [
  { label: 'GitHub', icon: 'github' },
  { label: 'Photo journal', icon: 'camera' },
  { label: 'Chat with us', icon: 'chat' },
] as const;

/**
 * The page lifts off the footer like a curtain.
 *
 * The footer is `position: sticky; bottom: 0` behind the page, and the page above it is
 * `position: relative` with a `z-index` and an opaque background, so the footer is revealed as
 * the page scrolls away. In your app that is your `<main>`: give it `relative z-10
 * bg-background` and put this footer right after it. Here a short stand-in plays that part.
 *
 * A sticky footer taller than the viewport hides its own top forever, so it is half a screen
 * on a wide layout and one full screen on a phone, with two link columns side by side so it
 * fits. A fixed "back to top" button, if you have one, belongs above the bottom line.
 *
 * Behind it, a canvas draws a grid of dots where about one in ten slowly swells and brightens.
 * Its colour is read from the theme about once a second, so a theme switch shows; it stops
 * drawing off screen or in a hidden tab, and draws one still frame under reduced motion.
 */
@Component({
  selector: 'app-footer-curtain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNativeButton,
    VoltSeparator,
    VoltTooltip,
    VoltTooltipContent,
    LmnCameraIcon,
    LmnGithubIcon,
    LmnMailIcon,
    LmnMapPinIcon,
    LmnMessageCircleIcon,
    LmnPhoneIcon,
  ],
  host: { class: '@container block' },
  template: `
    <!-- Stand-in for your <main>: relative, above the footer, opaque. -->
    <div
      class="relative z-10 flex min-h-[60svh] flex-col justify-center rounded-b-[2rem] border-b border-border bg-background px-4 py-24 text-center shadow-[0_24px_48px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] @2xl:px-6"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        End of the page
      </p>
      <p class="mx-auto mt-3 max-w-xl text-balance text-2xl font-semibold tracking-tight">
        Keep scrolling: the page lifts away and the footer is already waiting behind it.
      </p>
    </div>

    <footer
      class="sticky bottom-0 isolate flex min-h-svh flex-col overflow-hidden bg-background @4xl:min-h-[50svh]"
    >
      <div class="glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <canvas #canvas class="block size-full"></canvas>
      </div>

      <div
        class="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-14 @2xl:px-6 @4xl:py-12"
      >
        <div
          class="grid grid-cols-2 gap-x-6 gap-y-10 @4xl:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] @4xl:gap-8"
        >
          <div class="col-span-2 flex flex-col items-start gap-4 @4xl:col-span-1">
            <a
              href="#top"
              class="flex items-center gap-2 rounded-sm text-lg font-bold tracking-tight"
            >
              <span
                class="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <lmn-map-pin [size]="16" />
              </span>
              Fieldline
            </a>
            <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Surveys, aerial maps and photographs of the land, before anyone builds on it.
            </p>
            <ul class="flex gap-2">
              @for (link of social; track link.label) {
                <li>
                  <a
                    voltButton
                    variant="outline"
                    size="icon"
                    href="#"
                    class="rounded-full text-muted-foreground"
                    [attr.aria-label]="link.label"
                    [voltTooltip]="tooltip"
                    [context]="link.label"
                  >
                    @switch (link.icon) {
                      @case ('github') {
                        <lmn-github [size]="16" />
                      }
                      @case ('camera') {
                        <lmn-camera [size]="16" />
                      }
                      @case ('chat') {
                        <lmn-message-circle [size]="16" />
                      }
                    }
                  </a>
                </li>
              }
            </ul>
          </div>

          <nav aria-labelledby="footer-curtain-explore">
            <h2 id="footer-curtain-explore" class="text-sm font-semibold">Explore</h2>
            <ul class="mt-4 grid gap-2.5 text-sm">
              @for (item of explore; track item) {
                <li>
                  <a
                    voltButton
                    variant="link"
                    class="h-auto p-0 text-muted-foreground data-[hover]:text-foreground"
                    [href]="'#' + item.toLowerCase()"
                    >{{ item }}</a
                  >
                </li>
              }
            </ul>
          </nav>

          <nav aria-labelledby="footer-curtain-services">
            <h2 id="footer-curtain-services" class="text-sm font-semibold">Services</h2>
            <ul class="mt-4 grid gap-2.5 text-sm">
              @for (item of services; track item) {
                <li>
                  <a
                    voltButton
                    variant="link"
                    class="h-auto p-0 text-muted-foreground data-[hover]:text-foreground"
                    href="#services"
                    >{{ item }}</a
                  >
                </li>
              }
            </ul>
          </nav>

          <div class="col-span-2 @4xl:col-span-1">
            <h2 class="text-sm font-semibold">Contact</h2>
            <ul class="mt-4 grid gap-2.5 text-sm">
              <li>
                <a
                  voltButton
                  variant="link"
                  class="h-auto gap-2 p-0 text-muted-foreground data-[hover]:text-foreground"
                  href="mailto:hello@fieldline.example"
                  ><lmn-mail [size]="16" />hello&#64;fieldline.example</a
                >
              </li>
              <li>
                <a
                  voltButton
                  variant="link"
                  class="h-auto gap-2 p-0 text-muted-foreground data-[hover]:text-foreground"
                  href="tel:+41000000000"
                  ><lmn-phone [size]="16" />+41 00 000 00 00</a
                >
              </li>
              <li class="flex items-center gap-2 text-muted-foreground">
                <lmn-map-pin [size]="16" />Bern, Switzerland
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-6xl px-4 @2xl:px-6">
        <volt-separator />
        <div
          class="flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-muted-foreground"
        >
          <p>&copy; {{ year }} Fieldline Studio. All rights reserved.</p>
          <p>Fieldwork across the Alps and beyond.</p>
        </div>
      </div>
    </footer>

    <!-- A tooltip's context arrives as a signal, hence label(). -->
    <ng-template #tooltip let-label>
      <volt-tooltip-content>{{ label() }}</volt-tooltip-content>
    </ng-template>
  `,
  styles: `
    .glow {
      /* The canvas reads this colour, so the dots follow the theme. */
      color: var(--foreground);
      /* Solid along the top edge, where the Contact Map's dots arrive; fading to the sides and
         the bottom. */
      mask-image:
        linear-gradient(to bottom, black 35%, transparent),
        linear-gradient(to right, transparent, black 12%, black 88%, transparent);
      mask-composite: intersect;
    }
  `,
})
export class FooterCurtain {
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly explore = EXPLORE;
  protected readonly services = SERVICES;
  protected readonly social = SOCIAL;
  protected readonly year = new Date().getFullYear();

  constructor() {
    // Browser only: afterNextRender never runs on the server.
    afterNextRender(() => this.glow());
  }

  private glow(): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dots: Dot[] = [];
    let color = '';
    let colorReadAt = 0;
    let frame: number | undefined;
    let visible = false;

    const layout = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) {
          dots.push({
            x,
            y,
            base: 0.12 + Math.random() * 0.12,
            glow: Math.random() < GLOW_SHARE,
            speed: 0.4 + Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const draw = (time: number) => {
      if (!color || time - colorReadAt > COLOR_REFRESH_MS) {
        color = getComputedStyle(canvas).color;
        colorReadAt = time;
      }
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      const seconds = time / 1000;
      for (const dot of dots) {
        if (!dot.glow) {
          context.globalAlpha = dot.base;
          context.fillRect(dot.x - RADIUS, dot.y - RADIUS, RADIUS * 2, RADIUS * 2);
          continue;
        }
        // A glowing dot swells and brightens, with a faint halo at its peak.
        const pulse = still.matches ? 0.5 : (Math.sin(seconds * dot.speed + dot.phase) + 1) / 2;
        const strength = pulse * pulse;
        context.globalAlpha = 0.025 * strength;
        context.beginPath();
        context.arc(dot.x, dot.y, RADIUS * 5, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = dot.base + 0.32 * strength;
        context.beginPath();
        context.arc(dot.x, dot.y, RADIUS * (1 + 0.3 * strength), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      frame = undefined;
      draw(time);
      if (visible && !still.matches && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (frame === undefined) frame = requestAnimationFrame(loop);
    };

    const resize = new ResizeObserver(() => {
      layout();
      start();
    });
    resize.observe(canvas);
    const view = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
    });
    view.observe(canvas);
    document.addEventListener('visibilitychange', start);
    still.addEventListener('change', start);

    this.destroyRef.onDestroy(() => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      resize.disconnect();
      view.disconnect();
      document.removeEventListener('visibilitychange', start);
      still.removeEventListener('change', start);
    });
  }
}
