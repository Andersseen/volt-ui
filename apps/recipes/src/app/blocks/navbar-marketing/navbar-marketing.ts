import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LmnMenuIcon, LmnXIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';

export interface NavbarLink {
  readonly label: string;
  readonly href: string;
}

const DEFAULT_LINKS: readonly NavbarLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#customers' },
  { label: 'Docs', href: '#docs' },
];

/**
 * Marketing navbar: brand on the left, links in the middle, one call to action on the right, and a
 * disclosure menu below the `md` container width.
 *
 * Everything the copy needs to change is an input — brand, links, the call to action, which link is
 * current — and every click is an output, so wiring it to a router is one handler:
 * `(linkSelected)="router.navigateByUrl($event.href)"`. Without that the links are ordinary anchors.
 *
 * The mobile menu is a disclosure, not a dialog: the toggle owns `aria-expanded` and
 * `aria-controls`, Escape closes it and puts focus back on the toggle, and choosing a link closes it.
 * The layout answers to the container (`@container`), not the viewport, so it behaves the same
 * pasted into a narrow column.
 */
@Component({
  selector: 'app-navbar-marketing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltNativeButton, LmnMenuIcon, LmnXIcon],
  host: { class: 'block', '(keydown.escape)': 'closeMenu(true)' },
  template: `
    <header
      class="@container z-30 border-b border-border bg-background/90 backdrop-blur"
      [class.sticky]="sticky()"
      [class.top-0]="sticky()"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <a
          [href]="brandHref()"
          class="text-base font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >{{ brand() }}</a
        >

        <nav aria-label="Primary" class="hidden flex-1 @2xl:block">
          <ul class="flex items-center gap-1">
            @for (link of links(); track link.href) {
              <li>
                <a
                  voltButton
                  variant="ghost"
                  size="sm"
                  [href]="link.href"
                  [attr.aria-current]="link.href === currentHref() ? 'page' : null"
                  [class.text-primary]="link.href === currentHref()"
                  (click)="linkSelected.emit(link)"
                  >{{ link.label }}</a
                >
              </li>
            }
          </ul>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          @if (cta(); as action) {
            <a
              voltButton
              size="sm"
              class="hidden @2xl:inline-flex"
              [href]="action.href"
              (click)="linkSelected.emit(action)"
              >{{ action.label }}</a
            >
          }
          <button
            #toggle
            voltButton
            variant="ghost"
            size="icon"
            type="button"
            class="@2xl:hidden"
            aria-controls="navbar-marketing-menu"
            [attr.aria-expanded]="menuOpen()"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
            (click)="menuOpen.set(!menuOpen())"
          >
            @if (menuOpen()) {
              <lmn-x [size]="20" />
            } @else {
              <lmn-menu [size]="20" />
            }
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav
          id="navbar-marketing-menu"
          aria-label="Primary"
          class="border-t border-border @2xl:hidden"
        >
          <ul class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            @for (link of links(); track link.href) {
              <li>
                <a
                  voltButton
                  variant="ghost"
                  class="w-full justify-start"
                  [href]="link.href"
                  [attr.aria-current]="link.href === currentHref() ? 'page' : null"
                  (click)="choose(link)"
                  >{{ link.label }}</a
                >
              </li>
            }
            @if (cta(); as action) {
              <li class="pt-2">
                <a voltButton class="w-full" [href]="action.href" (click)="choose(action)">{{
                  action.label
                }}</a>
              </li>
            }
          </ul>
        </nav>
      }
    </header>
  `,
})
export class NavbarMarketing {
  readonly brand = input('Acme');
  readonly brandHref = input('/');
  readonly links = input<readonly NavbarLink[]>(DEFAULT_LINKS);
  readonly cta = input<NavbarLink | null>({ label: 'Get started', href: '#start' });
  /** The `href` of the link for the page being shown. */
  readonly currentHref = input('#product');
  readonly sticky = input(false, { transform: booleanAttribute });

  /** Emits before the browser follows the link, so a router can take over. */
  readonly linkSelected = output<NavbarLink>();

  protected readonly menuOpen = signal(false);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  protected choose(link: NavbarLink): void {
    this.linkSelected.emit(link);
    this.menuOpen.set(false);
  }

  /** Escape closes the menu; focus returns to the toggle only if it was open. */
  protected closeMenu(restoreFocus: boolean): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.toggle()?.nativeElement.focus();
  }
}
