import { ChangeDetectionStrategy, Component, inject, input, booleanAttribute } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { VoltSidebarService } from './sidebar.service';
import { VoltTooltip } from '../../components/tooltip';

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
        role="button"
        tabindex="-1"
        aria-label="Close sidebar"
        (click)="sidebarService.setMobileOpen(false)"
        (keydown.escape)="sidebarService.setMobileOpen(false)"
      ></div>
    }

    <aside
      class="fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out md:relative md:z-auto md:translate-x-0"
      [class]="sidebarService.isCollapsed() ? 'w-16' : 'w-72'"
      [class.translate-x-0]="sidebarService.isMobileOpen()"
      [class.-translate-x-full]="!sidebarService.isMobileOpen()"
    >
      <ng-content />
    </aside>
  `,
})
export class VoltSidebar {
  protected readonly sidebarService = inject(VoltSidebarService);
}

// ==========================================
// 2. Sidebar Header
// ==========================================
@Component({
  selector: 'volt-sidebar-header',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex h-14 items-center border-b border-border px-3"
      [class.justify-center]="sidebarService.isCollapsed()"
    >
      <ng-content />
    </div>
  `,
})
export class VoltSidebarHeader {
  protected readonly sidebarService = inject(VoltSidebarService);
}

// ==========================================
// 3. Sidebar Content
// ==========================================
@Component({
  selector: 'volt-sidebar-content',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 py-4 space-y-1 volt-scrollbar">
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
        background-color: hsl(var(--border));
        border-radius: 10px;
      }
    `,
  ],
})
export class VoltSidebarContent {
  protected readonly sidebarService = inject(VoltSidebarService);
}

// ==========================================
// 4. Sidebar Group
// ==========================================
@Component({
  selector: 'volt-sidebar-group',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4">
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
  protected readonly sidebarService = inject(VoltSidebarService);
}

// ==========================================
// 5. Sidebar Item (Link)
// ==========================================
@Component({
  selector: 'volt-sidebar-item',
  imports: [RouterLink, RouterLinkActive, VoltTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sidebarService.isCollapsed()) {
      <a
        [voltTooltip]="label()"
        placement="right"
        [routerLink]="routerLink()"
        routerLinkActive="bg-accent text-accent-foreground font-medium"
        [routerLinkActiveOptions]="{ exact: exact() }"
        class="flex h-10 w-full items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50 group relative"
        (click)="sidebarService.setMobileOpen(false)"
      >
        <ng-content select="[slot=icon]" />
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r-md transition-all group-hover:h-4 [.active_&]:h-6"
        ></div>
      </a>
    } @else {
      <a
        [routerLink]="routerLink()"
        routerLinkActive="bg-accent text-accent-foreground font-medium active"
        [routerLinkActiveOptions]="{ exact: exact() }"
        class="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50 group relative"
        (click)="sidebarService.setMobileOpen(false)"
      >
        <ng-content select="[slot=icon]" />
        <span class="flex-1 truncate">{{ label() }}</span>
        <ng-content select="[slot=trailing]" />
      </a>
    }
  `,
})
export class VoltSidebarItem {
  readonly routerLink = input.required<string>();
  readonly label = input.required<string>();
  readonly exact = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly sidebarService = inject(VoltSidebarService);
}

// ==========================================
// 6. Sidebar Footer
// ==========================================
@Component({
  selector: 'volt-sidebar-footer',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-auto border-t border-border p-3">
      <ng-content />
    </div>
  `,
})
export class VoltSidebarFooter {
  protected readonly sidebarService = inject(VoltSidebarService);
}
