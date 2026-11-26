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
// Relative, not @shared: vite.config.ts loads this catalog (legacy redirects) before aliases exist.
import { WORKFLOW_RECIPES } from '../../../../../packages/shared/lib/workflow-recipes';

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
  // The three workflow recipes live in packages/shared so voltui.dev can link back to them.
  ...WORKFLOW_RECIPES.map(recipe => ({
    slug: recipe.slug,
    labelKey: recipe.labelKey,
    path: recipe.path,
    atoms: recipe.atoms.map(entry => atom(entry.name, entry.slug)),
  })),
  {
    slug: 'live-playground',
    labelKey: 'recipes.items.livePlayground',
    path: '/patterns/live-playground',
    atoms: [
      atom('VoltAlert', 'alert'),
      atom('VoltToggleGroup', 'toggle-group'),
      atom('VoltInput', 'input'),
      atom('VoltSwitch', 'switch'),
      atom('VoltButton', 'button'),
    ],
  },
  {
    slug: 'component-explorer',
    labelKey: 'recipes.items.componentExplorer',
    path: '/patterns/component-explorer',
    atoms: [
      atom('VoltToggleGroup', 'toggle-group'),
      atom('VoltButton', 'button'),
      atom('VoltBadge', 'badge'),
      atom('VoltSwitch', 'switch'),
      atom('VoltSpinner', 'spinner'),
    ],
  },
  {
    slug: 'section-nav',
    labelKey: 'recipes.items.sectionNav',
    path: '/patterns/section-nav',
    atoms: [atom('VoltSeparator', 'separator')],
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
