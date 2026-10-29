import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LmnMenuIcon, LmnXIcon } from 'lumen-icons';
import { MoveEnterDirective } from 'angular-movement';
import {
  VoltDrawer,
  VoltDrawerClose,
  VoltDrawerContent,
  VoltDrawerDescription,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltNativeButton,
} from 'volt';
import { MOTION } from '../lib/motion';
import { injectAppI18n } from '../i18n/i18n';
import type { SiteNavLink } from './site-nav';

/** The menu drawer below `md`, for either site: Volt's Drawer, Button and Close, nothing hand-built. */
@Component({
  selector: 'app-site-mobile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    VoltNativeButton,
    VoltDrawer,
    VoltDrawerOverlay,
    VoltDrawerContent,
    VoltDrawerTitle,
    VoltDrawerDescription,
    VoltDrawerClose,
    LmnMenuIcon,
    LmnXIcon,
    MoveEnterDirective,
  ],
  template: `
    <button
      voltButton
      variant="outline"
      size="icon"
      type="button"
      class="md:hidden"
      [voltDrawer]="mobileMenuTemplate"
      [attr.aria-label]="t('nav.openMenu')"
    >
      <lmn-menu [size]="20" />
    </button>

    <ng-template #mobileMenuTemplate let-close="close">
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="right">
        <div class="flex items-center justify-between border-b border-border p-4">
          <h2 voltDrawerTitle class="text-lg font-semibold">{{ t('nav.menu') }}</h2>
          <volt-drawer-close [label]="t('nav.closeMenu')">
            <lmn-x [size]="20" />
          </volt-drawer-close>
        </div>

        <nav
          class="flex max-h-[calc(100vh-80px)] flex-col space-y-1 overflow-y-auto p-4"
          voltDrawerDescription
          [attr.aria-label]="t('nav.main')"
        >
          @for (link of links(); track link.label; let i = $index) {
            @if (link.path !== undefined) {
              <a
                voltButton
                variant="ghost"
                [routerLink]="link.path"
                routerLinkActive="bg-accent text-accent-foreground font-semibold ring-1 ring-inset ring-primary/50"
                [routerLinkActiveOptions]="{ exact: !!link.exact }"
                ariaCurrentWhenActive="page"
                (click)="close()"
                moveEnter="fade-left"
                [moveDelay]="i * stagger"
                class="h-11 justify-start px-3 text-base font-medium text-muted-foreground"
              >
                {{ link.label }}
              </a>
            } @else {
              <a
                voltButton
                variant="ghost"
                [href]="link.href"
                (click)="close()"
                moveEnter="fade-left"
                [moveDelay]="i * stagger"
                class="h-11 justify-start px-3 text-base font-medium text-muted-foreground"
              >
                {{ link.label }}
              </a>
            }
          }
        </nav>
      </div>
    </ng-template>
  `,
})
export class SiteMobileMenu {
  readonly links = input.required<readonly SiteNavLink[]>();

  protected readonly t = injectAppI18n().t;
  /** Links stagger in behind the drawer, so the panel reads as arriving rather than appearing. */
  protected readonly stagger = MOTION.stagger;
}
