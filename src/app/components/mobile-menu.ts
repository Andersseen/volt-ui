import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { LmnMenuIcon, LmnXIcon } from 'lumen-icons';
import { MoveEnterDirective } from 'angular-movement';
import { MOTION } from '../lib/motion';

@Component({
  selector: 'app-mobile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgpDialog,
    NgpDialogTrigger,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    LmnMenuIcon,
    LmnXIcon,
    MoveEnterDirective,
  ],
  template: `
    <!-- Mobile Menu Button -->
    <button
      [ngpDialogTrigger]="mobileMenuTemplate"
      class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
      aria-label="Open menu"
    >
      <lmn-menu [size]="20" />
    </button>

    <!-- Mobile Menu Dialog Template -->
    <ng-template #mobileMenuTemplate let-close="close">
      <!-- Overlay/Backdrop -->
      <div
        ngpDialogOverlay
        class="fixed inset-0 bg-foreground/50 animate-in fade-in-0 data-[exit]:animate-out data-[exit]:fade-out-0 duration-200"
      ></div>

      <!-- Drawer Content -->
      <div
        ngpDialog
        class="fixed inset-y-0 right-0 z-50 h-full w-[280px] bg-background shadow-xl border-l border-border animate-in slide-in-from-right data-[exit]:animate-out data-[exit]:slide-out-to-right duration-300 ease-out"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 ngpDialogTitle class="text-lg font-semibold">Menu</h2>
          <button
            (click)="close()"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <lmn-x [size]="20" />
          </button>
        </div>

        <!-- Navigation -->
        <nav
          class="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]"
          ngpDialogDescription
        >
          @for (link of links; track link.path; let i = $index) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-muted text-foreground font-medium"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              (click)="close()"
              moveEnter="fade-left"
              [moveDelay]="i * stagger"
              class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {{ link.label }}
            </a>
          }
        </nav>
      </div>
    </ng-template>
  `,
})
export class MobileMenu {
  /** Links stagger in behind the drawer, so the panel reads as arriving rather than appearing. */
  protected readonly stagger = MOTION.stagger;

  protected readonly links = [
    { path: '/', label: 'Home', exact: true },
    { path: '/docs/introduction', label: 'Docs', exact: false },
    { path: '/docs/components', label: 'Components', exact: false },
    { path: '/docs/blocks', label: 'Gallery', exact: false },
    { path: '/create-theme', label: 'Create Theme', exact: false },
  ];
}
