import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { FORM_FIELD_SNIPPET } from '../../../../lib/snippets';
import { FORM_FIELD_USAGE } from '../../../../lib/snippets/usage';
import { FORM_FIELD_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-form-field-demo',
  standalone: true,
  imports: [VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.formField.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.formField.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
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
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="formFieldApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add form-field"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/form-field' })"
      />
    </div>
  `,
})
export default class FormFieldDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly formFieldApi = FORM_FIELD_API;
  readonly code = FORM_FIELD_SNIPPET;
  readonly usage = FORM_FIELD_USAGE;
}
