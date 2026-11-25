import { describe, expect, it } from 'vitest';
import { scope } from './ci-scope.mjs';

describe('CI scope of a pull request', () => {
  it('a Recipes-only change runs Recipes, not the docs site or the library jobs', () => {
    expect(scope(['apps/recipes/src/app/blocks/hero/hero.ts', 'e2e/recipes/gallery.spec.ts'])).toEqual(
      { core: false, web: false, recipes: true }
    );
  });

  it('a docs-site-only change runs the docs site, not Recipes', () => {
    expect(scope(['apps/web/src/app/pages/index.page.ts', 'e2e/home.spec.ts'])).toEqual({
      core: false,
      web: true,
      recipes: false,
    });
  });

  it('touching both apps runs both', () => {
    expect(scope(['apps/web/src/main.ts', 'apps/recipes/src/main.ts'])).toEqual({
      core: false,
      web: true,
      recipes: true,
    });
  });

  it('the library, shared code, the CLI, dependencies or workflows run everything', () => {
    for (const file of [
      'packages/volt/src/lib/components/button/button.ts',
      'packages/shared/components/code-panel.ts',
      'cli/bin/volt',
      'pnpm-lock.yaml',
      'package.json',
      '.github/workflows/ci.yml',
      'e2e/contracts/catalog.spec.ts',
      'stories/components/button.stories.ts',
    ]) {
      expect(scope([file]), file).toEqual({ core: true, web: true, recipes: true });
    }
  });

  it('Markdown and specs alone run neither app', () => {
    expect(scope(['README.md', 'specs/v2/SDD.md', 'docs/headless-backends.md'])).toEqual({
      core: false,
      web: false,
      recipes: false,
    });
  });

  it('an unknown path never skips a check', () => {
    expect(scope(['some/new/place.ts'])).toEqual({ core: true, web: true, recipes: true });
  });
});
