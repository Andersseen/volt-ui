import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeShowcase } from '../../../components/recipe-showcase';
import { recipeBySlug } from '../../../lib/recipes-metadata';
import { SECTION_NAV_RECIPE } from '../../../lib/snippets/recipes';
import { SectionNav } from '../../../patterns/section-nav/section-nav';

/** `contained`: inside the showcase frame the demo scrolls its own pane, not the catalog page. */
@Component({
  selector: 'app-recipe-section-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeShowcase, SectionNav],
  template: `
    <app-recipe-showcase [recipe]="recipe" [code]="code">
      <app-section-nav contained />
    </app-recipe-showcase>
  `,
})
export default class RecipeSectionNavPage {
  protected readonly recipe = recipeBySlug('section-nav');
  protected readonly code = SECTION_NAV_RECIPE;
}
