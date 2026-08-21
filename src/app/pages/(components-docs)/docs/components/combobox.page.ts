import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltCombobox } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { COMBOBOX_SNIPPET } from '../../../../lib/snippets';
import { COMBOBOX_USAGE } from '../../../../lib/snippets/usage';
import { COMBOBOX_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-combobox-demo',
  standalone: true,
  imports: [VoltCombobox, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.combobox.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.combobox.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 flex justify-center">
          <div class="w-full max-w-xs">
            <volt-combobox
              [(value)]="framework"
              [items]="frameworks"
              placeholder="Select framework"
            >
              <ng-template let-item>{{ item }}</ng-template>
            </volt-combobox>
          </div>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="comboboxApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add combobox"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/combobox' })"
      />
    </div>
  `,
})
export default class ComboboxDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly comboboxApi = COMBOBOX_API;
  readonly code = COMBOBOX_SNIPPET;
  readonly usage = COMBOBOX_USAGE;
  readonly framework = signal('');
  readonly frameworks = ['Angular', 'React', 'Vue', 'Svelte'];
}
