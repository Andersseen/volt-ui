import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { LmnChevronRightIcon, LmnXIcon } from 'lumen-icons';
import type { ComponentStability } from '../lib/component-metadata';
import { Translations } from '../i18n/translations';

export interface DocsSidebarLink {
  path: string;
  label: string;
  exact?: boolean;
  stability?: ComponentStability;
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
    LmnChevronRightIcon,
    LmnXIcon,
  ],
  template: `
    <div class="w-full md:hidden">
      <button
        [ngpDialogTrigger]="mobileDrawer"
        class="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-muted/50 text-sm font-medium hover:bg-muted transition-colors"
      >
        <span>{{ browseLabel() }}</span>
        <lmn-chevron-right [size]="16" />
      </button>
    </div>

    <aside
      class="hidden md:flex w-full md:w-64 flex-shrink-0 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] flex-col gap-2 overflow-y-auto overscroll-contain pr-3 pb-6"
      [attr.aria-label]="title()"
    >
      <h4 class="font-medium text-sm mt-2 text-foreground">{{ title() }}</h4>
      @if (description()) {
        <p class="text-xs text-muted-foreground">{{ description() }}</p>
      }
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
                [routerLink]="path(link.path)"
                routerLinkActive="font-medium text-foreground bg-muted"
                [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                class="flex items-center justify-between gap-2 px-2 py-1 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <span class="truncate">{{ link.label }}</span>
                @if (link.stability; as stability) {
                  <span
                    class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none"
                    [class]="stabilityClass(stability)"
                  >
                    {{ stabilityLabel(stability) }}
                  </span>
                }
              </a>
            </li>
          }
        </ul>
      }
    </aside>

    <!-- Mobile Drawer (stays in app — uses ng-primitives + app icons) -->
    <ng-template #mobileDrawer let-close="close">
      <div
        ngpDialogOverlay
        class="fixed inset-0 bg-foreground/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      ></div>
      <div
        ngpDialog
        class="fixed inset-y-0 left-0 z-50 h-full w-[300px] bg-surface text-surface-foreground shadow-xl border-r border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300"
      >
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 ngpDialogTitle class="text-lg font-semibold">{{ title() }}</h2>
          <button
            (click)="close()"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <lmn-x [size]="20" />
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
                [routerLink]="path(link.path)"
                routerLinkActive="bg-muted text-foreground font-medium"
                [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                (click)="close()"
                class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <span>{{ link.label }}</span>
                @if (link.stability; as stability) {
                  <span
                    class="rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none"
                    [class]="stabilityClass(stability)"
                  >
                    {{ stabilityLabel(stability) }}
                  </span>
                }
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
  private readonly translations = inject(Translations);

  /** Every sidebar link on the site passes through here, so one call keeps them all in locale. */
  protected readonly path = this.translations.path;

  readonly title = input.required<string>();
  readonly browseLabel = input<string>('Browse');
  readonly description = input<string>('');
  readonly groups = input.required<readonly DocsSidebarGroup[]>();

  protected stabilityLabel(stability: ComponentStability): string {
    return stability === 'experimental' ? 'exp' : stability;
  }

  protected stabilityClass(stability: ComponentStability): string {
    switch (stability) {
      case 'stable':
        return 'bg-success/15 text-success';
      case 'beta':
        return 'bg-info/15 text-info';
      case 'experimental':
        return 'bg-warning/20 text-warning';
    }
  }
}
