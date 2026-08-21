import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localeFromPath,
  localizePath,
  stripLocale,
} from './locales';

describe('locale paths', () => {
  it('reads the locale from the first segment', () => {
    expect(localeFromPath('/es/docs/introduction')).toBe('es');
    expect(localeFromPath('/uk')).toBe('uk');
  });

  it('treats an unprefixed path as the default locale', () => {
    expect(localeFromPath('/docs/introduction')).toBe(DEFAULT_LOCALE);
    expect(localeFromPath('/')).toBe(DEFAULT_LOCALE);
  });

  it('does not mistake a page for a locale', () => {
    // `/docs` starts with a segment that is not a locale, and must stay English.
    expect(localeFromPath('/docs/es')).toBe(DEFAULT_LOCALE);
    expect(isLocale('docs')).toBe(false);
  });

  it('strips the prefix back to the shared path', () => {
    expect(stripLocale('/es/docs/introduction')).toBe('/docs/introduction');
    expect(stripLocale('/docs/introduction')).toBe('/docs/introduction');
    expect(stripLocale('/uk')).toBe('/');
  });

  it('keeps the query and the fragment when stripping', () => {
    expect(stripLocale('/es/docs/themes?preset=ember')).toBe('/docs/themes?preset=ember');
    expect(stripLocale('/uk/docs/themes#presets')).toBe('/docs/themes#presets');
  });

  it('serves the default locale from the root, with no prefix', () => {
    expect(localizePath('/es/docs/themes', 'en')).toBe('/docs/themes');
    expect(localizePath('/', 'en')).toBe('/');
  });

  it('prefixes the other locales', () => {
    expect(localizePath('/docs/themes', 'es')).toBe('/es/docs/themes');
    expect(localizePath('/', 'uk')).toBe('/uk');
  });

  it('round-trips every locale without accumulating prefixes', () => {
    // Switching language repeatedly must not produce `/es/uk/docs`.
    let path = '/docs/components/button';
    for (const locale of [...LOCALES, ...LOCALES]) {
      path = localizePath(path, locale);
      expect(stripLocale(path)).toBe('/docs/components/button');
    }
  });
});
