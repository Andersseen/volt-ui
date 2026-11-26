import { describe, expect, it } from 'vitest';
import { RECIPES } from '../../../apps/recipes/src/app/lib/recipes-metadata';
import { WORKFLOW_RECIPES, workflowRecipesFor } from './workflow-recipes';

describe('workflow recipes', () => {
  it('mirror the Recipes catalog exactly (slug, label, path and atoms)', () => {
    for (const recipe of WORKFLOW_RECIPES) {
      const entry = RECIPES.find(r => r.slug === recipe.slug);
      expect(entry, recipe.slug).toBeDefined();
      expect({
        slug: entry!.slug,
        labelKey: entry!.labelKey,
        path: entry!.path,
        atoms: entry!.atoms.map(a => ({ name: a.name, path: a.path })),
      }).toEqual({
        slug: recipe.slug,
        labelKey: recipe.labelKey,
        path: recipe.path,
        atoms: recipe.atoms.map(a => ({ name: a.name, path: `/docs/components/${a.slug}` })),
      });
    }
  });

  it('finds the recipes that use a component', () => {
    expect(workflowRecipesFor('combobox').map(r => r.slug)).toEqual(['async-search']);
    expect(workflowRecipesFor('alert').map(r => r.slug)).toEqual([
      'settings-form',
      'async-search',
      'data-table',
    ]);
    expect(workflowRecipesFor('tooltip')).toEqual([]);
  });
});
