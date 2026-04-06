import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltToggle } from 'volt';
import { CodePanel } from '../../../components/code-panel';
import { TOGGLE_SNIPPET } from '../../../lib/snippets';
import { IconItalic, IconBold } from '../../../icons';

@Component({
  selector: 'app-toggle-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltToggle, CodePanel, IconItalic, IconBold],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Toggle</h1>
        <p class="text-base text-muted-foreground mt-2">
          A two-state button that can be either on or off.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">Example</h2>
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center min-h-[300px] gap-4"
        >
          <volt-toggle aria-label="Toggle italic" [(pressed)]="italic">
            <icon-italic class="w-4 h-4" />
          </volt-toggle>

          <volt-toggle variant="outline" aria-label="Toggle bold" [(pressed)]="bold">
            <icon-bold class="w-4 h-4" />
          </volt-toggle>
        </div>
      </div>

      <!-- Source Code Section -->
      <app-code-panel
        title="Component Source"
        [code]="toggleCode"
        cliCommand="npx github:Andersseen/volt-ui add toggle"
        description="Copy this code to your project. The component uses ng-primitives/toggle."
      />
    </div>
  `,
})
export default class ToggleDemo {
  italic = signal(false);
  bold = signal(true);
  readonly toggleCode = TOGGLE_SNIPPET;
}
