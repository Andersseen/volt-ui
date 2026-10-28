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
import { ThemeTokenField } from './theme-token-field';
import { injectAppI18n } from '@shared/i18n/i18n';

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
    ThemeTokenField,
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
              <div class="mt-4 grid gap-2.5 sm:grid-cols-2">
                @for (field of store.colorFields; track field.key) {
                  <app-theme-token-field
                    [field]="field"
                    [value]="store.theme()[mode][field.key]"
                    (changed)="store.setColor(mode, field.key, $event)"
                  />
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
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly store = inject(ThemeStudioStore);
}
