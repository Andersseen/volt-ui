import type { StorybookConfig } from '@storybook/angular-vite';

/**
 * Storybook is the component reference for the public `volt` surface (see AGENTS.md "Storybook").
 * It renders the real library through the same `volt` path alias the docs app uses and loads the
 * docs app's own stylesheet, so there is no second copy of the Tailwind setup or the theme tokens.
 *
 * `@storybook/angular-vite` (not the webpack `@storybook/angular`) because the repo is already
 * Vite + Tailwind v4 + zoneless, and it reads signal inputs/outputs in-process: no Compodoc.
 */
const config: StorybookConfig = {
  framework: '@storybook/angular-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  staticDirs: ['./public'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: {
    disableTelemetry: true,
    builder: {
      name: '@storybook/builder-vite',
      options: { viteConfigPath: '.storybook/vite.config.ts' },
    },
  },
};

export default config;
