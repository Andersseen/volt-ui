import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SiteHeader } from '@shared/components/site-header';
import type { SiteNavLink } from '@shared/components/site-nav';
import { injectAppI18n } from '@shared/i18n/i18n';
import { CATALOG_KINDS, listingPath } from '../lib/catalog';
import { docsUrl, GITHUB_URL } from '../lib/site';

/**
 * Recipes' links in the header both sites share: the three catalog sections and the guides, then
 * the way back to the parent product as the highlighted call-out.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeader],
  template: `
    <app-site-header
      name="Volt UI"
      badge="Recipes"
      [home]="path('/')"
      [links]="links()"
      [github]="github"
    />
  `,
})
export class Header {
  private readonly translations = injectAppI18n();

  protected readonly path = this.translations.path;
  protected readonly github = GITHUB_URL;

  protected readonly links = computed((): readonly SiteNavLink[] => {
    const { t, path, locale } = this.translations;
    return [
      ...CATALOG_KINDS.map(kind => ({
        label: kind === 'recipes' ? t('recipes.title') : t(`gallery.${kind}.title`),
        path: path(listingPath(kind)),
      })),
      { label: t('nav.docs'), path: path('/docs') },
      { label: t('nav.components'), href: docsUrl(locale(), '/docs/components'), highlight: true },
    ];
  });
}
