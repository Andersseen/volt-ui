import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IconButton,
  IconInput,
  IconCheckbox,
  IconSwitch,
  IconRadio,
  IconSelect,
  IconToggle,
  IconCard,
  IconSeparator,
  IconNavigation,
  IconTabs,
  IconAccordion,
  IconAvatar,
  IconBadge,
  IconTooltip,
} from '../../icons';

@Component({
  selector: 'app-components-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconButton,
    IconInput,
    IconCheckbox,
    IconSwitch,
    IconRadio,
    IconSelect,
    IconToggle,
    IconCard,
    IconSeparator,
    IconNavigation,
    IconTabs,
    IconAccordion,
    IconAvatar,
    IconBadge,
    IconTooltip,
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Components</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A collection of reusable, accessible components built with Angular and Tailwind CSS. Each
          component includes source code that you can copy and customize.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Installation Note -->
      <div class="p-4 rounded-lg border border-border bg-muted/30">
        <p class="text-sm">
          <span class="font-medium">Quick install:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded mx-1">npx volt add [component]</code>
          or browse below to copy source code.
          <a routerLink="/docs/introduction" class="text-primary hover:underline ml-1"
            >Learn more →</a
          >
        </p>
      </div>

      <!-- Components Grid -->
      <div class="space-y-6">
        <!-- Form Components -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Form Components</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              routerLink="/docs/components/button"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-button class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Button</h3>
                  <p class="text-xs text-muted-foreground">Interactive button with variants</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/input"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-input class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Input</h3>
                  <p class="text-xs text-muted-foreground">Text input fields</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/checkbox"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-checkbox class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Checkbox</h3>
                  <p class="text-xs text-muted-foreground">Toggle checkboxes</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/switch"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-switch class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Switch</h3>
                  <p class="text-xs text-muted-foreground">Toggle switches</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/radio"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-radio class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Radio Group</h3>
                  <p class="text-xs text-muted-foreground">Single-select options</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/select"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-select class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Select</h3>
                  <p class="text-xs text-muted-foreground">Dropdown selection</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/toggle"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-toggle class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Toggle Button</h3>
                  <p class="text-xs text-muted-foreground">Press toggle buttons</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Layout Components -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Layout</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              routerLink="/docs/components/card"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-card class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Card</h3>
                  <p class="text-xs text-muted-foreground">Content containers</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/separator"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-separator class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Separator</h3>
                  <p class="text-xs text-muted-foreground">Visual dividers</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Navigation</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              routerLink="/docs/components/navigation-menu"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-navigation class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Navigation Menu</h3>
                  <p class="text-xs text-muted-foreground">Navbar with dropdowns</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/tabs"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-tabs class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Tabs</h3>
                  <p class="text-xs text-muted-foreground">Tabbed interface</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/accordion"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-accordion class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Accordion</h3>
                  <p class="text-xs text-muted-foreground">Collapsible sections</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/dialog"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-card class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Dialog</h3>
                  <p class="text-xs text-muted-foreground">Modal dialogs & drawers</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Display -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Display</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              routerLink="/docs/components/avatar"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-avatar class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Avatar</h3>
                  <p class="text-xs text-muted-foreground">User profile images</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/badge"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-badge class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Badge</h3>
                  <p class="text-xs text-muted-foreground">Status indicators</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/components/tooltip"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <icon-tooltip class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Tooltip</h3>
                  <p class="text-xs text-muted-foreground">Hover information</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class ComponentsIndexPage {}
