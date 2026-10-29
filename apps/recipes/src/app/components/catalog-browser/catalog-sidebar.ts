import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { VoltSidebarGroup, VoltSidebarItem } from 'volt';
import { filter, map } from 'rxjs';
import { injectAppI18n } from '@shared/i18n/i18n';
import {
  CATALOG_KINDS,
  entriesOf,
  groupsOf,
  listingPath,
  type CatalogKind,
} from '../../lib/catalog';

/**
 * The catalog's table of contents, beside every listing and every entry page.
 *
 * It shows all three catalogs with their sizes, and opens the current one into its categories,
 * each a link to the listing filtered by `?category=` — the same URL the chips on the listing
 * write, so the two never disagree about where you are. Entry pages keep it too, so moving to a
 * neighbouring category is one click rather than a trip back up.
 */
@Component({
  selector: 'app-catalog-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSidebarGroup, VoltSidebarItem],
  host: { class: 'block' },
  template: `
    <nav [attr.aria-label]="t('recipes.browser.catalog')">
      <volt-sidebar-group [label]="t('recipes.browser.catalog')">
        @for (kind of kinds(); track kind.id) {
          <!-- Exact, so the catalog itself is only "current" on its unfiltered listing. -->
          <volt-sidebar-item
            class="h-9 font-medium"
            [class.text-foreground]="kind.id === currentKind()"
            [routerLink]="kind.path"
            [label]="kind.title"
            exact
          >
            <span slot="trailing" class="text-xs tabular-nums">{{ kind.count }}</span>
          </volt-sidebar-item>

          @if (kind.id === currentKind() && kind.groups.length) {
            <div class="mb-2 ml-3 mt-1 border-l border-border pl-2">
              @for (group of kind.groups; track group.id) {
                <volt-sidebar-item
                  class="h-8 text-[13px]"
                  [routerLink]="kind.path"
                  [queryParams]="{ category: group.id }"
                  [label]="t(group.labelKey)"
                  exact
                >
                  <span slot="trailing" class="text-xs tabular-nums">{{ group.count }}</span>
                </volt-sidebar-item>
              }
            </div>
          }
        }
      </volt-sidebar-group>
    </nav>
  `,
})
export class CatalogSidebar {
  private readonly translations = injectAppI18n();
  private readonly router = inject(Router);

  protected readonly t = this.translations.t;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  /** Which catalog the page belongs to, read from the URL (locale prefix aside). */
  protected readonly currentKind = computed(() => {
    const tree = this.router.parseUrl(this.url());
    const segments = tree.root.children['primary']?.segments.map(segment => segment.path) ?? [];
    return segments.find((segment): segment is CatalogKind =>
      (CATALOG_KINDS as readonly string[]).includes(segment)
    );
  });

  protected readonly kinds = computed(() =>
    CATALOG_KINDS.map(id => {
      const entries = entriesOf(id);
      return {
        id,
        path: this.translations.path(listingPath(id)),
        title: id === 'recipes' ? this.t('recipes.title') : this.t(`gallery.${id}.title`),
        count: entries.length,
        groups: groupsOf(id).map(group => ({
          ...group,
          count: entries.filter(entry => entry.groupId === group.id).length,
        })),
      };
    })
  );
}
