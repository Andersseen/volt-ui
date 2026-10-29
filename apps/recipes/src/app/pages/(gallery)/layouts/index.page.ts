import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogBrowser } from '../../../components/catalog-browser/catalog-browser';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-layouts-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogBrowser],
  template: `
    <app-catalog-browser
      kind="layouts"
      titleKey="gallery.layouts.title"
      ledeKey="gallery.layouts.description"
    >
      <p class="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {{ t('gallery.layoutUnbrandedNote') }}
      </p>
    </app-catalog-browser>
  `,
})
export default class LayoutsIndexPage {
  protected readonly t = injectAppI18n().t;
}
