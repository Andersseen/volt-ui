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
 * Doqs interface text, read from the site's Glossa catalog.
 *
 * Only the messages this site can show are listed: there is no search, no archived version and no
 * playground, so those keys keep Doqs's English defaults. Where the site already had the same words
 * (`ui.docs.*`, `ui.copy.*`) they are reused rather than duplicated under `recipes.doqs.*`.
 */
const MESSAGES: Partial<Record<DoqMessageKey, (t: AppI18n['t'], label: string) => string>> = {
  'documentation.label': t => t('recipes.doqs.documentation'),
  'documentation.breadcrumbRoot': t => t('nav.docs'),
  'documentation.loading': t => t('recipes.doqs.loading'),
  'index.title': t => t('recipes.doqs.indexTitle'),
  'index.description': t => t('recipes.doqs.indexDescription'),
  'index.readGuide': t => t('recipes.doqs.readGuide'),
  'nav.menu': (t, label) => t('recipes.doqs.menu', { label }),
  'nav.close': t => t('recipes.doqs.closeNavigation'),
  'nav.overview': t => t('gallery.overview'),
  'toc.title': t => t('ui.docs.onThisPage'),
  'pagination.previous': t => t('ui.docs.previous'),
  'pagination.next': t => t('ui.docs.next'),
  'notFound.title': t => t('recipes.doqs.notFoundTitle'),
  'notFound.pageTitle': t => t('recipes.doqs.notFoundPageTitle'),
  'notFound.body': t => t('recipes.doqs.notFoundBody'),
  'notFound.browse': t => t('recipes.doqs.browse'),
  'code.copy': t => t('ui.copy.action'),
  'code.copied': t => t('landing.hero.copied'),
  'code.copyUnavailable': t => t('recipes.doqs.copyUnavailable'),
  'code.copyLabel': t => t('ui.copy.code'),
  'code.copiedLabel': t => t('recipes.doqs.codeCopied'),
  'code.copyUnavailableLabel': t => t('recipes.doqs.clipboardUnavailable'),
  'table.scrollableLabel': t => t('recipes.doqs.scrollableTable'),
  'locale.untranslatedNotice': (t, label) => t('recipes.doqs.untranslated', { label }),
};

/**
 * Connects Doqs to the site's Etyma locale.
 *
 * Etyma owns the language (the URL prefix, `<html lang>`, canonical and hreflang, and the header's
 * language switcher), so this adapter only reports it: `locale` is Etyma's signal, `localize` uses
 * Etyma's path helper, and Doqs interface text comes from the same Glossa catalog as the rest of the
 * site. Doc *content* is translated in `src/content/docs-<locale>`.
 *
 * A factory rather than Doqs's own `provideDoqI18n(adapter)`, which provides a value: the adapter
 * reads Etyma, so it has to be built inside an injection context.
 */
export function provideEtymaDoqI18n(): Provider {
  return {
    provide: DOQ_I18N_ADAPTER,
    useFactory: (): DoqI18nAdapter => {
      const translations = injectAppI18n();
      const locale = computed(() => translations.locale());
      return {
        locale,
        direction: computed(() => 'ltr' as const),
        translate: (key, fallback, params) => {
          const message = MESSAGES[key as DoqMessageKey];
          return message
            ? message(translations.t, String(params?.['label'] ?? ''))
            : formatDoqMessage(fallback, params);
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
