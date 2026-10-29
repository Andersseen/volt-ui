import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { LandingRecipes } from './landing-recipes';

describe('landing signpost to Volt UI Recipes', () => {
  it('links each kind of entry to its listing on the Recipes origin', async () => {
    await render(LandingRecipes);

    expect(
      screen.getByRole('heading', { name: 'Whole screens, ready to copy.' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blocks' })).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/blocks'
    );
    expect(screen.getByRole('link', { name: 'Layouts' })).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/layouts'
    );
    expect(screen.getByRole('link', { name: 'Recipes' })).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/recipes'
    );
    expect(screen.getByRole('link', { name: /Open Volt UI Recipes/ })).toHaveAttribute(
      'href',
      'https://recipes.voltui.dev/'
    );
  });
});
