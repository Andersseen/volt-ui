import { fileURLToPath } from 'node:url';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { etymaRemoteContract, etymaRemoteValidation } from '@etyma/tooling/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { catalogUrl, I18N_PROJECT } from './shared/i18n/project.ts';
import { CATALOG } from './apps/recipes/src/app/lib/catalog.ts';
import { legacyRouteRules } from './shared/legacy-redirects.ts';
import {
  freshRouteTablePlugin,
  noMarkdownDepsPlugin,
  rawTypeScriptPlugin,
  serverModeChunksPlugin,
} from './shared/vite-plugins.ts';

/** This config's directory (the package is ESM, so there is no `__dirname`). */
const ROOT = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(() => ({
  // Expose PUBLIC_* env vars to import.meta.env (not a Vite default prefix).
  envPrefix: ['VITE_', 'PUBLIC_'],
  ssr: {
    noExternal: ['@analogjs/router', '@etyma/analog', '@etyma/angular', '@etyma/core'],
  },
  plugins: [
    freshRouteTablePlugin(),
    noMarkdownDepsPlugin(),
    serverModeChunksPlugin(),
    rawTypeScriptPlugin(),
    // Both read shared/i18n/project.ts, so the contract and the validation can never be pointed
    // at different catalogs.
    etymaRemoteContract({
      source: catalogUrl(I18N_PROJECT.sourceLocale),
      output: resolve(ROOT, 'shared/i18n/etyma.generated.ts'),
    }),
    // Every published locale through Etyma's validator: missing keys, invalid MessageFormat 2 and
    // variable mismatches fail `vite build` (and only warn in `vite dev`).
    etymaRemoteValidation({
      remote: I18N_PROJECT.remote,
      locales: I18N_PROJECT.locales,
      sourceLocale: I18N_PROJECT.sourceLocale,
    }),
    tailwindcss(),
    analog({
      ssr: true,
      nitro: {
        preset: 'cloudflare-pages',
        // Blocks, layouts and recipes live at https://recipes.voltui.dev now; every old URL
        // redirects there permanently. See shared/legacy-redirects.ts and docs/recipes-app.md.
        routeRules: legacyRouteRules({
          locales: I18N_PROJECT.locales,
          sourceLocale: I18N_PROJECT.sourceLocale,
          entries: CATALOG,
        }),
        externals: {
          inline: ['@analogjs/router'],
        },
      },
    }),
  ],
  resolve: {
    dedupe: ['@analogjs/router'],
    alias: {
      volt: resolve(ROOT, 'projects/volt/src/public-api.ts'),
      '@shared': resolve(ROOT, 'shared'),
    },
  },
}));
