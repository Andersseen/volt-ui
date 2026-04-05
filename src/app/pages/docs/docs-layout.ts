import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';

@Component({
  selector: 'app-docs-layout',
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
  ],
  template: `
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-12 items-start"
    >
      <!-- Mobile Docs Menu Button -->
      <div class="w-full md:hidden">
        <button
          [ngpDialogTrigger]="mobileDocsTemplate"
          class="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-muted/50 text-sm font-medium hover:bg-muted transition-colors"
        >
          <span>Browse Documentation</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Sidebar Navigation (Desktop) -->
      <aside class="hidden md:block w-full md:w-64 flex-shrink-0 md:sticky md:top-24">
        <nav class="flex flex-col space-y-2">
          <h4 class="font-medium text-sm mt-2 text-foreground">Documentation</h4>
          <ul class="space-y-1 mt-2 md:border-l md:border-border/50 md:ml-2 md:pl-4">
            <li>
              <a
                routerLink="introduction"
                routerLinkActive="font-medium text-foreground"
                class="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Introduction
              </a>
            </li>
            <li>
              <a
                routerLink="themes"
                routerLinkActive="font-medium text-foreground"
                class="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Themes
              </a>
            </li>
            <li>
              <a
                routerLink="components"
                routerLinkActive="font-medium text-foreground"
                class="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                All Components
              </a>
            </li>
            <li>
              <a
                routerLink="mcp"
                routerLinkActive="font-medium text-foreground"
                class="block py-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 2v4" />
                  <path d="m5 5 2.8 2.8" />
                  <path d="m19 5-2.8 2.8" />
                  <path d="M12 12v8" />
                  <path d="m5 19 2.8-2.8" />
                  <path d="m19 19-2.8-2.8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                AI Integration
              </a>
            </li>
          </ul>

          <h4 class="font-medium text-sm mt-8 text-foreground">Components</h4>
          <ul class="space-y-1 mt-2 md:border-l md:border-border/50 md:ml-2 md:pl-4">
            @for (item of componentLinks; track item.path) {
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
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Mobile Docs Menu Dialog -->
    <ng-template #mobileDocsTemplate let-close="close">
      <!-- Overlay -->
      <div
        ngpDialogOverlay
        class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      ></div>

      <!-- Drawer -->
      <div
        ngpDialog
        class="fixed inset-y-0 left-0 z-50 h-full w-[300px] bg-background shadow-xl border-r border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 ngpDialogTitle class="text-lg font-semibold">Documentation</h2>
          <button
            (click)="close()"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav
          class="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]"
          ngpDialogDescription
        >
          <h3
            class="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
          >
            Getting Started
          </h3>
          <a
            routerLink="introduction"
            routerLinkActive="bg-muted text-foreground font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Introduction
          </a>
          <a
            routerLink="themes"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Themes
          </a>
          <a
            routerLink="components"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            All Components
          </a>
          <a
            routerLink="mcp"
            routerLinkActive="bg-muted text-foreground font-medium"
            (click)="close()"
            class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2v4" />
              <path d="m5 5 2.8 2.8" />
              <path d="m19 5-2.8 2.8" />
              <path d="M12 12v8" />
              <path d="m5 19 2.8-2.8" />
              <path d="m19 19-2.8-2.8" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            AI Integration
          </a>

          <div class="h-px bg-border my-3"></div>

          <h3
            class="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
          >
            Components
          </h3>
          <div class="grid grid-cols-2 gap-1">
            @for (item of componentLinks; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-muted text-foreground"
                (click)="close()"
                class="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {{ item.label }}
              </a>
            }
          </div>
        </nav>
      </div>
    </ng-template>
  `,
})
export class DocsLayout {
  readonly componentLinks = [
    { path: 'accordion', label: 'Accordion' },
    { path: 'avatar', label: 'Avatar' },
    { path: 'badge', label: 'Badge' },
    { path: 'button', label: 'Button' },
    { path: 'card', label: 'Card' },
    { path: 'checkbox', label: 'Checkbox' },
    { path: 'dialog', label: 'Dialog' },
    { path: 'input', label: 'Input' },
    { path: 'navigation-menu', label: 'Nav Menu' },
    { path: 'radio', label: 'Radio' },
    { path: 'select', label: 'Select' },
    { path: 'separator', label: 'Separator' },
    { path: 'switch', label: 'Switch' },
    { path: 'tabs', label: 'Tabs' },
    { path: 'toggle', label: 'Toggle' },
    { path: 'tooltip', label: 'Tooltip' },
  ];
}
