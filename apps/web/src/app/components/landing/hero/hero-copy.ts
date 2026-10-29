import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoveHoverDirective, MoveLoopDirective, MoveTapDirective } from 'angular-movement';
import { LmnArrowRightIcon, LmnSparklesIcon } from 'lumen-icons';
import { VoltBadge, VoltButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { SITE_STATS } from '../../../lib/generated/site-stats';
import { HOVER_LIFT, TAP_PRESS } from '@shared/lib/motion';
import { InstallCommand } from './install-command';

/** The hero's words: release badge, headline, lede, the two journeys and the install command. */
@Component({
  selector: 'app-hero-copy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MoveHoverDirective,
    MoveLoopDirective,
    MoveTapDirective,
    VoltBadge,
    VoltButton,
    LmnArrowRightIcon,
    LmnSparklesIcon,
    InstallCommand,
  ],
  host: { class: 'block min-w-0' },
  template: `
    <volt-badge
      variant="outline"
      class="reveal-up border-primary/30 bg-background/60 px-3 py-1.5 text-primary shadow-sm backdrop-blur"
    >
      <span
        moveLoop="pulse"
        [moveDuration]="1800"
        class="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-success"
      ></span>
      {{ t('landing.hero.badge', { version }) }}
    </volt-badge>

    <h1
      class="hero-title landing-display reveal-up reveal-delay-1 mt-6 text-balance text-5xl font-bold sm:text-6xl xl:text-7xl"
    >
      {{ t('landing.hero.title') }}
    </h1>

    <p
      class="reveal-up reveal-delay-2 mt-6 max-w-xl text-balance text-lg leading-8 text-muted-foreground"
    >
      {{ t('landing.hero.subtitle') }}
    </p>

    <div class="reveal-up reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
      <volt-button
        [routerLink]="path('/docs/introduction')"
        size="lg"
        class="group w-full min-w-44 shadow-lg shadow-primary/30 sm:w-auto"
        [moveWhileHover]="lift"
        [moveWhileTap]="press"
      >
        {{ t('landing.hero.start') }}
        <lmn-arrow-right
          slot="trailing"
          [size]="16"
          class="transition-transform group-hover:translate-x-1"
        />
      </volt-button>
      <volt-button
        [routerLink]="path('/create-theme')"
        size="lg"
        variant="outline"
        class="w-full min-w-44 bg-background/60 backdrop-blur sm:w-auto"
        [moveWhileHover]="lift"
        [moveWhileTap]="press"
      >
        <lmn-sparkles slot="leading" [size]="16" class="text-primary" />
        {{ t('landing.hero.studio') }}
      </volt-button>
    </div>

    <app-install-command class="reveal-up reveal-delay-4 mt-7" />
  `,
  styles: `
    /* The headline catches the light: full ink at the top, fading toward the threads below. */
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
export class HeroCopy {
  private readonly translations = injectAppI18n();
  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  /** Generated from packages/volt/package.json, so the badge cannot outlive a release. */
  protected readonly version = SITE_STATS.version;
  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;
}
