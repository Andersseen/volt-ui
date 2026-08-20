import { describe, expect, it } from 'vitest';
import { BLOCKS, BLOCK_GROUPS, blockBySlug } from './blocks-metadata';

describe('blocks catalog', () => {
  it('derives each path from the slug, so navigation and routes cannot drift apart', () => {
    for (const block of BLOCKS) {
      expect(block.path).toBe(`/docs/blocks/${block.slug}`);
    }
  });

  it('has a unique slug per block', () => {
    expect(new Set(BLOCKS.map(block => block.slug)).size).toBe(BLOCKS.length);
  });

  it('groups every block, so none can be published without a way to reach it', () => {
    const grouped = BLOCK_GROUPS.flatMap(group => group.blocks);

    expect(grouped).toHaveLength(BLOCKS.length);
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
});
