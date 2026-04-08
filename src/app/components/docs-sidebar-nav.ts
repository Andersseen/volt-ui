import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { VoltNavSidebar } from 'volt';
import { IconChevronRight, IconClose } from '../icons';

export interface DocsSidebarLink {
  path: string;
  label: string;
  exact?: boolean;
}

export interface DocsSidebarGroup {
  heading?: string;
  links: DocsSidebarLink[];
}

@Component({
  selector: 'app-docs-sidebar-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgpDialog,
    NgpDialogTrigger,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    VoltNavSidebar,
    IconChevronRight,
    IconClose,
  ],
  template: `
    <volt-nav-sidebar [title]="title()" [description]="description()">
      <!-- Mobile trigger (projected into [slot=mobile-trigger]) -->
      <button
        slot="mobile-trigger"
        [ngpDialogTrigger]="mobileDrawer"
        class="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-muted/50 text-sm font-medium hover:bg-muted transition-colors"
      >
        <span>{{ browseLabel() }}</span>
        <icon-chevron-right />
      </button>

      <!-- Desktop nav links -->
      @for (group of groups(); track $index) {
        @if (group.heading) {
          <h5 class="font-medium text-xs mt-4 text-muted-foreground uppercase tracking-wider">
            {{ group.heading }}
          </h5>
        }
        <ul class="space-y-1 mt-2 border-l border-border/50 ml-2 pl-4">
          @for (link of group.links; track link.path) {
            <li>
              <a
                [routerLink]="link.path"
                routerLinkActive="font-medium text-foreground"
                [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                class="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>
      }
    </volt-nav-sidebar>

    <!-- Mobile Drawer (stays in app — uses ng-primitives + app icons) -->
    <ng-template #mobileDrawer let-close="close">
      <div
        ngpDialogOverlay
        class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      ></div>
      <div
        ngpDialog
        class="fixed inset-y-0 left-0 z-50 h-full w-[300px] bg-background shadow-xl border-r border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300"
      >
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 ngpDialogTitle class="text-lg font-semibold">{{ title() }}</h2>
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
          @for (group of groups(); track $index) {
            @if (group.heading) {
              <p
                class="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1"
              >
                {{ group.heading }}
              </p>
            }
            @for (link of group.links; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-muted text-foreground font-medium"
                [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                (click)="close()"
                class="px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {{ link.label }}
              </a>
            }
            @if (!$last) {
              <div class="h-px bg-border my-2"></div>
            }
          }
        </nav>
      </div>
    </ng-template>
  `,
})
export class DocsSidebarNav {
  readonly title = input.required<string>();
  readonly browseLabel = input<string>('Browse');
  readonly description = input<string>('');
  readonly groups = input.required<DocsSidebarGroup[]>();
}
