import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltCard } from 'volt';
import {
  COLOR_PRESETS,
  STYLE_PRESETS,
  shapeVars,
  swatch,
  type ColorPreset,
  type StylePreset,
} from '../../../lib/theme-presets';

/** Every color preset as a swatch, every style preset as the same tile in a different shape. */
@Component({
  selector: 'app-system-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard],
  template: `
    <div class="grid grid-cols-5 gap-3">
      @for (color of colors; track color) {
        <volt-card class="p-2 sm:p-3">
          <span class="block h-10 rounded-lg sm:h-14" [style.background]="swatchOf(color)"></span>
          <span class="mt-2 block truncate font-mono text-[11px] sm:text-xs">{{ color }}</span>
        </volt-card>
      }
    </div>
    <div class="mt-3 grid grid-cols-5 gap-3">
      @for (shape of shapes; track shape) {
        <volt-card class="grid place-items-center gap-2 p-2 sm:p-3" [attr.style]="shapeOf(shape)">
          <span class="block h-8 w-full rounded-md border border-border bg-primary shadow"></span>
          <span class="truncate font-mono text-[11px] text-muted-foreground">{{ shape }}</span>
        </volt-card>
      }
    </div>
  `,
})
export class SystemVisual {
  protected readonly colors = COLOR_PRESETS;
  protected readonly shapes = STYLE_PRESETS;

  protected swatchOf(color: ColorPreset): string {
    return swatch(color);
  }

  /** Only the shape changes; the page's own palette stays, so shape is all that varies. */
  protected shapeOf(shape: StylePreset): string {
    return shapeVars(shape);
  }
}
