import type { PlainTranslationKey } from '@shared/i18n/i18n';
import { BLOCKS, categoryFor, type BlockMetadata } from './blocks-metadata';
import { LAYOUT_CATEGORIES, LAYOUTS, type LayoutMetadata } from './layouts-metadata';
import { RECIPES, type RecipeMetadata } from './recipes-metadata';

/**
 * The one description of everything Recipes publishes.
 *
 * Routes, listing cards, the header navigation, the sitemap and the page head are all read from
 * `CATALOG`, so an entry cannot be reachable in one and absent from another. The per-kind
 * metadata modules (`blocks-metadata`, `layouts-metadata`, `recipes-metadata`) stay the place
 * the facts are authored; this module only gives them one shape.
 *
 * Adding an entry (docs/recipes-app.md "Adding a recipe"): author its metadata, add its source to
 * `lib/snippets/`, add its `*.page.ts`. `catalog.spec.ts` fails if any of the three is missing.
 */
export type CatalogKind = 'blocks' | 'layouts' | 'recipes';

export const CATALOG_KINDS: readonly CatalogKind[] = ['blocks', 'layouts', 'recipes'];

export interface CatalogAtom {
  /** Exported class name, e.g. `VoltCard`. */
  readonly name: string;
  /** Path on the Volt UI docs site. */
  readonly path: string;
}

export interface CatalogEntry {
  /** Stable across renames of the route: `blocks/hero`. */
  readonly id: string;
  readonly kind: CatalogKind;
  readonly slug: string;
  /** Public route on the Recipes origin, without a locale prefix. */
  readonly path: string;
  /** The name in the reader's language. */
  readonly nameKey: PlainTranslationKey;
  /** One line for a listing card, when Glossa has one. */
  readonly summaryKey?: PlainTranslationKey;
  /** The group the entry is filed under on its listing page. */
  readonly groupKey?: PlainTranslationKey;
  /** Volt components the entry is built from — "related components". */
  readonly atoms: readonly CatalogAtom[];
}

const fromBlock = (block: BlockMetadata): CatalogEntry => ({
  id: `blocks/${block.slug}`,
  kind: 'blocks',
  slug: block.slug,
  path: block.path,
  nameKey: block.labelKey,
  summaryKey: block.taglineKey,
  groupKey: categoryFor(block).labelKey,
  atoms: block.atoms,
});

const fromLayout = (layout: LayoutMetadata): CatalogEntry => ({
  id: `layouts/${layout.slug}`,
  kind: 'layouts',
  slug: layout.slug,
  path: layout.path,
  nameKey: layout.labelKey,
  summaryKey: layout.taglineKey,
  groupKey: LAYOUT_CATEGORIES.find(category => category.id === layout.category)?.labelKey,
  atoms: layout.atoms,
});

const fromRecipe = (recipe: RecipeMetadata): CatalogEntry => ({
  id: `recipes/${recipe.slug}`,
  kind: 'recipes',
  slug: recipe.slug,
  path: recipe.path,
  nameKey: recipe.labelKey,
  atoms: recipe.atoms,
});

export const CATALOG: readonly CatalogEntry[] = [
  ...BLOCKS.map(fromBlock),
  ...LAYOUTS.map(fromLayout),
  ...RECIPES.map(fromRecipe),
];

export const entriesOf = (kind: CatalogKind): readonly CatalogEntry[] =>
  CATALOG.filter(entry => entry.kind === kind);

/** Looks an entry up by its route path, for the page head. */
export const entryForPath = (path: string): CatalogEntry | undefined =>
  CATALOG.find(entry => entry.path === path);

/** The listing path of a kind: `/blocks`. */
export const listingPath = (kind: CatalogKind): string => `/${kind}`;
