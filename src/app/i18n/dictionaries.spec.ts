import { describe, expect, it } from 'vitest';
import en from './en.json';
import es from './es.json';
import uk from './uk.json';
import { LOCALES } from './i18n';

const DICTIONARIES: Record<string, unknown> = { en, es, uk };

function paths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key)
  );
}

function messageVariables(value: string): string[] {
  // Enough for Volt's JSON catalogs: messages use external variable expressions such as
  // `{$name}` and `{$year :number useGrouping=never}`, not MF2 local declarations.
  return [...value.matchAll(/\{\$(\w+)(?:\s+:[^}]*)?\}/g)].map(match => match[1]).sort();
}

function entries(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') {
    return [[prefix, value]];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    entries(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe('dictionaries', () => {
  const englishKeys = paths(en);

  it('ships one file per published locale', () => {
    expect(Object.keys(DICTIONARIES).sort()).toEqual([...LOCALES].sort());
  });

  it.each(LOCALES.filter(locale => locale !== 'en'))(
    'gives %s every key English has, so nothing silently falls back',
    locale => {
      const missing = englishKeys.filter(key => !paths(DICTIONARIES[locale]).includes(key));

      expect(missing).toEqual([]);
    }
  );

  it.each(LOCALES.filter(locale => locale !== 'en'))(
    'gives %s no key English lacks, which would be a key nothing reads',
    locale => {
      const extra = paths(DICTIONARIES[locale]).filter(key => !englishKeys.includes(key));

      expect(extra).toEqual([]);
    }
  );

  it.each(LOCALES)('keeps every MF2 parameter in %s', locale => {
    const english = new Map(entries(en));

    for (const [key, value] of entries(DICTIONARIES[locale])) {
      // A translation that drops `{$version}` renders the sentence with a hole in it, and
      // one that invents a parameter renders the expression literally.
      expect({ key, slots: messageVariables(value) }).toEqual({
        key,
        slots: messageVariables(english.get(key) ?? ''),
      });
    }
  });

  it.each(LOCALES)('leaves no custom interpolation syntax in %s', locale => {
    for (const [key, value] of entries(DICTIONARIES[locale])) {
      expect({
        key,
        legacySlots: [...value.matchAll(/\{(?!\$)(\w+)\}/g)].map(match => match[1]),
      }).toEqual({
        key,
        legacySlots: [],
      });
    }
  });

  it('leaves no empty string behind, which would render as a blank label', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of entries(DICTIONARIES[locale])) {
        expect(`${locale}:${key}:${value.trim().length > 0}`).toBe(`${locale}:${key}:true`);
      }
    }
  });
});
