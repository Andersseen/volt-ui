import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { injectAppI18n } from '@shared/i18n/i18n';
import { currentIndex, flattenLinks, slugFor, type TocItem } from '../lib/docs-nav';
import { DocsBreadcrumbs } from './docs/docs-breadcrumbs';
import { DocsMobileNav } from './docs/docs-mobile-nav';
import { DocsNavList, type DocsSidebarGroup, type DocsSidebarLink } from './docs/docs-nav-list';
import { DocsPager, type PagerLink } from './docs/docs-pager';
import { DocsToc } from './docs/docs-toc';

export type { DocsSidebarGroup, DocsSidebarLink } from './docs/docs-nav-list';

/** Headings inside a live demo are part of the exhibit, not the page outline. */
const TOC_IGNORE = '[data-toc-ignore]';

/**
 * The outline's depth. Guide pages structure with `h2` and use `h3` for card titles, so with
 * a few `h2`s the `h3`s are noise; component pages title their sections with `h3`, so those
 * are the outline when `h2`s are scarce.
 */
function outlineLevels(headings: readonly HTMLElement[]): readonly HTMLElement[] {
  const h2 = headings.filter(heading => heading.tagName === 'H2');
  return h2.length >= 3 ? h2 : headings;
}

/**
 * The documentation frame: pinned navigation, the reading column with breadcrumbs and a
 * previous/next pager, and an "On this page" outline that follows the reader.
 *
 * Owns the state the pieces share — which page the URL is on, the page's headings and which
 * one is being read — and leaves the drawing to small presentational children.
 */
@Component({
  selector: 'app-docs-page-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsBreadcrumbs, DocsMobileNav, DocsNavList, DocsPager, DocsToc],
  template: `
    <div class="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
      <div
        class="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_13rem]"
      >
        <aside
          class="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-r border-border/60 py-8 pr-4 lg:block"
          [attr.aria-label]="title()"
        >
          <p class="px-3 text-sm font-semibold">{{ title() }}</p>
          @if (description()) {
            <p class="mt-1 mb-6 px-3 text-xs text-muted-foreground">{{ description() }}</p>
          } @else {
            <div class="mb-6"></div>
          }
          <app-docs-nav-list [groups]="groups()" />
        </aside>

        <div class="min-w-0 py-8 lg:py-10">
          <app-docs-mobile-nav
            class="mb-6 lg:hidden"
            [title]="title()"
            [browseLabel]="browseLabel()"
            [groups]="groups()"
          />
          <div class="mx-auto max-w-[52rem]">
            <app-docs-breadcrumbs
              class="mb-5"
              [section]="title()"
              [sectionPath]="sectionPath()"
              [page]="pageLabel()"
            />
            <article #content class="docs-content">
              <ng-content />
            </article>
            <app-docs-pager
              class="mt-16 border-t border-border/60 pt-8"
              [previous]="previous()"
              [next]="next()"
            />
          </div>
        </div>

        <aside class="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto py-10 xl:block">
          <app-docs-toc [items]="headings()" [active]="activeHeading()" (selected)="goTo($event)" />
        </aside>
      </div>
    </div>
  `,
})
export class DocsPageShell {
  readonly title = input.required<string>();
  readonly browseLabel = input<string>('Browse');
  readonly description = input<string>('');
  readonly groups = input.required<readonly DocsSidebarGroup[]>();

  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly translations = injectAppI18n();
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  protected readonly t = this.translations.t;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  private readonly links = computed(() => flattenLinks(this.groups()));
  private readonly index = computed(() =>
    currentIndex(this.links(), this.url(), this.translations.path)
  );

  protected readonly sectionPath = computed(() =>
    this.translations.path(this.links()[0]?.path ?? '/docs')
  );
  protected readonly pageLabel = computed(() => {
    const link = this.links()[this.index()];
    return link ? this.label(link) : undefined;
  });
  protected readonly previous = computed(() => this.pagerLink(this.index() - 1));
  protected readonly next = computed(() => this.pagerLink(this.index() + 1));

  protected readonly headings = signal<readonly TocItem[]>([]);
  protected readonly activeHeading = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const view = this.document.defaultView;
      const article = this.content().nativeElement;
      let tracked: readonly HTMLElement[] = [];
      let frame = 0;
      let spyFrame = 0;

      // The heading being read is the last one that has passed under the sticky header; at the
      // very bottom of the page it is the last heading, even if it never reaches the top.
      const spy = () => {
        if (!view || !tracked.length) {
          return;
        }
        const atBottom =
          view.innerHeight + view.scrollY >= this.document.documentElement.scrollHeight - 4;
        const passed = tracked.filter(heading => heading.getBoundingClientRect().top <= 120);
        const current = atBottom ? tracked[tracked.length - 1] : (passed.at(-1) ?? tracked[0]);
        this.activeHeading.set(current.id);
      };
      const onScroll = () => {
        view?.cancelAnimationFrame(spyFrame);
        spyFrame = view?.requestAnimationFrame(spy) ?? 0;
      };
      view?.addEventListener('scroll', onScroll, { passive: true });

      const collect = () => {
        const taken = new Set<string>();
        const elements = outlineLevels(
          [...article.querySelectorAll<HTMLElement>('h2, h3')].filter(
            heading => !heading.closest(TOC_IGNORE) && heading.textContent?.trim()
          )
        );
        const items = elements.map(heading => {
          if (!heading.id || taken.has(heading.id)) {
            heading.id = slugFor(heading.textContent ?? '', taken);
          } else {
            taken.add(heading.id);
          }
          return {
            id: heading.id,
            text: heading.textContent!.trim(),
            level: heading.tagName === 'H3' ? 3 : 2,
          } as TocItem;
        });
        this.headings.set(items);

        tracked = elements;
        spy();
      };

      // Pages render after navigation and their copy can arrive after that (catalog load), so
      // the outline is rebuilt whenever the content's text changes — one rebuild per frame.
      const schedule = () => {
        view?.cancelAnimationFrame(frame);
        frame = view?.requestAnimationFrame(collect) ?? 0;
      };
      const changes = new MutationObserver(schedule);
      changes.observe(article, { childList: true, subtree: true, characterData: true });
      schedule();

      const navigation = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.activeHeading.set(null);
          schedule();
        });

      destroyRef.onDestroy(() => {
        view?.cancelAnimationFrame(frame);
        view?.cancelAnimationFrame(spyFrame);
        view?.removeEventListener('scroll', onScroll);
        changes.disconnect();
        navigation.unsubscribe();
      });
    });
  }

  /** Jump to a heading and put it in the URL, so the position can be shared. */
  goTo(id: string): void {
    const view = this.document.defaultView;
    const target = this.document.getElementById(id);
    if (!target || !view) {
      return;
    }
    const reduce = view.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    view.history.replaceState(
      view.history.state,
      '',
      `${view.location.pathname}${view.location.search}#${id}`
    );
    this.activeHeading.set(id);
  }

  private label(link: DocsSidebarLink): string {
    return link.labelKey ? this.t(link.labelKey) : (link.label ?? '');
  }

  private pagerLink(index: number): PagerLink | null {
    const link = this.links()[index];
    return this.index() >= 0 && link
      ? { path: this.translations.path(link.path), label: this.label(link) }
      : null;
  }
}
