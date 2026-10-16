import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoveTapDirective } from 'angular-movement';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCheckbox,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSlider,
  VoltSwitch,
} from 'volt';
import { injectAppI18n } from '../../../i18n/i18n';
import { TAP_PRESS } from '../../../lib/motion';

/**
 * A settings panel of real Volt components, not a mockup: whatever preset the visitor picks in
 * the header re-skins it live. Glass over the threads, tilted until hovered.
 */
@Component({
  selector: 'app-hero-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MoveTapDirective,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCheckbox,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSlider,
    VoltSwitch,
  ],
  host: { class: 'hero-showcase block min-w-0' },
  template: `
    <volt-card class="hero-panel border-border/70 bg-surface/60 p-5 backdrop-blur-xl sm:p-6">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ t('landing.hero.panelTitle') }}</p>
          <p class="mt-0.5 truncate text-xs text-muted-foreground">
            {{ t('landing.hero.panelSubtitle') }}
          </p>
        </div>
        <volt-badge variant="secondary" class="shrink-0 font-mono text-[10px]">
          {{ t('landing.hero.live') }}
        </volt-badge>
      </div>

      <div class="space-y-5">
        <volt-form-field>
          <volt-label>{{ t('landing.hero.workspace') }}</volt-label>
          <volt-input value="Acme Design System" />
        </volt-form-field>

        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm font-medium">{{ t('landing.hero.publicTheme') }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ t('landing.hero.publicThemeHint') }}
            </p>
          </div>
          <volt-switch [checked]="true" [aria-label]="t('landing.hero.publicTheme')" />
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="font-medium">{{ t('landing.hero.radius') }}</span>
            <span class="font-mono text-xs text-muted-foreground">0.5rem</span>
          </div>
          <volt-slider [value]="45" [min]="0" [max]="100" [ariaLabel]="t('landing.hero.radius')" />
        </div>

        <volt-progress [value]="82">
          <volt-progress-label class="text-sm">{{
            t('landing.hero.migration')
          }}</volt-progress-label>
          <volt-progress-value class="text-sm">82%</volt-progress-value>
        </volt-progress>

        <div class="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <volt-button size="sm" [moveWhileTap]="press">{{ t('landing.hero.save') }}</volt-button>
          <volt-button size="sm" variant="outline" [moveWhileTap]="press">
            {{ t('landing.hero.reset') }}
          </volt-button>
          <div class="flex items-center gap-2 pl-1">
            <volt-checkbox [checked]="true" [aria-label]="t('landing.hero.autoSync')" />
            <span class="text-xs text-muted-foreground">{{ t('landing.hero.autoSync') }}</span>
          </div>
        </div>
      </div>
    </volt-card>
  `,
  styles: `
    :host {
      perspective: 1400px;
    }

    .hero-panel {
      box-shadow:
        0 0 0 1px color-mix(in oklch, var(--primary) 18%, transparent),
        0 30px 80px -30px color-mix(in oklch, var(--primary) 55%, transparent);
    }

    @media (min-width: 1024px) {
      .hero-panel {
        transform: rotateY(-6deg) rotateX(3deg);
        transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      :host:hover .hero-panel {
        transform: rotateY(0deg) rotateX(0deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-panel,
      :host:hover .hero-panel {
        transform: none;
        transition: none;
      }
    }
  `,
})
export class HeroShowcase {
  protected readonly t = injectAppI18n().t;
  protected readonly press = TAP_PRESS;
}
