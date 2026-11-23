import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogBrowser } from '../../../components/catalog-browser/catalog-browser';
import { VoltAlert, VoltAlertDescription } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-layouts-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogBrowser, VoltAlert, VoltAlertDescription],
  template: `
    <app-catalog-browser
      kind="layouts"
      titleKey="gallery.layouts.title"
      ledeKey="gallery.layouts.description"
    >
      <volt-alert>
        <volt-alert-description>{{ t('gallery.layoutUnbrandedNote') }}</volt-alert-description>
      </volt-alert>
    </app-catalog-browser>
  `,
})
export default class LayoutsIndexPage {
  protected readonly t = injectAppI18n().t;
}
