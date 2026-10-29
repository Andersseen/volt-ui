import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncSearchRecipe } from '../../../recipes/async-search/async-search';
import { RecipeShowcase } from '../../../components/recipe-showcase';
import { recipeBySlug } from '../../../lib/recipes-metadata';
import { ASYNC_SEARCH_RECIPE } from '../../../lib/snippets/recipes';

@Component({
  selector: 'app-recipe-async-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeShowcase, AsyncSearchRecipe],
  template: `
    <app-recipe-showcase [recipe]="recipe" [code]="code">
      <app-async-search-recipe />
    </app-recipe-showcase>
  `,
})
export default class RecipeAsyncSearchPage {
  protected readonly recipe = recipeBySlug('async-search');
  protected readonly code = ASYNC_SEARCH_RECIPE;
}
