import { fileURLToPath } from 'node:url';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { etymaRemoteContract, etymaRemoteValidation } from '@etyma/tooling/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { catalogUrl, I18N_PROJECT } from '../../packages/shared/i18n/project.ts';
import {
  freshRouteTablePlugin,
  noMarkdownDepsPlugin,
  rawTypeScriptPlugin,
  serverModeChunksPlugin,
} from '../../packages/shared/vite-plugins.ts';

/**
 * Volt UI Recipes (https://recipes.voltui.dev).
 *
 * A second Analog application in the same workspace. `root` points Analog at `apps/recipes/`,
 * so the page glob, `index.html`, `src/main.ts` and `public/` are all this app's own, and
 * Analog's Nitro output lands in `dist/apps/recipes/analog/` — never in the Volt UI site's
 * `dist/apps/recipes/analog/`. `workspaceRoot` is the repository, which is what keeps `dist/` shared.
 *
 * The library and the theme tokens are not copied: `volt` and `@shared` resolve to the same
 * sources the docs site compiles.
 */
const APP = fileURLToPath(new URL('.', import.meta.url));
const REPO = resolve(APP, '../..');

export default defineConfig(() => ({
  root: APP,
  // Expose PUBLIC_* env vars to import.meta.env (not a Vite default prefix).
  envPrefix: ['VITE_', 'PUBLIC_'],
  // Read from the repository root, where the committed `.env` conventions live.
  envDir: REPO,
  ssr: {
    noExternal: ['@analogjs/router', '@etyma/analog', '@etyma/angular', '@etyma/core'],
  },
  plugins: [
    freshRouteTablePlugin(),
    noMarkdownDepsPlugin(),
    serverModeChunksPlugin(),
    rawTypeScriptPlugin(),
    // The same Glossa project as the docs site (see packages/shared/i18n/project.ts), so one contract file
    // serves both applications and neither can be built against a different catalog.
    etymaRemoteContract({
      source: catalogUrl(I18N_PROJECT.sourceLocale),
      output: resolve(REPO, 'packages/shared/i18n/etyma.generated.ts'),
    }),
    etymaRemoteValidation({
      remote: I18N_PROJECT.remote,
      locales: I18N_PROJECT.locales,
      sourceLocale: I18N_PROJECT.sourceLocale,
    }),
    tailwindcss(),
    analog({
      ssr: true,
      workspaceRoot: REPO,
      nitro: {
        preset: 'cloudflare-pages',
        externals: {
          inline: ['@analogjs/router'],
        },
      },
    }),
  ],
  resolve: {
    dedupe: ['@analogjs/router'],
    alias: {
      volt: resolve(REPO, 'packages/volt/src/public-api.ts'),
      '@shared': resolve(REPO, 'packages/shared'),
    },
  },
  build: {
    // Analog's Nitro step reads the client build from `<workspace>/dist/<root>/client`.
    outDir: resolve(REPO, 'dist/apps/recipes/client'),
    emptyOutDir: true,
  },
  server: {
    fs: { allow: [REPO] },
  },
}));
