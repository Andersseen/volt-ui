import { injectAppI18n, type PlainTranslationKey } from './i18n';

/**
 * Compile-time proof that the params typed by the Glossa contract reach Angular callers.
 *
 * Never called and never imported: `pnpm typecheck` compiles it, and every
 * `@ts-expect-error` below fails the build the day its line stops being an error — for
 * instance if `injectAppI18n()` gains an annotation that erases the contract's params.
 * Each key is a real source message; the comment beside it is that message's variables.
 * `t` is the same function components expose to their templates as `protected readonly t`.
 */
export function translationParamsAreTyped(): void {
  const { t, parts } = injectAppI18n();

  // "Language: {$name}" — language-switcher's aria-label.
  t('language.current', { name: 'Español' });
  // @ts-expect-error a required param is missing
  t('language.current');
  // @ts-expect-error `name` is misspelled
  t('language.current', { nmae: 'Español' });

  // "Theme: {$color} palette, {$style} shape" — every declared param is required.
  t('nav.themeLabel', { color: 'Ember', style: 'Soft' });
  // @ts-expect-error `style` is missing
  t('nav.themeLabel', { color: 'Ember' });

  // "© {$year :number useGrouping=never}" — `:number` narrows the value, not just the name.
  t('footer.rights', { year: 2026 });
  t('footer.rights', { year: 2026n });
  // @ts-expect-error a Date is not a number, whatever the runtime would coerce it to
  t('footer.rights', { year: new Date() });
  // @ts-expect-error neither is a boolean
  parts('footer.rights', { year: true });

  // A message without variables takes no params, and an unknown key is rejected.
  t('nav.docs');
  // @ts-expect-error not a key in the contract
  t('nav.dcos');
}

/** Static data may only hold keys `t(key)` can be called with on its own. */
export function plainKeysExcludeParameterizedMessages(): void {
  const label: PlainTranslationKey = 'nav.docs';
  // @ts-expect-error `language.current` needs `{ name }`, so it cannot be a bare label
  const parameterized: PlainTranslationKey = 'language.current';

  void [label, parameterized];
}
