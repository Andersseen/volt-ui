import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogBrowser } from '../../../components/catalog-browser/catalog-browser';

/** Patterns are not grouped yet, so the listing offers search but no categories or sort. */
@Component({
  selector: 'app-patterns-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogBrowser],
  template: `
    <app-catalog-browser
      kind="patterns"
      titleKey="gallery.patterns.title"
      ledeKey="recipes.kinds.recipes"
    />
  `,
})
export default class PatternsIndexPage {}
