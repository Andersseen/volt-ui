import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge, VoltButton } from 'volt';

interface Step {
  readonly title: string;
  readonly body: string;
  readonly duration: string;
  readonly outcome: string;
}

/**
 * How an engagement runs, as numbered steps joined by a line that fills while you read.
 *
 * It is an ordered list, because the order is the content: a screen reader announces "4 items" and
 * each step's position. The steps stack with the line down the left on a narrow container and lay
 * out in a row with the line across the top from `@4xl`.
 *
 * The fill is a scroll-driven animation (`animation-timeline: view()`) tied to the list itself, so
 * it tracks the reader without a scroll listener. Browsers without scroll timelines, and anyone who
 * prefers reduced motion, get the line already full — the same information, standing still.
 */
@Component({
  selector: 'app-service-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltButton],
  template: `
    <section class="@container bg-background px-4 py-20 @3xl:px-6 @3xl:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-col gap-6 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div class="max-w-xl">
            <p class="text-sm font-medium text-primary">How we work</p>
            <h2 class="mt-2 text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
              From first call to launch in six weeks
            </h2>
          </div>
          <volt-button variant="outline" class="self-start @3xl:self-auto">
            Book a discovery call
          </volt-button>
        </div>

        <div class="relative mt-14 pl-10 @4xl:pl-0 @4xl:pt-12">
          <span class="track" aria-hidden="true"><span class="fill"></span></span>

          <ol class="grid gap-10 @4xl:grid-cols-4 @4xl:gap-6">
            @for (step of steps; track step.title; let i = $index) {
              <li class="relative">
                <span
                  class="marker absolute grid h-8 w-8 place-items-center rounded-full border-2 border-primary bg-background text-sm font-semibold text-primary"
                  aria-hidden="true"
                  >{{ i + 1 }}</span
                >
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-lg font-semibold tracking-tight">{{ step.title }}</h3>
                  <volt-badge variant="secondary">{{ step.duration }}</volt-badge>
                </div>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ step.body }}</p>
                <p class="mt-3 text-sm">
                  <span class="font-medium">You get:</span> {{ step.outcome }}
                </p>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>
  `,
  styles: `
    .track {
      position: absolute;
      left: 15px;
      top: 0.25rem;
      bottom: 0.25rem;
      width: 2px;
      background: var(--border);
      overflow: hidden;
    }

    .fill {
      position: absolute;
      inset: 0;
      background: var(--primary);
      transform-origin: top;
    }

    .marker {
      left: -2.5rem;
      top: -0.1rem;
    }

    @container (min-width: 56rem) {
      .track {
        left: 1rem;
        right: 1rem;
        top: 15px;
        bottom: auto;
        width: auto;
        height: 2px;
      }
      .fill {
        transform-origin: left;
      }
      .marker {
        left: 0;
        top: -3rem;
      }
    }

    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        .fill {
          animation: fill-down linear both;
          animation-timeline: view();
          animation-range: entry 40% cover 55%;
        }

        @container (min-width: 56rem) {
          .fill {
            animation-name: fill-across;
          }
        }
      }
    }

    @keyframes fill-down {
      from {
        transform: scaleY(0);
      }
    }

    @keyframes fill-across {
      from {
        transform: scaleX(0);
      }
    }
  `,
})
export class ServiceSteps {
  protected readonly steps: readonly Step[] = [
    {
      title: 'Discover',
      duration: 'Week 1',
      body: 'Interviews with your team and customers, and a read through what already exists.',
      outcome: 'a one-page brief everyone has signed.',
    },
    {
      title: 'Design',
      duration: 'Weeks 2–3',
      body: 'Flows and screens in your design system, tested with five real users.',
      outcome: 'a clickable prototype and the test notes.',
    },
    {
      title: 'Build',
      duration: 'Weeks 4–5',
      body: 'Production code in your repository, reviewed by your engineers as it lands.',
      outcome: 'a feature behind a flag, with tests.',
    },
    {
      title: 'Launch',
      duration: 'Week 6',
      body: 'A staged rollout, the dashboards to watch it and a handover session.',
      outcome: 'a shipped feature your team owns.',
    },
  ];
}
