import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';
import { BLOCK_GROUPS } from './blocks-metadata';
import { LAYOUT_GROUPS } from './layouts-metadata';
import type { TranslationKey } from '../i18n/translations';

/**
 * The two halves of the gallery.
 *
 * Blocks and layouts used to be separate top-level destinations, which cost a navbar
 * slot each and asked the visitor to know the difference before they had seen either.
 * They are the same kind of thing — a finished composition of Volt components that you
 * copy whole — so they share one route group and one shell, and the distinction between
 * "a section of a marketing page" and "the shell of an application" is a tab.
 *
 * The URLs stay `/docs/blocks/*` and `/docs/layouts/*`: nothing published ever pointed
 * at a `/docs/gallery` prefix, and inventing one would break every existing link to buy
 * nothing.
 */
export interface GallerySection {
  readonly id: 'blocks' | 'layouts';
  readonly path: string;
  /*
   * Translation keys rather than text. The catalog is data, and data that carries English
   * strings can only ever be shown in English — keeping the key here is what lets the same
   * definition serve all three languages.
   */
  readonly labelKey: TranslationKey;
  readonly titleKey: TranslationKey;
  readonly descriptionKey: TranslationKey;
  readonly browseKey: TranslationKey;
  readonly groups: readonly DocsSidebarGroup[];
}

export const GALLERY_SECTIONS: readonly GallerySection[] = [
  {
    id: 'blocks',
    path: '/docs/blocks',
    labelKey: 'gallery.blocks.title',
    titleKey: 'gallery.blocks.title',
    descriptionKey: 'gallery.blocks.description',
    browseKey: 'gallery.blocks.browse',
    groups: [
      { links: [{ path: '/docs/blocks', labelKey: 'gallery.overview', exact: true }] },
      ...BLOCK_GROUPS.map(group => ({
        headingKey: group.headingKey,
        links: group.blocks.map(block => ({ path: block.path, labelKey: block.labelKey })),
      })),
    ],
  },
  {
    id: 'layouts',
    path: '/docs/layouts',
    labelKey: 'gallery.layouts.title',
    titleKey: 'gallery.layouts.title',
    descriptionKey: 'gallery.layouts.description',
    browseKey: 'gallery.layouts.browse',
    groups: LAYOUT_GROUPS.map(group => ({
      headingKey: group.headingKey,
      links: group.layouts.map(layout => ({ path: layout.path, labelKey: layout.labelKey })),
    })),
  },
];

/**
 * Which tab a URL belongs to.
 *
 * Falls back to blocks rather than throwing: the only way to get here with an unknown
 * URL is a route inside the gallery group that nobody added a tab for, and rendering the
 * first tab is a better failure than a blank page.
 */
export function sectionForUrl(url: string): GallerySection {
  return GALLERY_SECTIONS.find(section => url.startsWith(section.path)) ?? GALLERY_SECTIONS[0];
}
