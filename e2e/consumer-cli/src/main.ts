import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import './styles.css';
import { UiButton } from './ui/button';
// Importing the full barrel forces every `volt add`-copied component file into the
// build's module graph, so the CLI copy-paste path (transformed selectors/classes,
// rewritten imports) gets compiled and type-checked, not just button.
import * as UI from './ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiButton],
  template: `
    <main>
      <h1>Volt CLI Consumer Fixture</h1>
      <p data-testid="component-count">{{ componentCount }} exports loaded via volt add</p>
      <ui-button data-testid="cli-button">CLI-copied button</ui-button>
    </main>
  `,
})
class AppRoot {
  protected readonly componentCount = Object.keys(UI).length;
}

bootstrapApplication(AppRoot, {
  providers: [provideZonelessChangeDetection()],
});
