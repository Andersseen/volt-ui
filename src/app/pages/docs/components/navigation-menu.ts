import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltNavigationMenu,
  VoltNavigationMenuList,
  VoltNavigationMenuItem,
  VoltNavigationMenuTrigger,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
  VoltNavigationMenuLink,
} from 'volt';

@Component({
  selector: 'app-navigation-menu-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuList,
    VoltNavigationMenuItem,
    VoltNavigationMenuTrigger,
    VoltNavigationMenuContent,
    VoltNavigationMenuContentItem,
    VoltNavigationMenuLink,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Navigation Menu</h1>
        <p class="text-base text-muted-foreground mt-2">
          A collection of links for navigating websites, with support for dropdown menus.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">Example</h2>
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center min-h-[400px]"
        >
          <volt-navigation-menu>
            <volt-navigation-menu-list>
              <!-- Getting Started Dropdown -->
              <volt-navigation-menu-item>
                <volt-navigation-menu-trigger [content]="gettingStartedTpl">
                  Getting Started
                </volt-navigation-menu-trigger>
                <ng-template #gettingStartedTpl>
                  <volt-navigation-menu-content class="w-[500px]">
                    <div class="grid gap-3 p-2">
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Introduction</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Learn about the basics of Volt UI and how to get started.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Installation</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Step-by-step guide to install Volt UI in your project.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Theming</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Customize the look and feel with themes and colors.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Dark Mode</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Enable and configure dark mode for your application.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                    </div>
                  </volt-navigation-menu-content>
                </ng-template>
              </volt-navigation-menu-item>

              <!-- Components Dropdown -->
              <volt-navigation-menu-item>
                <volt-navigation-menu-trigger [content]="componentsTpl">
                  Components
                </volt-navigation-menu-trigger>
                <ng-template #componentsTpl>
                  <volt-navigation-menu-content class="w-[500px]">
                    <div class="grid grid-cols-2 gap-3 p-2">
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Form Controls</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Inputs, checkboxes, switches, and more.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Display</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Cards, badges, avatars, and separators.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Navigation</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Tabs, navigation menus, and tooltips.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Overlays</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Dialogs, dropdowns, and popovers.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                    </div>
                  </volt-navigation-menu-content>
                </ng-template>
              </volt-navigation-menu-item>

              <!-- Resources Dropdown -->
              <volt-navigation-menu-item>
                <volt-navigation-menu-trigger [content]="resourcesTpl">
                  Resources
                </volt-navigation-menu-trigger>
                <ng-template #resourcesTpl>
                  <volt-navigation-menu-content class="w-[400px]">
                    <div class="grid gap-3 p-2">
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Documentation</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Comprehensive API reference and guides.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">GitHub</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Source code and issue tracking.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                      <volt-navigation-menu-content-item>
                        <a href="#" class="block">
                          <div class="text-sm font-medium text-foreground">Community</div>
                          <p class="text-xs text-muted-foreground mt-1">
                            Join our Discord and get help from the community.
                          </p>
                        </a>
                      </volt-navigation-menu-content-item>
                    </div>
                  </volt-navigation-menu-content>
                </ng-template>
              </volt-navigation-menu-item>

              <!-- Direct Link -->
              <volt-navigation-menu-item>
                <volt-navigation-menu-link href="#">About</volt-navigation-menu-link>
              </volt-navigation-menu-item>
            </volt-navigation-menu-list>
          </volt-navigation-menu>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">Features</h2>
        <ul class="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Keyboard navigation with Arrow keys and Escape</li>
          <li>Accessible with proper ARIA attributes</li>
          <li>Smooth animations and transitions</li>
          <li>Flexible content layouts (single column, multi-column)</li>
          <li>Support for direct links and dropdown menus</li>
        </ul>
      </div>
    </div>
  `,
})
export class NavigationMenuDemo {}
