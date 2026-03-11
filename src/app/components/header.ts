import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VoltBadge } from 'volt';
import { ThemeSwitcher } from './theme-switcher';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, VoltBadge, ThemeSwitcher],
  template: `
    <header class="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(var(--color-primary),0.5)]">
              <div class="absolute inset-0 bg-primary opacity-20"></div>
              <img src="favicon.svg" alt="Volt UI Logo" class="w-full h-full object-cover relative z-10" />
            </div>
            <span class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 hidden sm:inline-flex">
              Volt UI
            </span>
          </a>
          <volt-badge variant="secondary" class="font-mono text-xs hidden md:inline-flex border-none shadow-sm ring-1 ring-border/50">
            v0.0.1
          </volt-badge>
        </div>
        
        <div class="flex items-center gap-4">
          <nav class="hidden md:flex gap-6 text-sm font-medium text-muted-foreground mr-4">
            <a routerLink="/" routerLinkActive="text-foreground" [routerLinkActiveOptions]="{ exact: true }" class="transition-colors hover:text-foreground">
              Home
            </a>
            <a routerLink="/docs" routerLinkActive="text-foreground" class="transition-colors hover:text-foreground">
              Components
            </a>
            <a href="https://github.com/volt-ui" target="_blank" rel="noreferrer" class="transition-colors hover:text-foreground">
              GitHub
            </a>
          </nav>

          <app-theme-switcher />
        </div>
      </div>
    </header>
  `,
})
export class Header {}
