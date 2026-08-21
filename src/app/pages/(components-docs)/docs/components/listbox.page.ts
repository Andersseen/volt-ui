import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { LISTBOX_SNIPPET } from '../../../../lib/snippets';
import { LISTBOX_USAGE } from '../../../../lib/snippets/usage';
import { LISTBOX_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-listbox-demo',
  standalone: true,
  imports: [
    VoltListbox,
    VoltListboxHeader,
    VoltListboxOption,
    VoltListboxSection,
    CodePanel,
    ApiReference,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.listbox.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.listbox.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-listbox [(value)]="selected">
            <volt-listbox-section>
              <volt-listbox-header>Frameworks</volt-listbox-header>
              <volt-listbox-option value="angular">Angular</volt-listbox-option>
              <volt-listbox-option value="react">React</volt-listbox-option>
              <volt-listbox-option value="vue">Vue</volt-listbox-option>
            </volt-listbox-section>
          </volt-listbox>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="listboxApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add listbox"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/listbox' })"
      />
    </div>
  `,
})
export default class ListboxDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly listboxApi = LISTBOX_API;
  readonly code = LISTBOX_SNIPPET;
  readonly usage = LISTBOX_USAGE;
  readonly selected = signal(['angular']);
}
