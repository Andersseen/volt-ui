import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnGridIcon, LmnShieldIcon, LmnSunIcon, LmnTerminalIcon, LmnZapIcon } from 'lumen-icons';
import { VoltBadge, VoltCard } from 'volt';

interface Feature {
  readonly icon: 'zap' | 'shield' | 'sun' | 'terminal' | 'grid';
  readonly title: string;
  readonly body: string;
  /** Tailwind span classes. The wide card carries the headline claim. */
  readonly span: string;
  /** Extra detail, shown only where the layout leaves room for it. */
  readonly tags: readonly string[];
}

/**
 * Bento grid where each card lights up under the pointer.
 *
 * Two layers do the work, both driven by the same `--gx` / `--gy` pair the pointer handler
 * writes onto the card: a soft fill inside the card, and a one-pixel gradient ring around
 * it. The ring is the `mask-composite: exclude` trick — paint the gradient over the whole
 * card, then punch out everything but the border band, which is the only way to give a
 * border a gradient without nesting an extra element.
 *
 * The handler writes to `event.currentTarget` rather than to component state, so hovering
 * a card costs a style recalculation instead of a change-detection pass.
 */
@Component({
  selector: 'app-feature-bento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltBadge,
    LmnZapIcon,
    LmnShieldIcon,
    LmnSunIcon,
    LmnTerminalIcon,
    LmnGridIcon,
  ],
  template: `
    <section class="bg-background px-4 py-20 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="max-w-2xl">
          <volt-badge variant="secondary" class="mb-4">Why teams pick it</volt-badge>
          <h2 class="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need, nothing you have to unlearn.
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            Plain Angular components in your own repository. No runtime to upgrade, no theme API to
            fight.
          </p>
        </div>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (feature of features; track feature.title) {
            <volt-card
              class="bento-card group relative overflow-hidden p-6 transition-transform duration-300 motion-safe:hover:-translate-y-1"
              [class]="feature.span"
              (pointermove)="glow($event)"
            >
              <span class="bento-fill" aria-hidden="true"></span>
              <span class="bento-ring" aria-hidden="true"></span>

              <div class="relative">
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  @switch (feature.icon) {
                    @case ('zap') {
                      <lmn-zap [size]="20" />
                    }
                    @case ('shield') {
                      <lmn-shield [size]="20" />
                    }
                    @case ('sun') {
                      <lmn-sun [size]="20" />
                    }
                    @case ('terminal') {
                      <lmn-terminal [size]="20" />
                    }
                    @case ('grid') {
                      <lmn-grid [size]="20" />
                    }
                  }
                </span>

                <h3 class="mt-4 font-semibold tracking-tight">{{ feature.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ feature.body }}</p>

                <!-- Only the wide card gets these. A bento row is as tall as its tallest
                     card, so the double-width one has room the others do not, and filling
                     it with something specific beats padding it with air. -->
                @if (feature.tags.length) {
                  <ul class="mt-5 flex flex-wrap gap-1.5">
                    @for (tag of feature.tags; track tag) {
                      <li
                        class="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {{ tag }}
                      </li>
                    }
                  </ul>
                }
              </div>
            </volt-card>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .bento-card {
      --gx: 50%;
      --gy: 50%;
    }

    /* Both layers are inert decoration: they sit above the card background but below the
       content, which is why every content wrapper above is positioned. */
    .bento-fill,
    .bento-ring {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      pointer-events: none;
      transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .bento-fill {
      background: radial-gradient(
        340px circle at var(--gx) var(--gy),
        color-mix(in oklch, var(--primary) 12%, transparent),
        transparent 62%
      );
    }

    .bento-ring {
      padding: 1px;
      background: radial-gradient(
        220px circle at var(--gx) var(--gy),
        color-mix(in oklch, var(--primary) 95%, transparent),
        transparent 58%
      );
      /* Keep only the 1px padding band: paint everything, then subtract the content box. */
      mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      mask-composite: exclude;
      -webkit-mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      -webkit-mask-composite: xor;
    }

    .bento-card:hover .bento-fill,
    .bento-card:hover .bento-ring,
    .bento-card:focus-within .bento-fill,
    .bento-card:focus-within .bento-ring {
      opacity: 1;
    }

    /* The hover lift is a motion-safe: utility in the template, so it disappears on
       its own here; what is left to neutralise is the glow's fade. */
    @media (prefers-reduced-motion: reduce) {
      .bento-fill,
      .bento-ring {
        transition: none;
      }
    }
  `,
})
export class FeatureBento {
  protected readonly features: Feature[] = [
    {
      icon: 'zap',
      title: 'Motion that ships with the markup',
      body: 'Every interaction here is CSS and a pointer handler — no animation runtime, no bundle cost, and it degrades to a static section when the visitor asks for reduced motion.',
      span: 'sm:col-span-2',
      tags: ['@keyframes', 'mask-composite', 'pointermove', 'prefers-reduced-motion'],
    },
    {
      icon: 'shield',
      title: 'Accessible underneath',
      body: 'Roles, focus order and keyboard paths come from the primitives, not from markup you have to remember to write.',
      span: '',
      tags: [],
    },
    {
      icon: 'sun',
      title: 'Themed by tokens',
      body: 'Five colour presets, five shape presets, light and dark. Blocks inherit them because they never hard-code a colour.',
      span: '',
      tags: [],
    },
    {
      icon: 'terminal',
      title: 'Copy, do not install',
      body: 'The source lands in your repository. Rename it, gut it, keep it — nothing upstream can break it later.',
      span: '',
      tags: [],
    },
    {
      icon: 'grid',
      title: 'Composed from real components',
      body: 'Buttons, cards, switches and avatars you already use, arranged. Nothing here is a one-off.',
      span: '',
      tags: [],
    },
  ];

  /** Writes the pointer position into the hovered card, in card-relative pixels. */
  protected glow(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    const box = card.getBoundingClientRect();

    card.style.setProperty('--gx', `${event.clientX - box.left}px`);
    card.style.setProperty('--gy', `${event.clientY - box.top}px`);
  }
}
