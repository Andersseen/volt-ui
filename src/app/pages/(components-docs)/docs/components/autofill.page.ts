import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CodePanel } from '../../../../components/code-panel';
import { AUTOFILL_SNIPPET } from '../../../../lib/snippets';
import { VoltAutofill } from 'volt';

@Component({
  selector: 'app-autofill-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, VoltAutofill],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Autofill</h1>
        <p class="mt-2 text-muted-foreground">
          Directive for detecting browser autofill state on form controls.
        </p>
      </div>

      <app-code-panel title="Usage" [code]="usageCode" [tabbed]="true">
        <div class="max-w-md space-y-2">
          <input
            voltAutofill
            type="email"
            autocomplete="email"
            placeholder="Email address"
            (autofillChange)="autofilled.set($event)"
            class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p class="text-sm text-muted-foreground">Autofill active: {{ autofilled() }}</p>
        </div>
      </app-code-panel>

      <app-code-panel
        title="Directive Source"
        [code]="sourceCode"
        cliCommand="npx github:Andersseen/volt-ui add autofill"
      />
    </div>
  `,
})
export default class AutofillPage {
  readonly autofilled = signal(false);
  readonly sourceCode = AUTOFILL_SNIPPET;
  readonly usageCode = `import { Component, signal } from '@angular/core';
import { VoltAutofill } from 'volt';

@Component({
  imports: [VoltAutofill],
  template: \`
    <input
      voltAutofill
      type="email"
      autocomplete="email"
      placeholder="Email address"
      (autofillChange)="autofilled.set($event)"
    />
  \`,
})
export class MyComponent {
  autofilled = signal(false);
}`;
}
