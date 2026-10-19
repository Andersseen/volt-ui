import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { VoltBadge, VoltNativeButton } from 'volt';
import { ThemeSwitcher } from './theme-switcher';
import { MobileMenu } from './mobile-menu';
import { LmnGithubIcon } from 'lumen-icons';
import { LanguageSwitcher } from './language-switcher';
import { injectAppI18n } from '../i18n/i18n';
import { GALLERY_SECTIONS } from '../lib/gallery-sections';
import { SITE_STATS } from '../lib/generated/site-stats';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    VoltBadge,
    VoltNativeButton,
    ThemeSwitcher,
    MobileMenu,
    LanguageSwitcher,
    LmnGithubIcon,
  ],
  template: `
    <header class="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <div
        class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-3 shrink-0">
          <a
            voltButton
            variant="ghost"
            [routerLink]="path('/')"
            class="h-auto gap-2 px-1.5 py-1 hover:opacity-80"
          >
            <div
              class="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
            >
              <div class="absolute inset-0 bg-primary opacity-20"></div>
              <img
                src="favicon.svg"
                width="32"
                height="32"
                [alt]="t('nav.logoAlt')"
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
            v{{ version }}
          </volt-badge>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- These are ordinary route links, so keep native navigation semantics. -->
          <nav class="hidden items-center gap-1 md:flex" [attr.aria-label]="t('nav.main')">
            <a
              voltButton
              variant="ghost"
              [routerLink]="path('/')"
              routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
              class="transition-colors"
            >
              {{ t('nav.home') }}
            </a>
            <a
              voltButton
              variant="ghost"
              [routerLink]="path('/docs/introduction')"
              routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
              ariaCurrentWhenActive="page"
              class="transition-colors"
            >
              {{ t('nav.docs') }}
            </a>
            <a
              voltButton
              variant="ghost"
              [routerLink]="path('/docs/components')"
              routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
              ariaCurrentWhenActive="page"
              class="transition-colors"
            >
              {{ t('nav.components') }}
            </a>
            <!-- One entry for both gallery sections; RouterLinkActive only knows a single path. -->
            <a
              voltButton
              variant="ghost"
              [routerLink]="path(galleryPath)"
              [class]="
                inGallery()
                  ? 'bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50'
                  : ''
              "
              [attr.aria-current]="inGallery() ? 'page' : null"
              class="transition-colors"
            >
              {{ t('nav.gallery') }}
            </a>
            <a
              voltButton
              variant="ghost"
              [routerLink]="path('/create-theme')"
              routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
              ariaCurrentWhenActive="page"
              class="gap-1.5 bg-primary/10 text-foreground hover:bg-primary hover:text-primary-foreground"
            >
              {{ t('nav.createTheme') }}
              <volt-badge aria-hidden="true" class="px-1.5 py-0 text-[10px]">{{
                t('nav.new')
              }}</volt-badge>
            </a>
          </nav>

          <a
            voltButton
            variant="outline"
            size="icon"
            href="https://github.com/andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            [attr.aria-label]="t('nav.github')"
          >
            <lmn-github [size]="20" />
          </a>

          <app-language-switcher />

          <app-theme-switcher />

          <app-mobile-menu />
        </div>
      </div>
    </header>
  `,
})
export class Header {
  private readonly router = inject(Router);
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  /** Keeps every link in the locale the visitor is already reading. */
  protected readonly path = this.translations.path;

  /** Generated from projects/volt/package.json, so the badge cannot outlive a release. */
  protected readonly version = SITE_STATS.version;

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
