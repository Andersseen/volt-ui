import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LmnCheckIcon } from 'lumen-icons';
import { VoltBadge, VoltButton, VoltCard, VoltSwitch } from 'volt';

interface Tier {
  readonly name: string;
  readonly blurb: string;
  readonly monthly: number;
  readonly annual: number;
  readonly cta: string;
  readonly featured: boolean;
  readonly features: readonly string[];
}

/**
 * Three-tier pricing with an annual/monthly switch.
 *
 * The two price branches are not redundant markup. Interpolating one number would swap
 * the text in place, silently, and flipping the switch would feel like it did nothing.
 * A control-flow branch destroys the old node and creates a new one, and a new node
 * replays its CSS entrance — which is the animation, for free and without a keyframe
 * that has to know what the previous price was.
 *
 * The featured tier is scaled up in the layout rather than merely tinted, so which plan
 * the page is selling still reads in greyscale.
 */
@Component({
  selector: 'app-pricing-tiers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard, VoltButton, VoltBadge, VoltSwitch, LmnCheckIcon],
  template: `
    <section class="bg-background px-4 py-20 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <h2 class="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing that stops being interesting once you ship.
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-balance text-lg text-muted-foreground">
            Every tier includes the full component source. The paid ones only add people and
            support.
          </p>
        </div>

        <!-- Both labels point at the switch, so the whole control is clickable rather
             than just the 40px track. The id has to be a binding rather than a static
             attribute: a static one is rendered on the <volt-switch> host *as well as*
             passed to the input, and the labels would then point at the custom element —
             which is not labelable, so clicking them would quietly do nothing. -->
        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <label
            for="billing-period"
            class="cursor-pointer text-sm transition-colors"
            [class]="annual() ? 'text-muted-foreground' : 'font-medium text-foreground'"
          >
            Monthly
          </label>
          <volt-switch
            [id]="'billing-period'"
            ariaLabel="Bill annually"
            [checked]="annual()"
            (checkedChange)="annual.set($event)"
          />
          <label
            for="billing-period"
            class="cursor-pointer text-sm transition-colors"
            [class]="annual() ? 'font-medium text-foreground' : 'text-muted-foreground'"
          >
            Annual
          </label>
          <volt-badge
            variant="secondary"
            class="save-badge bg-success/15 text-success"
            [class.is-on]="annual()"
          >
            Save 20%
          </volt-badge>
        </div>

        <div class="mt-12 grid items-start gap-6 lg:grid-cols-3">
          @for (tier of tiers; track tier.name) {
            <volt-card
              class="tier relative p-8 transition-all duration-300 motion-safe:hover:-translate-y-1.5 hover:shadow-lg"
              [class]="tier.featured ? 'tier-featured' : ''"
            >
              @if (tier.featured) {
                <span class="tier-ring" aria-hidden="true"></span>
                <volt-badge class="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">
                  Most popular
                </volt-badge>
              }

              <div class="relative">
                <h3 class="font-semibold tracking-tight">{{ tier.name }}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{{ tier.blurb }}</p>

                <p class="mt-6 flex items-baseline gap-1">
                  <!-- The branch is what makes the number animate; see the note on the
                       class. tabular-nums keeps the row from twitching as digits change. -->
                  @if (annual()) {
                    <span class="price text-4xl font-bold tracking-tight tabular-nums">
                      &dollar;{{ tier.annual }}
                    </span>
                  } @else {
                    <span class="price text-4xl font-bold tracking-tight tabular-nums">
                      &dollar;{{ tier.monthly }}
                    </span>
                  }
                  <span class="text-sm text-muted-foreground">/ month</span>
                </p>

                <!-- Fixed height: the yearly line only exists on paid plans under annual
                     billing, and letting it appear would shove three cards around. -->
                <p class="mt-1 h-5 text-xs text-muted-foreground">
                  @if (annual() && tier.monthly > 0) {
                    <span class="price">billed &dollar;{{ tier.annual * 12 }} yearly</span>
                  }
                </p>

                <volt-button
                  class="mt-6 w-full"
                  size="lg"
                  [variant]="tier.featured ? 'solid' : 'outline'"
                >
                  {{ tier.cta }}
                </volt-button>

                <ul class="mt-8 space-y-3 text-sm">
                  @for (feature of tier.features; track feature) {
                    <li class="flex items-start gap-2.5">
                      <span
                        class="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                      >
                        <lmn-check [size]="12" />
                      </span>
                      <span class="text-muted-foreground">{{ feature }}</span>
                    </li>
                  }
                </ul>
              </div>
            </volt-card>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    /* Tailwind v4 drives translate and scale through their own CSS properties, so setting
       scale here composes with the card's hover lift instead of overwriting it. Lifting a
       tier out of the row only means something while there is a row, so it collapses once
       the cards stack. */
    @media (min-width: 1024px) {
      .tier-featured {
        scale: 1.04;
      }
    }

    .tier-ring {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        160deg,
        color-mix(in oklch, var(--primary) 85%, transparent),
        transparent 55%
      );
      /* Keep only the 1px padding band, so the card gets a gradient border without an
         extra wrapper element. */
      mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      mask-composite: exclude;
      -webkit-mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      -webkit-mask-composite: xor;
      pointer-events: none;
    }

    /* Replayed every time the node is recreated, which is every time the price changes. */
    .price {
      animation: price-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .save-badge {
      opacity: 0;
      translate: -6px 0;
      scale: 0.9;
      transition:
        opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
        translate 260ms cubic-bezier(0.22, 1, 0.36, 1),
        scale 260ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .save-badge.is-on {
      opacity: 1;
      translate: none;
      scale: 1;
    }

    @keyframes price-in {
      from {
        opacity: 0;
        translate: 0 8px;
      }
      to {
        opacity: 1;
        translate: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .price {
        animation: none;
      }

      .save-badge {
        transition: opacity 260ms ease;
        translate: none;
        scale: 1;
      }
    }
  `,
})
export class PricingTiers {
  protected readonly annual = signal(true);

  protected readonly tiers: readonly Tier[] = [
    {
      name: 'Starter',
      blurb: 'For the side project that might become something.',
      monthly: 0,
      annual: 0,
      cta: 'Get started',
      featured: false,
      features: [
        'Every component and block',
        'MIT licensed source',
        'Community support',
        'One seat',
      ],
    },
    {
      name: 'Pro',
      blurb: 'For the product a small team ships every week.',
      monthly: 24,
      annual: 19,
      cta: 'Start free trial',
      featured: true,
      features: [
        'Everything in Starter',
        'Figma design kit',
        'Private theme presets',
        'Five seats',
        'Priority issues',
      ],
    },
    {
      name: 'Team',
      blurb: 'For the design system several teams depend on.',
      monthly: 79,
      annual: 63,
      cta: 'Talk to us',
      featured: false,
      features: [
        'Everything in Pro',
        'Unlimited seats',
        'SSO and audit log',
        'Shared Slack channel',
      ],
    },
  ];
}
