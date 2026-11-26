import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LmnAvatarIcon,
  LmnGridIcon,
  LmnHomeIcon,
  LmnMailIcon,
  LmnMenuIcon,
  LmnSearchIcon,
  LmnSettingsIcon,
} from 'lumen-icons';
import {
  VoltAvatar,
  VoltBadge,
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

/**
 * Sidebar shell: a collapsible navigation rail beside the page content, built from the public
 * `volt-sidebar` layout. The items link to the current route with a `tab` query parameter so the
 * shell works wherever it is pasted; point `routerLink` at your own routes.
 *
 * `VoltSidebarService` (provided in root) owns collapsed and mobile-open state; the application
 * owns the routes, the user and what the content area shows.
 */
@Component({
  selector: 'app-sidebar-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltSidebar,
    VoltSidebarContent,
    VoltSidebarFooter,
    VoltSidebarGroup,
    VoltSidebarHeader,
    VoltSidebarItem,
    VoltAvatar,
    VoltBadge,
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
  template: `
    <!-- A fixed-height frame so the shell can be previewed inside a page; in an application the
         sidebar fills the viewport (drop the height and border). -->
    <div
      class="h-[600px] border border-border rounded-lg overflow-hidden flex bg-background relative mt-6"
    >
      <!-- Trigger for Mobile Sidebar -->
      <div class="absolute top-4 left-4 z-10 md:hidden">
        <button
          voltButton
          variant="outline"
          size="icon"
          aria-label="Open navigation"
          (click)="sidebarService.toggleMobile()"
        >
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
                aria-label="Collapse sidebar"
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
            <volt-sidebar-item routerLink="." [exact]="true" label="Dashboard">
              <lmn-home slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="." [queryParams]="{ tab: 'inbox' }" label="Inbox">
              <lmn-mail slot="icon" class="h-4 w-4" />
              <volt-badge slot="trailing" class="ml-auto px-1.5">3</volt-badge>
            </volt-sidebar-item>
            <volt-sidebar-item
              routerLink="."
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
            <volt-sidebar-item routerLink="." [queryParams]="{ tab: 'profile' }" label="Profile">
              <lmn-avatar slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="." [queryParams]="{ tab: 'settings' }" label="Settings">
              <lmn-settings slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="." [queryParams]="{ tab: 'search' }" label="Search">
              <lmn-search slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
          </volt-sidebar-group>
        </volt-sidebar-content>

        <volt-sidebar-footer>
          <div class="flex items-center gap-3">
            <volt-avatar initials="JD" fallback="JD" />
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
              [attr.aria-label]="
                sidebarService.isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'
              "
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
          <h1 class="mb-4 text-2xl font-semibold tracking-tight">Dashboard</h1>
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
export class SidebarLayout {
  protected readonly sidebarService = inject(VoltSidebarService);
}
