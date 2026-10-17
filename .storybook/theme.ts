import { create } from 'storybook/theming';

/** Minimal manager branding: name, logo and a link home. Nothing else about Storybook's UI is customised. */
export default create({
  base: 'light',
  brandTitle: 'Volt UI',
  brandUrl: 'https://voltui.dev',
  brandImage: './volt-logo.svg',
  brandTarget: '_blank',
});
