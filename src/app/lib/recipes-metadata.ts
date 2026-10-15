/**
 * Recipes: tested compositions that teach an application workflow — validation, async work,
 * recovery — using existing Volt atoms. Not part of `@voltui/components`; you copy the source.
 *
 * | Layout | structure             |
 * | Block  | a finished section    |
 * | Recipe | behaviour over time   |
 *
 * `label` is the recipe's own name. The sentence-length copy around it (what it teaches, when
 * to use it) needs Glossa keys; see specs/plans/v1.2.md "Glossa keys pending".
 */
export interface RecipeMetadata {
  readonly slug: string;
  readonly label: string;
  readonly path: string;
}

export const RECIPES: readonly RecipeMetadata[] = [
  { slug: 'settings-form', label: 'Settings form', path: '/docs/recipes/settings-form' },
  { slug: 'async-search', label: 'Async search', path: '/docs/recipes/async-search' },
  { slug: 'data-table', label: 'Data table', path: '/docs/recipes/data-table' },
];
