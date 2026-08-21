/**
 * The blocks catalog.
 *
 * A block is a whole page section — a hero, a pricing table, a footer — composed from
 * Volt components and copied into a project wholesale. It is deliberately not a library
 * export: the moment a section ships as a dependency, every product using it looks the
 * same and nobody can change the parts they need to change. `projects/volt/` stays the
 * component surface; this stays the arrangement of it.
 *
 * The catalog is grouped by the kind of section rather than by one flat "marketing"
 * heading, because that is how the need arrives — nobody goes looking for "a nice block",
 * they go looking for a hero. It also makes the gaps legible: an empty category is a
 * visible promise, which is why `UPCOMING_BLOCKS` sits next to this rather than in a
 * roadmap nobody opens.
 */
export interface BlockCategory {
  readonly id: string;
  readonly label: string;
  /** Shown once above the category, so the cards underneath do not each re-explain it. */
  readonly blurb: string;
}

export interface BlockMetadata {
  /** Route segment under `/docs/blocks/`. */
  readonly slug: string;
  readonly path: string;
  readonly label: string;
  readonly category: BlockCategory['id'];
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

/** Ordered the way a landing page is assembled, top to bottom. */
export const BLOCK_CATEGORIES: readonly BlockCategory[] = [
  {
    id: 'hero',
    label: 'Hero',
    blurb: 'The first screen. What the product is, and the one thing to do about it.',
  },
  {
    id: 'features',
    label: 'Features',
    blurb: 'What it does, arranged so the important one is visibly the important one.',
  },
  {
    id: 'services',
    label: 'Services',
    blurb: 'What you do for someone, when the product is a team rather than a download.',
  },
  {
    id: 'proof',
    label: 'Social proof',
    blurb: 'Other people saying it, which is the only version anyone believes.',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    blurb: 'Plans, the difference between them, and the one you would like picked.',
  },
  {
    id: 'contact',
    label: 'Contact',
    blurb: 'A form that works, next to the ways of reaching you that are not a form.',
  },
  {
    id: 'cta',
    label: 'Call to action',
    blurb: 'The last chance to convert someone who read the whole page.',
  },
  {
    id: 'footer',
    label: 'Footer',
    blurb: 'The sitemap, the legal bits, and the newsletter nobody scrolls back up for.',
  },
  {
    id: 'auth',
    label: 'Auth',
    blurb:
      'Screens where the page is the component. The layouts tab has the same ones stripped to their skeleton.',
  },
  {
    id: 'app',
    label: 'Application',
    blurb: 'The screens behind the login, with the work done rather than left as slots.',
  },
];

export const BLOCKS: readonly BlockMetadata[] = [
  {
    slug: 'hero',
    path: '/docs/blocks/hero',
    label: 'Hero Spotlight',
    category: 'hero',
    tagline: 'Centred opening with a spotlight that follows the pointer.',
    motion:
      'A radial spotlight tracks the pointer, two auroras drift behind the grid, the headline word shimmers, and the content rises in five steps at first paint.',
    atoms: [
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'hero-split',
    path: '/docs/blocks/hero-split',
    label: 'Hero Split',
    category: 'hero',
    tagline: 'Copy on the left, a live product panel on the right, tilted toward the reader.',
    motion:
      'The panel sits on a slight 3D tilt that straightens as the pointer approaches, and a status row ticks through states on its own.',
    atoms: [
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltProgress', path: '/docs/components/progress' },
    ],
  },
  {
    slug: 'bento',
    path: '/docs/blocks/bento',
    label: 'Feature Bento',
    category: 'features',
    tagline: 'Asymmetric grid where each card lights its own border under the cursor.',
    motion:
      'Each card carries a radial fill and a one-pixel gradient ring that follow the pointer inside that card, plus a lift on hover.',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltBadge', path: '/docs/components/badge' },
    ],
  },
  {
    slug: 'services',
    path: '/docs/blocks/services',
    label: 'Service List',
    category: 'services',
    tagline: 'Numbered rows that open as you point at them, instead of four equal cards.',
    motion:
      'The row under the pointer expands to reveal its detail and deliverables while the others recede, so the section reads as one thing at a time.',
    atoms: [
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltSeparator', path: '/docs/components/separator' },
    ],
  },
  {
    slug: 'testimonials',
    path: '/docs/blocks/testimonials',
    label: 'Testimonial Marquee',
    category: 'proof',
    tagline: 'Two rows of quotes sliding in opposite directions, pausing under the pointer.',
    motion:
      'Each row loops a duplicated list by exactly half its width, so the seam is invisible, and stops on hover or focus.',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'pricing',
    path: '/docs/blocks/pricing',
    label: 'Pricing Tiers',
    category: 'pricing',
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
    slug: 'contact',
    path: '/docs/blocks/contact',
    label: 'Contact Split',
    category: 'contact',
    tagline: 'A real form beside the ways of reaching you that are not a form.',
    motion:
      'Each field group grows an accent bar and brightens its label on focus, and submitting swaps the form for a confirmation in place, with focus moved onto it.',
    atoms: [
      { name: 'VoltInput', path: '/docs/components/input' },
      { name: 'VoltTextarea', path: '/docs/components/textarea' },
      { name: 'VoltSelect', path: '/docs/components/select' },
      { name: 'VoltButton', path: '/docs/components/button' },
    ],
  },
  {
    slug: 'cta',
    path: '/docs/blocks/cta',
    label: 'Magnetic CTA',
    category: 'cta',
    tagline: 'Closing panel with a rotating gradient border and a button that leans toward you.',
    motion:
      'A conic gradient spins around the panel edge, and the submit button is pulled toward the pointer while it is within 140px.',
    atoms: [
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltInput', path: '/docs/components/input' },
    ],
  },
  {
    slug: 'login',
    path: '/docs/blocks/login',
    label: 'Login Split',
    category: 'auth',
    tagline: 'A marketing panel beside the form — the shipped version of the login layout.',
    motion:
      'Two auroras drift behind the brand panel, and the copy and form rise in three steps at first paint. The panel itself is dropped, not stacked, once the section is too narrow for it.',
    atoms: [
      { name: 'VoltFormField', path: '/docs/components/form-field' },
      { name: 'VoltInput', path: '/docs/components/input' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'footer',
    path: '/docs/blocks/footer',
    label: 'Footer Sitemap',
    category: 'footer',
    tagline: 'Four link columns, a newsletter field, and a status line that is actually live.',
    motion:
      'Column links slide their underline out from the left on hover, and the status dot pulses on a slow loop.',
    atoms: [
      { name: 'VoltInput', path: '/docs/components/input' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltSeparator', path: '/docs/components/separator' },
    ],
  },
  {
    slug: 'dashboard',
    path: '/docs/blocks/dashboard',
    label: 'Dashboard',
    category: 'app',
    tagline: 'Branded shell, figures that count up, and a chart that draws itself.',
    motion:
      'The figures count to their value the first time the row is scrolled into view, once and never again, and the chart strokes itself on as it arrives. Both start finished under reduced motion.',
    atoms: [
      { name: 'VoltSidebar', path: '/docs/components/sidebar' },
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
];

/**
 * The catalog, grouped for navigation. Built from the categories rather than written out
 * again, so a block can never appear in the sidebar under a heading its page disagrees
 * with. Categories with nothing in them yet are dropped rather than rendered empty.
 */
export const BLOCK_GROUPS: readonly BlockGroup[] = BLOCK_CATEGORIES.map(category => ({
  heading: category.label,
  blocks: BLOCKS.filter(block => block.category === category.id),
})).filter(group => group.blocks.length > 0);

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
    label: 'Team',
    tagline: 'Portraits that swap for a role and a link when you point at them.',
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

/** The category a block belongs to, for the heading on its own page. */
export function categoryFor(block: BlockMetadata): BlockCategory {
  const category = BLOCK_CATEGORIES.find(entry => entry.id === block.category);

  if (!category) {
    throw new Error(`Block ${block.slug} claims unknown category: ${block.category}`);
  }

  return category;
}
