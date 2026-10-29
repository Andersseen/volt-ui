import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LmnGithubIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';
import { LanguageSwitcher } from '@shared/components/language-switcher';
import { ThemeSwitcher } from '@shared/components/theme-switcher';
import { injectAppI18n } from '@shared/i18n/i18n';
import { CATALOG_KINDS, listingPath } from '../lib/catalog';
import { docsUrl, GITHUB_URL, SITE_NAME } from '../lib/site';

/**
 * Brand, the three catalog sections, and the way back to the parent product.
 *
 * Below `md` the sections drop to their own scrollable row under the bar rather than a drawer:
 * there are only three, and a row keeps every destination one tap away with no state to manage.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    VoltNativeButton,
    LmnGithubIcon,
    LanguageSwitcher,
    ThemeSwitcher,
  ],
  template: `
    <header class="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div
        class="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-2 px-4 sm:h-16 sm:px-6 lg:px-8"
      >
        <a
          voltButton
          variant="ghost"
          [routerLink]="path('/')"
          class="h-auto gap-2 px-1.5 py-1 hover:opacity-80"
        >
          <img src="favicon.svg" width="32" height="32" alt="" class="h-8 w-8 rounded-lg" />
          <span class="whitespace-nowrap font-semibold tracking-tight">{{ siteName }}</span>
        </a>

        <nav class="hidden items-center gap-1 md:flex" [attr.aria-label]="t('nav.main')">
          @for (section of sections; track section.kind) {
            <a
              voltButton
              variant="ghost"
              [routerLink]="path(section.path)"
              routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
              ariaCurrentWhenActive="page"
              class="transition-colors"
            >
              {{ label(section.kind) }}
            </a>
          }
          <a
            voltButton
            variant="ghost"
            [routerLink]="path('/docs')"
            routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
            ariaCurrentWhenActive="page"
            class="transition-colors"
          >
            {{ t('nav.docs') }}
          </a>
          <a voltButton variant="ghost" [href]="componentsHref()" class="transition-colors">
            {{ t('nav.components') }}
          </a>
        </nav>

        <div class="flex items-center gap-2">
          <a
            voltButton
            variant="outline"
            size="icon"
            [href]="github"
            target="_blank"
            rel="noreferrer"
            [attr.aria-label]="t('nav.github')"
          >
            <lmn-github [size]="20" />
          </a>
          <app-language-switcher />
          <app-theme-switcher />
        </div>
      </div>

      <nav
        class="flex gap-1 overflow-x-auto border-t border-border/40 px-4 py-1.5 md:hidden"
        [attr.aria-label]="t('nav.main')"
      >
        @for (section of sections; track section.kind) {
          <a
            voltButton
            variant="ghost"
            size="sm"
            [routerLink]="path(section.path)"
            routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
            ariaCurrentWhenActive="page"
          >
            {{ label(section.kind) }}
          </a>
        }
        <a
          voltButton
          variant="ghost"
          size="sm"
          [routerLink]="path('/docs')"
          routerLinkActive="bg-accent text-accent-foreground ring-1 ring-inset ring-primary/50"
          ariaCurrentWhenActive="page"
          >{{ t('nav.docs') }}</a
        >
        <a voltButton variant="ghost" size="sm" [href]="componentsHref()">{{
          t('nav.components')
        }}</a>
      </nav>
    </header>
  `,
})
export class Header {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly siteName = SITE_NAME;
  protected readonly github = GITHUB_URL;
  protected readonly sections = CATALOG_KINDS.map(kind => ({ kind, path: listingPath(kind) }));

  protected readonly componentsHref = computed(() =>
    docsUrl(this.translations.locale(), '/docs/components')
  );

  protected label(kind: 'blocks' | 'layouts' | 'recipes'): string {
    return kind === 'recipes' ? this.t('recipes.title') : this.t(`gallery.${kind}.title`);
  }
}
