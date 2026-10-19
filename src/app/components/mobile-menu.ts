import { ChangeDetectionStrategy, Component } from '@angular/core';
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

/** The site's own menu drawer: Volt's Drawer, Button and Close, nothing hand-built. */
@Component({
  selector: 'app-mobile-menu',
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
          @for (link of links; track link.path; let i = $index) {
            <a
              voltButton
              variant="ghost"
              [routerLink]="path(link.path)"
              routerLinkActive="bg-accent text-accent-foreground font-semibold ring-1 ring-inset ring-primary/50"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              ariaCurrentWhenActive="page"
              (click)="close()"
              moveEnter="fade-left"
              [moveDelay]="i * stagger"
              class="h-11 justify-start px-3 text-base font-medium text-muted-foreground"
            >
              {{ t(link.key) }}
            </a>
          }
        </nav>
      </div>
    </ng-template>
  `,
})
export class MobileMenu {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  /** Links stagger in behind the drawer, so the panel reads as arriving rather than appearing. */
  protected readonly stagger = MOTION.stagger;

  protected readonly links = [
    { path: '/', key: 'nav.home', exact: true },
    { path: '/docs/introduction', key: 'nav.docs', exact: false },
    { path: '/docs/components', key: 'nav.components', exact: false },
    { path: '/docs/blocks', key: 'nav.gallery', exact: false },
    { path: '/create-theme', key: 'nav.createTheme', exact: false },
  ] as const;
}
