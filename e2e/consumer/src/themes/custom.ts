import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltButton,
  VoltDialog,
  VoltDialogContent,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltInput,
  VoltNativeButton,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltTheme,
  applyVoltTheme,
  persistVoltTheme,
  voltCustomColor,
  voltThemeInitScript,
} from '@voltui/components';

/** The palette `acme.css` defines: a stylesheet exported by Theme Studio (`acme.theme.json`). */
export const acme = voltCustomColor('acme');

/**
 * A declared custom palette in every scope arrangement the contract supports: light and dark scopes
 * in a light page, a custom scope inside a built-in one and the other way round, density, an
 * overlay opened from a custom scope, the whole page, and the first-paint script.
 */
@Component({
  selector: 'app-theme-custom',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltDialog,
    VoltDialogContent,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltInput,
    VoltNativeButton,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltTheme,
  ],
  template: `
    <div class="grid gap-4 p-6">
      <div id="outside"><volt-button>Outside</volt-button></div>

      <section id="custom-light" class="p-3" [voltTheme]="{ color: acme, dark: false }">
        <volt-button>Light</volt-button>
        <volt-input aria-label="Light input" />
      </section>

      <section id="custom-dark" class="p-3" [voltTheme]="{ color: acme, dark: true }">
        <volt-button>Dark</volt-button>
      </section>

      <!-- The project's own style and density: what Theme Studio's preview shows for acme.theme.json. -->
      <section
        id="custom-project"
        class="p-3"
        [voltTheme]="{ color: acme, style: 'soft', density: 'compact' }"
      >
        <volt-button>Project</volt-button>
        <volt-input aria-label="Project input" />
      </section>
      <section
        id="custom-project-dark"
        class="p-3"
        [voltTheme]="{ color: acme, style: 'soft', density: 'compact', dark: true }"
      >
        <volt-button>Project dark</volt-button>
        <volt-input aria-label="Project dark input" />
      </section>

      <section id="custom-compact" class="p-3" [voltTheme]="{ color: acme, density: 'compact' }">
        <volt-button>Compact</volt-button>
      </section>

      <section id="custom-brutal" class="p-3" [voltTheme]="{ color: acme, style: 'brutal' }">
        <volt-button>Brutal</volt-button>
      </section>

      <section id="builtin-dark" class="p-3" [voltTheme]="{ color: 'ember', dark: true }">
        <section id="nested-custom-light" class="p-3" [voltTheme]="{ color: acme, dark: false }">
          <volt-button>Nested light</volt-button>
        </section>
      </section>

      <section id="custom-dark-outer" class="p-3" [voltTheme]="{ color: acme, dark: true }">
        <section id="nested-builtin-light" class="p-3" [voltTheme]="{ color: 'sage', dark: false }">
          <volt-button>Nested built-in</volt-button>
        </section>
      </section>
      <section id="ref-sage" class="p-3" [voltTheme]="{ color: 'sage', dark: false }">
        <volt-button>Sage reference</volt-button>
      </section>

      <section id="custom-overlay" class="p-3" [voltTheme]="{ color: acme, dark: true }">
        <button voltButton [voltDialog]="dialog">Open custom dialog</button>
        <ng-template #dialog>
          <div voltDialogOverlay></div>
          <div voltDialogContent data-scoped="custom-dialog">
            <h2 voltDialogTitle>Custom dialog</h2>
            <volt-select aria-label="Custom fruit" placeholder="Pick">
              <volt-select-content>
                <volt-select-item value="apple">Apple</volt-select-item>
              </volt-select-content>
            </volt-select>
          </div>
        </ng-template>
      </section>

      <div class="flex gap-2">
        <button voltButton variant="outline" id="apply-root" (click)="applyToPage()">
          Apply to page
        </button>
        <button voltButton variant="outline" id="persist" (click)="persist()">Persist</button>
      </div>
    </div>
  `,
})
export class ThemeCustomFixture {
  protected readonly acme = acme;

  constructor() {
    // What an app would inline in <head>; the contract runs it to emulate a first paint.
    (globalThis as { voltCustomThemeScript?: string }).voltCustomThemeScript = voltThemeInitScript({
      customColors: [acme],
    });
  }

  protected applyToPage(): void {
    applyVoltTheme({ color: acme, style: 'soft', density: 'compact', dark: false });
  }

  protected persist(): void {
    persistVoltTheme({ color: acme, dark: true });
  }
}
