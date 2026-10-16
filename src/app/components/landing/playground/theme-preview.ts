import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  VoltBadge,
  VoltButton,
  VoltCheckbox,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSwitch,
} from 'volt';
import { injectAppI18n } from '../../../i18n/i18n';
import { presetStyle, type ColorPreset, type StylePreset } from '../../../lib/theme-presets';

/**
 * A settings panel of real Volt components, themed by one preset pair.
 *
 * The pair is applied as custom properties on the panel, so no class in here names a color or
 * a radius: every utility resolves through the preset, exactly as it would in a consumer's app.
 */
@Component({
  selector: 'app-theme-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltButton,
    VoltCheckbox,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSwitch,
  ],
  host: { class: 'block min-w-0' },
  template: `
    <div
      class="preview rounded-2xl border border-border bg-background p-6 text-foreground shadow-lg sm:p-8"
      [attr.style]="style()"
    >
      <div class="mb-6 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ t('landing.hero.panelTitle') }}</p>
          <p class="mt-0.5 truncate text-xs text-muted-foreground">
            {{ t('landing.hero.panelSubtitle') }}
          </p>
        </div>
        <volt-badge class="shrink-0 font-mono text-[10px]"
          >{{ color() }} · {{ shape() }}</volt-badge
        >
      </div>

      <div class="space-y-6">
        <volt-form-field>
          <volt-label>{{ t('landing.hero.workspace') }}</volt-label>
          <volt-input value="Acme Design System" />
        </volt-form-field>

        <div
          class="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-4"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium">{{ t('landing.hero.publicTheme') }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ t('landing.hero.publicThemeHint') }}
            </p>
          </div>
          <volt-switch [checked]="true" [aria-label]="t('landing.hero.publicTheme')" />
        </div>

        <volt-progress [value]="64">
          <volt-progress-label class="text-sm">{{
            t('landing.hero.migration')
          }}</volt-progress-label>
          <volt-progress-value class="text-sm">64%</volt-progress-value>
        </volt-progress>

        <div class="flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <volt-button size="sm">{{ t('landing.hero.save') }}</volt-button>
          <volt-button size="sm" variant="outline">{{ t('landing.hero.reset') }}</volt-button>
          <div class="flex items-center gap-2 pl-1">
            <volt-checkbox [checked]="true" [aria-label]="t('landing.hero.autoSync')" />
            <span class="text-xs text-muted-foreground">{{ t('landing.hero.autoSync') }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* The preset swap is the point of the section, so let it read as a change. */
    .preview,
    .preview * {
      transition:
        background-color 350ms ease,
        border-color 350ms ease,
        color 350ms ease,
        border-radius 350ms ease,
        box-shadow 350ms ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .preview,
      .preview * {
        transition: none;
      }
    }
  `,
})
export class ThemePreview {
  readonly color = input.required<ColorPreset>();
  readonly shape = input.required<StylePreset>();
  /** Follow the page's dark mode, so the preview reads as part of it. */
  readonly dark = input(false);

  protected readonly t = injectAppI18n().t;
  protected readonly style = computed(() => presetStyle(this.color(), this.shape(), this.dark()));
}
