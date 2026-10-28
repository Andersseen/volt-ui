import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoveHoverDirective, MoveTapDirective } from 'angular-movement';
import { LmnGithubIcon, LmnGridIcon } from 'lumen-icons';
import { VoltButton, VoltCard, VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { SITE_STATS } from '../../lib/generated/site-stats';
import { HOVER_LIFT, TAP_PRESS } from '@shared/lib/motion';
import { Reveal } from '@shared/components/reveal';

/** Closing call to action. */
@Component({
  selector: 'app-landing-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Reveal,
    MoveHoverDirective,
    MoveTapDirective,
    VoltButton,
    VoltCard,
    VoltNativeButton,
    LmnGithubIcon,
    LmnGridIcon,
  ],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <volt-card
        appReveal
        class="grid gap-8 rounded-2xl border-border/70 bg-foreground p-6 text-background shadow-2xl shadow-black/15 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"
      >
        <div>
          <lmn-grid [size]="24" class="mb-6" />
          <h2 class="landing-display max-w-2xl text-balance text-4xl font-bold sm:text-6xl">
            {{ t('landing.cta.title') }}
          </h2>
          <p class="mt-5 max-w-2xl text-lg text-background/70">
            {{
              t('landing.cta.body', {
                components: stats.components,
                themes: stats.themeCombos,
              })
            }}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <volt-button
            [routerLink]="path('/docs/components')"
            variant="outline"
            size="lg"
            class="border-background/25 bg-background text-foreground hover:bg-background/90"
            [moveWhileHover]="lift"
            [moveWhileTap]="press"
          >
            {{ t('landing.cta.browse') }}
          </volt-button>
          <a
            voltButton
            variant="outline"
            size="lg"
            href="https://github.com/Andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="border-background/25 bg-transparent text-background data-[hover]:bg-background/10 data-[hover]:text-background"
            [moveWhileHover]="lift"
            [moveWhileTap]="press"
          >
            <lmn-github [size]="16" />
            {{ t('landing.cta.star') }}
          </a>
        </div>
      </volt-card>
    </section>
  `,
})
export class LandingCta {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly stats = SITE_STATS;

  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;
}
