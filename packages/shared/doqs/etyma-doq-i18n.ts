import { computed, inject, type Provider } from '@angular/core';
import type { CanActivateFn, Routes } from '@angular/router';
import {
  DOQ_I18N_ADAPTER,
  formatDoqMessage,
  type DoqI18nAdapter,
  type DoqMessageKey,
} from '@doqs/analog';
import { ETYMA_DEFINITION, EtymaI18n } from '@etyma/angular';
import { injectAppI18n } from '@shared/i18n/i18n';

type AppI18n = ReturnType<typeof injectAppI18n>;

/**
 * Doqs interface text, read from the site's Glossa catalog. A function per Doqs key: it receives the
 * site's typed `t()` and the Doqs placeholders (`{label}`, `{count}`, …) as strings. A key an app does
 * not list keeps Doqs's English default, so list every key a reader of that app can see.
 */
export type DoqMessages = Partial<
  Record<DoqMessageKey, (t: AppI18n['t'], params: Readonly<Record<string, string>>) => string>
>;

/**
 * Connects Doqs to the site's Etyma locale.
 *
 * Etyma owns the language (the URL prefix, `<html lang>`, canonical and hreflang, and the header's
 * language switcher), so this adapter only reports it: `locale` is Etyma's signal, `localize` uses
 * Etyma's path helper, and Doqs interface text comes from the same Glossa catalog as the rest of the
 * site. Doc *content* is translated in each app's `src/content/docs-<locale>`.
 *
 * A factory rather than Doqs's own `provideDoqI18n(adapter)`, which provides a value: the adapter
 * reads Etyma, so it has to be built inside an injection context. Doqs placeholders are `{label}`;
 * Glossa/MF2 are `{$label}`, so params go through `t()` rather than formatting the Doqs fallback.
 */
export function provideEtymaDoqI18n(messages: DoqMessages): Provider {
  return {
    provide: DOQ_I18N_ADAPTER,
    useFactory: (): DoqI18nAdapter => {
      const translations = injectAppI18n();
      const locale = computed(() => translations.locale());
      return {
        locale,
        direction: computed(() => 'ltr' as const),
        translate: (key, fallback, params) => {
          const message = messages[key as DoqMessageKey];
          if (!message) return formatDoqMessage(fallback, params);
          const text: Record<string, string> = {};
          for (const [name, value] of Object.entries(params ?? {})) text[name] = String(value);
          return message(translations.t, text);
        },
        localize: (path, target) => translations.path(path, target),
        ownsRouting: true,
        ownsHead: true,
      };
    },
  };
}

/** Activates the locale a documentation URL names (`/es/docs/x` → `es`, `/docs/x` → the source locale). */
const activateDocsLocale: CanActivateFn = (_route, state) => {
  const definition = inject(ETYMA_DEFINITION);
  return inject(EtymaI18n)
    .activate(definition.router.localeOf(state.url))
    .then(() => true);
};

/**
 * Doqs's routes, under the guard Etyma puts on its own localized routes.
 *
 * Etyma activates a non-source locale in a `canActivate` guard on the tree `withLocalizedRoutes()`
 * builds. Doqs registers `/es/docs/*` itself, ahead of that tree, so the guard never ran there:
 * switching to Spanish on a guide loaded the catalog and moved the URL, but left the header and
 * the Doqs interface in English. A direct load hid it, since bootstrap reads the locale from the URL.
 */
export function withEtymaLocale(routes: Routes): Routes {
  // On each route rather than on an empty-path parent around them: Angular accepts a componentless
  // `''` parent with no matching child when no segments are left, so `/` would render nothing.
  return routes.map(route => ({
    ...route,
    canActivate: [...(route.canActivate ?? []), activateDocsLocale],
    // `/docs/x` → `/es/docs/x` can resolve to the same route, so the guard runs on every navigation.
    runGuardsAndResolvers: 'always',
  }));
}
