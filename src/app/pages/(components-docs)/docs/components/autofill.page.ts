import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { AUTOFILL_SNIPPET } from '../../../../lib/snippets';
import { AUTOFILL_USAGE } from '../../../../lib/snippets/usage';
import { AUTOFILL_API } from '../../../../lib/api-reference.generated';
import { VoltAutofill } from 'volt';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-autofill-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, VoltAutofill, ApiReference],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('components.autofill.title') }}</h1>
        <p class="mt-2 text-muted-foreground">{{ t('components.autofill.description') }}</p>
      </div>

      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usageCode" [tabbed]="true">
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

      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="autofillApi" />
      </div>

      <app-code-panel
        [title]="t('ui.codePanel.directiveSource')"
        [code]="sourceCode"
        cliCommand="npx @voltui/cli add autofill"
      />
    </div>
  `,
})
export default class AutofillPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly autofillApi = AUTOFILL_API;
  readonly autofilled = signal(false);
  readonly sourceCode = AUTOFILL_SNIPPET;
  readonly usageCode = AUTOFILL_USAGE;
}
