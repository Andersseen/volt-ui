import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';
import { BLOCK_GROUPS } from './blocks-metadata';
import { LAYOUT_GROUPS } from './layouts-metadata';

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
  /** Tab label, and the root the tab links to. */
  readonly label: string;
  readonly path: string;
  /** Heading and blurb for the sidebar while this tab is active. */
  readonly title: string;
  readonly description: string;
  readonly browseLabel: string;
  readonly groups: readonly DocsSidebarGroup[];
}

export const GALLERY_SECTIONS: readonly GallerySection[] = [
  {
    id: 'blocks',
    label: 'Blocks',
    path: '/docs/blocks',
    title: 'Blocks',
    description: 'Animated page sections. Copy the source, keep the motion.',
    browseLabel: 'Browse Blocks',
    groups: [
      { links: [{ path: '/docs/blocks', label: 'Overview', exact: true }] },
      ...BLOCK_GROUPS.map(group => ({
        heading: group.heading,
        links: group.blocks.map(block => ({ path: block.path, label: block.label })),
      })),
    ],
  },
  {
    id: 'layouts',
    label: 'Layouts',
    path: '/docs/layouts',
    title: 'Layouts',
    description: 'Unbranded skeletons to fill with your screens.',
    browseLabel: 'Browse Layouts',
    groups: LAYOUT_GROUPS.map(group => ({
      heading: group.heading,
      links: group.layouts.map(layout => ({ path: layout.path, label: layout.label })),
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
