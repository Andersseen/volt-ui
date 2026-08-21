import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnGithubIcon } from 'lumen-icons';
import { Translations } from '../i18n/translations';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LmnGithubIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-border/50 bg-muted/15 py-10 relative z-10">
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-5 text-sm text-muted-foreground"
      >
        <div class="flex items-center gap-3">
          <img src="favicon.svg" alt="" class="h-7 w-7 rounded-lg" />
          <div>
            <p class="font-medium text-foreground">Volt UI</p>
            <p class="text-xs">{{ t('footer.tagline') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-5">
          <a
            [routerLink]="path('/docs/introduction')"
            class="hover:text-foreground transition-colors"
            >{{ t('nav.docs') }}</a
          >
          <a
            [routerLink]="path('/docs/components')"
            class="hover:text-foreground transition-colors"
            >{{ t('nav.components') }}</a
          >
          <a [routerLink]="path('/docs/blocks')" class="hover:text-foreground transition-colors">{{
            t('nav.gallery')
          }}</a>
          <span class="hidden sm:inline">{{ t('footer.rights', { year: currentYear }) }}</span>
          <a
            href="https://github.com/Andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 hover:text-foreground transition-colors"
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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly currentYear = new Date().getFullYear();
}
