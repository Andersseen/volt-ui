/**
 * Recipes: tested compositions that teach an application workflow — validation, async work,
 * recovery — using existing Volt atoms. Not part of `@voltui/components`; you copy the source.
 *
 * | Layout | structure             |
 * | Block  | a finished section    |
 * | Recipe | behaviour over time   |
 *
 * `label` is the recipe's own name. The sentence-length copy around it (what it teaches, when
 * to use it) needs Glossa keys that do not exist yet; see `specs/plans/recipes-app.md`.
 */
export interface RecipeAtom {
  readonly name: string;
  /** Path on the Volt UI docs site, made absolute (and localized) by `docsUrl`. */
  readonly path: string;
}

export interface RecipeMetadata {
  readonly slug: string;
  readonly label: string;
  readonly path: string;
  /** Volt components the recipe is assembled from, linked back to their own docs. */
  readonly atoms: readonly RecipeAtom[];
}

const atom = (name: string, slug: string): RecipeAtom => ({
  name,
  path: `/docs/components/${slug}`,
});

export const RECIPES: readonly RecipeMetadata[] = [
  {
    slug: 'settings-form',
    label: 'Settings form',
    path: '/recipes/settings-form',
    atoms: [
      atom('VoltFormField', 'form-field'),
      atom('VoltInput', 'input'),
      atom('VoltNativeSelect', 'select'),
      atom('VoltSwitch', 'switch'),
      atom('VoltAlert', 'alert'),
      atom('VoltButton', 'button'),
    ],
  },
  {
    slug: 'async-search',
    label: 'Async search',
    path: '/recipes/async-search',
    atoms: [
      atom('VoltCombobox', 'combobox'),
      atom('VoltFormField', 'form-field'),
      atom('VoltAlert', 'alert'),
      atom('VoltButton', 'button'),
    ],
  },
  {
    slug: 'data-table',
    label: 'Data table',
    path: '/recipes/data-table',
    atoms: [
      atom('VoltTable', 'table'),
      atom('VoltPagination', 'pagination'),
      atom('VoltInput', 'input'),
      atom('VoltBadge', 'badge'),
      atom('VoltSkeleton', 'skeleton'),
      atom('VoltAlert', 'alert'),
    ],
  },
];

/** Looks a recipe up by its route segment. Throws on a miss: the callers' slugs are typos the build should surface. */
export function recipeBySlug(slug: string): RecipeMetadata {
  const recipe = RECIPES.find(entry => entry.slug === slug);

  if (!recipe) {
    throw new Error(`Unknown recipe: ${slug}`);
  }

  return recipe;
}
