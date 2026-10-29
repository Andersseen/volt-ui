import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentExplorer } from '../../../recipes/component-explorer/component-explorer';
import { RecipeShowcase } from '../../../components/recipe-showcase';
import { recipeBySlug } from '../../../lib/recipes-metadata';
import { COMPONENT_EXPLORER_RECIPE } from '../../../lib/snippets/recipes';

@Component({
  selector: 'app-recipe-component-explorer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeShowcase, ComponentExplorer],
  template: `
    <app-recipe-showcase [recipe]="recipe" [code]="code">
      <app-component-explorer />
    </app-recipe-showcase>
  `,
})
export default class RecipeComponentExplorerPage {
  protected readonly recipe = recipeBySlug('component-explorer');
  protected readonly code = COMPONENT_EXPLORER_RECIPE;
}
