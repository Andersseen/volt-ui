import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  LmnArrowLeftIcon,
  LmnArrowRightIcon,
  LmnPackageIcon,
  LmnShieldIcon,
  LmnSparklesIcon,
  LmnZapIcon,
} from 'lumen-icons';
import { VoltButton } from 'volt';

export type ReasonIcon = 'zap' | 'package' | 'sparkles' | 'shield';

export interface Reason {
  readonly title: string;
  readonly body: string;
  readonly icon: ReasonIcon;
  readonly linkLabel: string;
}

const DEFAULT_REASONS: readonly Reason[] = [
  {
    title: 'Signals in, motion out',
    body: 'Bind a value and the element animates to its new state, without a change-detection detour.',
    icon: 'zap',
    linkLabel: 'Reactive animation',
  },
  {
    title: 'Native browser animation',
    body: 'Playback runs on the platform, so transforms and opacity stay on the compositor. Nothing extra to ship.',
    icon: 'package',
    linkLabel: 'How it works',
  },
  {
    title: 'Presence that owns lifetime',
    body: 'An element stays mounted until its exit has finished — including rows that are reordered mid-exit.',
    icon: 'sparkles',
    linkLabel: 'Presence guide',
  },
  {
    title: 'Safe on the server',
    body: 'Every browser API waits for the browser. Server rendering, hydration and zoneless apps work out of the box.',
    icon: 'shield',
    linkLabel: 'Get started',
  },
];

/**
 * Reasons to choose a product, laid out as a row the visitor scrolls through.
 *
 * The browser does the carousel: a horizontal list with `scroll-snap`, so trackpads, touch,
 * the keyboard (the track is a focusable region) and the arrow buttons all move the same
 * scroll position. The component only *reads* that position — which card is first in view,
 * whether either end has been reached — and never owns a slide index the scroll could
 * disagree with.
 *
 * The card in front is drawn in the brand colour, so the row has one place to start reading.
 * Without JavaScript, or before hydration, it is still a scrollable list of every card.
 */
@Component({
  selector: 'app-feature-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    LmnArrowLeftIcon,
    LmnArrowRightIcon,
    LmnPackageIcon,
    LmnShieldIcon,
    LmnSparklesIcon,
    LmnZapIcon,
  ],
  host: { class: 'block' },
  template: `
    <section class="@container bg-background px-4 py-16 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-col gap-6 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div class="max-w-2xl">
            <h2 class="text-balance text-3xl font-bold tracking-tight @3xl:text-5xl">
              {{ heading() }}
            </h2>
            <p class="mt-4 text-lg text-muted-foreground">{{ description() }}</p>
          </div>
          <div class="flex gap-2">
            <volt-button
              variant="outline"
              size="icon"
              aria-label="Previous"
              [aria-controls]="trackId"
              [disabled]="atStart()"
              (click)="page(-1)"
            >
              <lmn-arrow-left [size]="18" />
            </volt-button>
            <volt-button
              variant="outline"
              size="icon"
              aria-label="Next"
              [aria-controls]="trackId"
              [disabled]="atEnd()"
              (click)="page(1)"
            >
              <lmn-arrow-right [size]="18" />
            </volt-button>
          </div>
        </div>

        <!-- The region scrolls; the list inside keeps its list semantics. -->
        <div
          #track
          [id]="trackId"
          role="region"
          [attr.aria-label]="heading()"
          tabindex="0"
          class="track -mx-4 mt-10 snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 pb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          (scroll)="measure()"
        >
          <ul class="flex gap-5">
            @for (reason of reasons(); track reason.title; let i = $index) {
              <li
                class="card flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border p-7 @2xl:w-[calc((100%-1.25rem)/2)] @4xl:w-[calc((100%-2.5rem)/3)]"
                [class.front]="i === front()"
                [attr.aria-current]="i === front() ? 'true' : null"
              >
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-2xl font-semibold leading-tight tracking-tight">
                    {{ reason.title }}
                  </h3>
                  @switch (reason.icon) {
                    @case ('zap') {
                      <lmn-zap [size]="28" class="icon shrink-0" />
                    }
                    @case ('package') {
                      <lmn-package [size]="28" class="icon shrink-0" />
                    }
                    @case ('sparkles') {
                      <lmn-sparkles [size]="28" class="icon shrink-0" />
                    }
                    @case ('shield') {
                      <lmn-shield [size]="28" class="icon shrink-0" />
                    }
                  }
                </div>
                <p class="body mt-6 flex-1 leading-7">{{ reason.body }}</p>
                <volt-button
                  variant="link"
                  class="link mt-6 self-start px-0"
                  (click)="learnMore.emit(reason)"
                >
                  {{ reason.linkLabel }}
                  <lmn-arrow-right slot="trailing" [size]="14" />
                </volt-button>
              </li>
            }
          </ul>
        </div>

        @if (footnote()) {
          <p class="mt-6 text-sm text-muted-foreground">{{ footnote() }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    .track {
      scrollbar-width: none;
    }
    .track::-webkit-scrollbar {
      display: none;
    }

    .card {
      border-color: var(--border);
      background: var(--card);
      color: var(--card-foreground);
    }
    .card .body {
      color: var(--muted-foreground);
    }
    .card .icon {
      color: var(--muted-foreground);
    }

    /* The card in front takes the brand colour, so the row has one place to start. */
    .card.front {
      border-color: transparent;
      background: linear-gradient(
        150deg,
        var(--primary),
        color-mix(in oklch, var(--primary) 70%, var(--foreground))
      );
      color: var(--primary-foreground);
      box-shadow: 0 18px 50px -20px color-mix(in oklch, var(--primary) 70%, transparent);
    }
    .card.front .body,
    .card.front .icon,
    .card.front .link {
      color: var(--primary-foreground);
    }

    @media (prefers-reduced-motion: no-preference) {
      .track {
        scroll-behavior: smooth;
      }
      .card {
        transition:
          background 400ms ease,
          color 400ms ease,
          box-shadow 400ms ease;
      }
    }
  `,
})
export class FeatureCarousel {
  readonly heading = input("Built for state. Here's why.");
  readonly description = input(
    'The framework already animates simple enter and leave. This exists for the part that is hard to coordinate by hand.'
  );
  readonly reasons = input<readonly Reason[]>(DEFAULT_REASONS);
  readonly footnote = input('');

  readonly learnMore = output<Reason>();

  private static nextId = 0;
  protected readonly trackId = `feature-carousel-${FeatureCarousel.nextId++}`;

  /** Index of the first card in view. */
  protected readonly front = signal(0);
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  constructor() {
    // Analog's dev server runs after-render hooks during SSR too, where nothing has a layout.
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    afterNextRender(() => {
      if (isBrowser) this.measure();
    });
  }

  /** Scrolls by one card in either direction; the snap points settle it exactly. */
  protected page(direction: 1 | -1): void {
    const track = this.track().nativeElement;
    track.scrollBy({ left: direction * this.cardStep(track), behavior: 'auto' });
    // `scroll-behavior` in CSS decides whether that is smooth; the scroll event re-measures.
    this.measure();
  }

  protected measure(): void {
    const track = this.track().nativeElement;
    const step = this.cardStep(track);
    const last = this.reasons().length - 1;

    this.front.set(step > 0 ? Math.min(last, Math.round(track.scrollLeft / step)) : 0);
    this.atStart.set(track.scrollLeft <= 1);
    this.atEnd.set(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }

  /** One card's width plus the gap after it: the distance between two snap points. */
  private cardStep(track: HTMLElement): number {
    const [first, second] = Array.from(track.querySelectorAll<HTMLElement>(':scope > ul > li'));
    if (!first) return 0;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }
}
