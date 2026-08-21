import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LmnPackageIcon, LmnShieldIcon, LmnSparklesIcon } from 'lumen-icons';
import { Translations, type TranslationKey } from '../../i18n/translations';
import { VoltBadge, VoltCard, VoltCardContent, VoltCardHeader } from 'volt';
import { SITE_STATS } from '../../lib/generated/site-stats';
import { MOTION } from '../../lib/motion';
import { Reveal } from '../reveal';

/** The three pillars of the library, as a staggered card grid. */
interface Feature {
  readonly icon: string;
  /** Typed, so a renamed key breaks the build rather than the Spanish page. */
  readonly titleKey: TranslationKey;
  readonly bodyKey: TranslationKey;
  readonly detail: string;
}

@Component({
  selector: 'app-landing-features',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Reveal,
    VoltBadge,
    VoltCard,
    VoltCardContent,
    VoltCardHeader,
    LmnPackageIcon,
    LmnShieldIcon,
    LmnSparklesIcon,
  ],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div appReveal class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <volt-badge variant="outline" class="mb-5">{{
            t('landing.features.eyebrow')
          }}</volt-badge>
          <h2 class="text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
            {{ t('landing.features.title') }}
          </h2>
        </div>
        <p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
          {{ t('landing.features.subtitle') }}
        </p>
      </div>

      <div class="mt-12 grid gap-4 md:grid-cols-3">
        @for (feature of features; track feature.titleKey; let i = $index) {
          <volt-card
            [appReveal]="i * stagger"
            class="feature-card h-full border-border/70 bg-surface/70"
          >
            <volt-card-header>
              <div
                class="mb-5 grid h-11 w-11 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-primary"
              >
                @switch (feature.icon) {
                  @case ('package') {
                    <lmn-package [size]="20" />
                  }
                  @case ('shield') {
                    <lmn-shield [size]="20" />
                  }
                  @default {
                    <lmn-sparkles [size]="20" />
                  }
                }
              </div>
              <h3 class="text-lg font-semibold tracking-normal">{{ t(feature.titleKey) }}</h3>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                {{ t(feature.bodyKey) }}
              </p>
            </volt-card-header>
            <volt-card-content>
              <span class="font-mono text-xs text-primary">{{ feature.detail }}</span>
            </volt-card-content>
          </volt-card>
        }
      </div>
    </section>
  `,
  styles: `
    /* Hover stays in CSS: it costs no JavaScript, and it animates border and shadow
       colours that the Web Animations path would have to duplicate token by token. */
    .feature-card {
      transition:
        transform 220ms ease,
        border-color 220ms ease,
        box-shadow 220ms ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: color-mix(in oklch, var(--primary) 34%, var(--border));
      box-shadow: 0 20px 45px -30px color-mix(in oklch, var(--primary) 45%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      .feature-card {
        transition: none;
      }

      .feature-card:hover {
        transform: none;
      }
    }
  `,
})
export class LandingFeatures {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  protected readonly stagger = MOTION.stagger;

  protected readonly features: readonly Feature[] = [
    {
      icon: 'package',
      titleKey: 'landing.features.ownTitle',
      bodyKey: 'landing.features.ownBody',
      detail: 'npx @voltui/cli add',
    },
    {
      icon: 'shield',
      titleKey: 'landing.features.behaviorTitle',
      bodyKey: 'landing.features.behaviorBody',
      detail: 'WAI-ARIA - CVA - zoneless',
    },
    {
      icon: 'sparkles',
      titleKey: 'landing.features.systemTitle',
      bodyKey: 'landing.features.systemBody',
      detail: `${SITE_STATS.colorPresets} colors - ${SITE_STATS.stylePresets} styles`,
    },
  ];
}
