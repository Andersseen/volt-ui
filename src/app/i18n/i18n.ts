import { createHttpMessageLoader, defineRemoteI18n, type MessageParams } from '@etyma/core';
import { injectI18n, type EtymaI18n } from '@etyma/angular';

import contract from './etyma.generated';

export const LOCALES = ['en', 'es', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

export const SOURCE_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: 'English',
  es: 'Español',
  uk: 'Українська',
};

export const LOCALE_SHORT: Readonly<Record<Locale, string>> = {
  en: 'EN',
  es: 'ES',
  uk: 'UA',
};

// Translation content is owned by Glossa, not this repo. See AGENTS.md "Translations" for
// the agent workflow (Glossa MCP) and how to refresh `etyma.generated.ts` after a key change.
const GLOSSA_I18N_BASE = 'https://glossa.andersseen.dev/i18n/volt-ui';

const remoteLoader = createHttpMessageLoader(locale => `${GLOSSA_I18N_BASE}/${locale}.json`);

export const appI18n = defineRemoteI18n({
  locales: LOCALES,
  sourceLocale: SOURCE_LOCALE,
  contract,
  loaders: {
    en: remoteLoader,
    es: remoteLoader,
    uk: remoteLoader,
  },
});

export type TranslationKey = (typeof appI18n.keys)[number];
export type TranslationParams = MessageParams;

export const injectAppI18n = (): EtymaI18n<TranslationKey> => injectI18n(appI18n);
