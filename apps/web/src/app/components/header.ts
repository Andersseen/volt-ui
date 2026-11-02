import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SiteHeader } from '@shared/components/site-header';
import type { SiteNavLink } from '@shared/components/site-nav';
import { injectAppI18n } from '@shared/i18n/i18n';
import { SITE_STATS } from '../lib/generated/site-stats';

/** The docs site's links and release badge, in the header both sites share. */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeader],
  template: `
    <app-site-header
      name="Volt UI"
      [badge]="'v' + version"
      [home]="path('/')"
      [links]="links()"
      github="https://github.com/andersseen/volt-ui"
    />
  `,
})
export class Header {
  private readonly translations = injectAppI18n();

  /** Keeps every link in the locale the visitor is already reading. */
  protected readonly path = this.translations.path;

  /** What npm serves as `latest`, never the source version: the badge cannot get ahead of a release. */
  protected readonly version = SITE_STATS.publishedVersion;

  protected readonly links = computed((): readonly SiteNavLink[] => {
    const { t, path } = this.translations;
    return [
      { label: t('nav.home'), path: path('/'), exact: true },
      { label: t('nav.docs'), path: path('/docs/introduction') },
      { label: t('nav.components'), path: path('/docs/components') },
      {
        label: t('nav.createTheme'),
        path: path('/create-theme'),
        highlight: true,
        badge: t('nav.new'),
      },
    ];
  });
}
