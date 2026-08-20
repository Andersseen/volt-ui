import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { VoltBadge } from 'volt';
import { ThemeSwitcher } from './theme-switcher';
import { MobileMenu } from './mobile-menu';
import { LmnGithubIcon } from 'lumen-icons';
import { GALLERY_SECTIONS } from '../lib/gallery-sections';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, VoltBadge, ThemeSwitcher, MobileMenu, LmnGithubIcon],
  template: `
    <header class="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-3 shrink-0">
          <a routerLink="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div
              class="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
            >
              <div class="absolute inset-0 bg-primary opacity-20"></div>
              <img
                src="favicon.svg"
                alt="Volt UI Logo"
                class="w-full h-full object-cover relative z-10"
              />
            </div>
            <!-- whitespace-nowrap: without it the two words break onto separate lines as
                 soon as the nav grows, which is what makes the bar look crooked rather
                 than merely full. -->
            <span
              class="hidden whitespace-nowrap bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:inline-flex"
            >
              Volt UI
            </span>
          </a>
          <volt-badge
            variant="secondary"
            class="font-mono text-xs hidden lg:inline-flex border-none shadow-sm ring-1 ring-border/50"
          >
            v1.0.0
          </volt-badge>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <nav
            class="hidden md:flex gap-0.5 text-sm font-medium text-muted-foreground"
            aria-label="Main"
          >
            <a
              routerLink="/"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
              class="whitespace-nowrap rounded-md px-2.5 py-2 transition-colors hover:text-foreground lg:px-3"
            >
              Home
            </a>
            <a
              routerLink="/docs/introduction"
              routerLinkActive="text-foreground"
              class="whitespace-nowrap rounded-md px-2.5 py-2 transition-colors hover:text-foreground lg:px-3"
            >
              Docs
            </a>
            <a
              routerLink="/docs/components"
              routerLinkActive="text-foreground"
              class="whitespace-nowrap rounded-md px-2.5 py-2 transition-colors hover:text-foreground lg:px-3"
            >
              Components
            </a>
            <!-- One entry for both halves of the gallery, so the active state has to be
                 computed: routerLinkActive only knows about this link's own path, and the
                 tab underneath it may be the layouts one. -->
            <a
              [routerLink]="galleryPath"
              class="whitespace-nowrap rounded-md px-2.5 py-2 transition-colors hover:text-foreground lg:px-3"
              [class.text-foreground]="inGallery()"
            >
              Gallery
            </a>
            <a
              routerLink="/create-theme"
              routerLinkActive="text-foreground"
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary/10 px-2.5 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground lg:px-3"
            >
              Create Theme
              <span
                aria-hidden="true"
                class="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase leading-none text-primary-foreground"
              >
                New
              </span>
            </a>
          </nav>

          <a
            href="https://github.com/andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            aria-label="GitHub repository"
          >
            <lmn-github [size]="20" />
          </a>

          <app-theme-switcher />

          <app-mobile-menu />
        </div>
      </div>
    </header>
  `,
})
export class Header {
  private readonly router = inject(Router);

  /** The gallery opens on its first tab; the other one is a tab away. */
  protected readonly galleryPath = GALLERY_SECTIONS[0].path;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly inGallery = computed(() =>
    GALLERY_SECTIONS.some(section => this.url().startsWith(section.path))
  );
}
