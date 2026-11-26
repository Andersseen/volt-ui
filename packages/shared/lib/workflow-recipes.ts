/**
 * The three workflow recipes (settings form, async search, data table) and the Volt components each
 * is built from, for voltui.dev to link a component's page to the recipes that use it. It mirrors
 * their entries in apps/recipes/src/app/lib/recipes-metadata.ts (which Node scripts load without a
 * bundler, so it cannot import this file); workflow-recipes.spec.ts fails if the two differ.
 */
import type { PlainTranslationKey } from '@shared/i18n/i18n';

export interface WorkflowRecipeAtom {
  /** The package class name, as shown on the recipe page. */
  readonly name: string;
  /** The component's docs slug (`/docs/components/<slug>`). */
  readonly slug: string;
}

export interface WorkflowRecipe {
  readonly slug: string;
  readonly labelKey: PlainTranslationKey;
  /** Path on recipes.voltui.dev, without a locale prefix. */
  readonly path: string;
  readonly atoms: readonly WorkflowRecipeAtom[];
}

export const WORKFLOW_RECIPES: readonly WorkflowRecipe[] = [
  {
    slug: 'settings-form',
    labelKey: 'recipes.items.settingsForm',
    path: '/patterns/settings-form',
    atoms: [
      { name: 'VoltFormField', slug: 'form-field' },
      { name: 'VoltInput', slug: 'input' },
      { name: 'VoltNativeSelect', slug: 'select' },
      { name: 'VoltSwitch', slug: 'switch' },
      { name: 'VoltAlert', slug: 'alert' },
      { name: 'VoltButton', slug: 'button' },
    ],
  },
  {
    slug: 'async-search',
    labelKey: 'recipes.items.asyncSearch',
    path: '/patterns/async-search',
    atoms: [
      { name: 'VoltCombobox', slug: 'combobox' },
      { name: 'VoltFormField', slug: 'form-field' },
      { name: 'VoltAlert', slug: 'alert' },
      { name: 'VoltButton', slug: 'button' },
    ],
  },
  {
    slug: 'data-table',
    labelKey: 'recipes.items.dataTable',
    path: '/patterns/data-table',
    atoms: [
      { name: 'VoltTable', slug: 'table' },
      { name: 'VoltPagination', slug: 'pagination' },
      { name: 'VoltInput', slug: 'input' },
      { name: 'VoltBadge', slug: 'badge' },
      { name: 'VoltSkeleton', slug: 'skeleton' },
      { name: 'VoltAlert', slug: 'alert' },
    ],
  },
];

/** The workflow recipes built with the component whose docs slug is `componentSlug`. */
export function workflowRecipesFor(componentSlug: string): readonly WorkflowRecipe[] {
  return WORKFLOW_RECIPES.filter(recipe => recipe.atoms.some(atom => atom.slug === componentSlug));
}
