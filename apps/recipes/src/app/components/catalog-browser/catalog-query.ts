import type { ParamMap } from '@angular/router';
import type { CatalogEntry, CatalogGroup } from '../../lib/catalog';

export type CatalogSort = 'category' | 'name';

/**
 * What the visitor asked the listing for. It lives in the URL (`?q=…&category=…&sort=name`),
 * so a filtered view can be linked, survives a reload and is rendered by the server as-is.
 */
export interface CatalogQuery {
  readonly text: string;
  /** A group id, or `''` for every group. */
  readonly group: string;
  readonly sort: CatalogSort;
}

export const EMPTY_QUERY: CatalogQuery = { text: '', group: '', sort: 'category' };

/** Reads a query from the URL, ignoring values the listing would not understand. */
export function readQuery(params: ParamMap, groups: readonly CatalogGroup[]): CatalogQuery {
  const group = params.get('category') ?? '';
  return {
    text: (params.get('q') ?? '').slice(0, 80),
    group: groups.some(candidate => candidate.id === group) ? group : '',
    sort: params.get('sort') === 'name' ? 'name' : 'category',
  };
}

/** The query as URL parameters, leaving defaults out so a clean listing has a clean URL. */
export function toParams(query: CatalogQuery): Record<string, string | null> {
  return {
    q: query.text.trim() || null,
    category: query.group || null,
    sort: query.sort === 'name' ? 'name' : null,
  };
}

export const isFiltered = (query: CatalogQuery): boolean =>
  query.text.trim() !== '' || query.group !== '';

/** Case- and accent-insensitive, so "boton" finds "Botón" and "HERO" finds "hero". */
const fold = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * The entries a query selects, in the order it asks for.
 *
 * Text matches the name and summary in the reader's language, the group, and the Volt atoms an
 * entry is built from — someone looking for "switch" wants every block that has one. Every word
 * must match somewhere, so adding a word narrows the result instead of widening it.
 */
export function selectEntries(
  entries: readonly CatalogEntry[],
  query: CatalogQuery,
  translate: (entry: CatalogEntry) => { name: string; summary: string; group: string }
): CatalogEntry[] {
  const words = fold(query.text).split(/\s+/).filter(Boolean);

  const selected = entries.filter(entry => {
    if (query.group && entry.groupId !== query.group) return false;
    if (words.length === 0) return true;

    const { name, summary, group } = translate(entry);
    const haystack = fold(
      [name, summary, group, entry.slug, ...entry.atoms.map(atom => atom.name)].join(' ')
    );
    return words.every(word => haystack.includes(word));
  });

  if (query.sort === 'name') {
    return selected
      .map(entry => ({ entry, name: translate(entry).name }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ entry }) => entry);
  }
  return selected;
}
