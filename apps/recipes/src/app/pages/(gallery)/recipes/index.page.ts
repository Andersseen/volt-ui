import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectAppI18n } from '@shared/i18n/i18n';
import { CatalogCard } from '../../../components/catalog-card';
import { entriesOf } from '../../../lib/catalog';

@Component({
  selector: 'app-recipes-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogCard],
  template: `
    <div class="space-y-8">
      <h1 class="text-3xl font-bold tracking-tight">{{ t('recipes.title') }}</h1>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @for (entry of recipes; track entry.id) {
          <app-catalog-card [entry]="entry" />
        }
      </div>
    </div>
  `,
})
export default class RecipesIndexPage {
  protected readonly t = injectAppI18n().t;
  protected readonly recipes = entriesOf('recipes');
}
