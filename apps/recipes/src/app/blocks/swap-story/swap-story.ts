import { IMAGE_LOADER, type ImageLoaderConfig, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { VoltBadge } from 'volt';

interface Chapter {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  /** Unsplash photo id; replace with your own. */
  readonly photo: string;
  readonly alt: string;
}

const CHAPTERS: readonly Chapter[] = [
  {
    id: 'walk',
    title: 'Walk it first',
    paragraphs: [
      'Every project starts on foot. We trace the boundaries, the paths people already use and the places water collects after rain, because none of that shows up on a plan.',
      'The walk sets the questions the rest of the survey has to answer.',
    ],
    photo: 'photo-1447752875215-b2761acb3c5d',
    alt: 'A wooden footbridge leading into a rainforest',
  },
  {
    id: 'above',
    title: 'See it from above',
    paragraphs: [
      'A morning of drone flights turns into a measured orthophoto and an elevation model, accurate to a few centimetres and shared as a link rather than a hard drive.',
      'Flown again after each phase, it becomes a record of what changed.',
    ],
    photo: 'photo-1473773508845-188df298d2d1',
    alt: 'An aerial view straight down onto a pine canopy',
  },
  {
    id: 'seasons',
    title: 'Watch it through a year',
    paragraphs: [
      'A site in January is not the site in July. We photograph the same views through the seasons, so snow loads, shade and flooding are on file before anyone has to guess.',
    ],
    photo: 'photo-1505765050516-f72dcac9c60e',
    alt: 'A snowy ridge rising above a layer of cloud',
  },
  {
    id: 'report',
    title: 'Hand over one report',
    paragraphs: [
      'Surveys, maps and photographs arrive as one document, written so the planner, the engineer and the neighbour across the lake can all read it.',
      'Nothing to install, nothing to learn, and every figure traceable to where it was measured.',
    ],
    photo: 'photo-1439066615861-d1af74d74000',
    alt: 'A wooden jetty reaching into a calm forest lake',
  },
];

/** Unsplash resizes on the fly, so one id serves every width. */
function unsplashLoader({ src, width }: ImageLoaderConfig): string {
  return `https://images.unsplash.com/${src}?auto=format&fit=crop&q=75&w=${width ?? 1200}`;
}

/** Spring constants for the photo's trip across: firm, barely overshooting. */
const STIFFNESS = 230;
const DAMPING = 30;

/**
 * Chapters that alternate sides, with one photo that follows the reader down the page.
 *
 * On a wide section, with motion allowed, a sticky photo stays centred in the viewport and
 * changes chapter at a threshold, then a small spring carries it to the other side; it does
 * not track every pixel of scroll. The gap between two chapters is the photo's height plus
 * 12rem, and the swap happens when the midpoint of that gap passes the photo's centre, so the
 * previous text has already left the photo's band and the next has not reached it yet: the
 * photo never covers text.
 *
 * The sticky copy is decorative. Every chapter keeps its own inline photo, hidden only once
 * the sticky one has decoded its images, on a wide section, with motion allowed. Otherwise
 * (phones, reduced motion, a failed image) the chapters simply alternate.
 */
@Component({
  selector: 'app-swap-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, VoltBadge],
  providers: [{ provide: IMAGE_LOADER, useValue: unsplashLoader }],
  host: { class: 'block' },
  template: `
    <section
      #section
      class="@container border-t border-border bg-background px-4 py-16 @2xl:px-6 @2xl:py-24"
      aria-labelledby="swap-story-title"
    >
      <header class="mx-auto max-w-6xl">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          How we work
        </p>
        <h2
          id="swap-story-title"
          class="mt-3 text-balance text-3xl font-bold tracking-tight @2xl:text-5xl"
        >
          Four steps from first visit to final report
        </h2>
      </header>

      <div class="story mx-auto mt-10 max-w-6xl @4xl:mt-14">
        <div #stage class="stage" aria-hidden="true" [attr.data-ready]="ready() ? '' : null">
          <div #frame class="frame">
            @for (chapter of chapters; track chapter.id; let i = $index) {
              <!-- Plain images: decoded before the effect starts, and never the LCP. -->
              <img
                [src]="url(chapter.photo, 960)"
                [srcset]="srcset(chapter.photo)"
                sizes="(min-width: 64rem) 36rem, 50vw"
                alt=""
                decoding="async"
                width="1200"
                height="900"
                [class.shown]="i === active()"
              />
            }
            <volt-badge variant="secondary" class="caption">
              <span class="tabular-nums opacity-70">{{ pad(active() + 1) }}</span>
              {{ chapters[active()].title }}
            </volt-badge>
          </div>
        </div>

        <div class="chapters">
          @for (chapter of chapters; track chapter.id; let odd = $odd) {
            <article
              class="row"
              [class.reverse]="odd"
              [id]="chapter.id"
              [attr.aria-labelledby]="'swap-story-' + chapter.id"
            >
              <div class="photo">
                <div class="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                  <img
                    [ngSrc]="chapter.photo"
                    fill
                    sizes="(min-width: 64rem) 45vw, 100vw"
                    [alt]="chapter.alt"
                    class="object-cover"
                  />
                </div>
              </div>
              <div #copy class="copy">
                <h3
                  [id]="'swap-story-' + chapter.id"
                  class="text-3xl font-bold tracking-tight @2xl:text-4xl @5xl:text-5xl"
                >
                  {{ chapter.title }}
                </h3>
                <div
                  class="mt-5 max-w-prose space-y-4 text-base leading-relaxed text-muted-foreground"
                >
                  @for (paragraph of chapter.paragraphs; track $index) {
                    <p>{{ paragraph }}</p>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .chapters {
      display: grid;
      gap: 3rem;
    }

    .row {
      display: grid;
      gap: 1.75rem;
      scroll-margin-top: 0.5rem;
    }

    .stage {
      display: none;
    }

    @container (min-width: 56rem) {
      .story {
        --chapter-gap: clamp(2.75rem, 6cqw, 6rem);
        display: grid;
      }

      .stage,
      .chapters {
        grid-area: 1 / 1;
        min-width: 0;
      }

      .chapters {
        gap: clamp(2.75rem, 7svh, 5rem);
      }

      .row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas: 'photo copy';
        align-items: center;
        gap: var(--chapter-gap);
      }

      .row.reverse {
        grid-template-areas: 'copy photo';
      }

      .photo {
        grid-area: photo;
      }

      .copy {
        position: relative;
        z-index: 2;
        grid-area: copy;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      @container (min-width: 56rem) {
        /* Taller than the photo, so the photo can cross while neither text is beside it. */
        .chapters {
          gap: calc(min(26rem, 66svh) + 12rem);
        }

        .row {
          align-items: start;
        }

        .stage {
          display: grid;
          position: sticky;
          /* Centred in the viewport: the frame is at most 26rem (or 66svh) tall. */
          top: max(1.5rem, calc(50svh - min(13rem, 33svh)));
          align-self: start;
          z-index: 1;
          visibility: hidden;
          opacity: 0;
          transition:
            opacity 200ms ease,
            visibility 200ms;
          pointer-events: none;
        }

        .stage[data-ready] {
          visibility: visible;
          opacity: 1;
        }

        .photo {
          transition: opacity 200ms ease;
        }

        .stage[data-ready] + .chapters .photo {
          opacity: 0;
        }

        .frame {
          position: relative;
          width: calc((100% - var(--chapter-gap)) / 2);
          height: min(26rem, 66svh);
          overflow: clip;
          border-radius: 1.5rem;
          background: var(--muted);
          box-shadow: 0 30px 60px -30px color-mix(in oklab, var(--foreground) 45%, transparent);
          /* --side: 0 left, 1 right, driven by the spring. --travel peaks halfway across. */
          transform: translateX(calc(var(--side, 0) * (100% + var(--chapter-gap))))
            scale(calc(1 - 0.06 * var(--travel, 0)));
        }

        .frame img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          scale: 1.06;
          transition:
            opacity 520ms ease,
            scale 520ms ease;
        }

        .frame img.shown {
          opacity: 1;
          scale: 1;
        }

        .caption {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          gap: 0.625rem;
          backdrop-filter: blur(8px);
        }
      }
    }
  `,
})
export class SwapStory {
  private readonly destroyRef = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly copies = viewChildren<ElementRef<HTMLElement>>('copy');

  protected readonly chapters = CHAPTERS;
  /** The chapter whose photo is on show; it changes in the gap between two chapters' texts. */
  protected readonly active = signal(0);
  /** The sticky photo replaces the inline ones only when this is true. */
  protected readonly ready = signal(false);

  protected readonly url = (photo: string, width: number) => unsplashLoader({ src: photo, width });
  protected readonly srcset = (photo: string) =>
    [640, 960, 1200, 1600].map(width => `${this.url(photo, width)} ${width}w`).join(', ');

  constructor() {
    // Browser only: afterNextRender never runs on the server.
    afterNextRender(() => this.start());
  }

  protected pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  private start(): void {
    const section = this.section().nativeElement;
    const stage = this.stage().nativeElement;
    const frame = this.frame().nativeElement;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let decoded = false;
    let wide = false;
    let pending: number | undefined;

    // The spring: x is the side (0 left, 1 right), integrated per frame towards the target.
    let x = 0;
    let velocity = 0;
    let target = 0;
    let last = 0;
    let springFrame: number | undefined;
    const paint = () => {
      frame.style.setProperty('--side', x.toFixed(4));
      frame.style.setProperty(
        '--travel',
        Math.sin(Math.PI * Math.min(1, Math.max(0, x))).toFixed(4)
      );
    };
    const tick = (time: number) => {
      const dt = last ? Math.min(0.032, (time - last) / 1000) : 1 / 60;
      last = time;
      velocity += (-STIFFNESS * (x - target) - DAMPING * velocity) * dt;
      x += velocity * dt;
      if (Math.abs(x - target) < 0.001 && Math.abs(velocity) < 0.001) {
        x = target;
        velocity = 0;
        springFrame = undefined;
      } else {
        springFrame = requestAnimationFrame(tick);
      }
      paint();
    };
    const travel = (side: number) => {
      target = side;
      if (springFrame === undefined) {
        last = 0;
        springFrame = requestAnimationFrame(tick);
      }
    };

    const measure = () => {
      pending = undefined;
      if (!this.ready()) return;
      const box = frame.getBoundingClientRect();
      const centre = box.top + box.height / 2;
      const copies = this.copies().map(copy => copy.nativeElement.getBoundingClientRect());
      let active = 0;
      for (let index = 1; index < copies.length; index++) {
        // The midpoint of the gap between two texts has passed the photo's centre.
        if ((copies[index - 1].bottom + copies[index].top) / 2 < centre) active = index;
      }
      if (active !== this.active()) {
        this.active.set(active);
        travel(active % 2);
      }
    };
    const schedule = () => {
      if (pending === undefined) pending = requestAnimationFrame(measure);
    };
    const update = () => {
      const ready = decoded && wide && motion.matches;
      if (ready && !this.ready()) {
        // Start where the reader already is, without a trip across.
        this.ready.set(true);
        measure();
        x = target = this.active() % 2;
        paint();
      } else if (!ready) {
        this.ready.set(false);
      }
    };

    const fit = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      wide = section.clientWidth >= 56 * rem;
      update();
      schedule();
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(section);
    motion.addEventListener('change', update);
    window.addEventListener('scroll', schedule, { passive: true });

    void Promise.allSettled(
      Array.from(stage.querySelectorAll('img'), image => image.decode())
    ).then(results => {
      if (this.destroyRef.destroyed) return;
      decoded = results.every(result => result.status === 'fulfilled');
      update();
    });

    this.destroyRef.onDestroy(() => {
      if (pending !== undefined) cancelAnimationFrame(pending);
      if (springFrame !== undefined) cancelAnimationFrame(springFrame);
      resize.disconnect();
      motion.removeEventListener('change', update);
      window.removeEventListener('scroll', schedule);
    });
  }
}
