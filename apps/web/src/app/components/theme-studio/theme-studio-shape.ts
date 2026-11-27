import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltNativeButton,
  VoltSlider,
} from 'volt';
import { ThemeStudioStore } from '../../services/theme-studio-store';
import { SHAPE_CONTROLS, type ShapeControl } from '../../lib/theme-draft';
import { injectAppI18n } from '@shared/i18n/i18n';

/**
 * The structural tokens both modes share. Each one either follows the chosen style preset or is
 * overridden here; only overrides are written to the exported stylesheet.
 */
@Component({
  selector: 'app-theme-studio-shape',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltNativeButton,
    VoltSlider,
  ],
  template: `
    <volt-card
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/25"
    >
      <volt-card-header>
        <volt-card-title>{{ t('themeStudio.shape.title') }}</volt-card-title>
        <volt-card-description>{{ t('themeStudio.shape.lede') }}</volt-card-description>
      </volt-card-header>
      <volt-card-content>
        <div class="grid gap-5 sm:grid-cols-2">
          @for (control of controls; track control.key) {
            @let value = store.theme().shape[control.key];
            <div class="space-y-2" [attr.data-shape]="control.key">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span [id]="'shape-' + control.key" class="text-sm font-medium text-foreground">{{
                  t(control.labelKey)
                }}</span>
                <code class="text-xs text-muted-foreground">
                  @if (value === null) {
                    {{ t('themeStudio.shape.fromStyle', { value: styleValue(control) }) }}
                  } @else {
                    {{ value }}{{ control.unit }}
                  }
                </code>
              </div>
              <volt-slider
                [value]="value ?? styleNumber(control) ?? control.min"
                [min]="control.min"
                [max]="control.max"
                [step]="1"
                [ariaLabel]="t(control.labelKey)"
                (valueChange)="store.setNumber(control.key, $event)"
              />
              @if (value !== null) {
                <button
                  voltButton
                  size="sm"
                  variant="ghost"
                  [attr.aria-label]="
                    t('themeStudio.shape.useStyleFor', { token: t(control.labelKey) })
                  "
                  (click)="store.setShape(control.key, null)"
                >
                  {{ t('themeStudio.shape.useStyle') }}
                </button>
              }
            </div>
          }
        </div>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioShape {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly store = inject(ThemeStudioStore);

  protected readonly controls = SHAPE_CONTROLS;

  /** The style preset's value in the control's unit, or `null` when the style has no single one. */
  protected styleNumber(control: ShapeControl): number | null {
    const shape = this.store.styleShape();
    switch (control.key) {
      case 'radius':
        return Math.min(shape.radius, control.max);
      case 'borderWidth':
        return shape.borderWidth;
      case 'ringWidth':
        return shape.ringWidth;
      case 'spacing':
        return shape.spacing;
      default:
        // Shadows are a whole recipe per style (offset ink, soft blur), not one intensity.
        return null;
    }
  }

  protected styleValue(control: ShapeControl): string {
    const number = this.styleNumber(control);
    return number === null ? this.store.theme().style : `${number}${control.unit}`;
  }
}
