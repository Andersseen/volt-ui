import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoveHoverDirective, MoveTapDirective } from 'angular-movement';
import { LmnArrowRightIcon, LmnFileIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { HOVER_LIFT, TAP_PRESS } from '@shared/lib/motion';
import { HeroShelf } from './hero-shelf';
import { ScanLines } from './scan-lines';

/**
 * The first screen: the promise, centred, over a shelf of three real blocks, with a field of lines
 * behind and a scanning band sweeping across them. Same typography, motion and tokens as the docs
 * site — its own composition, so the two read as family rather than as copies.
 */
@Component({
  selector: 'app-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MoveHoverDirective,
    MoveTapDirective,
    LmnArrowRightIcon,
    LmnFileIcon,
    VoltNativeButton,
    ScanLines,
    HeroShelf,
  ],
  template: `
    <section
      class="hero relative isolate flex min-h-[calc(100svh-3.5rem-1px)] flex-col overflow-hidden border-b border-border/60 sm:min-h-[calc(100svh-4rem-1px)] lg:h-[calc(100svh-4rem-1px)] lg:min-h-[36rem]"
    >
      <app-scan-lines class="hero-lines -z-10" />
      <div class="hero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48"></div>

      <div
        class="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pt-8 pb-8 text-center sm:px-6 sm:pt-14 sm:pb-10"
      >
        <p class="reveal-up font-mono text-xs uppercase tracking-[0.2em] text-primary">
          {{ t('recipes.home.badge') }}
        </p>
        <h1
          class="hero-title landing-display reveal-up reveal-delay-1 mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold sm:text-6xl xl:text-7xl"
        >
          {{ t('recipes.home.title') }}
        </h1>
        <p
          class="reveal-up reveal-delay-2 mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-muted-foreground"
        >
          {{ t('recipes.home.lede') }}
        </p>
        <div class="reveal-up reveal-delay-3 mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            voltButton
            size="lg"
            class="group min-w-44 shadow-lg shadow-primary/30"
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
            class="min-w-44 bg-background/60 backdrop-blur"
            [routerLink]="path('/docs')"
            [moveWhileHover]="lift"
            [moveWhileTap]="press"
          >
            <lmn-file [size]="16" class="text-primary" />
            {{ t('nav.docs') }}
          </a>
        </div>
      </div>

      <!-- The shelf peeks in from the bottom edge of the first screen, cut by a fade. -->
      <div class="shelf-peek mx-auto w-full max-w-6xl shrink-0 px-4 sm:px-6">
        <app-hero-shelf class="reveal-up reveal-delay-4 text-left" />
      </div>
    </section>
  `,
  styles: `
    .hero {
      background: var(--background);
    }

    /* The lines fade out at the sides, so the hero has no hard edges. */
    .hero-lines {
      mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
    }

    .shelf-peek {
      height: clamp(8rem, 30svh, 22rem);
      overflow: hidden;
      mask-image: linear-gradient(to bottom, black 55%, transparent);
      /* Room above the fanned side windows, which sit lower than the middle one. */
      padding-top: 0.5rem;
    }

    .hero-fade {
      background: linear-gradient(to bottom, transparent, var(--background));
    }

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
