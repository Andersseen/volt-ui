import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { injectAppI18n } from '@shared/i18n/i18n';
import { DocsPageShell } from '../components/docs-page-shell';
import { COMPONENTS_SIDEBAR, GUIDE_SIDEBAR } from '../lib/docs-sidebar';

/** `/docs/components/<name>` or `/<locale>/docs/components/<name>`, before any query or fragment. */
export function isComponentPage(url: string): boolean {
  return /^(?:\/[a-z]{2})?\/docs\/components(?:\/|$)/.test(url.split(/[?#]/)[0]);
}

/**
 * The frame around every Doqs page: the same `app-docs-page-shell` the host pages use.
 *
 * Doqs renders the Markdown, its demos and playgrounds; the site keeps one navigation. The Doqs
 * sidebar, outline, breadcrumb and pager only know the Markdown pages, so a reader on a migrated
 * page lost the guides, the AI tools and every unmigrated component. They are turned off
 * (`sidebar: 'hidden'`, `showTableOfContents: false`, CSS for the rest in `styles.css`) and this
 * shell draws the full sidebar for the section the URL is in, plus the outline and pager.
 */
@Component({
  selector: 'app-doq-host-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell
      [title]="components() ? t('components.index.title') : t('guide.title')"
      [browseLabel]="components() ? t('catalog.browse') : t('guide.browse')"
      [description]="components() ? '' : t('guide.description')"
      [groups]="components() ? componentGroups : guideGroups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class DoqHostLayout {
  private readonly router = inject(Router);
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly guideGroups = GUIDE_SIDEBAR;
  protected readonly componentGroups = COMPONENTS_SIDEBAR;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly components = computed(() => isComponentPage(this.url()));
}
