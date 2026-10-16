import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VoltToggleGroup, VoltToggleGroupItem } from 'volt';
import { injectAppI18n } from '../../../i18n/i18n';
import { STYLE_PRESETS, type StylePreset } from '../../../lib/theme-presets';

/** The style preset choices, as a single-select toggle group. */
@Component({
  selector: 'app-shape-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [VoltToggleGroup, VoltToggleGroupItem],
  template: `
    <p id="shape-picker-label" class="mb-3 text-sm font-semibold">{{ t('nav.shape') }}</p>
    <volt-toggle-group
      type="single"
      class="flex h-auto w-full flex-wrap"
      aria-labelledby="shape-picker-label"
      [value]="[selected()]"
      [allowDeselection]="false"
      (valueChange)="choose($event)"
    >
      @for (name of shapes; track name) {
        <volt-toggle-group-item [value]="name">
          <span class="font-mono text-xs">{{ name }}</span>
        </volt-toggle-group-item>
      }
    </volt-toggle-group>
  `,
})
export class ShapePicker {
  readonly selected = input.required<StylePreset>();
  readonly picked = output<StylePreset>();

  protected readonly t = injectAppI18n().t;
  protected readonly shapes = STYLE_PRESETS;

  protected choose(value: string[]): void {
    const name = value[0] as StylePreset | undefined;
    if (name && name !== this.selected()) {
      this.picked.emit(name);
    }
  }
}
