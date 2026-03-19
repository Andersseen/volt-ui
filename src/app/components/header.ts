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
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-4">
          <a routerLink="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
            >
              <div class="absolute inset-0 bg-primary opacity-20"></div>
              <img
                src="favicon.svg"
                alt="Volt UI Logo"
                class="w-full h-full object-cover relative z-10"
              />
            </div>
            <span
              class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 hidden sm:inline-flex"
            >
              Volt UI
            </span>
          </a>
          <volt-badge
            variant="secondary"
            class="font-mono text-xs hidden md:inline-flex border-none shadow-sm ring-1 ring-border/50"
          >
            v0.0.1
          </volt-badge>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <nav class="hidden md:flex gap-4 text-sm font-medium text-muted-foreground mr-1">
            <a
              routerLink="/"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
              class="transition-colors hover:text-foreground"
            >
              Home
            </a>
            <a
              routerLink="/docs"
              routerLinkActive="text-foreground"
              class="transition-colors hover:text-foreground"
            >
              Components
            </a>
          </nav>

          <a
            href="https://github.com/Andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.88c.85 0 1.7.12 2.5.36 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.07.36.33.68.98.68 1.98 0 1.43-.01 2.58-.01 2.93 0 .27.18.59.69.48A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
              />
            </svg>
          </a>

          <app-theme-switcher />
        </div>
      </div>
    </header>
  `,
})
export class Header {}
