import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  VoltBadge,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSwitch,
  VoltTheme,
  VoltToggleGroup,
  VoltToggleGroupItem,
  voltCustomColor,
  type VoltAnyThemeOptions,
} from 'volt';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { PREVIEW_THEME_NAME, ThemeStudioStore } from '../../services/theme-studio-store';
import { PreviewDashboard } from './preview/preview-dashboard';
import { PreviewData } from './preview/preview-data';
import { PreviewSettings } from './preview/preview-settings';
import {
  PREVIEW_SCENARIOS,
  PREVIEW_STATES,
  type PreviewScenario,
  type PreviewState,
} from './preview/preview-state';
import { ThemeStudioStylesheet } from './theme-studio-stylesheet';

const PREVIEW_COLOR = voltCustomColor(PREVIEW_THEME_NAME);

const SCENARIO_KEYS: Record<PreviewScenario, PlainTranslationKey> = {
  dashboard: 'themeStudio.preview.scenarioDashboard',
  settings: 'themeStudio.preview.scenarioSettings',
  data: 'themeStudio.preview.scenarioData',
};

const STATE_KEYS: Record<PreviewState, PlainTranslationKey> = {
  default: 'themeStudio.preview.stateDefault',
  disabled: 'themeStudio.preview.stateDisabled',
  invalid: 'themeStudio.preview.stateInvalid',
  loading: 'themeStudio.preview.stateLoading',
  empty: 'themeStudio.preview.stateEmpty',
  error: 'themeStudio.preview.stateError',
};

/**
 * The live canvas: three small applications built from Volt components, inside a `voltTheme` scope
 * that names the draft's palette. The palette itself comes from the exported stylesheet, injected
 * under a private name, so the preview shows exactly what an app importing that file gets — light
 * or dark, the chosen style and density, and overlays that open outside the scope. The page around
 * it keeps the site's own theme.
 */
@Component({
  selector: 'app-theme-studio-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:self-start lg:overflow-y-auto',
  },
  imports: [
    PreviewDashboard,
    PreviewData,
    PreviewSettings,
    ThemeStudioStylesheet,
    VoltBadge,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSwitch,
    VoltTheme,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  template: `
    <aside class="space-y-4" [appThemeStudioStylesheet]="store.previewCss()">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {{ t('themeStudio.preview.eyebrow') }}
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {{ t('themeStudio.preview.title') }}
          </h2>
          <p class="text-sm text-muted-foreground">{{ t('themeStudio.preview.lede') }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <label for="theme-preview-dark">{{ t('themeStudio.preview.dark') }}</label>
          <volt-switch
            [id]="'theme-preview-dark'"
            ariaLabel="Dark preview"
            [checked]="store.previewDark()"
            (checkedChange)="store.setPreviewDark($event)"
          />
        </div>
      </div>

      <div
        class="grid gap-3 sm:grid-cols-2"
        role="group"
        [attr.aria-label]="t('themeStudio.preview.controls')"
      >
        <volt-toggle-group
          class="sm:col-span-2"
          [value]="[scenario()]"
          (valueChange)="setScenario($event)"
          [allowDeselection]="false"
          [attr.aria-label]="t('themeStudio.preview.scenario')"
        >
          @for (option of scenarios; track option) {
            <volt-toggle-group-item [value]="option">{{
              t(scenarioKeys[option])
            }}</volt-toggle-group-item>
          }
        </volt-toggle-group>
        <volt-select
          [value]="state()"
          (valueChange)="setState($event)"
          [ariaLabel]="t('themeStudio.preview.state')"
          [displayWith]="stateLabel"
        >
          <volt-select-content>
            @for (option of states; track option) {
              <volt-select-item [value]="option">{{ t(stateKeys[option]) }}</volt-select-item>
            }
          </volt-select-content>
        </volt-select>
        <volt-toggle-group
          [value]="[viewport()]"
          (valueChange)="setViewport($event)"
          [allowDeselection]="false"
          [attr.aria-label]="t('themeStudio.preview.viewport')"
        >
          <volt-toggle-group-item value="desktop">{{
            t('themeStudio.preview.desktop')
          }}</volt-toggle-group-item>
          <volt-toggle-group-item value="narrow">{{
            t('themeStudio.preview.narrow')
          }}</volt-toggle-group-item>
        </volt-toggle-group>
      </div>

      <div
        class="preview-shell overflow-hidden rounded-2xl border border-border/70 bg-surface/75 shadow-2xl shadow-black/10 backdrop-blur"
      >
        <div
          class="flex items-center justify-between border-b border-border/60 bg-muted/35 px-4 py-3"
        >
          <div class="flex items-center gap-1.5" aria-hidden="true">
            <span class="h-2.5 w-2.5 rounded-full bg-destructive/70"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-warning/80"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-success/70"></span>
          </div>
          <span class="font-mono text-[10px] text-muted-foreground"
            >{{ store.normalizedName() }}.css</span
          >
          <volt-badge variant="secondary" class="text-[10px]"
            >{{ store.theme().style }} · {{ store.theme().density }}</volt-badge
          >
        </div>

        <div class="h-[680px] overflow-auto bg-muted/20 p-3 sm:p-4">
          <div
            data-testid="theme-preview"
            class="@container mx-auto overflow-hidden rounded-xl border border-border shadow-lg transition-[max-width] duration-300 motion-reduce:transition-none"
            [class.max-w-[360px]]="viewport() === 'narrow'"
            [voltTheme]="previewTheme()"
          >
            <div class="min-h-[620px] bg-background text-foreground">
              @switch (scenario()) {
                @case ('dashboard') {
                  <app-preview-dashboard [state]="state()" />
                }
                @case ('settings') {
                  <app-preview-settings [state]="state()" />
                }
                @case ('data') {
                  <app-preview-data [state]="state()" />
                }
              }
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: `
    .preview-shell {
      animation: preview-enter 550ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes preview-enter {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .preview-shell {
        animation: none;
      }
    }
  `,
})
export class ThemeStudioPreview {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly store = inject(ThemeStudioStore);

  protected readonly scenarios = PREVIEW_SCENARIOS;
  protected readonly states = PREVIEW_STATES;
  protected readonly scenarioKeys = SCENARIO_KEYS;
  protected readonly stateKeys = STATE_KEYS;

  protected readonly scenario = signal<PreviewScenario>('dashboard');
  protected readonly state = signal<PreviewState>('default');
  protected readonly viewport = signal<'desktop' | 'narrow'>('desktop');

  /** The scope the canvas renders in: the draft's palette (by its private name), style, density, mode. */
  protected readonly previewTheme = computed<VoltAnyThemeOptions>(() => ({
    color: PREVIEW_COLOR,
    style: this.store.theme().style,
    density: this.store.theme().density,
    dark: this.store.previewDark(),
  }));

  protected readonly stateLabel = (value: unknown) =>
    this.t(STATE_KEYS[value as PreviewState] ?? STATE_KEYS.default);

  protected setScenario(value: unknown): void {
    const next = Array.isArray(value) ? value[0] : value;
    if ((PREVIEW_SCENARIOS as readonly unknown[]).includes(next))
      this.scenario.set(next as PreviewScenario);
  }

  protected setState(value: unknown): void {
    if ((PREVIEW_STATES as readonly unknown[]).includes(value))
      this.state.set(value as PreviewState);
  }

  protected setViewport(value: unknown): void {
    const next = Array.isArray(value) ? value[0] : value;
    if (next === 'desktop' || next === 'narrow') this.viewport.set(next);
  }
}
