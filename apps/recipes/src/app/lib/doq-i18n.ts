import { computed, type Provider } from '@angular/core';
import { DOQ_I18N_ADAPTER, type DoqI18nAdapter } from '@doqs/analog';
import { injectAppI18n } from '@shared/i18n/i18n';

/**
 * Connects Doqs to the site's Etyma locale.
 *
 * Etyma owns the language (the URL prefix, `<html lang>`, canonical and hreflang), so this adapter
 * only reports it: `locale` is Etyma's signal, `localize` uses Etyma's path helper, and Doqs-owned
 * interface text falls back to its English defaults (`translate` returns the fallback unchanged)
 * until Doqs publishes translated chrome. Doc *content* is translated in `src/content/docs-<locale>`.
 */
export function provideDoqI18n(): Provider {
  return {
    provide: DOQ_I18N_ADAPTER,
    useFactory: (): DoqI18nAdapter => {
      const translations = injectAppI18n();
      const locale = computed(() => translations.locale());
      return {
        locale,
        direction: computed(() => 'ltr' as const),
        translate: (_key, fallback) => fallback,
        localize: (path, target) => translations.path(path, target),
        ownsRouting: true,
        ownsHead: true,
      };
    },
  };
}
