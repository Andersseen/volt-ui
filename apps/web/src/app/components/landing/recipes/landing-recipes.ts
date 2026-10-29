import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MoveHoverDirective, MoveTapDirective } from 'angular-movement';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltBadge, VoltCard, VoltNativeButton } from 'volt';
import { Prose } from '@shared/components/prose';
import { Reveal } from '@shared/components/reveal';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { HOVER_LIFT, MOTION, TAP_PRESS } from '@shared/lib/motion';
import { recipesUrl } from '../../../lib/recipes-site';
import { RecipesStage } from './recipes-stage';

interface RecipesSection {
  readonly path: string;
  readonly titleKey: PlainTranslationKey;
  readonly descriptionKey: PlainTranslationKey;
}

const SECTIONS: readonly RecipesSection[] = [
  {
    path: '/blocks',
    titleKey: 'gallery.blocks.title',
    descriptionKey: 'gallery.blocks.description',
  },
  {
    path: '/layouts',
    titleKey: 'gallery.layouts.title',
    descriptionKey: 'gallery.layouts.description',
  },
  { path: '/recipes', titleKey: 'recipes.title', descriptionKey: 'recipes.description' },
];

/**
 * The way from the library to Volt UI Recipes: what it holds, a numbered link into each listing in
 * the visitor's language, and a stage of the three kinds of entry floating in perspective.
 *
 * Blocks, layouts and recipes are a separate application on their own origin, so every link here
 * is absolute; this section is the site's signpost to it (the footer carries the other).
 */
@Component({
  selector: 'app-landing-recipes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MoveHoverDirective,
    MoveTapDirective,
    LmnArrowRightIcon,
    VoltBadge,
    VoltCard,
    VoltNativeButton,
    Prose,
    Reveal,
    RecipesStage,
  ],
  template: `
    <section class="relative isolate overflow-hidden border-y border-border/60 py-20 sm:py-28">
      <div class="grid-bg pointer-events-none absolute inset-0 -z-10"></div>
      <div class="glow pointer-events-none absolute -z-10"></div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div appReveal>
            <volt-badge
              variant="outline"
              class="border-primary/30 bg-background/60 px-3 py-1.5 text-primary backdrop-blur"
            >
              {{ t('landing.recipes.eyebrow') }}
            </volt-badge>
            <h2 class="title landing-display mt-5 text-balance text-4xl font-bold sm:text-6xl">
              {{ t('landing.recipes.title') }}
            </h2>
            <app-prose
              class="mt-6 block max-w-xl text-lg leading-8 text-muted-foreground"
              [text]="t('landing.recipes.lede')"
            />
            <a
              voltButton
              size="lg"
              class="group mt-8 shadow-lg shadow-primary/30"
              [href]="home()"
              [moveWhileHover]="lift"
              [moveWhileTap]="press"
            >
              {{ t('landing.recipes.open') }}
              <lmn-arrow-right
                [size]="16"
                class="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </a>
          </div>

          <ol class="space-y-3">
            @for (section of sections(); track section.path; let i = $index) {
              <li [appReveal]="i * stagger">
                <volt-card
                  class="group relative bg-background/70 p-4 backdrop-blur transition-colors hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring"
                >
                  <div class="flex items-center gap-4">
                    <span class="font-mono text-sm text-primary">0{{ i + 1 }}</span>
                    <div class="min-w-0 flex-1">
                      <a
                        [href]="section.href"
                        class="stretched font-semibold group-hover:text-primary focus-visible:outline-none"
                        >{{ t(section.titleKey) }}</a
                      >
                      <p class="mt-0.5 text-sm text-muted-foreground">
                        {{ t(section.descriptionKey) }}
                      </p>
                    </div>
                    <lmn-arrow-right
                      [size]="16"
                      class="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none"
                    />
                  </div>
                </volt-card>
              </li>
            }
          </ol>
        </div>

        <app-recipes-stage appReveal class="mt-16 block" />
      </div>
    </section>
  `,
  styles: `
    .grid-bg {
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
      mask-image: radial-gradient(ellipse 70% 60% at 50% 70%, black 15%, transparent 72%);
    }

    .glow {
      left: 50%;
      bottom: -10%;
      width: 70rem;
      height: 36rem;
      translate: -50% 0;
      border-radius: 9999px;
      background: radial-gradient(
        closest-side,
        color-mix(in oklch, var(--primary) 24%, transparent),
        transparent
      );
      filter: blur(50px);
    }

    /* The same ink-to-primary fade as the hero headline. */
    .title {
      background: linear-gradient(
        to bottom,
        var(--foreground) 35%,
        color-mix(in oklch, var(--foreground) 55%, var(--primary))
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .stretched::after {
      content: '';
      position: absolute;
      inset: 0;
    }
  `,
})
export class LandingRecipes {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly stagger = MOTION.stagger;
  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;

  protected readonly home = computed(() => recipesUrl(this.translations.locale()));
  protected readonly sections = computed(() =>
    SECTIONS.map(section => ({
      ...section,
      href: recipesUrl(this.translations.locale(), section.path),
    }))
  );
}
