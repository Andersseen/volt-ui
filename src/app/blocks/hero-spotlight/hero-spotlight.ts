import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { LmnArrowRightIcon, LmnSparklesIcon, LmnStarIcon } from 'lumen-icons';
import { VoltAvatar, VoltAvatarFallback, VoltBadge, VoltButton } from 'volt';

/**
 * Hero with a spotlight that tracks the pointer.
 *
 * The spotlight is one radial gradient parked at `--spot-x` / `--spot-y`. The pointer
 * handler writes those two custom properties straight onto the host, so the effect never
 * goes through change detection — a `signal` here would re-render the whole template on
 * every `pointermove`, which is sixty renders a second for two numbers the compositor
 * could have handled alone.
 *
 * The entrance is a CSS animation rather than a JavaScript one because a hero is above
 * the fold: CSS ships with the server-rendered stylesheet and starts at first paint,
 * while anything driven from JavaScript cannot begin until hydration, by which point the
 * visitor has already seen the final state and would watch it blink out.
 */
@Component({
  selector: 'app-hero-spotlight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltBadge,
    VoltButton,
    LmnArrowRightIcon,
    LmnSparklesIcon,
    LmnStarIcon,
  ],
  host: {
    class: 'hero block',
    '(pointermove)': 'moveSpotlight($event)',
    '(pointerleave)': 'resetSpotlight()',
  },
  template: `
    <section
      class="@container relative isolate overflow-hidden bg-background px-4 py-24 @2xl:px-6 @2xl:py-32"
    >
      <!-- Decorative backdrop: grid, two drifting auroras, and the pointer spotlight. -->
      <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="hero-aurora hero-aurora-a pointer-events-none absolute" aria-hidden="true"></div>
      <div class="hero-aurora hero-aurora-b pointer-events-none absolute" aria-hidden="true"></div>
      <div class="hero-spotlight pointer-events-none absolute inset-0" aria-hidden="true"></div>

      <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <volt-badge
          variant="outline"
          class="rise rise-1 border-primary/30 bg-background/80 px-3 py-1.5 text-primary backdrop-blur"
        >
          <lmn-sparkles [size]="14" class="mr-1.5" />
          Now in public beta
        </volt-badge>

        <h1
          class="rise rise-2 mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground @3xl:text-6xl"
        >
          Interfaces that feel
          <span class="hero-shimmer">alive</span>
          the moment they load.
        </h1>

        <p class="rise rise-3 mt-6 max-w-xl text-balance text-lg leading-8 text-muted-foreground">
          Drop-in Angular sections built from accessible primitives. Copy the source, keep the
          motion, own every line of it.
        </p>

        <div class="rise rise-4 mt-9 flex w-full flex-col gap-3 @md:w-auto @md:flex-row">
          <volt-button size="lg" class="group w-full min-w-44 @md:w-auto">
            Start building
            <lmn-arrow-right
              slot="trailing"
              [size]="16"
              class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </volt-button>
          <volt-button variant="outline" size="lg" class="w-full min-w-44 @md:w-auto">
            Browse blocks
          </volt-button>
        </div>

        <!-- Social proof. The avatars overlap, so they read as one group rather than a list. -->
        <div class="rise rise-5 mt-12 flex flex-col items-center gap-3 @md:flex-row @md:gap-4">
          <div class="flex -space-x-2.5">
            @for (person of people; track person.initials) {
              <volt-avatar
                class="ring-2 ring-background transition-transform duration-300 motion-safe:hover:-translate-y-1"
              >
                <volt-avatar-fallback class="text-xs font-medium">
                  {{ person.initials }}
                </volt-avatar-fallback>
              </volt-avatar>
            }
          </div>
          <div class="flex flex-col items-center gap-1 @md:items-start">
            <div class="flex items-center gap-0.5 text-warning" aria-hidden="true">
              @for (star of stars; track $index) {
                <lmn-star [size]="14" variant="filled" />
              }
            </div>
            <p class="text-sm text-muted-foreground">
              <span class="font-medium text-foreground">4.9 / 5</span>
              from 2,400+ developers
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      /* Parked off-centre until the pointer arrives, so the first paint is not symmetric. */
      --spot-x: 50%;
      --spot-y: 0%;
    }

    .hero-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        );
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 78%);
    }

    /* The spotlight lags the pointer by a frame or two on purpose — an exactly tracking
       highlight reads as a cursor artefact, a trailing one reads as light. */
    .hero-spotlight {
      background: radial-gradient(
        520px circle at var(--spot-x) var(--spot-y),
        color-mix(in oklch, var(--primary) 16%, transparent),
        transparent 65%
      );
      transition:
        background 220ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 300ms ease;
    }

    .hero-aurora {
      border-radius: 9999px;
      filter: blur(72px);
      opacity: 0.5;
    }

    .hero-aurora-a {
      top: -18%;
      left: -8%;
      height: 26rem;
      width: 26rem;
      background: color-mix(in oklch, var(--primary) 45%, transparent);
      animation: drift-a 18s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
    }

    .hero-aurora-b {
      right: -12%;
      bottom: -22%;
      height: 22rem;
      width: 22rem;
      background: color-mix(in oklch, var(--info) 40%, transparent);
      animation: drift-b 22s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
    }

    /* A gradient clipped to the text, then slid slowly across it. Clipping a background
       to the glyphs needs a transparent colour, which is why the span sets both. */
    .hero-shimmer {
      background: linear-gradient(
        110deg,
        var(--primary) 20%,
        color-mix(in oklch, var(--primary) 35%, var(--foreground)) 45%,
        var(--primary) 70%
      );
      background-size: 220% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: shimmer 6s linear infinite;
    }

    .rise {
      animation: rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .rise-1 {
      animation-delay: 40ms;
    }
    .rise-2 {
      animation-delay: 120ms;
    }
    .rise-3 {
      animation-delay: 200ms;
    }
    .rise-4 {
      animation-delay: 280ms;
    }
    .rise-5 {
      animation-delay: 380ms;
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shimmer {
      to {
        background-position: -220% 0;
      }
    }

    @keyframes drift-a {
      to {
        transform: translate3d(6rem, 3rem, 0) scale(1.15);
      }
    }

    @keyframes drift-b {
      to {
        transform: translate3d(-5rem, -3rem, 0) scale(1.1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .rise,
      .hero-shimmer,
      .hero-aurora {
        animation: none;
      }

      .hero-spotlight {
        transition: none;
      }

      .hero-shimmer {
        background: none;
        color: var(--primary);
      }
    }
  `,
})
export class HeroSpotlight {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly people = [
    { initials: 'AR' },
    { initials: 'MK' },
    { initials: 'JT' },
    { initials: 'SL' },
  ];
  protected readonly stars = [1, 2, 3, 4, 5];

  /** Pointer position in host-relative percentages, written straight to the element. */
  protected moveSpotlight(event: PointerEvent): void {
    const element = this.host.nativeElement;
    const box = element.getBoundingClientRect();

    element.style.setProperty('--spot-x', `${((event.clientX - box.left) / box.width) * 100}%`);
    element.style.setProperty('--spot-y', `${((event.clientY - box.top) / box.height) * 100}%`);
  }

  protected resetSpotlight(): void {
    const element = this.host.nativeElement;

    element.style.setProperty('--spot-x', '50%');
    element.style.setProperty('--spot-y', '0%');
  }
}
