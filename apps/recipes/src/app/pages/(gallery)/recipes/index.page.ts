import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogBrowser } from '../../../components/catalog-browser/catalog-browser';

/** Recipes are not grouped yet, so the listing offers search but no categories or sort. */
@Component({
  selector: 'app-recipes-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogBrowser],
  template: `
    <app-catalog-browser kind="recipes" titleKey="recipes.title" ledeKey="recipes.kinds.recipes" />
  `,
})
export default class RecipesIndexPage {}
