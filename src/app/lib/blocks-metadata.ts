/**
 * The blocks catalog.
 *
 * A block is a whole page section — hero, pricing, closing call to action — composed from
 * Volt components and copied into a project wholesale. It is deliberately not a library
 * export: the moment a section ships as a dependency, every product using it looks the
 * same and nobody can change the parts they need to change. `projects/volt/` stays the
 * component surface; this stays the arrangement of it.
 */
export interface BlockMetadata {
  /** Route segment under `/docs/blocks/`. */
  readonly slug: string;
  readonly path: string;
  readonly label: string;
  /** One line for the gallery card. */
  readonly tagline: string;
  /** What actually moves, in the visitor's terms. Shown on the block's own page. */
  readonly motion: string;
  /** Volt components the block is built from, linked back to their own docs. */
  readonly atoms: readonly BlockAtom[];
}

export interface BlockAtom {
  readonly name: string;
  readonly path: string;
}

export interface BlockGroup {
  readonly heading: string;
  readonly blocks: readonly BlockMetadata[];
}

export const BLOCKS: readonly BlockMetadata[] = [
  {
    slug: 'hero',
    path: '/docs/blocks/hero',
    label: 'Hero Spotlight',
    tagline: 'Opening section with a spotlight that follows the pointer and a staggered entrance.',
    motion:
      'A radial spotlight tracks the pointer, two auroras drift behind the grid, the headline word shimmers, and the content rises in five steps at first paint.',
    atoms: [
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'bento',
    path: '/docs/blocks/bento',
    label: 'Feature Bento',
    tagline: 'Asymmetric feature grid where each card lights its own border under the cursor.',
    motion:
      'Each card carries a radial fill and a one-pixel gradient ring that follow the pointer inside that card, plus a lift on hover.',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltBadge', path: '/docs/components/badge' },
    ],
  },
  {
    slug: 'pricing',
    path: '/docs/blocks/pricing',
    label: 'Pricing Tiers',
    tagline: 'Three plans with an annual switch, animated prices and a scaled featured tier.',
    motion:
      'Switching the billing period replays the price entrance, the savings badge slides in, and the featured tier sits scaled above the row.',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltSwitch', path: '/docs/components/switch' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltBadge', path: '/docs/components/badge' },
    ],
  },
  {
    slug: 'testimonials',
    path: '/docs/blocks/testimonials',
    label: 'Testimonial Marquee',
    tagline: 'Two rows of quotes sliding in opposite directions, pausing under the pointer.',
    motion:
      'Each row loops a duplicated list by exactly half its width, so the seam is invisible, and stops on hover or focus.',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'cta',
    path: '/docs/blocks/cta',
    label: 'Magnetic CTA',
    tagline: 'Closing panel with a rotating gradient border and a button that leans toward you.',
    motion:
      'A conic gradient spins around the panel edge, and the submit button is pulled toward the pointer while it is within 140px.',
    atoms: [
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltInput', path: '/docs/components/input' },
    ],
  },
];

export const BLOCK_GROUPS: readonly BlockGroup[] = [{ heading: 'Marketing', blocks: BLOCKS }];

/**
 * Announced, not built. Kept here rather than in a roadmap page so the gallery can show
 * the shape of the set — a visitor deciding whether to adopt this wants to know what is
 * missing, and finding out later is worse than being told now.
 */
export const UPCOMING_BLOCKS: readonly { readonly label: string; readonly tagline: string }[] = [
  {
    label: 'Logo Cloud',
    tagline: 'Customer logos that settle into place as the section arrives.',
  },
  {
    label: 'FAQ',
    tagline: 'Accordion built on the accessible primitive, with a search field over it.',
  },
  {
    label: 'Stats',
    tagline: 'Figures that count up once, the first time they are scrolled into view.',
  },
  {
    label: 'Footer',
    tagline: 'Sitemap footer with a newsletter field and a theme switcher.',
  },
];

/**
 * Looks a block up by its route segment.
 *
 * Throws rather than returning `undefined`: the only callers are the block pages, whose
 * slugs are written next to their imports, so a miss is a typo the build should surface
 * rather than a case a template has to handle.
 */
export function blockBySlug(slug: string): BlockMetadata {
  const block = BLOCKS.find(entry => entry.slug === slug);

  if (!block) {
    throw new Error(`Unknown block: ${slug}`);
  }

  return block;
}
