import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';
import { ThemeStudioStore } from '../../services/theme-studio-store';
import { Translations } from '../../i18n/translations';

/** The semantic color tokens, edited per mode. */
@Component({
  selector: 'app-theme-studio-tokens',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
  ],
  template: `
    <volt-card
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/25"
    >
      <volt-card-header>
        <volt-card-title>{{ t('themeStudio.tokens.title') }}</volt-card-title>
        <volt-card-description>{{ t('themeStudio.tokens.lede') }}</volt-card-description>
      </volt-card-header>
      <volt-card-content>
        <volt-tabs [value]="store.activeMode()" (valueChange)="store.setActiveMode($event)">
          <volt-tabs-list class="grid w-full grid-cols-2">
            <volt-tabs-trigger value="light">{{ t('themeStudio.tokens.light') }}</volt-tabs-trigger>
            <volt-tabs-trigger value="dark">{{ t('themeStudio.tokens.dark') }}</volt-tabs-trigger>
          </volt-tabs-list>

          @for (mode of store.modes; track mode) {
            <volt-tabs-content [value]="mode">
              <div class="grid gap-3 sm:grid-cols-2">
                @for (field of store.colorFields; track field.key) {
                  <div
                    class="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span
                      class="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
                    >
                      <input
                        type="color"
                        [value]="store.theme()[mode][field.key]"
                        (input)="store.setColor(mode, field.key, $event)"
                        class="h-12 w-12 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent p-0"
                        [attr.aria-label]="field.label"
                      />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-sm font-medium text-foreground">
                        {{ field.label }}
                      </span>
                      <span class="block text-xs text-muted-foreground">
                        {{ field.description }}
                      </span>
                    </span>
                    <code class="text-xs text-muted-foreground">
                      {{ store.theme()[mode][field.key] }}
                    </code>
                  </div>
                }
              </div>
            </volt-tabs-content>
          }
        </volt-tabs>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioTokens {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  protected readonly store = inject(ThemeStudioStore);
}
