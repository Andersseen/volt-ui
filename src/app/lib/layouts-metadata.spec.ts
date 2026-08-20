import { describe, expect, it } from 'vitest';
import { LAYOUT_CATEGORIES, LAYOUT_GROUPS, LAYOUTS, layoutBySlug } from './layouts-metadata';

describe('layouts catalog', () => {
  it('derives each path from the slug, so navigation and routes cannot drift apart', () => {
    for (const layout of LAYOUTS) {
      expect(layout.path).toBe(`/docs/layouts/${layout.slug}`);
    }
  });

  it('has a unique slug per layout', () => {
    expect(new Set(LAYOUTS.map(layout => layout.slug)).size).toBe(LAYOUTS.length);
  });

  it('files every layout under a category that exists', () => {
    const ids = new Set(LAYOUT_CATEGORIES.map(category => category.id));

    for (const layout of LAYOUTS) {
      expect(ids.has(layout.category)).toBe(true);
    }
  });

  it('groups every layout, and never renders an empty heading', () => {
    const grouped = LAYOUT_GROUPS.flatMap(group => group.layouts);

    expect(grouped).toHaveLength(LAYOUTS.length);
    for (const group of LAYOUT_GROUPS) {
      expect(group.layouts.length).toBeGreaterThan(0);
    }
  });

  it('describes the arrangement, which is what a layout is chosen by', () => {
    for (const layout of LAYOUTS) {
      expect(layout.structure.length).toBeGreaterThan(40);
      expect(layout.atoms.length).toBeGreaterThan(0);
      for (const atom of layout.atoms) {
        expect(atom.path).toMatch(/^\/docs\/components\/[a-z-]+$/);
      }
    }
  });

  it('fails loudly on an unknown slug', () => {
    expect(() => layoutBySlug('does-not-exist')).toThrow(/unknown layout/i);
  });
});
