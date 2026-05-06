import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { FORM_FIELD_SNIPPET } from '../../../../lib/snippets';
import { FORM_FIELD_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-form-field-demo',
  standalone: true,
  imports: [VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Form Field</h1>
        <p class="text-base text-muted-foreground mt-2">
          Accessible form wrapper with label, hint, and error text.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 flex justify-center">
          <div class="w-full max-w-sm space-y-5">
            <volt-form-field>
              <volt-label>Email</volt-label>
              <volt-input type="email" placeholder="you@example.com" />
              <volt-hint>We'll only use this for account updates.</volt-hint>
            </volt-form-field>
            <volt-form-field>
              <volt-label [error]="true">Project name</volt-label>
              <volt-input state="error" placeholder="My app" />
              <volt-error>Project name is required.</volt-error>
            </volt-form-field>
          </div>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add form-field"
        description="Copy this code to your project. The component uses ng-primitives/form-field."
      />
    </div>
  `,
})
export default class FormFieldDemo {
  readonly code = FORM_FIELD_SNIPPET;
  readonly usage = FORM_FIELD_USAGE;
}
