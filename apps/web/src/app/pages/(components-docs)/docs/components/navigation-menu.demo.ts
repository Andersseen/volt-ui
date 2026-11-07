import type { VoltNavigationMenuLayout, VoltNavigationMenuVariant } from 'volt';

/**
 * Specimen data for the navigation menu showcase. The labels are part of the exhibit shown beside
 * its code (like every live demo in a code panel), and every path is a real docs route.
 */
export interface DemoLink {
  readonly label: string;
  readonly hint: string;
  readonly path: string;
}

export const NAV_VARIANTS: readonly VoltNavigationMenuVariant[] = [
  'subtle',
  'pill',
  'underline',
  'outline',
];

export const NAV_LAYOUTS: readonly VoltNavigationMenuLayout[] = ['inline', 'contained'];

export const GETTING_STARTED_LINKS: readonly DemoLink[] = [
  {
    label: 'Introduction',
    hint: 'What Volt UI is and how it is built.',
    path: '/docs/introduction',
  },
  { label: 'Themes', hint: 'Colour and style presets, dark mode.', path: '/docs/themes' },
  {
    label: 'Customization',
    hint: 'Tokens, density and your own presets.',
    path: '/docs/customization',
  },
];

export const COMPONENT_LINKS: readonly DemoLink[] = [
  {
    label: 'Button',
    hint: 'Actions and links styled as buttons.',
    path: '/docs/components/button',
  },
  {
    label: 'Date Picker',
    hint: 'Calendar for a date or a range.',
    path: '/docs/components/date-picker',
  },
  { label: 'Tabs', hint: 'Switch between views in place.', path: '/docs/components/tabs' },
  {
    label: 'Empty State',
    hint: 'A list or search with nothing to show.',
    path: '/docs/components/empty-state',
  },
];

/** The opening tag of the usage snippet, rewritten for the selected combination. */
export function usageFor(
  usage: string,
  variant: VoltNavigationMenuVariant,
  layout: VoltNavigationMenuLayout
): string {
  return usage.replace(
    /<volt-navigation-menu aria-label="Main" variant="[a-z]+" layout="[a-z]+">/,
    `<volt-navigation-menu aria-label="Main" variant="${variant}" layout="${layout}">`
  );
}
