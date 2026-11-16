import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltTheme } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

/**
 * The five color presets, each drawn in its own `voltTheme` scope from the tokens it ships, in the
 * page's current mode and style (`::demo[theme-presets]` on the Themes guide).
 */
@Component({
  selector: 'app-theme-presets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltTheme],
  template: `
    <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
      @for (preset of presets; track preset.id) {
        <li class="rounded-lg border border-border p-4">
          <div class="mb-3 flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground"
              [voltTheme]="{ color: preset.id }"
              aria-hidden="true"
            >
              {{ preset.name.charAt(0) }}
            </div>
            <div>
              <p class="font-medium">{{ preset.name }}</p>
              <p class="text-xs text-muted-foreground">{{ t(preset.descriptionKey) }}</p>
            </div>
          </div>
          <div class="flex gap-2" [voltTheme]="{ color: preset.id }" aria-hidden="true">
            @for (swatch of swatches; track swatch) {
              <span class="h-6 w-6 rounded-full border border-border" [class]="swatch"></span>
            }
          </div>
        </li>
      }
    </ul>
  `,
})
export class ThemePresets {
  protected readonly t = injectAppI18n().t;
  protected readonly swatches = ['bg-primary', 'bg-secondary', 'bg-surface'] as const;
  protected readonly presets = [
    { id: 'volt', name: 'Volt', descriptionKey: 'guide.themesPage.presets.volt' },
    { id: 'ember', name: 'Ember', descriptionKey: 'guide.themesPage.presets.ember' },
    { id: 'sage', name: 'Sage', descriptionKey: 'guide.themesPage.presets.sage' },
    { id: 'dusk', name: 'Dusk', descriptionKey: 'guide.themesPage.presets.dusk' },
    { id: 'glacier', name: 'Glacier', descriptionKey: 'guide.themesPage.presets.glacier' },
  ] as const;
}
