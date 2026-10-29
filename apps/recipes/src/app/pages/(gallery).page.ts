import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CatalogSidebar } from '../components/catalog-browser/catalog-sidebar';

/**
 * The frame around every catalog page: the catalog's table of contents on the left from the
 * `lg` width up, the page on the right. Below `lg` the sidebar steps aside and the listing's own
 * category chips do the same job, so a phone never scrolls past a menu to reach the content.
 */
@Component({
  selector: 'app-gallery-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CatalogSidebar],
  template: `
    <div
      class="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8 lg:py-12"
    >
      <aside class="hidden lg:block">
        <app-catalog-sidebar class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6" />
      </aside>
      <div class="min-w-0">
        <router-outlet />
      </div>
    </div>
  `,
})
export default class GalleryLayout {}
