import type { TranslationKey } from '../i18n/translations';

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
  readonly labelKey: TranslationKey;
  /** Shown once above the category, so the cards underneath do not each re-explain it. */
  readonly blurbKey: TranslationKey;
}

export interface BlockMetadata {
  /** Route segment under `/docs/blocks/`. */
  readonly slug: string;
  readonly path: string;
  readonly labelKey: TranslationKey;
  readonly category: BlockCategory['id'];
  /** One line for the gallery card. */
  readonly taglineKey: TranslationKey;
  /** What actually moves, in the visitor's terms. Shown on the block's own page. */
  readonly motionKey: TranslationKey;
  /** Volt components the block is built from, linked back to their own docs. */
  readonly atoms: readonly BlockAtom[];
}

export interface BlockAtom {
  readonly name: string;
  readonly path: string;
}

export interface BlockGroup {
  readonly headingKey: TranslationKey;
  readonly blocks: readonly BlockMetadata[];
}

/** Ordered the way a landing page is assembled, top to bottom. */
export const BLOCK_CATEGORIES: readonly BlockCategory[] = [
  {
    id: 'hero',
    labelKey: 'blocks.categories.hero.label',
    blurbKey: 'blocks.categories.hero.blurb',
  },
  {
    id: 'features',
    labelKey: 'blocks.categories.features.label',
    blurbKey: 'blocks.categories.features.blurb',
  },
  {
    id: 'services',
    labelKey: 'blocks.categories.services.label',
    blurbKey: 'blocks.categories.services.blurb',
  },
  {
    id: 'proof',
    labelKey: 'blocks.categories.proof.label',
    blurbKey: 'blocks.categories.proof.blurb',
  },
  {
    id: 'pricing',
    labelKey: 'blocks.categories.pricing.label',
    blurbKey: 'blocks.categories.pricing.blurb',
  },
  {
    id: 'contact',
    labelKey: 'blocks.categories.contact.label',
    blurbKey: 'blocks.categories.contact.blurb',
  },
  {
    id: 'cta',
    labelKey: 'blocks.categories.cta.label',
    blurbKey: 'blocks.categories.cta.blurb',
  },
  {
    id: 'footer',
    labelKey: 'blocks.categories.footer.label',
    blurbKey: 'blocks.categories.footer.blurb',
  },
  {
    id: 'auth',
    labelKey: 'blocks.categories.auth.label',
    blurbKey: 'blocks.categories.auth.blurb',
  },
  {
    id: 'app',
    labelKey: 'blocks.categories.app.label',
    blurbKey: 'blocks.categories.app.blurb',
  },
];

export const BLOCKS: readonly BlockMetadata[] = [
  {
    slug: 'hero',
    path: '/docs/blocks/hero',
    labelKey: 'blocks.items.hero.label',
    category: 'hero',
    taglineKey: 'blocks.items.hero.tagline',
    motionKey: 'blocks.items.hero.motion',
    atoms: [
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'hero-split',
    path: '/docs/blocks/hero-split',
    labelKey: 'blocks.items.heroSplit.label',
    category: 'hero',
    taglineKey: 'blocks.items.heroSplit.tagline',
    motionKey: 'blocks.items.heroSplit.motion',
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
    labelKey: 'blocks.items.bento.label',
    category: 'features',
    taglineKey: 'blocks.items.bento.tagline',
    motionKey: 'blocks.items.bento.motion',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltBadge', path: '/docs/components/badge' },
    ],
  },
  {
    slug: 'services',
    path: '/docs/blocks/services',
    labelKey: 'blocks.items.services.label',
    category: 'services',
    taglineKey: 'blocks.items.services.tagline',
    motionKey: 'blocks.items.services.motion',
    atoms: [
      { name: 'VoltBadge', path: '/docs/components/badge' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltSeparator', path: '/docs/components/separator' },
    ],
  },
  {
    slug: 'testimonials',
    path: '/docs/blocks/testimonials',
    labelKey: 'blocks.items.testimonials.label',
    category: 'proof',
    taglineKey: 'blocks.items.testimonials.tagline',
    motionKey: 'blocks.items.testimonials.motion',
    atoms: [
      { name: 'VoltCard', path: '/docs/components/card' },
      { name: 'VoltAvatar', path: '/docs/components/avatar' },
    ],
  },
  {
    slug: 'pricing',
    path: '/docs/blocks/pricing',
    labelKey: 'blocks.items.pricing.label',
    category: 'pricing',
    taglineKey: 'blocks.items.pricing.tagline',
    motionKey: 'blocks.items.pricing.motion',
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
    labelKey: 'blocks.items.contact.label',
    category: 'contact',
    taglineKey: 'blocks.items.contact.tagline',
    motionKey: 'blocks.items.contact.motion',
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
    labelKey: 'blocks.items.cta.label',
    category: 'cta',
    taglineKey: 'blocks.items.cta.tagline',
    motionKey: 'blocks.items.cta.motion',
    atoms: [
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltInput', path: '/docs/components/input' },
    ],
  },
  {
    slug: 'login',
    path: '/docs/blocks/login',
    labelKey: 'blocks.items.login.label',
    category: 'auth',
    taglineKey: 'blocks.items.login.tagline',
    motionKey: 'blocks.items.login.motion',
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
    labelKey: 'blocks.items.footer.label',
    category: 'footer',
    taglineKey: 'blocks.items.footer.tagline',
    motionKey: 'blocks.items.footer.motion',
    atoms: [
      { name: 'VoltInput', path: '/docs/components/input' },
      { name: 'VoltButton', path: '/docs/components/button' },
      { name: 'VoltSeparator', path: '/docs/components/separator' },
    ],
  },
  {
    slug: 'dashboard',
    path: '/docs/blocks/dashboard',
    labelKey: 'blocks.items.dashboard.label',
    category: 'app',
    taglineKey: 'blocks.items.dashboard.tagline',
    motionKey: 'blocks.items.dashboard.motion',
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
  headingKey: category.labelKey,
  blocks: BLOCKS.filter(block => block.category === category.id),
})).filter(group => group.blocks.length > 0);

/**
 * Announced, not built. Kept here rather than in a roadmap page so the gallery can show
 * the shape of the set — a visitor deciding whether to adopt this wants to know what is
 * missing, and finding out later is worse than being told now.
 */
export const UPCOMING_BLOCKS: readonly {
  readonly labelKey: TranslationKey;
  readonly taglineKey: TranslationKey;
}[] = [
  {
    labelKey: 'blocks.upcoming.logoCloud.label',
    taglineKey: 'blocks.upcoming.logoCloud.tagline',
  },
  {
    labelKey: 'blocks.upcoming.faq.label',
    taglineKey: 'blocks.upcoming.faq.tagline',
  },
  {
    labelKey: 'blocks.upcoming.stats.label',
    taglineKey: 'blocks.upcoming.stats.tagline',
  },
  {
    labelKey: 'blocks.upcoming.team.label',
    taglineKey: 'blocks.upcoming.team.tagline',
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
