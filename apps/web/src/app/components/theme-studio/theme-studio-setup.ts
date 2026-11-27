import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltInput,
  VoltNativeButton,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltTextarea,
} from 'volt';
import type { VoltThemeDensity } from 'volt';
import { COLOR_PRESETS, STYLE_PRESETS } from '@shared/lib/theme-presets';
import type { PlainTranslationKey } from '@shared/i18n/i18n';
import { DENSITIES } from '../../lib/theme-draft';
import { ThemeStudioStore } from '../../services/theme-studio-store';
import { Prose } from '@shared/components/prose';
import { injectAppI18n } from '@shared/i18n/i18n';

/** Name the theme, pick a starting preset, generate or import a palette. */
@Component({
  selector: 'app-theme-studio-setup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Prose,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltInput,
    VoltNativeButton,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    VoltTextarea,
  ],
  template: `
    <volt-card
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/25"
    >
      <volt-card-header>
        <volt-card-title>{{ t('themeStudio.setup.title') }}</volt-card-title>
        <volt-card-description>{{ t('themeStudio.setup.lede') }}</volt-card-description>
      </volt-card-header>
      <volt-card-content>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2 sm:col-span-2">
            <label for="theme-name" class="text-sm font-medium text-foreground">{{
              t('themeStudio.setup.nameLabel')
            }}</label>
            <volt-input
              [id]="'theme-name'"
              ariaLabel="Theme name"
              [value]="store.theme().name"
              (valueChange)="store.setName($event)"
              [placeholder]="t('themeStudio.setup.namePlaceholder')"
              [state]="store.nameIsShipped() ? 'error' : 'default'"
              aria-describedby="theme-name-hint"
            />
            <p
              id="theme-name-hint"
              class="text-xs"
              [class.text-error]="store.nameIsShipped()"
              [class.text-muted-foreground]="!store.nameIsShipped()"
            >
              @if (store.nameIsShipped()) {
                {{ t('themeStudio.setup.nameShipped', { name: store.normalizedName() }) }}
              } @else {
                {{ t('themeStudio.setup.nameHint', { name: store.normalizedName() }) }}
              }
            </p>
          </div>

          <div class="space-y-2">
            <span id="theme-palette-label" class="text-sm font-medium text-foreground">{{
              t('themeStudio.setup.startFrom')
            }}</span>
            <volt-select
              [(value)]="store.presetValue"
              ariaLabel="Starting preset"
              [displayWith]="titleOf"
              [placeholder]="t('themeStudio.setup.presetPlaceholder')"
            >
              <volt-select-content>
                <volt-select-label>{{ t('themeStudio.setup.presets') }}</volt-select-label>
                @for (preset of colorPresets; track preset) {
                  <volt-select-item [value]="preset">{{ title(preset) }}</volt-select-item>
                }
              </volt-select-content>
            </volt-select>
          </div>

          <div class="space-y-2">
            <span class="text-sm font-medium text-foreground">{{
              t('themeStudio.setup.style')
            }}</span>
            <volt-select
              [(value)]="store.styleValue"
              [ariaLabel]="t('themeStudio.setup.style')"
              [displayWith]="titleOf"
            >
              <volt-select-content>
                @for (style of stylePresets; track style) {
                  <volt-select-item [value]="style">{{ title(style) }}</volt-select-item>
                }
              </volt-select-content>
            </volt-select>
          </div>

          <div class="space-y-2">
            <span class="text-sm font-medium text-foreground">{{
              t('themeStudio.setup.density')
            }}</span>
            <volt-select
              [(value)]="store.densityValue"
              [ariaLabel]="t('themeStudio.setup.density')"
              [displayWith]="densityLabel"
            >
              <volt-select-content>
                @for (density of densities; track density) {
                  <volt-select-item [value]="density">{{
                    t(densityKeys[density])
                  }}</volt-select-item>
                }
              </volt-select-content>
            </volt-select>
          </div>
          <p class="self-end text-xs text-muted-foreground">
            {{ t('themeStudio.setup.styleNote') }}
          </p>
        </div>

        <!-- Palette generator -->
        <div class="mt-6 space-y-4 rounded-xl border border-border/70 bg-muted/25 p-4">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">
                {{ t('themeStudio.setup.generateTitle') }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ t('themeStudio.setup.generateLede') }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <volt-select
                [(value)]="store.harmonyValue"
                ariaLabel="Color harmony"
                [placeholder]="t('themeStudio.setup.harmony')"
                class="w-40"
              >
                <volt-select-content>
                  <volt-select-label>{{ t('themeStudio.setup.harmony') }}</volt-select-label>
                  @for (option of store.harmonies; track option) {
                    <volt-select-item [value]="option">{{ option }}</volt-select-item>
                  }
                </volt-select-content>
              </volt-select>
              <volt-button (click)="store.generate()">{{
                t('themeStudio.setup.generate')
              }}</volt-button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <button
              voltButton
              variant="link"
              size="sm"
              class="h-auto px-0"
              [attr.aria-expanded]="store.importOpen()"
              (click)="store.toggleImport()"
            >
              {{
                store.importOpen()
                  ? t('themeStudio.setup.hideImport')
                  : t('themeStudio.setup.importCrafter')
              }}
            </button>
            <a
              [href]="store.crafterLink()"
              target="_blank"
              rel="noreferrer"
              class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {{
                store.paletteMeta()
                  ? t('themeStudio.setup.refineCrafter')
                  : t('themeStudio.setup.craftCrafter')
              }}
            </a>
            @if (store.paletteMeta(); as meta) {
              <span class="font-mono text-muted-foreground">
                seed {{ meta.seed }} · hue {{ meta.baseHue }}°
              </span>
            }
          </div>

          @if (store.importOpen()) {
            <div class="space-y-2">
              <label for="palette-import" class="text-sm text-muted-foreground">
                <app-prose key="themeStudio.setup.importLabel" />
              </label>
              <volt-textarea
                [id]="'palette-import'"
                [rows]="4"
                placeholder='{ "theme": { "bg": "#f9fafd", … } }'
                [value]="store.importText()"
                (valueChange)="store.setImportText($event)"
                class="font-mono text-xs"
              />
              @if (store.importError(); as message) {
                <p role="alert" class="text-xs text-error">{{ message }}</p>
              }
              <volt-button
                size="sm"
                variant="outline"
                [disabled]="!store.importText().trim()"
                (click)="store.importFromCrafter()"
              >
                {{ t('themeStudio.setup.applyPalette') }}
              </volt-button>
            </div>
          }
        </div>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioSetup {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly store = inject(ThemeStudioStore);

  protected readonly colorPresets = COLOR_PRESETS;
  protected readonly stylePresets = STYLE_PRESETS;
  protected readonly densities = DENSITIES;
  protected readonly densityKeys: Record<VoltThemeDensity, PlainTranslationKey> = {
    compact: 'themeStudio.setup.densityCompact',
    comfortable: 'themeStudio.setup.densityComfortable',
    spacious: 'themeStudio.setup.densitySpacious',
  };

  protected readonly titleOf = (value: unknown) => this.title(String(value));
  protected readonly densityLabel = (value: unknown) =>
    this.t(this.densityKeys[value as VoltThemeDensity] ?? 'themeStudio.setup.densityComfortable');

  /** Preset names are proper nouns: the same word in every language. */
  protected title(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
