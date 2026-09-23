import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  booleanAttribute,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { VoltSidebarService } from './sidebar.service';
import { VoltTooltip } from '../../components/tooltip';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/** Expanded width when nothing overrides it — the value Tailwind's `w-72` resolves to. */
const DEFAULT_SIDEBAR_WIDTH = 'calc(var(--spacing, 0.25rem) * 72)';

/** Collapsed width when nothing overrides it — the value Tailwind's `w-16` resolves to. */
const DEFAULT_SIDEBAR_COLLAPSED_WIDTH = 'calc(var(--spacing, 0.25rem) * 16)';

// ==========================================
// 1. Sidebar Container
// ==========================================
@Component({
  selector: 'volt-sidebar',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sidebarService.isMobileOpen()) {
      <div
        class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden"
        aria-hidden="true"
        aria-label="Close sidebar"
        (click)="sidebarService.setMobileOpen(false)"
      ></div>
    }

    <aside
      [class]="classes()"
      [style.width]="resolvedWidth()"
      [class.translate-x-0]="sidebarService.isMobileOpen()"
      [class.-translate-x-full]="!sidebarService.isMobileOpen()"
      [attr.role]="sidebarService.isMobileOpen() ? 'dialog' : null"
      [attr.aria-modal]="sidebarService.isMobileOpen() ? 'true' : null"
    >
      <ng-content />
    </aside>
  `,
})
export class VoltSidebar {
  /**
   * Width of the expanded sidebar as any CSS length (`'20rem'`, `'280px'`, `'25vw'`).
   * Falls back to the `--volt-sidebar-width` custom property, then to `18rem`.
   */
  readonly width = input<string>();

  /**
   * Width of the collapsed sidebar as any CSS length.
   * Falls back to the `--volt-sidebar-collapsed-width` custom property, then to `4rem`.
   */
  readonly collapsedWidth = input<string>();

  /** Classes for the `<aside>`, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  protected readonly sidebarService = inject(VoltSidebarService);

  protected readonly classes = computed(() =>
    cn(
      'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out md:relative md:z-auto md:translate-x-0',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }

  /** Input wins, then the custom property, then the historical Tailwind width. */
  protected readonly resolvedWidth = computed(() =>
    this.sidebarService.isCollapsed()
      ? (this.collapsedWidth() ??
        `var(--volt-sidebar-collapsed-width, ${DEFAULT_SIDEBAR_COLLAPSED_WIDTH})`)
      : (this.width() ?? `var(--volt-sidebar-width, ${DEFAULT_SIDEBAR_WIDTH})`)
  );

  @HostListener('document:keydown.escape')
  protected closeMobileSidebar(): void {
    if (this.sidebarService.isMobileOpen()) {
      this.sidebarService.setMobileOpen(false);
    }
  }
}

// ==========================================
// 2. Sidebar Header
// ==========================================
@Component({
  selector: 'volt-sidebar-header',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()" [class.justify-center]="sidebarService.isCollapsed()">
      <ng-content />
    </div>
  `,
})
export class VoltSidebarHeader {
  readonly class = input<string>('');

  protected readonly sidebarService = inject(VoltSidebarService);

  protected readonly classes = computed(() =>
    cn('flex h-14 items-center border-b border-border px-3', this.class())
  );

  constructor() {
    forwardClassFromHost();
  }
}

// ==========================================
// 3. Sidebar Content
// ==========================================
@Component({
  selector: 'volt-sidebar-content',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
  styles: [
    `
      .volt-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .volt-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .volt-scrollbar::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-thumb);
        border-radius: 10px;
      }
    `,
  ],
})
export class VoltSidebarContent {
  readonly class = input<string>('');

  protected readonly sidebarService = inject(VoltSidebarService);

  protected readonly classes = computed(() =>
    cn('flex-1 overflow-y-auto overflow-x-hidden p-3 py-4 space-y-1 volt-scrollbar', this.class())
  );

  constructor() {
    forwardClassFromHost();
  }
}

// ==========================================
// 4. Sidebar Group
// ==========================================
@Component({
  selector: 'volt-sidebar-group',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()">
      @if (!sidebarService.isCollapsed() && label()) {
        <h4 class="mb-2 px-3 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
          {{ label() }}
        </h4>
      }
      <div class="space-y-1">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltSidebarGroup {
  readonly label = input<string>();
  readonly class = input<string>('');
  protected readonly sidebarService = inject(VoltSidebarService);

  protected readonly classes = computed(() => cn('mb-4', this.class()));

  constructor() {
    forwardClassFromHost();
  }
}

// ==========================================
// 5. Sidebar Item (Link)
// ==========================================
@Component({
  selector: 'volt-sidebar-item',
  imports: [RouterLink, RouterLinkActive, VoltTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      A single anchor renders both modes on purpose. Angular assigns projected nodes to a
      slot at compile time, so duplicating <ng-content select="[slot=icon]"> across two
      branches binds the icon to whichever branch is declared first and leaves the other
      one empty. One anchor => one slot per name, and the routing bindings stay in sync.
    -->
    <a
      [voltTooltip]="label()"
      placement="right"
      [disabled]="!sidebarService.isCollapsed()"
      [routerLink]="routerLink()"
      [queryParams]="queryParams()"
      routerLinkActive="bg-accent text-accent-foreground font-medium active"
      [routerLinkActiveOptions]="{ exact: exact() }"
      [class]="classes()"
      [class.justify-center]="sidebarService.isCollapsed()"
      [class.gap-3]="!sidebarService.isCollapsed()"
      [class.px-3]="!sidebarService.isCollapsed()"
      [class.text-sm]="!sidebarService.isCollapsed()"
      (click)="sidebarService.setMobileOpen(false)"
    >
      <ng-content select="[slot=icon]" />

      @if (sidebarService.isCollapsed()) {
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r-md transition-all group-hover:h-4 [.active_&]:h-6"
        ></div>
      } @else {
        <span class="flex-1 truncate">{{ label() }}</span>
        <ng-content select="[slot=trailing]" />
      }
    </a>
  `,
})
export class VoltSidebarItem {
  readonly routerLink = input.required<string>();
  readonly queryParams = input<Record<string, string> | undefined>(undefined);
  readonly label = input.required<string>();
  readonly exact = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Classes for the link, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  protected readonly sidebarService = inject(VoltSidebarService);

  protected readonly classes = computed(() =>
    cn(
      'flex h-10 w-full items-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50 group relative',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }
}

// ==========================================
// 6. Sidebar Footer
// ==========================================
@Component({
  selector: 'volt-sidebar-footer',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class VoltSidebarFooter {
  readonly class = input<string>('');

  protected readonly sidebarService = inject(VoltSidebarService);

  protected readonly classes = computed(() =>
    cn('mt-auto border-t border-border p-3', this.class())
  );

  constructor() {
    forwardClassFromHost();
  }
}
