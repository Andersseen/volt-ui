import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltAvatar,
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
  IconAvatar,
  IconComponents,
  IconHome,
  IconMail,
  IconMenu,
  IconSearch,
  IconSettings,
} from '../../../../icons';

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
    VoltSeparator,
    IconHome,
    IconSettings,
    IconMail,
    IconAvatar,
    IconComponents,
    IconMenu,
    IconSearch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Since this is a demo inside the main app layout, we constrain the height and add a border to simulate a standard window -->
    <div
      class="h-[600px] border border-border rounded-lg overflow-hidden flex bg-background relative mt-6"
    >
      <!-- Trigger for Mobile Sidebar -->
      <div class="absolute top-4 left-4 z-10 md:hidden">
        <button volt-button variant="outline" size="icon" (click)="sidebarService.toggleMobile()">
          <icon-menu />
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
                volt-button
                variant="ghost"
                size="icon"
                class="h-6 w-6 shrink-0"
                (click)="sidebarService.toggleCollapse()"
              >
                <icon-settings class="h-4 w-4 text-muted-foreground" />
              </button>
            }
          </div>
        </volt-sidebar-header>

        <volt-sidebar-content>
          <!-- Main Group -->
          <volt-sidebar-group label="Platform">
            <volt-sidebar-item routerLink="/docs/layouts/sidebar" [exact]="true" label="Dashboard">
              <icon-home slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/sidebar" label="Inbox">
              <icon-mail slot="icon" class="h-4 w-4" />
              <div
                slot="trailing"
                class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
              >
                3
              </div>
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/sidebar" label="Components">
              <icon-components slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
          </volt-sidebar-group>

          <div class="px-3 my-2">
            <volt-separator />
          </div>

          <!-- Secondary Group -->
          <volt-sidebar-group label="Configuration">
            <volt-sidebar-item routerLink="/docs/layouts/sidebar" label="Profile">
              <icon-avatar slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/sidebar" label="Settings">
              <icon-settings slot="icon" class="h-4 w-4" />
            </volt-sidebar-item>
            <volt-sidebar-item routerLink="/docs/layouts/sidebar" label="Search">
              <icon-search slot="icon" class="h-4 w-4" />
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
              volt-button
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              (click)="sidebarService.toggleCollapse()"
            >
              <icon-menu class="h-4 w-4" />
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
            <div
              class="rounded-xl border border-border bg-card text-card-foreground shadow p-6 h-32 flex items-center justify-center"
            >
              <span class="text-muted-foreground">Widget 1</span>
            </div>
            <div
              class="rounded-xl border border-border bg-card text-card-foreground shadow p-6 h-32 flex items-center justify-center"
            >
              <span class="text-muted-foreground">Widget 2</span>
            </div>
            <div
              class="rounded-xl border border-border bg-card text-card-foreground shadow p-6 h-32 flex items-center justify-center"
            >
              <span class="text-muted-foreground">Widget 3</span>
            </div>
          </div>
          <div
            class="mt-4 rounded-xl border border-border bg-card text-card-foreground shadow p-6 min-h-[400px] flex items-center justify-center"
          >
            <span class="text-muted-foreground">Main Content Plot</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SidebarDemo {
  sidebarService = inject(VoltSidebarService);
}

@Component({
  selector: 'app-docs-sidebar',
  imports: [SidebarDemo],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Sidebar Layout</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A composable, responsive sidebar layout that you can copy and paste into your apps.
      </p>

      <app-sidebar-demo />

      <!-- Installation / Code Instructions -->
      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Installation</h2>
        <p class="text-muted-foreground text-sm">
          Para utilizar este Layout, copia el código que creamos en
          <code>src/app/layout/sidebar/</code>. Este bloque incluye un servicio ligero con signals
          para manejar el estado responsivo.
        </p>
      </div>
    </div>
  `,
})
export default class DocsSidebar {}
