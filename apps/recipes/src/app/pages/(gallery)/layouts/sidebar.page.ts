import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltAvatar,
  VoltCard,
  VoltNativeButton,
  VoltSeparator,
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarFooter,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSidebarService,
} from 'volt';
import {
  LmnAvatarIcon,
  LmnGridIcon,
  LmnHomeIcon,
  LmnMailIcon,
  LmnMenuIcon,
  LmnSearchIcon,
  LmnSettingsIcon,
} from 'lumen-icons';
import { LayoutShowcase } from '../../../components/layout-showcase';
import { layoutBySlug } from '../../../lib/layouts-metadata';
import sidebarSource from '../../../../../../../projects/volt/src/lib/layouts/sidebar/sidebar.ts?raw';
import sidebarServiceSource from '../../../../../../../projects/volt/src/lib/layouts/sidebar/sidebar.service.ts?raw';

@Component({
  selector: 'app-sidebar-demo',
  imports: [
    CommonModule,
    VoltSidebar,
    VoltSidebarContent,
    VoltSidebarFooter,
    VoltSidebarGroup,
    VoltSidebarHeader,
    VoltSidebarItem,
    VoltAvatar,
    VoltCard,
    VoltNativeButton,
    VoltSeparator,
    LmnHomeIcon,
    LmnSettingsIcon,
    LmnMailIcon,
    LmnAvatarIcon,
    LmnGridIcon,
    LmnMenuIcon,
    LmnSearchIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Since this is a demo inside the main app layout, we constrain the height and add a border to simulate a standard window -->
    <div
      class="h-[600px] border border-border rounded-lg overflow-hidden flex bg-background relative mt-6"
    >
      <!-- Trigger for Mobile Sidebar -->
      <div class="absolute top-4 left-4 z-10 md:hidden">
        <button voltButton variant="outline" size="icon" (click)="sidebarService.toggleMobile()">
          <lmn-menu />
        </button>
      </div>

      <!-- THE SIDEBAR LAYOUT -->
      <volt-sidebar>
        <volt-sidebar-header>
          <div class="flex items-center w-full justify-between gap-2 h-full">
            <div class="flex items-center gap-2 overflow-hidden">
              <div
                class="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0"
              >
                V
              </div>
              @if (!sidebarService.isCollapsed()) {
                <span class="font-semibold text-sm truncate">Volt Inc.</span>
              }
            </div>
            @if (!sidebarService.isCollapsed()) {
              <button
                voltButton
                variant="ghost"
                size="icon"
                class="h-6 w-6 shrink-0"
                (click)="sidebarService.toggleCollapse()"
              >
                <lmn-settings class="h-4 w-4 text-muted-foreground" />
              </button>
            }
          </div>
        </volt-sidebar-header>

        <volt-sidebar-content>
          <!-- Main Group -->
          <volt-sidebar-group label="Platform">
            <volt-sidebar-item routerLink="/layouts/sidebar" [exact]="true" label="Dashboard">
              <lmn-home slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item
              routerLink="/layouts/sidebar"
              [queryParams]="{ tab: 'inbox' }"
              label="Inbox"
            >
              <lmn-mail slot="icon" class="h-4 w-4" />
              <div
                slot="trailing"
                class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
              >
                3
              </div>
            </volt-sidebar-item>
            <volt-sidebar-item
              routerLink="/layouts/sidebar"
              [queryParams]="{ tab: 'components' }"
              label="Components"
            >
              <lmn-grid slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
          </volt-sidebar-group>

          <div class="px-3 my-2">
            <volt-separator />
          </div>

          <!-- Secondary Group -->
          <volt-sidebar-group label="Configuration">
            <volt-sidebar-item
              routerLink="/layouts/sidebar"
              [queryParams]="{ tab: 'profile' }"
              label="Profile"
            >
              <lmn-avatar slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item
              routerLink="/layouts/sidebar"
              [queryParams]="{ tab: 'settings' }"
              label="Settings"
            >
              <lmn-settings slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item
              routerLink="/layouts/sidebar"
              [queryParams]="{ tab: 'search' }"
              label="Search"
            >
              <lmn-search slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
          </volt-sidebar-group>
        </volt-sidebar-content>

        <volt-sidebar-footer>
          <div class="flex items-center gap-3">
            <volt-avatar
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              initials="JD"
              fallback="JD"
            />
            @if (!sidebarService.isCollapsed()) {
              <div class="flex flex-col truncate">
                <span class="text-sm font-medium">John Doe</span>
                <span class="text-xs text-muted-foreground">john.doe&#64;example.com</span>
              </div>
            }
          </div>
        </volt-sidebar-footer>
      </volt-sidebar>

      <!-- MAIN CONTENT AREA FOR DEMO -->
      <div class="flex-1 overflow-auto bg-muted/20">
        <div class="h-14 border-b border-border flex items-center px-4 md:px-6">
          <div class="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <button
              voltButton
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              (click)="sidebarService.toggleCollapse()"
            >
              <lmn-menu class="h-4 w-4" />
            </button>
            <volt-separator orientation="vertical" class="h-4 mx-2" />
            <span>Platform</span>
            <span>/</span>
            <span class="text-foreground font-medium">Dashboard</span>
          </div>
          <div class="md:hidden w-full text-center font-medium">Dashboard</div>
        </div>

        <div class="p-6">
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <volt-card class="p-6 h-32 flex items-center justify-center">
              <span class="text-muted-foreground">Widget 1</span>
            </volt-card>
            <volt-card class="p-6 h-32 flex items-center justify-center">
              <span class="text-muted-foreground">Widget 2</span>
            </volt-card>
            <volt-card class="p-6 h-32 flex items-center justify-center">
              <span class="text-muted-foreground">Widget 3</span>
            </volt-card>
          </div>
          <volt-card class="mt-4 flex min-h-[400px] items-center justify-center p-6">
            <span class="text-muted-foreground">Main Content Plot</span>
          </volt-card>
        </div>
      </div>
    </div>
  `,
})
export class SidebarDemo {
  sidebarService = inject(VoltSidebarService);
}

@Component({
  selector: 'app-layout-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, SidebarDemo],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-sidebar-demo />
    </app-layout-showcase>
  `,
})
export default class LayoutSidebarPage {
  protected readonly layout = layoutBySlug('sidebar');
  /** The sidebar is a library layout component: the copyable source is the library's own two files. */
  protected readonly code = `// sidebar.ts\n${sidebarSource}\n// sidebar.service.ts\n${sidebarServiceSource}`;
}
