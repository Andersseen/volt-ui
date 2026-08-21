import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { DocsPageShell } from '../components/docs-page-shell';
import { GALLERY_SECTIONS, sectionForUrl } from '../lib/gallery-sections';
import { Translations } from '../i18n/translations';

/**
 * Shell shared by both halves of the gallery.
 *
 * The tabs are links rather than a `volt-tabs`: the panels here are routes, and a tab
 * widget that owns its own selected state would end up fighting the router over which of
 * them is right. Links also mean a tab can be opened in a new window, which is most of
 * why anyone middle-clicks a tab bar in a documentation site.
 *
 * The active tab is derived from the URL rather than stored, so a deep link like
 * `/docs/layouts/kanban` arrives with the right tab and the right sidebar already
 * selected — including on the server, where there is no click to have set it.
 */
@Component({
  selector: 'app-gallery-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, DocsPageShell],
  template: `
    <div class="border-b border-border/60">
      <nav
        class="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6"
        [attr.aria-label]="t('gallery.sections')"
      >
        @for (section of sections; track section.id) {
          <a
            [routerLink]="path(section.path)"
            [class]="section.id === active().id ? activeTab : idleTab"
            [attr.aria-current]="section.id === active().id ? 'page' : null"
          >
            {{ t(section.labelKey) }}
          </a>
        }
      </nav>
    </div>

    <app-docs-page-shell
      [title]="t(active().titleKey)"
      [browseLabel]="t(active().browseKey)"
      [description]="t(active().descriptionKey)"
      [groups]="active().groups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class GalleryLayout {
  private readonly router = inject(Router);
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly sections = GALLERY_SECTIONS;

  /*
   * The two states are written out in full rather than layered as a base class plus a
   * `routerLinkActive` override. Tailwind emits `border-transparent` after `border-primary`,
   * so with both on the element the transparent one wins and the underline never appears —
   * the failure is silent, because the class is right there in the DOM.
   */
  private static readonly TAB =
    '-mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors';
  protected readonly activeTab = `${GalleryLayout.TAB} border-primary text-foreground`;
  protected readonly idleTab = `${GalleryLayout.TAB} border-transparent text-muted-foreground hover:text-foreground`;

  /** `router.url` is a plain property, so it needs an event to become reactive. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly active = computed(() => sectionForUrl(this.url()));
}
