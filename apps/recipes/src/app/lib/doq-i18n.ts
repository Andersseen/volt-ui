import { provideEtymaDoqI18n, type DoqMessages } from '@shared/doqs/etyma-doq-i18n';

export { withEtymaLocale } from '@shared/doqs/etyma-doq-i18n';

/**
 * Doqs interface text for Recipes, read from the site's Glossa catalog.
 *
 * Only the messages this site can show are listed: there is no search, no archived version and no
 * playground, so those keys keep Doqs's English defaults. Where the site already had the same words
 * (`ui.docs.*`, `ui.copy.*`) they are reused rather than duplicated under `recipes.doqs.*`.
 */
const MESSAGES: DoqMessages = {
  'documentation.label': t => t('recipes.doqs.documentation'),
  'documentation.breadcrumbRoot': t => t('nav.docs'),
  'documentation.loading': t => t('recipes.doqs.loading'),
  'index.title': t => t('recipes.doqs.indexTitle'),
  'index.description': t => t('recipes.doqs.indexDescription'),
  'index.readGuide': t => t('recipes.doqs.readGuide'),
  'nav.menu': (t, { label = '' }) => t('recipes.doqs.menu', { label }),
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
  'locale.untranslatedNotice': (t, { label = '' }) => t('recipes.doqs.untranslated', { label }),
};

/** Connects Doqs to Etyma for Recipes; see `provideEtymaDoqI18n` in packages/shared/doqs. */
export function provideRecipesDoqI18n() {
  return provideEtymaDoqI18n(MESSAGES);
}
