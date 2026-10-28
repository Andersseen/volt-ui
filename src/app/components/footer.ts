import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnGithubIcon } from 'lumen-icons';
import { VoltNativeButton, VoltSeparator } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { recipesUrl } from '../lib/recipes-site';
import { STORYBOOK_URL } from '@shared/lib/storybook';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LmnGithubIcon, VoltNativeButton, VoltSeparator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-border/50 bg-muted/15 py-10 relative z-10">
      <div
        class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-5 text-sm text-muted-foreground"
      >
        <div class="flex items-center gap-3">
          <img src="favicon.svg" alt="" class="h-7 w-7 rounded-lg" />
          <div>
            <p class="font-medium text-foreground">Volt UI</p>
            <p class="text-xs">{{ t('footer.tagline') }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1">
          <a voltButton variant="ghost" size="sm" [routerLink]="path('/docs/introduction')">{{
            t('nav.docs')
          }}</a>
          <a voltButton variant="ghost" size="sm" [routerLink]="path('/docs/components')">{{
            t('nav.components')
          }}</a>
          <a
            voltButton
            variant="ghost"
            size="sm"
            [href]="recipesHref()"
            target="_blank"
            rel="noopener"
            >{{ t('nav.gallery') }}<span class="sr-only"> {{ t('nav.externalLink') }}</span></a
          >
          <a
            voltButton
            variant="ghost"
            size="sm"
            [href]="storybookUrl"
            target="_blank"
            rel="noopener"
            >{{ t('nav.storybook') }}<span class="sr-only"> {{ t('nav.externalLink') }}</span></a
          >
          <volt-separator orientation="vertical" class="mx-1 hidden h-5 sm:block" />
          <span class="hidden px-2 sm:inline">{{ t('footer.rights', { year: currentYear }) }}</span>
          <a
            voltButton
            variant="outline"
            size="icon"
            href="https://github.com/Andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            [attr.aria-label]="t('nav.github')"
          >
            <lmn-github [size]="16" />
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

  protected readonly recipesHref = computed(() => recipesUrl(this.translations.locale()));
  protected readonly storybookUrl = STORYBOOK_URL;
  protected readonly currentYear = new Date().getFullYear();
}
