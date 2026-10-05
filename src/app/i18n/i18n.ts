import { createHttpMessageLoader, defineRemoteI18n } from '@etyma/core';
import { injectI18n } from '@etyma/angular';

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

/**
 * The params each parameterized message needs, from the generated contract: its
 * `{$variables}` by name, and their value types where an MF2 function proves one
 * (`{$year :number}` takes a number, not a `Date`). Keys without variables are absent.
 */
type TranslationParamsMap = NonNullable<(typeof appI18n)['messageParams']>;

/**
 * A key whose message has no variables, so `t(key)` needs nothing else.
 *
 * Static data — the sidebar, the component catalog, block and layout metadata — holds
 * labels, and a label never takes params. Typing those fields as every `TranslationKey`
 * would let one hold `language.current`, which `t()` cannot be called with on its own;
 * this type is the honest one, and it follows the contract when Glossa adds a variable.
 */
export type PlainTranslationKey = Exclude<TranslationKey, keyof TranslationParamsMap>;

// No return annotation: `EtymaI18n<TranslationKey>` would default its second type
// argument and silently erase every per-key param type the contract carries.
export const injectAppI18n = () => injectI18n(appI18n);
