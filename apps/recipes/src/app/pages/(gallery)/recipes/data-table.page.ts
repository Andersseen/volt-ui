import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataTableRecipe } from '../../../recipes/data-table/data-table';
import { RecipeShowcase } from '../../../components/recipe-showcase';
import { recipeBySlug } from '../../../lib/recipes-metadata';
import { DATA_TABLE_RECIPE } from '../../../lib/snippets/recipes';

@Component({
  selector: 'app-recipe-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeShowcase, DataTableRecipe],
  template: `
    <app-recipe-showcase [recipe]="recipe" [code]="code">
      <app-data-table-recipe />
    </app-recipe-showcase>
  `,
})
export default class RecipeDataTablePage {
  protected readonly recipe = recipeBySlug('data-table');
  protected readonly code = DATA_TABLE_RECIPE;
}
