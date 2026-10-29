import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MoveHoverDirective, MoveTapDirective } from 'angular-movement';
import { LmnGithubIcon, LmnGridIcon } from 'lumen-icons';
import { VoltCard, VoltNativeButton } from 'volt';
import { Prose } from '@shared/components/prose';
import { Reveal } from '@shared/components/reveal';
import { injectAppI18n } from '@shared/i18n/i18n';
import { HOVER_LIFT, TAP_PRESS } from '@shared/lib/motion';
import { docsUrl, GITHUB_URL } from '../../lib/site';

/** Closing call to action, the same inverted card as the docs site's, pointing back to the library. */
@Component({
  selector: 'app-home-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MoveHoverDirective,
    MoveTapDirective,
    LmnGithubIcon,
    LmnGridIcon,
    VoltCard,
    VoltNativeButton,
    Prose,
    Reveal,
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
            {{ t('recipes.home.ctaTitle') }}
          </h2>
          <app-prose
            class="mt-5 block max-w-2xl text-lg text-background/70"
            codeClass="rounded bg-background/10 px-1.5 py-0.5 text-background"
            [text]="t('recipes.home.ctaBody')"
          />
        </div>
        <div class="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a
            voltButton
            variant="outline"
            size="lg"
            class="border-background/25 bg-background text-foreground hover:bg-background/90"
            [href]="componentsHref()"
            [moveWhileHover]="lift"
            [moveWhileTap]="press"
          >
            {{ t('recipes.home.ctaComponents') }}
          </a>
          <a
            voltButton
            variant="outline"
            size="lg"
            target="_blank"
            rel="noreferrer"
            class="border-background/25 bg-transparent text-background data-[hover]:bg-background/10 data-[hover]:text-background"
            [href]="github"
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
export class HomeCta {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly github = GITHUB_URL;
  protected readonly componentsHref = computed(() =>
    docsUrl(this.translations.locale(), '/docs/components')
  );

  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;
}
