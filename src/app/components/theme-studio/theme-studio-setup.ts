import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltInput,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltTextarea,
} from 'volt';
import { ThemeStudioStore } from '../../services/theme-studio-store';

/** Name the theme, pick a starting preset, generate or import a palette. */
@Component({
  selector: 'app-theme-studio-setup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltInput,
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
        <volt-card-title>Theme Setup</volt-card-title>
        <volt-card-description
          >Name it, pick a starting palette, then tune the details.</volt-card-description
        >
      </volt-card-header>
      <volt-card-content>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label for="theme-name" class="text-sm font-medium text-foreground">Theme name</label>
            <volt-input
              [id]="'theme-name'"
              ariaLabel="Theme name"
              [value]="store.theme().name"
              (valueChange)="store.setName($event)"
              placeholder="acme-ocean"
            />
          </div>

          <div class="space-y-2">
            <span class="text-sm font-medium text-foreground">Start from</span>
            <volt-select
              [(value)]="store.presetValue"
              ariaLabel="Starting preset"
              placeholder="Choose preset"
            >
              <volt-select-content>
                <volt-select-label>Presets</volt-select-label>
                <volt-select-item value="glacier">Glacier</volt-select-item>
                <volt-select-item value="sage">Sage</volt-select-item>
                <volt-select-item value="ember">Ember</volt-select-item>
              </volt-select-content>
            </volt-select>
          </div>
        </div>

        <!-- Palette generator -->
        <div class="mt-6 space-y-4 rounded-xl border border-border/70 bg-muted/25 p-4">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Generate a palette</p>
              <p class="mt-1 text-sm text-muted-foreground">
                Perceptual OKLCH scales with contrast-checked text colors, for both modes at once.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <volt-select
                [(value)]="store.harmonyValue"
                ariaLabel="Color harmony"
                placeholder="Harmony"
                class="w-40"
              >
                <volt-select-content>
                  <volt-select-label>Harmony</volt-select-label>
                  @for (option of store.harmonies; track option) {
                    <volt-select-item [value]="option">{{ option }}</volt-select-item>
                  }
                </volt-select-content>
              </volt-select>
              <volt-button (click)="store.generate()">Generate</volt-button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <button
              type="button"
              class="text-primary underline-offset-4 hover:underline"
              (click)="store.toggleImport()"
            >
              {{ store.importOpen() ? 'Hide import' : 'Import from Palette Crafter' }}
            </button>
            <a
              [href]="store.crafterLink()"
              target="_blank"
              rel="noreferrer"
              class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {{
                store.paletteMeta()
                  ? 'Refine this palette in Palette Crafter ↗'
                  : 'Craft one in Palette Crafter ↗'
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
                Paste the <span class="font-medium text-foreground">JSON</span> export from Palette
                Crafter:
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
                Apply palette
              </volt-button>
            </div>
          }
        </div>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioSetup {
  protected readonly store = inject(ThemeStudioStore);
}
