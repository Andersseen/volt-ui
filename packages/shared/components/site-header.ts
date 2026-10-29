import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LmnGithubIcon } from 'lumen-icons';
import { VoltBadge, VoltNativeButton } from 'volt';
import { injectAppI18n } from '../i18n/i18n';
import { LanguageSwitcher } from './language-switcher';
import { SiteMobileMenu } from './site-mobile-menu';
import type { SiteNavLink } from './site-nav';
import { ThemeSwitcher } from './theme-switcher';

const ACTIVE = 'bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50';

/**
 * The header both sites share, so voltui.dev and Volt UI Recipes read as one family: the glowing
 * mark and gradient name, a badge beside it (the release on the docs, "Recipes" on Recipes), the
 * primary links on the right with one highlighted call-out, then GitHub, language, theme and the
 * drawer below `md`. Each app hands over its own translated, localized links.
 */
@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    LmnGithubIcon,
    VoltBadge,
    VoltNativeButton,
    LanguageSwitcher,
    SiteMobileMenu,
    ThemeSwitcher,
  ],
  template: `
    <header class="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div
        class="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-2 px-4 sm:h-16 sm:px-6 lg:px-8"
      >
        <div class="flex shrink-0 items-center gap-3">
          <a
            voltButton
            variant="ghost"
            [routerLink]="home()"
            class="h-auto gap-2 px-1.5 py-1 hover:opacity-80"
          >
            <div
              class="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            >
              <div class="absolute inset-0 bg-primary opacity-20"></div>
              <img
                src="favicon.svg"
                width="32"
                height="32"
                [alt]="t('nav.logoAlt')"
                class="relative z-10 h-full w-full object-cover"
              />
            </div>
            <!-- whitespace-nowrap: without it the words break onto separate lines as the nav grows. -->
            <span
              class="hidden whitespace-nowrap bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:inline-flex"
            >
              {{ name() }}
            </span>
          </a>
          @if (badge()) {
            <volt-badge
              variant="secondary"
              class="hidden border-none font-mono text-xs shadow-sm ring-1 ring-border/50 lg:inline-flex"
            >
              {{ badge() }}
            </volt-badge>
          }
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <nav class="hidden items-center gap-1 md:flex" [attr.aria-label]="t('nav.main')">
            @for (link of links(); track link.label) {
              @if (link.path !== undefined) {
                <a
                  voltButton
                  variant="ghost"
                  [routerLink]="link.path"
                  [routerLinkActive]="active"
                  [routerLinkActiveOptions]="{ exact: !!link.exact }"
                  ariaCurrentWhenActive="page"
                  [class]="link.highlight ? highlight : 'transition-colors'"
                >
                  {{ link.label }}
                  @if (link.badge) {
                    <volt-badge aria-hidden="true" class="px-1.5 py-0 text-[10px]">{{
                      link.badge
                    }}</volt-badge>
                  }
                </a>
              } @else {
                <a
                  voltButton
                  variant="ghost"
                  [href]="link.href"
                  [class]="link.highlight ? highlight : 'transition-colors'"
                >
                  {{ link.label }}
                  @if (link.badge) {
                    <volt-badge aria-hidden="true" class="px-1.5 py-0 text-[10px]">{{
                      link.badge
                    }}</volt-badge>
                  }
                </a>
              }
            }
          </nav>

          <a
            voltButton
            variant="outline"
            size="icon"
            [href]="github()"
            target="_blank"
            rel="noreferrer"
            [attr.aria-label]="t('nav.github')"
          >
            <lmn-github [size]="20" />
          </a>
          <app-language-switcher />
          <app-theme-switcher />
          <app-site-mobile-menu [links]="links()" />
        </div>
      </div>
    </header>
  `,
})
export class SiteHeader {
  /** Shown beside the mark: "Volt UI", "Volt UI". The badge says which site this is. */
  readonly name = input.required<string>();
  readonly badge = input<string>('');
  /** The localized root of this site. */
  readonly home = input.required<string>();
  readonly links = input.required<readonly SiteNavLink[]>();
  readonly github = input.required<string>();

  protected readonly t = injectAppI18n().t;
  protected readonly active = ACTIVE;
  protected readonly highlight =
    'gap-1.5 bg-primary/10 text-foreground hover:bg-primary hover:text-primary-foreground';
}
