import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LmnArrowRightIcon, LmnCameraIcon, LmnGlobeIcon, LmnMapPinIcon } from 'lumen-icons';
import { VoltButton, VoltCard, VoltCardContent, VoltCardTitle, VoltNativeButton } from 'volt';

interface Service {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: 'pin' | 'globe' | 'camera';
  readonly art: 'survey' | 'aerial' | 'photo';
}

const SERVICES: readonly Service[] = [
  {
    id: 'surveys',
    title: 'Site surveys',
    description:
      'Ground surveys that map levels, soils and water before a single stake goes in, so the plan starts from what is really there.',
    icon: 'pin',
    art: 'survey',
  },
  {
    id: 'aerial',
    title: 'Aerial mapping',
    description:
      'Drone flights stitched into measured orthophotos and elevation models, refreshed as often as the site changes.',
    icon: 'globe',
    art: 'aerial',
  },
  {
    id: 'photography',
    title: 'Field photography',
    description:
      'A dated, captioned record of the site through the seasons, for planners, investors and the neighbours who will live with it.',
    icon: 'camera',
    art: 'photo',
  },
];

/** The open panel's share of the row; the others take 1fr each. */
const OPEN_SHARE = 2.65;

/**
 * Three service panels in a row: one open with its description and link, two folded to their
 * titles. Choosing a panel animates `grid-template-columns` on the row.
 *
 * Nothing inside reflows while the columns move. The copy is laid out at the open panel's
 * final width the whole time (measured in container units), and the folded title and the open
 * copy cross-fade instead of wrapping. The illustration never changes size: it is anchored to
 * the panel's right edge, centred in a folded panel and beside the copy in the open one, so it
 * only slides as the columns resize. Below the container breakpoint the panels stack and show
 * everything; with reduced motion the columns snap.
 */
@Component({
  selector: 'app-service-panels',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardTitle,
    VoltNativeButton,
    LmnArrowRightIcon,
    LmnCameraIcon,
    LmnGlobeIcon,
    LmnMapPinIcon,
  ],
  host: { class: 'block' },
  template: `
    <section
      class="@container bg-background px-4 py-20 @2xl:px-6 @2xl:py-28"
      aria-labelledby="service-panels-title"
    >
      <header class="mx-auto mb-10 max-w-3xl text-center @2xl:mb-12">
        <h2
          id="service-panels-title"
          class="text-balance text-3xl font-bold tracking-tight @2xl:text-5xl"
        >
          Three ways to know a site
        </h2>
        <p
          class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground @2xl:text-lg"
        >
          Most projects need one of them. The ones that go smoothly usually had all three.
        </p>
      </header>

      <div class="panels mx-auto max-w-6xl" [style.--columns]="columns()">
        @for (service of services; track service.id; let i = $index) {
          @let open = active() === i;
          <volt-card class="panel rounded-3xl p-0 shadow-none" [attr.data-expanded]="open">
            <!-- The whole card is the trigger; the link inside sits above it. -->
            <div class="trigger">
              <volt-button
                variant="ghost"
                class="absolute inset-0 z-10 size-full rounded-3xl p-0 focus-visible:ring-inset data-[hover]:bg-transparent"
                [aria-label]="service.title"
                [aria-expanded]="open"
                [aria-controls]="'service-panel-' + service.id"
                (click)="active.set(i)"
              />
            </div>

            <div class="art" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                @switch (service.art) {
                  @case ('survey') {
                    <ellipse class="tone-3 soft" cx="58" cy="70" rx="46" ry="30" />
                    <ellipse class="tone-3 mid" cx="56" cy="68" rx="32" ry="20" />
                    <ellipse class="tone-3" cx="54" cy="66" rx="18" ry="11" />
                    <path class="line" d="M54 66V24" />
                    <path class="tone-4" d="M55 24l24 7-24 7z" />
                    <circle class="ink" cx="54" cy="66" r="2.5" />
                  }
                  @case ('aerial') {
                    <path class="tone-1 soft" d="M18 74l42-24 42 24-42 24z" />
                    <path class="tone-1 mid" d="M39 74l21-12 21 12-21 12z" />
                    <path
                      class="grid"
                      d="M39 62l42 24M60 50l42 24M18 74l42 24M81 62l-42 24M60 50L18 74"
                    />
                    <path class="path" d="M24 40c18-14 44-16 66-4" />
                    <circle class="ink" cx="90" cy="36" r="5" />
                    <path class="line" d="M83 36h14M90 29v14" />
                  }
                  @case ('photo') {
                    <rect class="ink" x="20" y="38" width="80" height="54" rx="12" />
                    <rect class="ink" x="36" y="30" width="22" height="12" rx="4" />
                    <circle class="paper" cx="60" cy="65" r="21" />
                    <circle class="tone-2 mid" cx="60" cy="65" r="17" />
                    <path class="tone-2" d="M45 73l9-11 6 7 5-5 10 9a17 17 0 0 1-30 0z" />
                    <circle class="tone-4" cx="88" cy="48" r="3" />
                  }
                }
              </svg>
            </div>

            <div class="top" aria-hidden="true">
              <span
                class="inline-flex size-11 items-center justify-center rounded-full bg-muted text-foreground"
              >
                @switch (service.icon) {
                  @case ('pin') {
                    <lmn-map-pin [size]="20" />
                  }
                  @case ('globe') {
                    <lmn-globe [size]="20" />
                  }
                  @case ('camera') {
                    <lmn-camera [size]="20" />
                  }
                }
              </span>
              <span class="indicator"><lmn-arrow-right [size]="16" /></span>
            </div>

            <volt-card-content class="copy p-0">
              <volt-card-title class="text-xl font-bold leading-tight tracking-tight @2xl:text-2xl">
                <h3>{{ service.title }}</h3>
              </volt-card-title>
              <div class="detail" [id]="'service-panel-' + service.id">
                <p
                  class="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground @2xl:text-base"
                >
                  {{ service.description }}
                </p>
                <a
                  voltButton
                  variant="link"
                  class="link mt-3 h-auto justify-start gap-2 p-0 text-sm text-foreground"
                  [href]="'#' + service.id"
                >
                  Explore {{ service.title.toLowerCase() }}
                  <lmn-arrow-right [size]="16" />
                </a>
              </div>
            </volt-card-content>

            <div
              class="compact-title text-xl font-bold leading-tight tracking-tight @2xl:text-2xl"
              aria-hidden="true"
            >
              {{ service.title }}
            </div>
          </volt-card>
        }
      </div>
    </section>
  `,
  styles: `
    .panels {
      display: grid;
      gap: 1rem;
    }

    .panel {
      --pad: clamp(1.125rem, 2.3vw, 1.75rem);
      position: relative;
      isolation: isolate;
      display: flex;
      min-width: 0;
      flex-direction: column;
      justify-content: space-between;
      gap: 2rem;
      padding: var(--pad);
      overflow: clip;
    }

    .trigger,
    .indicator,
    .compact-title {
      display: none;
    }

    .top {
      display: flex;
      align-items: start;
      justify-content: space-between;
      pointer-events: none;
    }

    .top,
    .copy,
    .compact-title {
      position: relative;
      z-index: 1;
    }

    .indicator {
      place-items: center;
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--background);
      color: var(--muted-foreground);
      rotate: 45deg;
      transition: rotate 320ms ease;
    }

    /* Stacked: the illustration sits under the copy, partly behind it. */
    .art {
      position: relative;
      align-self: flex-end;
      width: min(42%, 9.5rem);
      aspect-ratio: 1;
      margin-block: -0.25rem -4.5rem;
      pointer-events: none;
    }

    /* A soft halo, so the illustration still reads on a dark card. */
    .art::before {
      content: '';
      position: absolute;
      inset: 4%;
      border-radius: 50%;
      background: radial-gradient(
        closest-side,
        color-mix(in oklab, var(--foreground) 9%, transparent),
        transparent
      );
    }

    .art svg {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .tone-1 {
      fill: var(--primary);
    }
    .tone-2 {
      fill: var(--info);
    }
    .tone-3 {
      fill: var(--success);
    }
    .tone-4 {
      fill: var(--warning);
    }
    .soft {
      fill-opacity: 0.25;
    }
    .mid {
      fill-opacity: 0.55;
    }
    .ink {
      fill: color-mix(in oklab, var(--foreground) 80%, transparent);
    }
    .paper {
      fill: var(--background);
    }
    .line,
    .grid,
    .path {
      fill: none;
      stroke: color-mix(in oklab, var(--foreground) 70%, transparent);
      stroke-width: 2;
      stroke-linecap: round;
    }
    .grid {
      stroke-width: 1;
      stroke-opacity: 0.4;
    }
    .path {
      stroke-dasharray: 2 5;
    }

    .link {
      position: relative;
      z-index: 11;
    }

    @container (min-width: 56rem) {
      .panels {
        container-type: inline-size;
        grid-template-columns: var(--columns);
      }

      .panel {
        /* 4.65 = 2.65 + 1 + 1 shares; 2rem = the two gaps. */
        --folded: calc((100cqw - 2rem) / 4.65 - 2 * var(--pad) - 2px);
        --open: calc((100cqw - 2rem) * 2.65 / 4.65 - 2 * var(--pad) - 2px);
        --art: min(var(--folded), 14rem);
        min-height: 26rem;
        gap: 4rem;
        transition: border-color 220ms ease;
      }

      .trigger {
        display: block;
        position: absolute;
        inset: 0;
      }

      .indicator {
        display: grid;
      }

      .panel[data-expanded='true'] .indicator {
        rotate: 0deg;
      }

      /* Same size in both states, anchored to the right edge: centred in a folded panel and
         beside the copy in the open one, so it only slides while the columns resize. */
      .art {
        position: absolute;
        z-index: 0;
        top: calc(var(--pad) + 3.5rem);
        right: calc(var(--pad) + (var(--folded) - var(--art)) / 2);
        width: var(--art);
        margin: 0;
        /* Half colour at rest, most of it on hover, all of it when open. */
        filter: grayscale(0.5);
        transition:
          filter 260ms ease,
          scale 320ms cubic-bezier(0.22, 0.7, 0.24, 1);
      }

      .panel:hover .art {
        filter: grayscale(0.2);
      }

      .panel[data-expanded='true'],
      .panel:focus-within {
        border-color: color-mix(in oklab, var(--foreground) 42%, var(--border));
      }

      .panel[data-expanded='true'] .art {
        filter: none;
        scale: 1.04;
      }

      /* Laid out at the final open width throughout, so the text never reflows mid-move. */
      .copy {
        width: calc(var(--open) - var(--art) - 1.5rem);
      }

      .compact-title {
        display: block;
        position: absolute;
        inset: auto auto var(--pad) var(--pad);
        width: var(--folded);
      }

      .copy,
      .compact-title {
        transition:
          opacity 180ms ease,
          visibility 180ms;
      }

      .panel[data-expanded='false'] .copy,
      .panel[data-expanded='true'] .compact-title {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .panel[data-expanded='true'] .copy {
        transition-delay: 115ms;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      @container (min-width: 56rem) {
        .panels {
          transition: grid-template-columns 440ms cubic-bezier(0.22, 0.7, 0.24, 1);
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .panel,
      .copy,
      .compact-title,
      .art,
      .indicator {
        transition: none;
      }
    }
  `,
})
export class ServicePanels {
  protected readonly services = SERVICES;
  protected readonly active = signal(0);

  protected readonly columns = computed(() =>
    SERVICES.map((_, index) =>
      index === this.active() ? `minmax(0, ${OPEN_SHARE}fr)` : 'minmax(0, 1fr)'
    ).join(' ')
  );
}
