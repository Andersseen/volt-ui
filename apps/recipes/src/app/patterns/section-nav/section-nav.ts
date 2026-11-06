import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface NavSection {
  /** The element id, and the `#fragment` of the link. Must be unique on the page. */
  readonly id: string;
  readonly label: string;
  /** Demo copy for the section body; replace the loop in the template with your real content. */
  readonly paragraphs: readonly string[];
}

const DEFAULT_SECTIONS: readonly NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    paragraphs: [
      'Long pages need a way to say where you are. This navigation follows the reader as they scroll and highlights the section on screen.',
      'It is built from native anchors, so middle-click, copy link and deep links to a section all work without any code.',
    ],
  },
  {
    id: 'installation',
    label: 'Installation',
    paragraphs: [
      'Nothing to install: copy this file, replace the section list and the demo content, and the observer does the rest.',
      'Sections are found by id in the document, so the content can live anywhere on the page, not only inside this component.',
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    paragraphs: [
      'Set the sticky offset to the height of your header, and the same value is used as the scroll margin of every section.',
      'The reading band is the top 40% of the scroll area: the active section is the first one that reaches it.',
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    paragraphs: [
      'The current link carries aria-current="location". Arrow keys move between links; Tab and Enter work as on any anchor.',
      'Smooth scrolling is applied only when the visitor has not asked for reduced motion.',
    ],
  },
  {
    id: 'faq',
    label: 'FAQ',
    paragraphs: [
      'The last section is often shorter than the screen and can never reach the top. Clicking its link still marks it active.',
      'If your sections load later, change the input: the observer is rebuilt for the new list and the old one is disconnected.',
    ],
  },
];

/**
 * Section navigation (scroll spy) for long pages.
 *
 * - **Native navigation.** Links are `<a href="#id">`; the browser scrolls, updates the hash and
 *   supports deep links. There is no router and no `scrollIntoView` call. A section's
 *   `scroll-margin-top` equals `offset`, so a sticky header never covers the heading you jumped to.
 * - **Tracking.** One `IntersectionObserver` watches the sections. The "reading band" is the top 40%
 *   of the scroll area below `offset`; the active section is the first one in document order that
 *   intersects it. When none does (a gap between sections) the previous one stays active.
 * - **Hash and clicks.** A hash present on load, `hashchange` and a click all set the active section
 *   immediately — needed for the last section, which can be too short to ever reach the band.
 * - **Keyboard.** Links are tabbable; ArrowUp/ArrowDown/Home/End move focus within the list.
 * - **Motion.** Smooth scrolling is `motion-safe:` only, so `prefers-reduced-motion` jumps instantly.
 * - **SSR and cleanup.** Nothing touches the DOM before render; the observer is rebuilt when
 *   `sections` changes and disconnected on destroy, as is the `hashchange` listener.
 *
 * By default the page scrolls (`contained` off). `contained` makes the content its own scroll area
 * of `height` — used for previews, and for nested panes.
 */
@Component({
  selector: 'app-section-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="@container"
      [class.flex]="contained()"
      [class.flex-col]="contained()"
      [style.height]="contained() ? height() : null"
    >
      <div
        class="flex min-h-0 flex-1 flex-col gap-6 @3xl:flex-row"
        [class.overflow-hidden]="contained()"
      >
        <nav
          aria-label="On this page"
          class="sticky z-10 -mx-1 shrink-0 bg-background/95 px-1 backdrop-blur @3xl:mx-0 @3xl:w-52 @3xl:self-start @3xl:bg-transparent @3xl:px-0 @3xl:backdrop-blur-none"
          [style.top.px]="contained() ? 0 : offset()"
        >
          <ul
            #list
            class="flex gap-1 overflow-x-auto border-b border-border py-2 @3xl:flex-col @3xl:overflow-visible @3xl:border-b-0 @3xl:border-l @3xl:py-0"
          >
            @for (section of sections(); track section.id) {
              <li class="shrink-0">
                <a
                  class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring @3xl:-ml-px @3xl:rounded-none @3xl:border-l-2 @3xl:border-transparent @3xl:py-1 aria-[current=location]:font-medium aria-[current=location]:text-foreground @3xl:aria-[current=location]:border-primary"
                  [href]="'#' + section.id"
                  [attr.aria-current]="section.id === activeId() ? 'location' : null"
                  (click)="activeId.set(section.id)"
                  (keydown)="onKeydown($event)"
                  >{{ section.label }}</a
                >
              </li>
            }
          </ul>
        </nav>

        <div
          #scroller
          class="min-w-0 flex-1 motion-safe:scroll-smooth"
          [class.overflow-y-auto]="contained()"
          [class.pr-2]="contained()"
        >
          @for (section of sections(); track section.id) {
            <section
              class="pb-10"
              [id]="section.id"
              [attr.aria-labelledby]="section.id + '-title'"
              [style.scroll-margin-top.px]="contained() ? 8 : offset()"
            >
              <h2 class="text-xl font-semibold tracking-tight" [id]="section.id + '-title'">
                {{ section.label }}
              </h2>
              @for (text of section.paragraphs; track $index) {
                <p class="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">{{ text }}</p>
              }
            </section>
          }
        </div>
      </div>
    </div>
  `,
})
export class SectionNav {
  private readonly document = inject(DOCUMENT);

  readonly sections = input<readonly NavSection[]>(DEFAULT_SECTIONS);
  /** Height of your sticky header in px: the nav sticks below it and sections scroll to just under it. */
  readonly offset = input(16, { transform: numberAttribute });
  /** Make the content its own scroll area (previews, panes). Off: the page scrolls. */
  readonly contained = input(false, { transform: booleanAttribute });
  /** CSS height of the scroll area when `contained`. */
  readonly height = input('24rem');

  protected readonly activeId = signal<string>(DEFAULT_SECTIONS[0].id);

  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly ids = computed(() => this.sections().map(section => section.id));

  constructor() {
    // Runs in the browser only, after the sections are in the DOM, and again when they change.
    afterRenderEffect(onCleanup => {
      const ids = this.ids();
      const scroller = this.scroller()?.nativeElement;
      const contained = this.contained();
      const offset = this.offset();

      const fromHash = this.sectionFromHash(ids);
      if (fromHash) this.activeId.set(fromHash);
      else if (!ids.includes(this.activeId()) && ids[0]) this.activeId.set(ids[0]);

      const view = this.document.defaultView;
      const onHash = () => {
        const id = this.sectionFromHash(this.ids());
        if (id) this.activeId.set(id);
      };
      view?.addEventListener('hashchange', onHash);
      onCleanup(() => view?.removeEventListener('hashchange', onHash));

      if (typeof IntersectionObserver === 'undefined' || !scroller) return;

      const visible = new Set<string>();
      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          const first = ids.find(id => visible.has(id));
          if (first) this.activeId.set(first);
        },
        {
          root: contained ? scroller : null,
          // The reading band: from the sticky offset down to 40% of the scroll area.
          rootMargin: `-${contained ? 0 : offset}px 0px -60% 0px`,
        }
      );
      for (const id of ids) {
        const target = this.document.getElementById(id);
        if (target) observer.observe(target);
      }
      onCleanup(() => observer.disconnect());
    });
  }

  private sectionFromHash(ids: readonly string[]): string | null {
    const hash = this.document.defaultView?.location.hash.slice(1);
    if (!hash) return null;
    let id = hash;
    try {
      id = decodeURIComponent(hash);
    } catch {
      /* keep the raw fragment */
    }
    return ids.includes(id) ? id : null;
  }

  protected onKeydown(event: KeyboardEvent): void {
    const links = Array.from(this.list()?.nativeElement.querySelectorAll('a') ?? []);
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index < 0) return;
    const target =
      event.key === 'ArrowDown'
        ? links[Math.min(index + 1, links.length - 1)]
        : event.key === 'ArrowUp'
          ? links[Math.max(index - 1, 0)]
          : event.key === 'Home'
            ? links[0]
            : event.key === 'End'
              ? links[links.length - 1]
              : null;
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
}
