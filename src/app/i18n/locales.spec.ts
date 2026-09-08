import { describe, expect, it } from 'vitest';
import { appI18n, LOCALES, SOURCE_LOCALE } from './i18n';

describe('locale paths', () => {
  const router = appI18n.router;

  it('reads the locale from the first segment', () => {
    expect(router.localeOf('/es/docs/introduction')).toBe('es');
    expect(router.localeOf('/uk')).toBe('uk');
  });

  it('treats an unprefixed path as the default locale', () => {
    expect(router.localeOf('/docs/introduction')).toBe(SOURCE_LOCALE);
    expect(router.localeOf('/')).toBe(SOURCE_LOCALE);
  });

  it('does not mistake a page for a locale', () => {
    // `/docs` starts with a segment that is not a locale, and must stay English.
    expect(router.localeOf('/docs/es')).toBe(SOURCE_LOCALE);
    expect(router.isLocale('docs')).toBe(false);
  });

  it('strips the prefix back to the shared path', () => {
    expect(router.strip('/es/docs/introduction')).toBe('/docs/introduction');
    expect(router.strip('/docs/introduction')).toBe('/docs/introduction');
    expect(router.strip('/uk')).toBe('/');
  });

  it('keeps the query and the fragment when stripping', () => {
    expect(router.strip('/es/docs/themes?preset=ember')).toBe('/docs/themes?preset=ember');
    expect(router.strip('/uk/docs/themes#presets')).toBe('/docs/themes#presets');
  });

  it('serves the default locale from the root, with no prefix', () => {
    expect(router.localize('/es/docs/themes', 'en')).toBe('/docs/themes');
    expect(router.localize('/', 'en')).toBe('/');
  });

  it('prefixes the other locales', () => {
    expect(router.localize('/docs/themes', 'es')).toBe('/es/docs/themes');
    expect(router.localize('/', 'uk')).toBe('/uk');
  });

  it('round-trips every locale without accumulating prefixes', () => {
    // Switching language repeatedly must not produce `/es/uk/docs`.
    let path = '/docs/components/button';
    for (const locale of [...LOCALES, ...LOCALES]) {
      path = router.localize(path, locale);
      expect(router.strip(path)).toBe('/docs/components/button');
    }
  });

  it('canonicalizes duplicate source-locale prefixes', () => {
    expect(router.strip('/en/docs/introduction?tab=api#usage')).toBe(
      '/docs/introduction?tab=api#usage'
    );
  });
});
