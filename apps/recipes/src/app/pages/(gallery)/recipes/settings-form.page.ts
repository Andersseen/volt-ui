import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsFormRecipe } from '../../../recipes/settings-form/settings-form';
import { RecipeShowcase } from '../../../components/recipe-showcase';
import { recipeBySlug } from '../../../lib/recipes-metadata';
import { SETTINGS_FORM_RECIPE } from '../../../lib/snippets/recipes';

@Component({
  selector: 'app-recipe-settings-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeShowcase, SettingsFormRecipe],
  template: `
    <app-recipe-showcase [recipe]="recipe" [code]="code">
      <app-settings-form-recipe />
    </app-recipe-showcase>
  `,
})
export default class RecipeSettingsFormPage {
  protected readonly recipe = recipeBySlug('settings-form');
  protected readonly code = SETTINGS_FORM_RECIPE;
}
