import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LivePlayground } from '../../../recipes/live-playground/live-playground';
import { RecipeShowcase } from '../../../components/recipe-showcase';
import { recipeBySlug } from '../../../lib/recipes-metadata';
import { LIVE_PLAYGROUND_RECIPE } from '../../../lib/snippets/recipes';

@Component({
  selector: 'app-recipe-live-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeShowcase, LivePlayground],
  template: `
    <app-recipe-showcase [recipe]="recipe" [code]="code">
      <app-live-playground />
    </app-recipe-showcase>
  `,
})
export default class RecipeLivePlaygroundPage {
  protected readonly recipe = recipeBySlug('live-playground');
  protected readonly code = LIVE_PLAYGROUND_RECIPE;
}
