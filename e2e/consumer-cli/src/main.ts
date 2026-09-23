import '@angular/compiler';
import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import './styles.css';
import { UiAlert, UiAlertTitle } from './ui/alert';
import { UiButton, UiNativeButton } from './ui/button';
import { UiCard, UiCardContent } from './ui/card';
import { UiInput } from './ui/input';
import { UiSpinner } from './ui/spinner';
import { UiToastService } from './ui/toast';
// Importing the full barrel forces every `volt add`-copied component file into the
// build's module graph, so the CLI copy-paste path (transformed selectors/classes,
// rewritten imports) gets compiled and type-checked, not just button.
import * as UI from './ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    UiButton,
    UiNativeButton,
    UiAlert,
    UiAlertTitle,
    UiCard,
    UiCardContent,
    UiInput,
    UiSpinner,
  ],
  template: `
    <main>
      <h1>Volt CLI Consumer Fixture</h1>
      <p data-testid="component-count">{{ componentCount }} exports loaded via volt add</p>
      <ui-button data-testid="cli-button">CLI-copied button</ui-button>

      <!-- 1.1 APIs through the copy-and-own path (selectors transformed to ui*) -->
      <a uiButton variant="outline" href="/docs" data-testid="cli-link-button">Docs</a>
      <ui-card>
        <ui-card-content class="p-3" data-testid="cli-card-content">
          <ui-input class="w-24" size="sm" aria-label="Quantity" data-testid="cli-input" />
        </ui-card-content>
      </ui-card>
      <ui-alert variant="success" role="status"><ui-alert-title>Copied</ui-alert-title></ui-alert>
      <ui-spinner label="Loading" />
      <button uiButton type="button" (click)="toast.success('CLI toast')" data-testid="cli-toast">
        Toast
      </button>
    </main>
  `,
})
class AppRoot {
  protected readonly componentCount = Object.keys(UI).length;
  protected readonly toast = inject(UiToastService);
}

bootstrapApplication(AppRoot, {
  providers: [provideZonelessChangeDetection()],
});
