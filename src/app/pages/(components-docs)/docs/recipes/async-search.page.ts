import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncSearchRecipe } from '../../../../recipes/async-search/async-search';
import { CodePanel } from '../../../../components/code-panel';
import { externalPackages } from '../../../../lib/snippets/consumer-source';
import { ASYNC_SEARCH_RECIPE } from '../../../../lib/snippets/recipes';
import { injectAppI18n } from '../../../../i18n/i18n';

// The heading is the recipe's own name. Switch it to t() and add the "what it teaches" prose once
// the Glossa keys exist (specs/plans/v1.2.md "Glossa keys pending"). Until then the lesson lives
// in the doc comment at the top of the source below.
@Component({
  selector: 'app-recipe-async-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncSearchRecipe, CodePanel],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Async search</h1>

      <app-code-panel
        [title]="t('ui.codePanel.usage')"
        [code]="code"
        [cliCommand]="install"
        [tabbed]="true"
      >
        <div class="p-6 md:p-10 border border-border/50 rounded-xl bg-background/50">
          <app-async-search-recipe />
        </div>
      </app-code-panel>
    </div>
  `,
})
export default class RecipeAsyncSearchPage {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly code = ASYNC_SEARCH_RECIPE;
  protected readonly install = `pnpm add ${externalPackages(ASYNC_SEARCH_RECIPE).join(' ')}`;
}
