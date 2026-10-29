import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoveHoverDirective, MoveTapDirective } from 'angular-movement';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltBadge, VoltCard, VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { HOVER_LIFT, TAP_PRESS } from '@shared/lib/motion';
import { BlockThumbnail } from '../block-thumbnail';

/**
 * The first screen: what Recipes is, the two ways in, and a real block in a window beside it.
 *
 * The window shows a live render of a catalog block rather than a screenshot, for the reason the
 * cards do: it cannot drift from what the block page delivers.
 */
@Component({
  selector: 'app-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MoveHoverDirective,
    MoveTapDirective,
    LmnArrowRightIcon,
    VoltBadge,
    VoltCard,
    VoltNativeButton,
    BlockThumbnail,
  ],
  template: `
    <section class="hero relative isolate overflow-hidden border-b border-border/60">
      <div class="hero-grid pointer-events-none absolute inset-0 -z-10"></div>
      <div
        class="hero-glow pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full"
      ></div>

      <div
        class="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-28"
      >
        <div class="min-w-0">
          <volt-badge
            variant="outline"
            class="reveal-up border-primary/30 bg-background/60 px-3 py-1.5 text-primary shadow-sm backdrop-blur"
          >
            {{ t('recipes.home.badge') }}
          </volt-badge>
          <h1
            class="hero-title landing-display reveal-up reveal-delay-1 mt-6 text-balance text-5xl font-bold sm:text-6xl xl:text-7xl"
          >
            {{ t('recipes.home.title') }}
          </h1>
          <p
            class="reveal-up reveal-delay-2 mt-6 max-w-xl text-balance text-lg leading-8 text-muted-foreground"
          >
            {{ t('recipes.home.lede') }}
          </p>
          <div class="reveal-up reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              voltButton
              size="lg"
              class="group w-full min-w-44 shadow-lg shadow-primary/30 sm:w-auto"
              [routerLink]="path('/blocks')"
              [moveWhileHover]="lift"
              [moveWhileTap]="press"
            >
              {{ t('gallery.blocks.browse') }}
              <lmn-arrow-right
                [size]="16"
                class="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </a>
            <a
              voltButton
              size="lg"
              variant="outline"
              class="w-full min-w-44 bg-background/60 backdrop-blur sm:w-auto"
              [routerLink]="path('/docs')"
              [moveWhileHover]="lift"
              [moveWhileTap]="press"
            >
              {{ t('nav.docs') }}
            </a>
          </div>
        </div>

        <volt-card
          class="window reveal-up reveal-delay-3 overflow-hidden rounded-2xl p-0 shadow-2xl shadow-primary/10"
        >
          <div class="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-3">
            <span class="h-2.5 w-2.5 rounded-full bg-border"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-border"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-border"></span>
          </div>
          <div class="relative aspect-[16/11] overflow-hidden bg-background">
            <app-block-thumbnail slug="pricing" />
          </div>
        </volt-card>
      </div>
    </section>
  `,
  styles: `
    .hero {
      background: var(--background);
    }

    .hero-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 45%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 45%, transparent) 1px,
          transparent 1px
        );
      background-size: 44px 44px;
      mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%);
    }

    .hero-glow {
      background: radial-gradient(
        closest-side,
        color-mix(in oklch, var(--primary) 22%, transparent),
        transparent
      );
      filter: blur(40px);
    }

    /* Same treatment as the docs site's hero: full ink at the top, catching the primary below. */
    .hero-title {
      background: linear-gradient(
        to bottom,
        var(--foreground) 35%,
        color-mix(in oklch, var(--foreground) 55%, var(--primary))
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  `,
})
export class HomeHero {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;
}
