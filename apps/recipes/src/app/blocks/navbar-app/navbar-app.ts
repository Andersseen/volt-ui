import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LmnMenuIcon, LmnXIcon } from 'lumen-icons';
import { VoltAvatar, VoltNativeButton } from 'volt';

export interface AppDestination {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export interface AppAccount {
  readonly name: string;
  readonly email?: string;
  /** Up to two letters, shown in the avatar. Derived from `name` when omitted. */
  readonly initials?: string;
}

const DEFAULT_DESTINATIONS: readonly AppDestination[] = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'reports', label: 'Reports', href: '#reports' },
  { id: 'team', label: 'Team', href: '#team' },
];

/**
 * Application navbar: a workspace switcher slot on the left, the product's destinations, then
 * contextual actions and the signed-in account on the right.
 *
 * This is deliberately not the marketing bar in another colour. It has no call to action; it has a
 * workspace identity, a current destination tracked by `id`, free-form `actions` (any buttons the
 * page projects in), and an account area that only *reports* what the visitor chose — there is no
 * authentication here. The host app passes the account in and handles `(accountAction)` and
 * `(destinationSelected)`.
 *
 * Below the `lg` container width the destinations collapse into a disclosure panel that also holds the
 * account actions; Escape closes it and returns focus to the toggle.
 */
@Component({
  selector: 'app-navbar-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltAvatar, VoltNativeButton, LmnMenuIcon, LmnXIcon],
  host: { class: 'block', '(keydown.escape)': 'closeMenu()' },
  template: `
    <header class="@container border-b border-border bg-card">
      <div class="flex h-14 items-center gap-3 px-3 @lg:px-4">
        <button
          #toggle
          voltButton
          variant="ghost"
          size="icon"
          type="button"
          class="@3xl:hidden"
          aria-controls="navbar-app-menu"
          [attr.aria-expanded]="menuOpen()"
          [attr.aria-label]="menuOpen() ? 'Close navigation' : 'Open navigation'"
          (click)="menuOpen.set(!menuOpen())"
        >
          @if (menuOpen()) {
            <lmn-x [size]="20" />
          } @else {
            <lmn-menu [size]="20" />
          }
        </button>

        <div class="flex min-w-0 items-center gap-2">
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
            aria-hidden="true"
            >{{ workspace().charAt(0) }}</span
          >
          <span class="truncate text-sm font-medium">{{ workspace() }}</span>
        </div>

        <nav aria-label="Application" class="hidden flex-1 @3xl:block">
          <ul class="flex items-center gap-1">
            @for (item of destinations(); track item.id) {
              <li>
                <a
                  class="relative inline-flex h-14 items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary"
                  [href]="item.href"
                  [attr.aria-current]="item.id === current() ? 'page' : null"
                  (click)="destinationSelected.emit(item)"
                  >{{ item.label }}</a
                >
              </li>
            }
          </ul>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <!-- Contextual actions: project buttons, a search trigger, a notifications bell. -->
          <ng-content />
          @if (account(); as person) {
            <button
              voltButton
              variant="ghost"
              type="button"
              class="gap-2 px-1.5"
              [attr.aria-label]="'Account: ' + person.name"
              (click)="accountAction.emit('open')"
            >
              <volt-avatar class="h-7 w-7" aria-hidden="true">
                <span class="flex h-full w-full items-center justify-center text-xs font-medium">{{
                  initialsOf(person)
                }}</span>
              </volt-avatar>
              <span class="hidden max-w-32 truncate text-sm @xl:inline">{{ person.name }}</span>
            </button>
          }
        </div>
      </div>

      @if (menuOpen()) {
        <nav
          id="navbar-app-menu"
          aria-label="Application"
          class="border-t border-border @3xl:hidden"
        >
          <ul class="flex flex-col gap-1 p-2">
            @for (item of destinations(); track item.id) {
              <li>
                <a
                  voltButton
                  variant="ghost"
                  class="w-full justify-start aria-[current=page]:bg-accent"
                  [href]="item.href"
                  [attr.aria-current]="item.id === current() ? 'page' : null"
                  (click)="choose(item)"
                  >{{ item.label }}</a
                >
              </li>
            }
            @if (account()) {
              <li class="border-t border-border pt-2">
                <button
                  voltButton
                  variant="ghost"
                  type="button"
                  class="w-full justify-start"
                  (click)="accountAction.emit('sign-out')"
                >
                  Sign out
                </button>
              </li>
            }
          </ul>
        </nav>
      }
    </header>
  `,
})
export class NavbarApp {
  readonly workspace = input('Northwind');
  readonly destinations = input<readonly AppDestination[]>(DEFAULT_DESTINATIONS);
  /** The `id` of the current destination. */
  readonly current = input('overview');
  readonly account = input<AppAccount | null>({ name: 'Ada Lovelace', email: 'ada@example.com' });

  readonly destinationSelected = output<AppDestination>();
  /** `'open'` for the account button, `'sign-out'` from the mobile panel. The host decides what they do. */
  readonly accountAction = output<'open' | 'sign-out'>();

  protected readonly menuOpen = signal(false);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  protected initialsOf(person: AppAccount): string {
    return (
      person.initials ??
      person.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')
    );
  }

  protected choose(item: AppDestination): void {
    this.destinationSelected.emit(item);
    this.menuOpen.set(false);
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.toggle()?.nativeElement.focus();
  }
}
