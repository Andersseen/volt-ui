import { IMAGE_LOADER, type ImageLoaderConfig, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LmnArrowRightIcon, LmnPauseIcon, LmnPlayIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltNativeButton,
  VoltToggleGroup,
  VoltToggleGroupItem,
  VoltTooltip,
  VoltTooltipContent,
} from 'volt';

interface Photo {
  /** Unsplash photo id; the loader below turns it into a sized URL. */
  readonly id: string;
  readonly alt: string;
  /** CSS object-position that keeps the subject in frame when the photo is cropped. */
  readonly focus: string;
}

/** Replace with your own photos. Any image CDN works: swap the loader below. */
const PHOTOS: readonly Photo[] = [
  {
    id: 'photo-1506905925346-21bda4d32df4',
    alt: 'A sea of clouds below snow peaks at dawn',
    focus: '50% 60%',
  },
  {
    id: 'photo-1501785888041-af3ef285b470',
    alt: 'A boat crossing a turquoise alpine lake',
    focus: '45% 75%',
  },
  {
    id: 'photo-1470071459604-3b5ec3a7fe05',
    alt: 'Mist rolling over green sea cliffs',
    focus: '35% 50%',
  },
  {
    id: 'photo-1464822759023-fed622ff2c3b',
    alt: 'A valley lake beneath pine-covered slopes',
    focus: '50% 55%',
  },
  {
    id: 'photo-1469474968028-56623f02e42e',
    alt: 'A hiker on a ridge above a green valley',
    focus: '68% 50%',
  },
];

const TAGS = ['Site surveys', 'Aerial mapping', 'Field photography'];

/** Unsplash resizes on the fly, so NgOptimizedImage can build a real srcset from one id. */
function unsplashLoader({ src, width }: ImageLoaderConfig): string {
  return `https://images.unsplash.com/${src}?auto=format&fit=crop&q=75&w=${width ?? 1600}`;
}

/**
 * Split hero: the message on one side, a tall photo on the other with a strip of thumbnails
 * cut into its edge.
 *
 * The strip sits in a notch painted in the page background; two pseudo-elements with a
 * radial gradient round the photo's edge into it (inverted corners). It runs down the right
 * edge on a wide section and along the bottom edge on a narrow one, and the arrow keys of the
 * toggle group follow it, because the orientation is measured from the same width the CSS
 * container query answers to.
 *
 * Autoplay cannot drift from what you see: a bar inside the active thumbnail fills with a CSS
 * animation and its `animationend` moves to the next photo. Pausing is
 * `animation-play-state: paused` while the pointer is on the carousel or keyboard focus is
 * inside it, and the pause button stops it for good (WCAG 2.2.2). Autoplay never starts under
 * `prefers-reduced-motion`; the strip and the button still work.
 */
@Component({
  selector: 'app-hero-rail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    VoltBadge,
    VoltNativeButton,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltTooltip,
    VoltTooltipContent,
    LmnArrowRightIcon,
    LmnPauseIcon,
    LmnPlayIcon,
  ],
  providers: [{ provide: IMAGE_LOADER, useValue: unsplashLoader }],
  host: { class: 'block' },
  template: `
    <section
      #section
      class="@container bg-background px-4 py-16 @2xl:px-6 @4xl:py-20"
      aria-labelledby="hero-rail-title"
    >
      <div
        class="mx-auto grid max-w-6xl content-center gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @4xl:gap-16"
      >
        <!-- Visible at first paint, so it enters with CSS rather than after hydration. -->
        <div class="flex min-w-0 flex-col items-start gap-6 @4xl:py-8">
          <p
            class="enter flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            style="--delay: 60ms"
          >
            <span class="h-px w-8 bg-current" aria-hidden="true"></span>Fieldline Studio
          </p>
          <h1
            id="hero-rail-title"
            class="enter text-balance text-4xl font-bold leading-[1.05] tracking-tight @2xl:text-5xl @5xl:text-6xl"
            style="--delay: 120ms"
          >
            We read the land before anyone builds on it.
          </h1>
          <p
            class="enter max-w-xl text-pretty text-base leading-relaxed text-muted-foreground @2xl:text-lg"
            style="--delay: 200ms"
          >
            Surveys, aerial maps and photographs of the places you are about to change, delivered as
            one report your planners, engineers and neighbours can all read.
          </p>
          <div class="enter flex flex-wrap gap-3 pt-2" style="--delay: 280ms">
            <a voltButton size="lg" class="rounded-full" href="#contact">
              Plan a survey
              <lmn-arrow-right [size]="16" />
            </a>
            <a voltButton size="lg" variant="outline" class="rounded-full" href="#work">
              See recent work
            </a>
          </div>
          <ul class="enter flex flex-wrap gap-2 pt-4" style="--delay: 360ms" aria-label="Services">
            @for (tag of tags; track tag) {
              <li>
                <volt-badge variant="outline" class="rounded-full px-3 py-1 font-medium">
                  {{ tag }}
                </volt-badge>
              </li>
            }
          </ul>
        </div>

        <div
          class="enter flex min-w-0 flex-col gap-3"
          style="--delay: 160ms"
          aria-roledescription="carousel"
          aria-label="Recent fieldwork"
          (pointerenter)="hovered.set(true)"
          (pointerleave)="hovered.set(false)"
          (focusin)="focused.set(isKeyboardFocus($event))"
          (focusout)="focused.set(false)"
        >
          <div class="frame relative isolate overflow-hidden rounded-[2rem] bg-muted">
            <!-- The outgoing photo stays until its fade-out ends, so the two cross-fade. -->
            @for (layer of layers(); track layer) {
              <div
                class="slide absolute inset-0"
                [class.leave]="layer !== index()"
                [class.enter-photo]="layer === index() && changed()"
                (animationend)="settle($event, layer)"
              >
                <!-- The first photo is the LCP element: priority preloads it from the server. -->
                <img
                  [ngSrc]="photos[layer].id"
                  fill
                  [priority]="layer === 0"
                  sizes="(min-width: 64rem) 55vw, 100vw"
                  [alt]="layer === index() ? photos[layer].alt : ''"
                  class="object-cover"
                  [style.object-position]="photos[layer].focus"
                />
              </div>
            }

            <!-- One photo chosen at a time; the arrow keys move between them. -->
            <volt-toggle-group
              class="rail"
              type="single"
              [allowDeselection]="false"
              [orientation]="orientation()"
              [attr.aria-orientation]="orientation()"
              [value]="selectedValue()"
              (valueChange)="pick($event)"
              aria-label="Choose a photo"
            >
              @for (photo of photos; track photo.id; let i = $index) {
                <volt-toggle-group-item
                  [value]="photo.id"
                  [aria-label]="photo.alt"
                  class="size-12 shrink-0 rounded-xl @2xl:size-14 @4xl:size-16 [&>button]:relative [&>button]:size-full [&>button]:overflow-hidden [&>button]:rounded-[inherit] [&>button]:p-0 [&>button]:opacity-60 [&>button]:transition-opacity [&>button]:hover:opacity-90 [&>button]:data-[selected]:opacity-100"
                >
                  <img
                    [ngSrc]="photo.id"
                    fill
                    ngSrcset="96w, 160w"
                    sizes="64px"
                    alt=""
                    class="thumb object-cover"
                    [style.object-position]="photo.focus"
                  />
                  @if (i === index() && playing()) {
                    <!-- The autoplay clock: it pauses with the carousel and moves on when it fills. -->
                    <span
                      class="progress"
                      aria-hidden="true"
                      [class.paused]="suspended()"
                      (animationend)="step(1)"
                    ></span>
                  }
                </volt-toggle-group-item>
              }
            </volt-toggle-group>
          </div>

          <div class="flex items-center justify-between gap-4 px-1 text-sm">
            <p class="flex min-w-0 items-baseline gap-3">
              <span class="shrink-0 font-semibold tabular-nums">
                {{ pad(index() + 1)
                }}<span class="text-muted-foreground"> / {{ pad(photos.length) }}</span>
              </span>
              @for (current of [index()]; track current) {
                <span
                  class="block min-w-0 truncate text-muted-foreground"
                  [class.caption-in]="changed()"
                  aria-hidden="true"
                  >{{ photos[current].alt }}</span
                >
              }
            </p>
            <button
              voltButton
              type="button"
              variant="ghost"
              size="icon"
              class="size-9 shrink-0 rounded-full"
              [voltTooltip]="tooltip"
              [context]="playing() ? 'Pause slideshow' : 'Play slideshow'"
              [attr.aria-label]="playing() ? 'Pause slideshow' : 'Play slideshow'"
              (click)="playing.set(!playing())"
            >
              @if (playing()) {
                <lmn-pause [size]="16" />
              } @else {
                <lmn-play [size]="16" />
              }
            </button>
          </div>
          <!-- Speaks only when the visitor drives the carousel; autoplay would talk every few seconds. -->
          <p class="sr-only" [attr.aria-live]="playing() ? 'off' : 'polite'">
            Photo {{ index() + 1 }} of {{ photos.length }}: {{ photos[index()].alt }}
          </p>
        </div>
      </div>
    </section>

    <!-- A tooltip's context arrives as a signal, hence label(). -->
    <ng-template #tooltip let-label>
      <volt-tooltip-content>{{ label() }}</volt-tooltip-content>
    </ng-template>
  `,
  styles: `
    .frame {
      height: min(68svh, 34rem);
    }

    /* The notch. Volt's toggle group draws a bordered pill; here it is the cut-out, painted in
       the page background, so its own surface goes. */
    .rail {
      --notch: 1.25rem;
      --cut: var(--background);
      position: absolute;
      bottom: 0;
      left: 50%;
      translate: -50% 0;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.375rem 0;
      border: 0;
      border-radius: var(--notch) var(--notch) 0 0;
      background: var(--cut);
      box-shadow: none;
    }

    .rail::before,
    .rail::after {
      content: '';
      position: absolute;
      bottom: 0;
      width: var(--notch);
      height: var(--notch);
      pointer-events: none;
    }

    /* Inverted corners: transparent inside the circle, background outside it. */
    .rail::before {
      right: 100%;
      background: radial-gradient(
        circle at 0 0,
        transparent var(--notch),
        var(--cut) calc(var(--notch) + 0.5px)
      );
    }

    .rail::after {
      left: 100%;
      background: radial-gradient(
        circle at 100% 0,
        transparent var(--notch),
        var(--cut) calc(var(--notch) + 0.5px)
      );
    }

    /* Wide: the strip runs down the right edge. The same 56rem the code measures. */
    @container (min-width: 56rem) {
      .frame {
        height: min(calc(100svh - 9rem), 44rem);
      }

      .rail {
        --notch: 1.5rem;
        top: 50%;
        right: 0;
        bottom: auto;
        left: auto;
        translate: 0 -50%;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem 0 0.5rem 0.5rem;
        border-radius: var(--notch) 0 0 var(--notch);
      }

      .rail::before,
      .rail::after {
        right: 0;
        left: auto;
      }

      .rail::before {
        bottom: 100%;
        background: radial-gradient(
          circle at 0 0,
          transparent var(--notch),
          var(--cut) calc(var(--notch) + 0.5px)
        );
      }

      .rail::after {
        top: 100%;
        bottom: auto;
        background: radial-gradient(
          circle at 0 100%,
          transparent var(--notch),
          var(--cut) calc(var(--notch) + 0.5px)
        );
      }
    }

    .progress {
      position: absolute;
      inset: auto 0 0;
      height: 3px;
      background: var(--foreground);
      transform-origin: left;
      animation: progress 7s linear both;
    }

    .progress.paused {
      animation-play-state: paused;
    }

    .thumb {
      transition: scale 300ms ease;
    }

    @keyframes progress {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }

    @keyframes enter {
      from {
        opacity: 0;
        translate: 0 1rem;
      }
    }

    @keyframes photo-in {
      from {
        opacity: 0;
        scale: 1.06;
      }
    }

    @keyframes photo-out {
      to {
        opacity: 0;
      }
    }

    @keyframes caption-in {
      from {
        opacity: 0;
        translate: 0 6px;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .enter {
        animation: enter 800ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms) both;
      }

      .enter-photo {
        animation: photo-in 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .leave {
        animation: photo-out 900ms ease both;
      }

      .caption-in {
        animation: caption-in 220ms ease-out both;
      }

      volt-toggle-group-item:hover .thumb {
        scale: 1.08;
      }
    }
  `,
})
export class HeroRail {
  private readonly destroyRef = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');

  protected readonly photos = PHOTOS;
  protected readonly tags = TAGS;

  protected readonly index = signal(0);
  /** The photo fading out, kept until its animation ends. */
  private readonly leaving = signal<number | null>(null);
  /** False until the first change, so the server-rendered photo never fades in again. */
  protected readonly changed = signal(false);
  protected readonly layers = computed(() => {
    const leaving = this.leaving();
    return leaving === null ? [this.index()] : [leaving, this.index()];
  });
  protected readonly selectedValue = computed(() => [PHOTOS[this.index()].id]);

  protected readonly playing = signal(false);
  protected readonly hovered = signal(false);
  protected readonly focused = signal(false);
  protected readonly suspended = computed(() => this.hovered() || this.focused());
  protected readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');

  private reducedMotion = true;

  constructor() {
    // afterNextRender never runs on the server: no matchMedia or observers there.
    afterNextRender(() => {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!this.reducedMotion) this.playing.set(true);

      // The rail turns vertical at the same width the container query does (56rem), so the
      // arrow keys always follow the strip you see.
      const section = this.section().nativeElement;
      const fit = () => {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        this.orientation.set(section.clientWidth >= 56 * rem ? 'vertical' : 'horizontal');
      };
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(section);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Keyboard focus pauses autoplay; a mouse click on a thumbnail must not stop it for good. */
  protected isKeyboardFocus(event: FocusEvent): boolean {
    return event.target instanceof Element && event.target.matches(':focus-visible');
  }

  protected pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  protected step(offset: number): void {
    this.show((this.index() + offset + PHOTOS.length) % PHOTOS.length);
  }

  protected pick(value: readonly string[]): void {
    const index = PHOTOS.findIndex(photo => photo.id === value[0]);
    if (index >= 0) this.show(index);
  }

  protected settle(event: AnimationEvent, layer: number): void {
    if (event.target === event.currentTarget && layer !== this.index()) this.leaving.set(null);
  }

  private show(index: number): void {
    const previous = this.index();
    if (index === previous) return;
    this.changed.set(true);
    // Without motion there is no fade-out to wait for, so nothing is kept behind.
    this.leaving.set(this.reducedMotion ? null : previous);
    this.index.set(index);
  }
}
