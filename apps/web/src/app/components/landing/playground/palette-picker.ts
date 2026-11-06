import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LmnPauseIcon, LmnPlayIcon } from 'lumen-icons';
import { VoltButton, VoltTheme, VoltToggleGroup, VoltToggleGroupItem } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { COLOR_PRESETS, type ColorPreset } from '@shared/lib/theme-presets';

/**
 * The palette choices, plus the tour's timer and its pause control.
 *
 * Stateless: the playground owns the selection and the tour clock; this only draws them.
 */
@Component({
  selector: 'app-palette-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [VoltButton, VoltTheme, VoltToggleGroup, VoltToggleGroupItem, LmnPauseIcon, LmnPlayIcon],
  template: `
    <div class="mb-3 flex min-h-9 items-center justify-between gap-3">
      <p id="palette-picker-label" class="text-sm font-semibold">{{ t('nav.palette') }}</p>
      @if (canTour()) {
        <volt-button
          variant="ghost"
          size="icon"
          [aria-label]="touring() ? t('landing.playground.pause') : t('landing.playground.play')"
          (click)="toggleTour.emit()"
        >
          @if (touring()) {
            <lmn-pause [size]="16" />
          } @else {
            <lmn-play [size]="16" />
          }
        </volt-button>
      }
    </div>

    <volt-toggle-group
      type="single"
      class="flex h-auto w-full flex-wrap"
      aria-labelledby="palette-picker-label"
      [value]="[selected()]"
      [allowDeselection]="false"
      (valueChange)="choose($event)"
    >
      @for (name of colors; track name) {
        <volt-toggle-group-item [value]="name">
          <span
            class="mr-2 h-3.5 w-3.5 shrink-0 rounded-full bg-primary ring-2 ring-background"
            [voltTheme]="{ color: name }"
          ></span>
          <span class="font-mono text-xs">{{ name }}</span>
        </volt-toggle-group-item>
      }
    </volt-toggle-group>

    <!-- The tour's clock is a slideshow timer, not a task the visitor is waiting on, so it is one
         segment per palette rather than a progress bar. The pause button is its control. -->
    @if (touring()) {
      <div class="mt-3 flex gap-1" aria-hidden="true" data-tour-steps>
        @for (name of colors; track name) {
          <span class="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
            <span
              class="block h-full origin-left bg-muted-foreground"
              [style.transform]="'scaleX(' + fill(name) + ')'"
            ></span>
          </span>
        }
      </div>
    }
  `,
})
export class PalettePicker {
  readonly selected = input.required<ColorPreset>();
  /** Whether the tour is running: shows its progress. */
  readonly touring = input(false);
  /** How far the tour is into the current palette, 0–100. */
  readonly progress = input(0);
  /** Whether to offer the pause/play control at all. */
  readonly canTour = input(false);

  readonly picked = output<ColorPreset>();
  readonly toggleTour = output<void>();

  protected readonly t = injectAppI18n().t;
  protected readonly colors = COLOR_PRESETS;

  protected choose(value: string[]): void {
    const name = value[0] as ColorPreset | undefined;
    if (name && name !== this.selected()) {
      this.picked.emit(name);
    }
  }

  /** How much of a palette's tour segment has passed, 0–1. */
  protected fill(name: ColorPreset): number {
    const offset = this.colors.indexOf(name) - this.colors.indexOf(this.selected());
    return offset < 0 ? 1 : offset === 0 ? this.progress() / 100 : 0;
  }
}
