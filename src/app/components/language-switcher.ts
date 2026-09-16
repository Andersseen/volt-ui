import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LmnCheckIcon, LmnGlobeIcon, LmnLoaderIcon } from 'lumen-icons';
import { VoltPopoverContent, VoltPopoverTrigger } from 'volt';
import { injectAppI18n, LOCALES, LOCALE_NAMES, LOCALE_SHORT, type Locale } from '../i18n/i18n';

/**
 * Language picker.
 *
 * Choosing a language navigates rather than swapping strings in place, because the URL is
 * what decides the language here. Anything else would leave `/es/docs` rendering English
 * — and would hand out links that open in whatever the recipient last picked.
 *
 * Etyma loads the target catalog before navigating, so the destination page never renders
 * a frame in the language the visitor just left - but that load is a network fetch to
 * Glossa, not instant, so `pendingLocale` swaps the trigger's icon for a spinner for its
 * duration. Same box size throughout (a 16px icon slot, a button that never resizes), so
 * nothing shifts or reflows while it waits.
 *
 * Deliberately `aria-disabled`, not the native `disabled` attribute, on every element that
 * can hold focus here (the option just activated, and the trigger once focus returns to it
 * on close): setting `disabled` on a focused control blurs it synchronously, straight to
 * `<body>`, with nothing to send focus back anywhere after. `switchTo()`'s own re-entry
 * guard (`pendingLocale() !== null`) already makes a stray click during the pending window
 * a no-op, so nothing but the visual/AT-facing "busy" signal depends on the attribute.
 */
@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltPopoverTrigger, VoltPopoverContent, LmnGlobeIcon, LmnCheckIcon, LmnLoaderIcon],
  template: `
    <button
      type="button"
      [voltPopover]="languages"
      placement="bottom-end"
      data-testid="language-trigger"
      [disabled]="pendingLocale() !== null"
      [attr.aria-disabled]="pendingLocale() !== null ? 'true' : null"
      class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-surface px-2.5 text-sm transition-colors hover:bg-muted aria-disabled:cursor-wait aria-disabled:opacity-70 aria-disabled:hover:bg-surface"
      [attr.aria-label]="t('language.current', { name: name(locale()) })"
      [attr.aria-busy]="pendingLocale() !== null"
    >
      @if (pendingLocale()) {
        <lmn-loader [size]="16" class="animate-spin text-muted-foreground" />
      } @else {
        <lmn-globe [size]="16" class="text-muted-foreground" />
      }
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
            class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted aria-disabled:cursor-wait aria-disabled:opacity-70 aria-disabled:hover:bg-transparent"
            [class]="option === locale() ? 'bg-muted font-medium' : ''"
            [attr.aria-disabled]="pendingLocale() !== null ? 'true' : null"
            [attr.aria-current]="option === locale() ? 'true' : null"
            [attr.data-testid]="'language-option-' + option"
            (click)="switchTo(option)"
          >
            <span>{{ name(option) }}</span>
            @if (pendingLocale() === option) {
              <lmn-loader [size]="14" class="animate-spin text-primary" />
            } @else if (option === locale()) {
              <lmn-check [size]="14" class="text-primary" />
            }
          </button>
        }
      </volt-popover-content>
    </ng-template>
  `,
})
export class LanguageSwitcher {
  private readonly translations = injectAppI18n();

  protected readonly locales = LOCALES;
  protected readonly locale = this.translations.locale;
  protected readonly t = this.translations.t;
  protected readonly pendingLocale = signal<Locale | null>(null);

  protected name(locale: string): string {
    return LOCALE_NAMES[locale as Locale] ?? locale;
  }

  protected short(locale: string): string {
    return LOCALE_SHORT[locale as Locale] ?? locale.toUpperCase();
  }

  protected switchTo(locale: Locale): void {
    if (locale === this.locale() || this.pendingLocale() !== null) {
      return;
    }

    this.pendingLocale.set(locale);
    void this.translations.setLocale(locale).finally(() => this.pendingLocale.set(null));
  }
}
