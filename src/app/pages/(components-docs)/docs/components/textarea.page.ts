import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltTextarea } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { TEXTAREA_SNIPPET } from '../../../../lib/snippets';
import { TEXTAREA_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-textarea-demo',
  standalone: true,
  imports: [VoltTextarea, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Textarea</h1>
        <p class="text-base text-muted-foreground mt-2">
          Multi-line text input with size, variant, resize, and error states.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 flex justify-center">
          <div class="w-full max-w-md space-y-3">
            <volt-textarea [(value)]="message" [rows]="4" />
            <p class="text-sm text-muted-foreground">{{ message().length }} characters</p>
          </div>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add textarea"
        description="Copy this code to your project. The component uses ng-primitives/textarea."
      />
    </div>
  `,
})
export default class TextareaDemo {
  readonly code = TEXTAREA_SNIPPET;
  readonly usage = TEXTAREA_USAGE;
  readonly message = signal('Write a short note...');
}
