import type { TranslationKey } from '../i18n/translations';

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
  readonly labelKey: TranslationKey;
  readonly category: LayoutCategory['id'];
  /** One line for the sidebar and the gallery card. */
  readonly taglineKey: TranslationKey;
  /** The arrangement in words, for the visitor deciding whether this is their shape. */
  readonly structureKey: TranslationKey;
  /** Volt components the layout is assembled from, linked back to their own docs. */
  readonly atoms: readonly LayoutAtom[];
}

export interface LayoutAtom {
  readonly name: string;
  readonly path: string;
}

export interface LayoutCategory {
  readonly id: string;
  readonly labelKey: TranslationKey;
}

export const LAYOUT_CATEGORIES: readonly LayoutCategory[] = [
  { id: 'shells', labelKey: 'layouts.categories.shells.label' },
  { id: 'account', labelKey: 'layouts.categories.account.label' },
  { id: 'productivity', labelKey: 'layouts.categories.productivity.label' },
  { id: 'auth', labelKey: 'layouts.categories.auth.label' },
];

const atom = (name: string, slug: string): LayoutAtom => ({
  name,
  path: `/docs/components/${slug}`,
});

export const LAYOUTS: readonly LayoutMetadata[] = [
  {
    slug: 'admin-dashboard',
    path: '/docs/layouts/admin-dashboard',
    labelKey: 'layouts.items.adminDashboard.label',
    category: 'shells',
    taglineKey: 'layouts.items.adminDashboard.tagline',
    structureKey: 'layouts.items.adminDashboard.structure',
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
    labelKey: 'layouts.items.topNav.label',
    category: 'shells',
    taglineKey: 'layouts.items.topNav.tagline',
    structureKey: 'layouts.items.topNav.structure',
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
    labelKey: 'layouts.items.analytics.label',
    category: 'shells',
    taglineKey: 'layouts.items.analytics.tagline',
    structureKey: 'layouts.items.analytics.structure',
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
    labelKey: 'layouts.items.sidebar.label',
    category: 'shells',
    taglineKey: 'layouts.items.sidebar.tagline',
    structureKey: 'layouts.items.sidebar.structure',
    atoms: [atom('VoltSidebar', 'sidebar'), atom('VoltAvatar', 'avatar')],
  },
  {
    slug: 'settings',
    path: '/docs/layouts/settings',
    labelKey: 'layouts.items.settings.label',
    category: 'account',
    taglineKey: 'layouts.items.settings.tagline',
    structureKey: 'layouts.items.settings.structure',
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
    labelKey: 'layouts.items.profile.label',
    category: 'account',
    taglineKey: 'layouts.items.profile.tagline',
    structureKey: 'layouts.items.profile.structure',
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
    labelKey: 'layouts.items.kanban.label',
    category: 'productivity',
    taglineKey: 'layouts.items.kanban.tagline',
    structureKey: 'layouts.items.kanban.structure',
    atoms: [atom('VoltCard', 'card'), atom('VoltAvatar', 'avatar'), atom('VoltBadge', 'badge')],
  },
  {
    slug: 'chat',
    path: '/docs/layouts/chat',
    labelKey: 'layouts.items.chat.label',
    category: 'productivity',
    taglineKey: 'layouts.items.chat.tagline',
    structureKey: 'layouts.items.chat.structure',
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
    labelKey: 'layouts.items.login.label',
    category: 'auth',
    taglineKey: 'layouts.items.login.tagline',
    structureKey: 'layouts.items.login.structure',
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
    labelKey: 'layouts.items.signUp.label',
    category: 'auth',
    taglineKey: 'layouts.items.signUp.tagline',
    structureKey: 'layouts.items.signUp.structure',
    atoms: [
      atom('VoltFormField', 'form-field'),
      atom('VoltInput', 'input'),
      atom('VoltCheckbox', 'checkbox'),
      atom('VoltButton', 'button'),
    ],
  },
];

export const LAYOUT_GROUPS = LAYOUT_CATEGORIES.map(category => ({
  headingKey: category.labelKey,
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
