/**
 * Recipes: tested compositions that teach an application workflow — validation, async work,
 * recovery — using existing Volt atoms. Not part of `@voltui/components`; you copy the source.
 *
 * | Layout | structure             |
 * | Block  | a finished section    |
 * | Recipe | behaviour over time   |
 *
 * `labelKey` is the recipe's name in the reader's language. The sentence-length copy around it
 * (what it teaches, when to use it) is not written yet; see docs/recipes-app.md "Deferred".
 */
import type { PlainTranslationKey } from '@shared/i18n/i18n';

export interface RecipeAtom {
  readonly name: string;
  /** Path on the Volt UI docs site, made absolute (and localized) by `docsUrl`. */
  readonly path: string;
}

export interface RecipeMetadata {
  readonly slug: string;
  readonly labelKey: PlainTranslationKey;
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
    labelKey: 'recipes.items.settingsForm',
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
    labelKey: 'recipes.items.asyncSearch',
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
    labelKey: 'recipes.items.dataTable',
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
