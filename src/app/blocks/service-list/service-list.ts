import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltBadge, VoltButton, VoltSeparator } from 'volt';

interface Service {
  readonly number: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly deliverables: readonly string[];
}

/**
 * Services as a list that opens under the pointer, rather than four equal cards.
 *
 * Four cards side by side give every service the same weight and the same three lines,
 * which is how a services section ends up saying nothing. A list can afford one of them
 * being open: the row under the pointer expands to its full detail while the rest dim,
 * so the section reads as one thing at a time and each row gets room for real copy.
 *
 * The expansion animates `grid-template-rows` from `0fr` to `1fr`, which is the only way
 * to transition to a height nobody has measured. `max-height` guessing is the usual
 * alternative and it either clips long copy or eases against a number that is far too
 * large, so the animation appears to stall.
 *
 * `:focus-within` opens a row too, so this works for a keyboard, and the detail is never
 * `display: none` — it is present and readable to a screen reader at every moment.
 */
@Component({
  selector: 'app-service-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltButton, VoltSeparator, LmnArrowRightIcon],
  template: `
    <section class="@container bg-background px-4 py-20 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="flex flex-col gap-6 @md:flex-row @2xl:items-end @2xl:justify-between">
          <div class="max-w-xl">
            <volt-badge variant="secondary" class="mb-4">What we do</volt-badge>
            <h2 class="text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
              Four things, done properly, instead of everything.
            </h2>
          </div>
          <volt-button variant="outline" class="group shrink-0">
            Book a call
            <lmn-arrow-right
              slot="trailing"
              [size]="16"
              class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </volt-button>
        </div>

        <volt-separator class="mt-10" />

        <ul class="service-list">
          @for (service of services; track service.number) {
            <li class="service">
              <div class="flex items-start gap-5 py-7 @2xl:gap-8">
                <span
                  class="mt-1 font-mono text-sm tabular-nums text-muted-foreground transition-colors duration-300"
                >
                  {{ service.number }}
                </span>

                <div class="min-w-0 flex-1">
                  <h3 class="text-xl font-semibold tracking-tight @2xl:text-2xl">
                    <!-- A link, so the row is reachable by keyboard and :focus-within can
                         open it without any script. -->
                    <a href="#" class="service-link" (click)="$event.preventDefault()">
                      {{ service.title }}
                    </a>
                  </h3>
                  <p class="mt-2 text-sm text-muted-foreground @2xl:text-base">
                    {{ service.summary }}
                  </p>

                  <div class="service-detail">
                    <div class="min-h-0 overflow-hidden">
                      <p class="pt-4 text-sm leading-6 text-muted-foreground">
                        {{ service.detail }}
                      </p>
                      <ul class="mt-4 flex flex-wrap gap-1.5">
                        @for (item of service.deliverables; track item) {
                          <li
                            class="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            {{ item }}
                          </li>
                        }
                      </ul>
                    </div>
                  </div>
                </div>

                <lmn-arrow-right
                  [size]="20"
                  class="service-arrow mt-1 shrink-0 text-muted-foreground"
                />
              </div>

              @if (!$last) {
                <volt-separator />
              }
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .service-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* Dimming the rest is what makes the open row read as chosen rather than as merely
       taller. Scoped to pointer hover on the list, so it never fires on touch, where
       there is no hover and every row would be dimmed at once. */
    @media (hover: hover) {
      .service-list:hover .service:not(:hover) {
        opacity: 0.5;
      }
    }

    .service {
      transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* 0fr to 1fr animates to a height nobody had to measure. The child needs min-height:0
       and overflow:hidden or it refuses to be squashed below its content. */
    .service-detail {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 420ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .service:hover .service-detail,
    .service:focus-within .service-detail {
      grid-template-rows: 1fr;
    }

    .service-link {
      color: inherit;
      text-decoration: none;
      outline-offset: 4px;
    }

    .service-arrow {
      opacity: 0;
      translate: -8px 0;
      transition:
        opacity 300ms cubic-bezier(0.22, 1, 0.36, 1),
        translate 300ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .service:hover .service-arrow,
    .service:focus-within .service-arrow {
      opacity: 1;
      translate: none;
    }

    .service:hover .font-mono,
    .service:focus-within .font-mono {
      color: var(--primary);
    }

    @media (prefers-reduced-motion: reduce) {
      .service,
      .service-detail,
      .service-arrow {
        transition: none;
      }

      .service-arrow {
        translate: none;
      }
    }
  `,
})
export class ServiceList {
  protected readonly services: readonly Service[] = [
    {
      number: '01',
      title: 'Design systems',
      summary: 'A component library your team actually uses, because they helped decide it.',
      detail:
        'We audit what you already ship, throw away the half of it that duplicates the other half, and rebuild the rest as tokens and components in your own repository. You end up owning the source, not renting it.',
      deliverables: ['Token architecture', 'Component library', 'Figma kit', 'Adoption plan'],
    },
    {
      number: '02',
      title: 'Frontend architecture',
      summary: 'The decisions that are expensive to change, made once and written down.',
      detail:
        'Routing, state, data fetching, rendering strategy and the boundaries between them. We leave you with a running application and a document explaining why every choice in it was made, so the next engineer does not relitigate all of them.',
      deliverables: ['Architecture review', 'Reference app', 'Decision records', 'Team workshop'],
    },
    {
      number: '03',
      title: 'Performance',
      summary: 'Numbers that move, measured on the devices your customers actually hold.',
      detail:
        'We profile on real hardware and real networks rather than a developer laptop on fibre, fix what the traces point at, and put a budget in CI so the wins stay won after we leave.',
      deliverables: ['Trace analysis', 'Bundle surgery', 'CI budgets', 'Before and after'],
    },
    {
      number: '04',
      title: 'Accessibility',
      summary: 'Conformance you can evidence, not a plugin score in a screenshot.',
      detail:
        'A manual audit against WCAG 2.2 AA with assistive technology, prioritised by how many people each issue blocks, plus the fixes implemented and the regression tests that keep them fixed.',
      deliverables: ['Manual audit', 'Remediation', 'Automated checks', 'Statement'],
    },
  ];
}
