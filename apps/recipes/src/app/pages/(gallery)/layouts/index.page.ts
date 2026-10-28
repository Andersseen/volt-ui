import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogCard } from '../../../components/catalog-card';
import { entriesOf } from '../../../lib/catalog';
import { LAYOUT_GROUPS } from '../../../lib/layouts-metadata';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-layouts-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogCard],
  template: `
    <div class="space-y-10">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('gallery.layouts.title') }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ t('gallery.layouts.description') }}</p>
      </div>

      <p class="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {{ t('gallery.layoutUnbrandedNote') }}
      </p>

      @for (group of groups; track group.headingKey) {
        <section class="space-y-5">
          <h2 class="text-lg font-semibold tracking-tight">{{ t(group.headingKey) }}</h2>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (entry of group.entries; track entry.id) {
              <app-catalog-card [entry]="entry" />
            }
          </div>
        </section>
      }
    </div>
  `,
})
export default class LayoutsIndexPage {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  /** Grouped like the catalog's own categories, reading the entries so the cards and routes agree. */
  protected readonly groups = LAYOUT_GROUPS.map(group => ({
    headingKey: group.headingKey,
    entries: entriesOf('layouts').filter(entry =>
      group.layouts.some(layout => layout.slug === entry.slug)
    ),
  }));
}
