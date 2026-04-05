import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { VoltBadge } from 'volt';
import { ThemeSwitcher } from './theme-switcher';
import { MobileMenu } from './mobile-menu';
import { IconGithub } from '../icons';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    RouterLink,
    RouterLinkActive,
    VoltBadge,
    ThemeSwitcher,
    MobileMenu,
    IconGithub,
  ],
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
          <!-- Navigation -->
          <nav class="hidden md:flex gap-1 text-sm font-medium text-muted-foreground mr-1">
            <a
              routerLink="/"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-3 py-2 rounded-md transition-colors hover:text-foreground"
            >
              Home
            </a>
            <a
              routerLink="/docs/introduction"
              routerLinkActive="text-foreground"
              class="px-3 py-2 rounded-md transition-colors hover:text-foreground"
            >
              Docs
            </a>
            <a
              routerLink="/docs/components"
              routerLinkActive="text-foreground"
              class="px-3 py-2 rounded-md transition-colors hover:text-foreground"
            >
              Components
            </a>
          </nav>

          <a
            href="https://github.com/andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            aria-label="GitHub repository"
          >
            <icon-github class="w-[18px] h-[18px]" />
          </a>

          <app-theme-switcher />

          <!-- Mobile Menu -->
          <app-mobile-menu />
        </div>
      </div>
    </header>
  `,
})
export class Header {}
