import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnStarIcon } from 'lumen-icons';
import { VoltAvatar, VoltAvatarFallback, VoltCard } from 'volt';

interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly initials: string;
}

interface Row {
  readonly items: readonly Testimonial[];
  /** Seconds for one full pass. Different per row, so the two never sync up. */
  readonly speed: number;
  readonly reverse: boolean;
}

/**
 * Two rows of testimonials sliding past each other, pausing under the pointer.
 *
 * The seam is the whole trick: each row holds the same list twice and translates by
 * exactly -50%, which lands the second copy precisely where the first started. Any other
 * distance shows a jump on every loop.
 *
 * The duplicate copy is `aria-hidden`, so a screen reader hears each quote once rather
 * than twice, and the rows pause on `:focus-within` as well as `:hover`, so a card that
 * grows a link later does not become a moving target for the keyboard.
 */
@Component({
  selector: 'app-testimonial-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, VoltCard, VoltAvatar, VoltAvatarFallback, LmnStarIcon],
  template: `
    <section class="@container overflow-hidden bg-background py-20 @2xl:py-24">
      <div class="mx-auto max-w-3xl px-4 text-center @2xl:px-6">
        <h2 class="text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
          Shipped by people who do not enjoy writing components.
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          Hover any row to stop it and read at your own pace.
        </p>
      </div>

      <div class="marquee mt-14 flex flex-col gap-5">
        @for (row of rows; track $index) {
          <div class="marquee-viewport">
            <div
              class="marquee-row"
              [class.is-reverse]="row.reverse"
              [style.--speed]="row.speed + 's'"
            >
              <ul class="marquee-group">
                @for (item of row.items; track item.name) {
                  <li>
                    <ng-container
                      [ngTemplateOutlet]="card"
                      [ngTemplateOutletContext]="{ $implicit: item }"
                    />
                  </li>
                }
              </ul>
              <!-- The seam copy. Decorative by definition: it is the same six quotes. -->
              <ul class="marquee-group" aria-hidden="true">
                @for (item of row.items; track item.name) {
                  <li>
                    <ng-container
                      [ngTemplateOutlet]="card"
                      [ngTemplateOutletContext]="{ $implicit: item }"
                    />
                  </li>
                }
              </ul>
            </div>
          </div>
        }
      </div>
    </section>

    <ng-template #card let-item>
      <volt-card
        class="w-[19rem] p-6 transition-colors duration-300 hover:border-primary/40 @2xl:w-[22rem]"
      >
        <div class="flex items-center gap-0.5 text-warning" aria-hidden="true">
          @for (star of stars; track $index) {
            <lmn-star [size]="12" variant="filled" />
          }
        </div>
        <blockquote class="mt-3 text-sm leading-6 text-foreground">
          {{ item.quote }}
        </blockquote>
        <div class="mt-5 flex items-center gap-3">
          <volt-avatar>
            <volt-avatar-fallback class="text-xs">{{ item.initials }}</volt-avatar-fallback>
          </volt-avatar>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ item.name }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ item.role }}</p>
          </div>
        </div>
      </volt-card>
    </ng-template>
  `,
  styles: `
    /* Fades both ends so cards dissolve instead of being guillotined by the viewport.
       The ramp is a fixed length rather than a percentage: a percentage ramp shrinks
       with the container, and the fade would disappear exactly where it matters most,
       on the narrow screens where the cards are cut closest. */
    .marquee-viewport {
      --fade: 5rem;
      overflow: hidden;
      mask-image: linear-gradient(
        to right,
        transparent,
        black var(--fade),
        black calc(100% - var(--fade)),
        transparent
      );
      -webkit-mask-image: linear-gradient(
        to right,
        transparent,
        black var(--fade),
        black calc(100% - var(--fade)),
        transparent
      );
    }

    .marquee-row {
      display: flex;
      width: max-content;
      animation: marquee var(--speed, 40s) linear infinite;
    }

    .is-reverse {
      animation-direction: reverse;
    }

    .marquee-group {
      display: flex;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* The spacing is a margin rather than a gap on purpose. A gap sits between
       children, so the row would measure two groups plus one extra gap and -50% would
       land half a gap short — a visible stutter once per loop. A trailing margin makes
       every item cost exactly the same, which puts the halfway point on the seam. */
    .marquee-group li {
      margin-right: 1.25rem;
    }

    /* Reading a moving quote is the one thing this block must not force on anyone. */
    .marquee-viewport:hover .marquee-row,
    .marquee-viewport:focus-within .marquee-row {
      animation-play-state: paused;
    }

    /* -50% is one full copy of the list, which is why the two copies exist. */
    @keyframes marquee {
      to {
        translate: -50% 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .marquee-row {
        animation: none;
      }

      /* Nothing moves on its own now, so the row becomes an ordinary scroller. */
      .marquee-viewport {
        overflow-x: auto;
      }
    }
  `,
})
export class TestimonialMarquee {
  protected readonly stars = [1, 2, 3, 4, 5];

  private readonly testimonials: readonly Testimonial[] = [
    {
      quote:
        'We replaced three half-finished internal components in an afternoon. The part I did not expect: the diff was readable.',
      name: 'Marta Ibáñez',
      role: 'Staff Engineer, Northwind',
      initials: 'MI',
    },
    {
      quote:
        'It is the first Angular kit where the accessibility was not something we had to add back in afterwards.',
      name: 'Dan Okoro',
      role: 'Frontend Lead, Kestrel',
      initials: 'DO',
    },
    {
      quote:
        'Our designers picked a preset, we changed one variable, and the whole app followed. That never happens.',
      name: 'Priya Raman',
      role: 'Design Systems, Bloom',
      initials: 'PR',
    },
    {
      quote:
        'No runtime dependency means no upgrade meeting. The code is ours now, and that is the entire pitch.',
      name: 'Tomás Vidal',
      role: 'CTO, Fathom',
      initials: 'TV',
    },
    {
      quote:
        'Zoneless and signal-first out of the box, so it fit the app we already had instead of the one we wish we had.',
      name: 'Sasha Lund',
      role: 'Principal Engineer, Verge',
      initials: 'SL',
    },
    {
      quote:
        'I copied a block, deleted half of it, and it still worked. That is the compliment I mean most.',
      name: 'Ines Ferreira',
      role: 'Product Engineer, Tilt',
      initials: 'IF',
    },
  ];

  protected readonly rows: readonly Row[] = [
    { items: this.testimonials.slice(0, 3), speed: 38, reverse: false },
    { items: this.testimonials.slice(3), speed: 46, reverse: true },
  ];
}
