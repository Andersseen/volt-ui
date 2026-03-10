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
          <h4 class="font-semibold text-lg mb-2">Components</h4>
          
          <a routerLink="/docs/button" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Button
          </a>
          <a routerLink="/docs/badge" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Badge
          </a>
          <a routerLink="/docs/input" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Input & Forms
          </a>
          <a routerLink="/docs/card" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Card
          </a>
          <a routerLink="/docs/checkbox" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Checkbox
          </a>
          <a routerLink="/docs/switch" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Switch
          </a>
          <a routerLink="/docs/avatar" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Avatar
          </a>
          <a routerLink="/docs/separator" routerLinkActive="bg-primary/10 text-primary font-medium" 
             class="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Separator
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DocsLayoutComponent {}
