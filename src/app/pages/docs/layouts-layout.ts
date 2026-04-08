import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { IconChevronRight, IconClose } from '../../icons';

@Component({
  selector: 'app-layouts-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgpDialog,
    NgpDialogTrigger,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    IconChevronRight,
    IconClose,
  ],
  template: `
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-12 items-start"
    >
      <!-- Mobile Menu Button -->
      <div class="w-full md:hidden">
        <button
          [ngpDialogTrigger]="mobileMenuTemplate"
          class="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-muted/50 text-sm font-medium hover:bg-muted transition-colors"
        >
          <span>Browse Layouts</span>
          <icon-chevron-right />
        </button>
      </div>

      <!-- Sidebar (Desktop) -->
      <aside class="hidden md:block w-full md:w-64 flex-shrink-0 md:sticky md:top-24">
        <nav class="flex flex-col space-y-2">
          <h4 class="font-medium text-sm mt-2 text-foreground">Layouts</h4>
          <p class="text-xs text-muted-foreground mt-1">Copy-paste blocks. No install needed.</p>
          <ul class="space-y-1 mt-4 md:border-l md:border-border/50 md:ml-2 md:pl-4">
            @for (item of layoutLinks; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="font-medium text-foreground"
                  class="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0 w-full">
        <router-outlet />
      </main>
    </div>

    <!-- Mobile Menu Dialog -->
    <ng-template #mobileMenuTemplate let-close="close">
      <div
        ngpDialogOverlay
        class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      ></div>
      <div
        ngpDialog
        class="fixed inset-y-0 left-0 z-50 h-full w-[300px] bg-background shadow-xl border-r border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300"
      >
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 ngpDialogTitle class="text-lg font-semibold">Layouts</h2>
          <button
            (click)="close()"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <icon-close />
          </button>
        </div>
        <nav
          class="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]"
          ngpDialogDescription
        >
          @for (item of layoutLinks; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-muted text-foreground font-medium"
              (click)="close()"
              class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </div>
    </ng-template>
  `,
})
export default class LayoutsLayout {
  readonly layoutLinks = [{ path: 'sidebar', label: 'Sidebar' }];
}
