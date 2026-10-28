import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnGithubIcon } from 'lumen-icons';
import { VoltNativeButton, VoltSeparator } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { STORYBOOK_URL } from '@shared/lib/storybook';
import { docsUrl, GITHUB_URL, SITE_NAME } from '../lib/site';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LmnGithubIcon, VoltNativeButton, VoltSeparator],
  template: `
    <footer class="relative z-10 border-t border-border/50 bg-muted/15 py-10">
      <div
        class="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-5 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row lg:px-8"
      >
        <div class="flex items-center gap-3">
          <img src="favicon.svg" alt="" class="h-7 w-7 rounded-lg" />
          <div>
            <p class="font-medium text-foreground">{{ siteName }}</p>
            <p class="text-xs">{{ t('footer.tagline') }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1">
          <a voltButton variant="ghost" size="sm" [routerLink]="path('/docs')">{{
            t('nav.docs')
          }}</a>
          <a voltButton variant="ghost" size="sm" [href]="componentsHref()">{{
            t('nav.components')
          }}</a>
          <a voltButton variant="ghost" size="sm" [href]="storybook" target="_blank" rel="noopener"
            >{{ t('nav.storybook') }}<span class="sr-only"> {{ t('nav.externalLink') }}</span></a
          >
          <volt-separator orientation="vertical" class="mx-1 hidden h-5 sm:block" />
          <span class="hidden px-2 sm:inline">{{ t('footer.rights', { year: currentYear }) }}</span>
          <a
            voltButton
            variant="ghost"
            size="icon"
            [href]="github"
            target="_blank"
            rel="noreferrer"
            [attr.aria-label]="t('nav.github')"
          >
            <lmn-github [size]="20" />
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly siteName = SITE_NAME;
  protected readonly github = GITHUB_URL;
  protected readonly storybook = STORYBOOK_URL;
  protected readonly currentYear = new Date().getFullYear();

  protected readonly componentsHref = computed(() =>
    docsUrl(this.translations.locale(), '/docs/components')
  );
}
