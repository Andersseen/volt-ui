import { provideEtymaDoqI18n, type DoqMessages } from '@shared/doqs/etyma-doq-i18n';

/**
 * Doqs interface text on voltui.dev, from the site's Glossa catalog.
 *
 * Every message a reader can meet here is listed: the documentation chrome (shared with Recipes'
 * `recipes.doqs.*` and the site's `ui.*` keys, the same words in the same project) and the
 * playground chrome (`doqs.playground.*`). There is no search, versioning, index or Doqs not-found
 * view on this site (`unmatched: 'continue'` leaves those URLs to the host), so their keys are not
 * listed. Playground control labels are the components' input names, which read the same in every
 * language.
 */
const MESSAGES: DoqMessages = {
  'documentation.label': t => t('recipes.doqs.documentation'),
  'documentation.breadcrumbRoot': t => t('nav.docs'),
  'documentation.loading': t => t('recipes.doqs.loading'),
  'nav.menu': (t, { label = '' }) => t('recipes.doqs.menu', { label }),
  'nav.close': t => t('recipes.doqs.closeNavigation'),
  'nav.overview': t => t('gallery.overview'),
  'toc.title': t => t('ui.docs.onThisPage'),
  'pagination.previous': t => t('ui.docs.previous'),
  'pagination.next': t => t('ui.docs.next'),
  'code.copy': t => t('ui.copy.action'),
  'code.copied': t => t('landing.hero.copied'),
  'code.copyUnavailable': t => t('recipes.doqs.copyUnavailable'),
  'code.copyLabel': t => t('ui.copy.code'),
  'code.copiedLabel': t => t('recipes.doqs.codeCopied'),
  'code.copyUnavailableLabel': t => t('recipes.doqs.clipboardUnavailable'),
  'table.scrollableLabel': t => t('recipes.doqs.scrollableTable'),
  'locale.untranslatedNotice': (t, { label = '' }) => t('recipes.doqs.untranslated', { label }),
  'playground.previewWidth': t => t('doqs.playground.previewWidth'),
  'playground.previewWidths': t => t('doqs.playground.previewWidth'),
  'playground.reset': t => t('doqs.playground.reset'),
  'playground.expand': t => t('doqs.playground.expand'),
  'playground.expandedPreview': t => t('doqs.playground.expandedPreview'),
  'playground.close': t => t('doqs.playground.close'),
  'playground.inputs': t => t('doqs.playground.inputs'),
  'playground.required': t => t('doqs.playground.required'),
  'playground.previewError': (t, { message = '' }) =>
    t('doqs.playground.previewError', { message }),
  'playground.notSet': t => t('doqs.playground.notSet'),
  'playground.events': t => t('doqs.playground.events'),
  'playground.clearEvents': t => t('doqs.playground.clearEvents'),
  'playground.noEvents': t => t('doqs.playground.noEvents'),
  'playground.usageCode': t => t('doqs.playground.usageCode'),
  'playground.codeExampleError': (t, { message = '' }) =>
    t('doqs.playground.codeExampleError', { message }),
  'playground.resetAnnouncement': t => t('doqs.playground.resetAnnouncement'),
  'playground.previewAnnouncement': (t, { label = '', width = '' }) =>
    t('doqs.playground.previewAnnouncement', { label, width }),
  'playground.previewFullWidth': t => t('doqs.playground.previewFullWidth'),
  'playground.copy': t => t('ui.copy.action'),
  'playground.copied': t => t('landing.hero.copied'),
  'playground.copyUnavailable': t => t('recipes.doqs.copyUnavailable'),
  'playground.copyLabel': (t, { label = '' }) => t('doqs.playground.copyLabel', { label }),
  'playground.copiedLabel': (t, { label = '' }) => t('doqs.playground.copiedLabel', { label }),
  'playground.copyUnavailableLabel': t => t('recipes.doqs.clipboardUnavailable'),
  'playground.clipboardUnavailable': t => t('doqs.playground.clipboardUnavailable'),
  'playground.copyAnnouncement': (t, { label = '' }) =>
    t('doqs.playground.copyAnnouncement', { label }),
};

/** Connects Doqs to Etyma on voltui.dev; see `provideEtymaDoqI18n` in packages/shared/doqs. */
export function provideSiteDoqI18n() {
  return provideEtymaDoqI18n(MESSAGES);
}
