import { convertToParamMap } from '@angular/router';
import { describe, expect, it } from 'vitest';
import type { CatalogEntry } from '../../lib/catalog';
import { EMPTY_QUERY, isFiltered, readQuery, selectEntries, toParams } from './catalog-query';

const entry = (slug: string, groupId: string, atoms: string[] = []): CatalogEntry => ({
  id: `blocks/${slug}`,
  kind: 'blocks',
  slug,
  path: `/blocks/${slug}`,
  nameKey: 'blocks.items.hero.label',
  groupId,
  atoms: atoms.map(name => ({ name, path: '/docs/components/x' })),
});

const NAMES: Record<string, { name: string; summary: string; group: string }> = {
  hero: { name: 'Hero Spotlight', summary: 'A light that follows the pointer.', group: 'Hero' },
  pricing: { name: 'Precios', summary: 'Tres planes con interruptor.', group: 'Pricing' },
  footer: { name: 'Footer', summary: 'Sitemap and newsletter.', group: 'Footer' },
};
const ENTRIES = [
  entry('hero', 'hero', ['VoltBadge']),
  entry('pricing', 'pricing', ['VoltSwitch']),
  entry('footer', 'footer', ['VoltInput']),
];
const translate = (item: CatalogEntry) => NAMES[item.slug];
const GROUPS = [
  { id: 'hero', labelKey: 'blocks.categories.hero.label' },
  { id: 'pricing', labelKey: 'blocks.categories.pricing.label' },
] as const;

const slugs = (entries: CatalogEntry[]) => entries.map(item => item.slug);

describe('catalog query', () => {
  it('keeps everything, in catalog order, when nothing is asked for', () => {
    expect(slugs(selectEntries(ENTRIES, EMPTY_QUERY, translate))).toEqual([
      'hero',
      'pricing',
      'footer',
    ]);
  });

  it('matches names, summaries and the atoms an entry is built from', () => {
    const find = (text: string) =>
      slugs(selectEntries(ENTRIES, { ...EMPTY_QUERY, text }, translate));

    expect(find('spotlight')).toEqual(['hero']);
    expect(find('newsletter')).toEqual(['footer']);
    expect(find('switch')).toEqual(['pricing']);
  });

  it('ignores case and accents, and needs every word to match', () => {
    const find = (text: string) =>
      slugs(selectEntries(ENTRIES, { ...EMPTY_QUERY, text }, translate));

    expect(find('PRECIOS')).toEqual(['pricing']);
    expect(find('tres planes')).toEqual(['pricing']);
    expect(find('tres sitemap')).toEqual([]);
  });

  it('narrows to one group', () => {
    const query = { ...EMPTY_QUERY, group: 'footer' };

    expect(slugs(selectEntries(ENTRIES, query, translate))).toEqual(['footer']);
  });

  it('sorts by the translated name when asked', () => {
    const query = { ...EMPTY_QUERY, sort: 'name' as const };

    expect(slugs(selectEntries(ENTRIES, query, translate))).toEqual(['footer', 'hero', 'pricing']);
  });

  it('reads the URL, dropping groups and sorts it does not know', () => {
    expect(
      readQuery(convertToParamMap({ q: 'hero', category: 'pricing', sort: 'name' }), GROUPS)
    ).toEqual({ text: 'hero', group: 'pricing', sort: 'name' });
    expect(readQuery(convertToParamMap({ category: 'nope', sort: 'random' }), GROUPS)).toEqual(
      EMPTY_QUERY
    );
  });

  it('writes defaults out of the URL, so a clean listing has a clean address', () => {
    expect(toParams(EMPTY_QUERY)).toEqual({ q: null, category: null, sort: null });
    expect(toParams({ text: ' hero ', group: 'hero', sort: 'name' })).toEqual({
      q: 'hero',
      category: 'hero',
      sort: 'name',
    });
  });

  it('counts only text and group as filters, not the sort', () => {
    expect(isFiltered({ ...EMPTY_QUERY, sort: 'name' })).toBe(false);
    expect(isFiltered({ ...EMPTY_QUERY, text: 'x' })).toBe(true);
    expect(isFiltered({ ...EMPTY_QUERY, group: 'hero' })).toBe(true);
  });
});
