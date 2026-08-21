import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CodePanel } from '../../../../components/code-panel';
import { SEARCH_SNIPPET } from '../../../../lib/snippets';
import { SEARCH_USAGE } from '../../../../lib/snippets/usage';
import { VoltInput, VoltSearch, VoltSearchClear } from 'volt';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-search-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, VoltInput, VoltSearch, VoltSearchClear],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('components.search.title') }}</h1>
        <p class="mt-2 text-muted-foreground">{{ t('components.search.description') }}</p>
      </div>

      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usageCode" [tabbed]="true">
        <volt-search class="flex max-w-md items-center gap-2">
          <volt-input type="search" placeholder="Search components..." class="flex-1" />
          <volt-search-clear>Clear</volt-search-clear>
        </volt-search>
      </app-code-panel>

      <app-code-panel [code]="sourceCode" cliCommand="npx @voltui/cli add search" />
    </div>
  `,
})
export default class SearchPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly sourceCode = SEARCH_SNIPPET;
  readonly usageCode = SEARCH_USAGE;
}
