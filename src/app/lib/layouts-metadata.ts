/**
 * The layouts catalog.
 *
 * A layout is the arrangement, not the product. Where navigation lives, what the content
 * area is responsible for, which Volt components fit each slot — with styling kept to the
 * theme's own tokens so that dropping your screens in does not start with unpicking
 * someone else's decoration.
 *
 * That is the whole difference from a block, and it is worth being strict about it. A
 * block is a finished section you paste and ship; a layout is a skeleton you paste and
 * fill. The same subject can be both — see `login`, which exists here as a bare centred
 * form and could exist in the blocks gallery as a branded one — and the two should not
 * drift toward each other, because a layout with a brand on it is useless to everyone
 * whose brand is different.
 */
export interface LayoutMetadata {
  /** Route segment under `/docs/layouts/`. */
  readonly slug: string;
  readonly path: string;
  readonly label: string;
  readonly category: LayoutCategory['id'];
  /** One line for the sidebar and the gallery card. */
  readonly tagline: string;
  /** The arrangement in words, for the visitor deciding whether this is their shape. */
  readonly structure: string;
  /** Volt components the layout is assembled from, linked back to their own docs. */
  readonly atoms: readonly LayoutAtom[];
}

export interface LayoutAtom {
  readonly name: string;
  readonly path: string;
}

export interface LayoutCategory {
  readonly id: string;
  readonly label: string;
}

export const LAYOUT_CATEGORIES: readonly LayoutCategory[] = [
  { id: 'shells', label: 'App shells' },
  { id: 'account', label: 'Account' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'auth', label: 'Auth' },
];

const atom = (name: string, slug: string): LayoutAtom => ({
  name,
  path: `/docs/components/${slug}`,
});

export const LAYOUTS: readonly LayoutMetadata[] = [
  {
    slug: 'admin-dashboard',
    path: '/docs/layouts/admin-dashboard',
    label: 'Admin Dashboard',
    category: 'shells',
    tagline: 'Collapsible sidebar, top bar, and a content area with stats and a table.',
    structure:
      'A sidebar that collapses to icons, a top bar carrying the collapse control and a breadcrumb, and a scrolling content area. The stat row and table are there to show what the content area is for — they are the part you replace.',
    atoms: [
      atom('VoltSidebar', 'sidebar'),
      atom('VoltCard', 'card'),
      atom('VoltTable', 'table'),
      atom('VoltAvatar', 'avatar'),
      atom('VoltBadge', 'badge'),
    ],
  },
  {
    slug: 'top-nav',
    path: '/docs/layouts/top-nav',
    label: 'Top Navigation',
    category: 'shells',
    tagline: 'Horizontal navigation instead of a sidebar, for apps with few sections.',
    structure:
      'A full-width header holding the brand, the primary navigation and the account menu, over a centred content column. The shape to reach for when the sections fit on one line.',
    atoms: [
      atom('VoltNavigationMenu', 'navigation-menu'),
      atom('VoltAvatar', 'avatar'),
      atom('VoltCard', 'card'),
      atom('VoltButton', 'button'),
    ],
  },
  {
    slug: 'analytics',
    path: '/docs/layouts/analytics',
    label: 'Analytics',
    category: 'shells',
    tagline: 'A metrics page: filter bar, KPI row, and panels sized by importance.',
    structure:
      'A filter bar pinned above a KPI row, then a grid where the panels are deliberately unequal — the chart is worth more space than the list beside it.',
    atoms: [
      atom('VoltCard', 'card'),
      atom('VoltSelect', 'select'),
      atom('VoltTabs', 'tabs'),
      atom('VoltProgress', 'progress'),
    ],
  },
  {
    slug: 'sidebar',
    path: '/docs/layouts/sidebar',
    label: 'Sidebar',
    category: 'shells',
    tagline: 'The sidebar component itself: API, collapse behaviour and width control.',
    structure:
      'Unlike the rest of this tab, this documents a component that ships in the library rather than an arrangement you copy. The layouts above are built on it.',
    atoms: [atom('VoltSidebar', 'sidebar'), atom('VoltAvatar', 'avatar')],
  },
  {
    slug: 'settings',
    path: '/docs/layouts/settings',
    label: 'Settings',
    category: 'account',
    tagline: 'Section navigation beside a form column, the shape every settings page has.',
    structure:
      'A narrow list of sections on the left and one form column on the right, with each group separated rather than boxed. Scales to more sections without redesigning anything.',
    atoms: [
      atom('VoltInput', 'input'),
      atom('VoltSwitch', 'switch'),
      atom('VoltSelect', 'select'),
      atom('VoltSeparator', 'separator'),
    ],
  },
  {
    slug: 'profile',
    path: '/docs/layouts/profile',
    label: 'Profile',
    category: 'account',
    tagline: 'An identity header over tabbed detail panels.',
    structure:
      'A header carrying who this is and the actions you can take on them, then tabs for the detail. The header stays put while the tabs change what is underneath.',
    atoms: [
      atom('VoltAvatar', 'avatar'),
      atom('VoltTabs', 'tabs'),
      atom('VoltCard', 'card'),
      atom('VoltBadge', 'badge'),
    ],
  },
  {
    slug: 'kanban',
    path: '/docs/layouts/kanban',
    label: 'Kanban Board',
    category: 'productivity',
    tagline: 'Columns that scroll horizontally with cards that scroll inside them.',
    structure:
      'The two-axis scrolling problem, solved: the board scrolls sideways, each column scrolls its own cards, and neither one steals the other gesture.',
    atoms: [atom('VoltCard', 'card'), atom('VoltAvatar', 'avatar'), atom('VoltBadge', 'badge')],
  },
  {
    slug: 'chat',
    path: '/docs/layouts/chat',
    label: 'Chat',
    category: 'productivity',
    tagline: 'A conversation list, a message thread, and a composer pinned to the bottom.',
    structure:
      'Three regions with different scroll behaviour: the list scrolls, the thread scrolls and starts at the bottom, and the composer never moves.',
    atoms: [
      atom('VoltAvatar', 'avatar'),
      atom('VoltInput', 'input'),
      atom('VoltButton', 'button'),
      atom('VoltBadge', 'badge'),
    ],
  },
  {
    slug: 'login',
    path: '/docs/layouts/login',
    label: 'Login',
    category: 'auth',
    tagline: 'A centred credential form with the fields wired to form-field.',
    structure:
      'One card, centred on both axes, with labels bound to their inputs and hints in the slot that announces them. Deliberately unbranded — the blocks gallery is where a login gets a face.',
    atoms: [
      atom('VoltFormField', 'form-field'),
      atom('VoltInput', 'input'),
      atom('VoltCheckbox', 'checkbox'),
      atom('VoltButton', 'button'),
    ],
  },
  {
    slug: 'sign-up',
    path: '/docs/layouts/sign-up',
    label: 'Sign Up',
    category: 'auth',
    tagline: 'Registration with validation slots and the terms checkbox that gates submit.',
    structure:
      'The login shape plus what registration adds: more fields, a place for per-field errors, and a submit that stays disabled until the terms are accepted.',
    atoms: [
      atom('VoltFormField', 'form-field'),
      atom('VoltInput', 'input'),
      atom('VoltCheckbox', 'checkbox'),
      atom('VoltButton', 'button'),
    ],
  },
];

export const LAYOUT_GROUPS = LAYOUT_CATEGORIES.map(category => ({
  heading: category.label,
  layouts: LAYOUTS.filter(layout => layout.category === category.id),
})).filter(group => group.layouts.length > 0);

/** See `blockBySlug`: throws, because the only callers write the slug next to the import. */
export function layoutBySlug(slug: string): LayoutMetadata {
  const layout = LAYOUTS.find(entry => entry.slug === slug);

  if (!layout) {
    throw new Error(`Unknown layout: ${slug}`);
  }

  return layout;
}
