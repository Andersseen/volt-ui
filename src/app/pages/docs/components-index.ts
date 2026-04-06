import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-components-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
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
              routerLink="/docs/button"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="16" height="10" x="4" y="7" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Button</h3>
                  <p class="text-xs text-muted-foreground">Interactive button with variants</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/input"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="20" height="12" x="2" y="6" rx="2" />
                    <path d="M6 10h.01M6 14h.01" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Input</h3>
                  <p class="text-xs text-muted-foreground">Text input fields</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/checkbox"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Checkbox</h3>
                  <p class="text-xs text-muted-foreground">Toggle checkboxes</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/switch"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Switch</h3>
                  <p class="text-xs text-muted-foreground">Toggle switches</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/radio"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Radio Group</h3>
                  <p class="text-xs text-muted-foreground">Single-select options</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/select"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Select</h3>
                  <p class="text-xs text-muted-foreground">Dropdown selection</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/toggle"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M19 4h-9M14 20H5M15 4 9 20" />
                  </svg>
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
              routerLink="/docs/card"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="18" height="14" x="3" y="5" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Card</h3>
                  <p class="text-xs text-muted-foreground">Content containers</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/separator"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14" />
                  </svg>
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
              routerLink="/docs/navigation-menu"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Navigation Menu</h3>
                  <p class="text-xs text-muted-foreground">Navbar with dropdowns</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/tabs"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 3v18" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Tabs</h3>
                  <p class="text-xs text-muted-foreground">Tabbed interface</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/accordion"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Accordion</h3>
                  <p class="text-xs text-muted-foreground">Collapsible sections</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/dialog"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
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
              routerLink="/docs/avatar"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Avatar</h3>
                  <p class="text-xs text-muted-foreground">User profile images</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/badge"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="18" height="12" x="3" y="6" rx="6" ry="6" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-primary">Badge</h3>
                  <p class="text-xs text-muted-foreground">Status indicators</p>
                </div>
              </div>
            </a>

            <a
              routerLink="/docs/tooltip"
              class="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
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
