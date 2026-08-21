import { describe, expect, it } from 'vitest';
import {
  BLOCK_CATEGORIES,
  BLOCK_GROUPS,
  BLOCKS,
  blockBySlug,
  categoryFor,
} from './blocks-metadata';

describe('blocks catalog', () => {
  it('derives each path from the slug, so navigation and routes cannot drift apart', () => {
    for (const block of BLOCKS) {
      expect(block.path).toBe(`/docs/blocks/${block.slug}`);
    }
  });

  it('has a unique slug per block', () => {
    expect(new Set(BLOCKS.map(block => block.slug)).size).toBe(BLOCKS.length);
  });

  it('files every block under a category that exists', () => {
    const ids = new Set(BLOCK_CATEGORIES.map(category => category.id));

    for (const block of BLOCKS) {
      expect(ids.has(block.category)).toBe(true);
      expect(categoryFor(block).id).toBe(block.category);
    }
  });

  it('groups every block, so none can be published without a way to reach it', () => {
    const grouped = BLOCK_GROUPS.flatMap(group => group.blocks);

    expect(grouped).toHaveLength(BLOCKS.length);
    expect(new Set(grouped.map(block => block.slug)).size).toBe(BLOCKS.length);
  });

  it('never renders a heading with nothing under it', () => {
    for (const group of BLOCK_GROUPS) {
      expect(group.blocks.length).toBeGreaterThan(0);
    }
  });

  it('keeps the page-section groups in the order a page is assembled', () => {
    const headings = BLOCK_GROUPS.map(group => group.headingKey);
    const footer = headings.indexOf('blocks.categories.footer.label');

    // Hero to footer, top to bottom, the way you would build the page.
    expect(headings[0]).toBe('blocks.categories.hero.label');
    expect(headings.indexOf('blocks.categories.features.label')).toBeGreaterThan(0);
    expect(footer).toBeGreaterThan(headings.indexOf('blocks.categories.cta.label'));
  });

  it('keeps whole-page categories after the sections that make up a page', () => {
    const headings = BLOCK_GROUPS.map(group => group.headingKey);
    const footer = headings.indexOf('blocks.categories.footer.label');

    // Neither a login nor a dashboard is a section of a landing page, so neither belongs
    // in that sequence.
    const wholeScreens = ['blocks.categories.auth.label', 'blocks.categories.app.label'] as const;

    for (const wholeScreen of wholeScreens) {
      expect(headings.indexOf(wholeScreen)).toBeGreaterThan(footer);
    }
  });

  it('mirrors the layouts that have a finished counterpart', () => {
    // The pair is the clearest statement of what the two galleries are for: the same
    // subject, once as a skeleton and once as something you would ship.
    for (const slug of ['login', 'dashboard']) {
      expect(BLOCKS.some(block => block.slug === slug)).toBe(true);
    }
  });

  it('points every atom at a component docs page', () => {
    for (const block of BLOCKS) {
      expect(block.atoms.length).toBeGreaterThan(0);
      for (const atom of block.atoms) {
        expect(atom.path).toMatch(/^\/docs\/components\/[a-z-]+$/);
      }
    }
  });

  it('fails loudly on an unknown slug rather than rendering a blank page', () => {
    expect(() => blockBySlug('does-not-exist')).toThrow(/unknown block/i);
  });

  it('fails loudly on a block filed under a category nobody declared', () => {
    expect(() => categoryFor({ ...BLOCKS[0], category: 'not-a-category' })).toThrow(
      /unknown category/i
    );
  });
});
