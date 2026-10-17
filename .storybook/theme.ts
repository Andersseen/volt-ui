import { create } from 'storybook/theming';

/** Minimal manager branding: name, logo and a link home. Nothing else about Storybook's UI is customised. */
const brand = {
  brandTitle: 'Volt UI',
  brandUrl: 'https://voltui.dev',
  brandImage: './volt-logo.svg',
  brandTarget: '_blank',
} as const;

export const light = create({ base: 'light', ...brand });
export const dark = create({ base: 'dark', ...brand });
