import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LmnCheckIcon, LmnGlobeIcon } from 'lumen-icons';
import { VoltPopoverContent, VoltPopoverTrigger } from 'volt';
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, localizePath, type Locale } from '../i18n/locales';
import { Translations } from '../i18n/translations';

/**
 * Language picker.
 *
 * Choosing a language navigates rather than swapping strings in place, because the URL is
 * what decides the language here. Anything else would leave `/es/docs` rendering English
 * — and would hand out links that open in whatever the recipient last picked.
 *
 * `replaceUrl` keeps the two versions of a page from stacking in history: going back
 * should return to the page before this one, not to the same page in the previous
 * language.
 */
@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltPopoverTrigger, VoltPopoverContent, LmnGlobeIcon, LmnCheckIcon],
  template: `
    <button
      type="button"
      [voltPopover]="languages"
      placement="bottom-end"
      class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-surface px-2.5 text-sm transition-colors hover:bg-muted"
      [attr.aria-label]="t('language.current', { name: name(locale()) })"
    >
      <lmn-globe [size]="16" class="text-muted-foreground" />
      <span class="font-medium">{{ short(locale()) }}</span>
    </button>

    <ng-template #languages>
      <volt-popover-content class="w-44 space-y-1 p-2">
        <p class="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {{ t('nav.language') }}
        </p>
        @for (option of locales; track option) {
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
            [class]="option === locale() ? 'bg-muted font-medium' : ''"
            [attr.aria-current]="option === locale() ? 'true' : null"
            (click)="switchTo(option)"
          >
            <span>{{ name(option) }}</span>
            @if (option === locale()) {
              <lmn-check [size]="14" class="text-primary" />
            }
          </button>
        }
      </volt-popover-content>
    </ng-template>
  `,
})
export class LanguageSwitcher {
  private readonly router = inject(Router);
  private readonly translations = inject(Translations);

  protected readonly locales = LOCALES;
  protected readonly locale = this.translations.locale;
  protected readonly t = this.translations.t;

  protected name(locale: Locale): string {
    return LOCALE_NAMES[locale];
  }

  protected short(locale: Locale): string {
    return LOCALE_SHORT[locale];
  }

  protected switchTo(locale: Locale): void {
    void this.router.navigateByUrl(localizePath(this.router.url, locale), { replaceUrl: true });
  }
}
