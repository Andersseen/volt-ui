import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltInput,
  VoltSlider,
  VoltSwitch,
} from 'volt';
import { ThemeStudioStore } from '../../services/theme-studio-store';
import { Translations } from '../../i18n/translations';

/**
 * The live canvas. Everything inside the shell is rendered under the draft's own tokens
 * via an inline custom-property map, which is what keeps it from inheriting — or
 * leaking into — the docs theme around it.
 */
@Component({
  selector: 'app-theme-studio-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:self-start lg:overflow-y-auto',
  },
  imports: [
    NgStyle,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltInput,
    VoltSlider,
    VoltSwitch,
  ],
  template: `
    <aside class="space-y-4">
      <div class="flex items-center justify-between gap-3">
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
          <span class="font-mono text-[10px] text-muted-foreground">theme-preview.css</span>
          <volt-badge variant="secondary" class="text-[10px]">Live</volt-badge>
        </div>

        <div class="h-[680px] overflow-auto p-3 sm:p-4">
          <div
            class="overflow-hidden rounded-xl border border-border shadow-lg transition-colors duration-300"
            [ngStyle]="store.previewStyle()"
          >
            <div class="min-h-[620px] bg-background p-5 text-foreground">
              <div class="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p class="text-sm text-muted-foreground">Volt UI</p>
                  <h3 class="text-2xl font-semibold">{{ store.normalizedName() }}</h3>
                </div>
                <volt-badge>Preview</volt-badge>
              </div>

              <div class="mt-5 grid gap-3">
                <volt-card>
                  <volt-card-header>
                    <volt-card-title>Dashboard Card</volt-card-title>
                    <volt-card-description
                      >Surface, border, muted text, and shadow tokens.</volt-card-description
                    >
                  </volt-card-header>
                  <volt-card-content>
                    <div class="grid grid-cols-3 gap-2">
                      <div class="rounded-md bg-muted p-3">
                        <p class="text-xs text-muted-foreground">Users</p>
                        <p class="text-lg font-semibold">12k</p>
                      </div>
                      <div class="rounded-md bg-muted p-3">
                        <p class="text-xs text-muted-foreground">MRR</p>
                        <p class="text-lg font-semibold">$48k</p>
                      </div>
                      <div class="rounded-md bg-muted p-3">
                        <p class="text-xs text-muted-foreground">NPS</p>
                        <p class="text-lg font-semibold">71</p>
                      </div>
                    </div>
                  </volt-card-content>
                </volt-card>

                <div class="rounded-lg border border-border bg-surface p-4 text-surface-foreground">
                  <span class="text-sm font-medium">Project name</span>
                  <div class="mt-2">
                    <volt-input value="Volt Studio" />
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <volt-button>Save theme</volt-button>
                    <volt-button variant="outline">Export CSS</volt-button>
                    <volt-button variant="ghost">Reset</volt-button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div
                    class="rounded-lg border border-border bg-success p-3 text-success-foreground"
                  >
                    Success
                  </div>
                  <div
                    class="rounded-lg border border-border bg-warning p-3 text-warning-foreground"
                  >
                    Warning
                  </div>
                  <div class="rounded-lg border border-border bg-error p-3 text-error-foreground">
                    Error
                  </div>
                  <div class="rounded-lg border border-border bg-info p-3 text-info-foreground">
                    Info
                  </div>
                </div>

                <div class="rounded-lg border border-border bg-surface p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Component density</span>
                    <span class="text-xs text-muted-foreground">64%</span>
                  </div>
                  <div class="mt-4">
                    <volt-slider [value]="64" />
                  </div>
                </div>
              </div>
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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  protected readonly store = inject(ThemeStudioStore);
}
