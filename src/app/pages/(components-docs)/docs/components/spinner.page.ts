import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltNativeButton, VoltSpinner } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SPINNER_SNIPPET } from '../../../../lib/snippets';
import { SPINNER_USAGE } from '../../../../lib/snippets/usage';
import { SPINNER_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

// The heading is the component name, which is identical in every locale (as every
// `components.*.title` is). Switch it to t('components.spinner.title') and add a description
// once those keys exist in Glossa — see specs/plans/v1.1.md "Glossa keys pending".
@Component({
  selector: 'app-spinner-demo',
  standalone: true,
  imports: [VoltSpinner, VoltNativeButton, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Spinner</h1>

      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="flex flex-col items-center gap-8 p-6 md:p-10 border border-border/50 rounded-xl bg-background/50"
        >
          <div class="flex items-center gap-6">
            <volt-spinner size="sm" />
            <volt-spinner size="md" />
            <volt-spinner size="lg" class="text-primary" />
          </div>

          <button voltButton type="button" disabled>
            <volt-spinner size="sm" />
            Saving…
          </button>

          <div class="grid place-items-center gap-2 text-sm text-muted-foreground" aria-busy="true">
            <volt-spinner size="lg" label="Loading projects" />
          </div>
        </div>
      </app-code-panel>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="api" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add spinner"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'class-variance-authority' })"
      />
    </div>
  `,
})
export default class SpinnerDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly api = SPINNER_API;
  readonly code = SPINNER_SNIPPET;
  readonly usage = SPINNER_USAGE;
}
