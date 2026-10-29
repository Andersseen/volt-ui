import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LmnShieldIcon, LmnTerminalIcon, LmnUsersIcon, LmnZapIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltCard,
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterLabel,
  VoltMeterTrack,
  VoltMeterValue,
} from 'volt';

/**
 * How a capability is drawn. Each kind is its own small visual, because a metric, a limit, a
 * snippet and a team do not want the same picture.
 */
export type FeatureVisual = 'chart' | 'meter' | 'code' | 'people';

export interface Feature {
  readonly title: string;
  readonly description: string;
  readonly visual: FeatureVisual;
  readonly badge?: string;
}

const DEFAULT_FEATURES: readonly Feature[] = [
  {
    title: 'Insights that explain themselves',
    description:
      'Every metric ships with its trend, its baseline and the change that moved it — no second tab needed.',
    visual: 'chart',
    badge: 'Core',
  },
  {
    title: 'Usage that never surprises',
    description: 'Limits are visible before they are reached.',
    visual: 'meter',
  },
  {
    title: 'An API you can read',
    description: 'Typed end to end, with examples that run.',
    visual: 'code',
  },
  {
    title: 'Built for teams',
    description: 'Roles, reviews and shared views from day one.',
    visual: 'people',
  },
];

/** Bar heights, in percent, for the featured chart. */
const BARS = [38, 52, 44, 66, 58, 82, 74, 96];

const PEOPLE = ['AN', 'LE', 'MI', 'JO'];

/**
 * Feature section with a hierarchy: one large capability, three supporting ones, each drawn
 * the way its content wants to be shown.
 *
 * The first feature takes the large cell; the rest fill the smaller ones in order, so the
 * order of the `features` input *is* the layout. Pure presentation — no routing, no data
 * loading — and every colour is a semantic token, so presets and dark mode apply unchanged.
 */
@Component({
  selector: 'app-feature-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LmnShieldIcon,
    LmnTerminalIcon,
    LmnUsersIcon,
    LmnZapIcon,
    VoltBadge,
    VoltCard,
    VoltMeter,
    VoltMeterIndicator,
    VoltMeterLabel,
    VoltMeterTrack,
    VoltMeterValue,
  ],
  host: { class: 'block' },
  template: `
    <section class="@container bg-background px-4 py-16 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="max-w-2xl">
          <p class="text-sm font-medium uppercase tracking-wider text-primary">{{ eyebrow() }}</p>
          <h2 class="mt-3 text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
            {{ heading() }}
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">{{ description() }}</p>
        </div>

        <ul class="mt-12 grid gap-4 @3xl:grid-cols-3">
          @for (feature of features(); track feature.title; let first = $first) {
            <li [class]="first ? '@3xl:col-span-2 @3xl:row-span-3' : ''" class="flex">
              <volt-card
                class="flex w-full flex-col gap-5 overflow-hidden p-6"
                [class]="first ? 'bg-surface @2xl:p-8' : ''"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    @switch (feature.visual) {
                      @case ('chart') {
                        <lmn-zap [size]="20" />
                      }
                      @case ('meter') {
                        <lmn-shield [size]="20" />
                      }
                      @case ('code') {
                        <lmn-terminal [size]="20" />
                      }
                      @case ('people') {
                        <lmn-users [size]="20" />
                      }
                    }
                  </span>
                  <div class="min-w-0">
                    <h3 [class]="first ? 'text-xl font-semibold' : 'font-semibold'">
                      {{ feature.title }}
                      @if (feature.badge) {
                        <volt-badge variant="secondary" class="ml-2 align-middle">
                          {{ feature.badge }}
                        </volt-badge>
                      }
                    </h3>
                    <p class="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {{ feature.description }}
                    </p>
                  </div>
                </div>

                <!-- Decorative drawings: the title and description above carry the meaning. -->
                <!-- The meter carries a real label and value; the other drawings are decoration. -->
                <div
                  class="mt-auto"
                  [attr.aria-hidden]="feature.visual === 'meter' ? null : 'true'"
                >
                  @switch (feature.visual) {
                    @case ('chart') {
                      <div
                        class="flex h-44 items-end gap-2 rounded-lg bg-muted/40 p-4 @2xl:h-56 @3xl:h-80"
                      >
                        @for (bar of bars; track $index; let last = $last) {
                          <span
                            class="bar flex-1 rounded-t-sm"
                            [class]="last ? 'bg-primary' : 'bg-primary/30'"
                            [style.height.%]="bar"
                          ></span>
                        }
                      </div>
                    }
                    @case ('meter') {
                      <volt-meter [value]="72" class="space-y-2">
                        <div class="flex justify-between text-xs text-muted-foreground">
                          <volt-meter-label>Seats used</volt-meter-label>
                          <volt-meter-value>72%</volt-meter-value>
                        </div>
                        <volt-meter-track>
                          <volt-meter-indicator />
                        </volt-meter-track>
                      </volt-meter>
                    }
                    @case ('code') {
                      <pre
                        class="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs leading-5"
                      ><code>client.report.get('q3')
  .then(r => r.total)</code></pre>
                    }
                    @case ('people') {
                      <div class="flex -space-x-2">
                        @for (initials of people; track initials) {
                          <span
                            class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium"
                          >
                            {{ initials }}
                          </span>
                        }
                      </div>
                    }
                  }
                </div>
              </volt-card>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @media (prefers-reduced-motion: no-preference) {
      .bar {
        transform-origin: bottom;
        animation: grow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
    }

    @keyframes grow {
      from {
        transform: scaleY(0.15);
      }
    }
  `,
})
export class FeatureShowcase {
  readonly eyebrow = input('Capabilities');
  readonly heading = input('One platform, four things done properly.');
  readonly description = input('Start with the one you need. The others are already there.');
  readonly features = input<readonly Feature[]>(DEFAULT_FEATURES);

  protected readonly bars = BARS;
  protected readonly people = PEOPLE;
}
