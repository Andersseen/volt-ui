import { CATALOG, listingPath, type CatalogKind } from '../catalog';
import { DOC_PAGES } from './docs-pages';

/**
 * Every public, indexable route of Volt UI Recipes, derived from the catalog.
 *
 * The runtime head (`provideSeo`), the sitemap and `llms.txt` all read this one list, so a route
 * cannot be in one and missing from another. A new catalog entry is indexed with no extra step.
 *
 * Not listed on purpose: anything under a locale prefix (the generators add those).
 */
export type SeoEntry =
  | { readonly kind: 'home'; readonly path: '/' }
  | { readonly kind: 'listing'; readonly path: string; readonly section: CatalogKind }
  | { readonly kind: 'entry'; readonly path: string; readonly id: string }
  | { readonly kind: 'doc'; readonly path: string; readonly slug: string };

const KINDS: readonly CatalogKind[] = ['blocks', 'layouts', 'recipes'];

export const SEO_ENTRIES: readonly SeoEntry[] = [
  { kind: 'home', path: '/' },
  ...KINDS.map((section): SeoEntry => ({ kind: 'listing', path: listingPath(section), section })),
  ...CATALOG.map((entry): SeoEntry => ({ kind: 'entry', path: entry.path, id: entry.id })),
  // The bare /docs index is a table of contents, not content worth indexing: it stays noindex.
  ...DOC_PAGES.map((page): SeoEntry => ({ kind: 'doc', path: page.path, slug: page.slug })),
];

export function seoEntryFor(barePath: string): SeoEntry | undefined {
  return SEO_ENTRIES.find(entry => entry.path === barePath);
}
