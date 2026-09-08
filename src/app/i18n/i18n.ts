import { defineI18n, type MessageParams } from '@etyma/core';
import { injectI18n, type EtymaI18n } from '@etyma/angular';

import en from './en.json';

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

export const appI18n = defineI18n({
  locales: LOCALES,
  sourceLocale: SOURCE_LOCALE,
  source: en,
  loaders: {
    es: () => import('./es.json'),
    uk: () => import('./uk.json'),
  },
});

export type TranslationKey = (typeof appI18n.keys)[number];
export type TranslationParams = MessageParams;

export const injectAppI18n = (): EtymaI18n<TranslationKey> => injectI18n(appI18n);
