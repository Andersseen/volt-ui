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
        class="fixed inset-0 bg-foreground/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      ></div>

      <!-- Drawer Content -->
      <div
        ngpDialog
        class="fixed inset-y-0 right-0 z-50 h-full w-[280px] bg-background shadow-xl border-l border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300"
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
          <a
            routerLink="/"
            routerLinkActive="bg-muted text-foreground font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Home
          </a>
          <a
            routerLink="/docs/introduction"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Docs
          </a>
          <a
            routerLink="/docs/components"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Components
          </a>
          <a
            routerLink="/create-theme"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Create Theme
          </a>
          <a
            routerLink="/docs/layouts"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Layouts
          </a>
        </nav>
      </div>
    </ng-template>
  `,
})
export class MobileMenu {}
