import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/**
 * Storybook's own Vite config. The repo-root `vite.config.ts` belongs to the AnalogJS docs app
 * (SSR, Etyma/Glossa catalogs, Cloudflare output); `main.ts` points Storybook here instead so a
 * Storybook build never needs the network and never inherits the docs app's plugins.
 * The Angular compiler plugin is added by `@storybook/angular-vite`.
 */
export default defineConfig({
  resolve: {
    // The same `volt` boundary as tsconfig.json `paths` and the docs app.
    alias: { volt: fileURLToPath(new URL('../packages/volt/src/public-api.ts', import.meta.url)) },
  },
  plugins: [tailwindcss()],
});
