import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 items-start">
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 flex-shrink-0 sticky top-24">
        <nav class="flex flex-col space-y-2">
          <h4 class="font-medium text-sm mt-2 text-foreground">Getting Started</h4>
          <ul class="space-y-1 mt-2 border-l border-border/50 ml-2 pl-4">
            <li>
              <a routerLink="installation" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Installation
              </a>
            </li>
          </ul>

          <h4 class="font-medium text-sm mt-8 text-foreground">Components</h4>
          <ul class="space-y-1 mt-2 border-l border-border/50 ml-2 pl-4">
            <li>
              <a routerLink="accordion" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Accordion
              </a>
            </li>
            <li>
              <a routerLink="tabs" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Tabs
              </a>
            </li>
            <li>
              <a routerLink="button" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Button
              </a>
            </li>
            <li>
              <a routerLink="badge" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Badge
              </a>
            </li>
            <li>
              <a routerLink="input" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Input & Forms
              </a>
            </li>
            <li>
              <a routerLink="card" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Card
              </a>
            </li>
            <li>
              <a routerLink="checkbox" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Checkbox
              </a>
            </li>
            <li>
              <a routerLink="switch" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Switch
              </a>
            </li>
            <li>
              <a routerLink="avatar" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Avatar
              </a>
            </li>
            <li>
              <a routerLink="select" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Select
              </a>
            </li>
            <li>
              <a routerLink="separator" routerLinkActive="font-medium text-foreground" class="block py-1 text-sm text-muted-foreground hover:text-foreground">
                Separator
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DocsLayout {}
