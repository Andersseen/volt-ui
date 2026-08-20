import { describe, expect, it } from 'vitest';
import { GALLERY_SECTIONS, sectionForUrl } from './gallery-sections';

describe('gallery sections', () => {
  it('keeps the published URLs, so no existing link had to move', () => {
    expect(GALLERY_SECTIONS.map(section => section.path)).toEqual([
      '/docs/blocks',
      '/docs/layouts',
    ]);
  });

  it('resolves a deep link to the tab that owns it', () => {
    expect(sectionForUrl('/docs/blocks/pricing').id).toBe('blocks');
    expect(sectionForUrl('/docs/layouts/kanban').id).toBe('layouts');
  });

  it('resolves each tab root to itself', () => {
    for (const section of GALLERY_SECTIONS) {
      expect(sectionForUrl(section.path).id).toBe(section.id);
    }
  });

  it('falls back to the first tab rather than rendering nothing', () => {
    expect(sectionForUrl('/docs/blocks-that-do-not-exist').id).toBe('blocks');
    expect(sectionForUrl('/somewhere/else').id).toBe('blocks');
  });

  it('gives every section a sidebar to render', () => {
    for (const section of GALLERY_SECTIONS) {
      expect(section.groups.length).toBeGreaterThan(0);
      for (const group of section.groups) {
        expect(group.links.length).toBeGreaterThan(0);
        for (const link of group.links) {
          expect(link.path.startsWith(section.path)).toBe(true);
        }
      }
    }
  });
});
