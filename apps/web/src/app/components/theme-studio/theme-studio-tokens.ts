import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltNativeButton,
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
    VoltNativeButton,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    ThemeTokenField,
  ],
  template: `
    <volt-card
      id="theme-studio-tokens"
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
              <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p class="text-xs text-muted-foreground">
                  {{ t('themeStudio.tokens.startedFrom', { palette: store.theme().palette }) }}
                </p>
                <button voltButton size="sm" variant="outline" (click)="store.resetPalette(mode)">
                  {{
                    mode === 'light'
                      ? t('themeStudio.tokens.resetLight')
                      : t('themeStudio.tokens.resetDark')
                  }}
                </button>
              </div>
              <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
                @for (field of store.colorFields; track field.key) {
                  <app-theme-token-field
                    [field]="field"
                    [idPrefix]="'token-' + mode"
                    [value]="store.theme()[mode][field.key]"
                    [preset]="store.presetPalette()[mode][field.key]"
                    [focusRequest]="focusRequestFor(mode, field.key)"
                    (changed)="store.setColor(mode, field.key, $event)"
                    (resetRequested)="store.resetColor(mode, field.key)"
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

  protected focusRequestFor(mode: string, key: string): number | null {
    const request = this.store.tokenFocus();
    return request && request.mode === mode && request.key === key ? request.id : null;
  }
}
