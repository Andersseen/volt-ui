import { fileURLToPath } from 'node:url';
import analog from '@analogjs/platform';
import { doqPrerenderRoutes } from '@doqs/analog/config';
import { doqContent } from '@doqs/analog/content';
import { doqDeterministicMarkdown } from '@doqs/analog/vite';
import tailwindcss from '@tailwindcss/vite';
import { etymaRemoteContract, etymaRemoteValidation } from '@etyma/tooling/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { catalogUrl, I18N_PROJECT } from '../../packages/shared/i18n/project.ts';
import { CATALOG } from '../recipes/src/app/lib/catalog.ts';
import { legacyRouteRules } from '../../packages/shared/legacy-redirects.ts';
import { doqPaths } from './src/doq.paths.ts';
import {
  freshRouteTablePlugin,
  noMarkdownDepsPlugin,
  rawTypeScriptPlugin,
  serverModeChunksPlugin,
} from '../../packages/shared/vite-plugins.ts';

/**
 * Volt UI docs site (https://voltui.dev). `root` is `apps/web/`, so Analog's page glob, index.html,
 * src/main.ts and public/ are this app's own and its Nitro output lands in `dist/apps/web/analog/`;
 * `workspaceRoot` is the repository. Same shape as apps/recipes/vite.config.ts.
 */
const APP = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(APP, '../..');

export default defineConfig(() => ({
  root: APP,
  envDir: ROOT,
  // Expose PUBLIC_* env vars to import.meta.env (not a Vite default prefix).
  envPrefix: ['VITE_', 'PUBLIC_'],
  ssr: {
    noExternal: ['@analogjs/router', '@etyma/analog', '@etyma/angular', '@etyma/core'],
  },
  optimizeDeps: {
    // `@analogjs/content` (which Doqs renders through) imports `front-matter`, a CommonJS package pnpm
    // does not hoist; without this the dev server serves it raw and the app never bootstraps.
    include: ['@analogjs/content > front-matter'],
  },
  plugins: [
    freshRouteTablePlugin(),
    noMarkdownDepsPlugin(),
    serverModeChunksPlugin(),
    rawTypeScriptPlugin(),
    // Both read packages/shared/i18n/project.ts, so the contract and the validation can never be pointed
    // at different catalogs.
    etymaRemoteContract({
      source: catalogUrl(I18N_PROJECT.sourceLocale),
      output: resolve(ROOT, 'packages/shared/i18n/etyma.generated.ts'),
    }),
    // Every published locale through Etyma's validator: missing keys, invalid MessageFormat 2 and
    // variable mismatches fail `vite build` (and only warn in `vite dev`).
    etymaRemoteValidation({
      remote: I18N_PROJECT.remote,
      locales: I18N_PROJECT.locales,
      sourceLocale: I18N_PROJECT.sourceLocale,
    }),
    tailwindcss(),
    // The Markdown pages are written in src/authoring/docs* and resolved (::source, ::include) into
    // src/content/docs* before Analog reads them; `pnpm docs:content:check` keeps the committed
    // output in step in CI.
    doqContent({ config: 'apps/web/doq.content.json', cwd: ROOT }),
    // Renders Markdown one file at a time so heading ids (`usage-1`) do not differ between builds.
    doqDeterministicMarkdown(),
    analog({
      ssr: true,
      workspaceRoot: ROOT,
      // Required by Doqs for code blocks, tabs and demos.
      content: { highlighter: 'prism' },
      // The home page, as before, and every Markdown documentation page in every language. Not the
      // bare /docs index of each language: with `unmatched: 'continue'` it is the host's redirect.
      prerender: {
        routes: async () => [
          '/',
          ...doqPrerenderRoutes(doqPaths).filter(
            route => typeof route !== 'string' || !/^(\/[a-z]{2})?\/docs$/.test(route)
          ),
        ],
      },
      nitro: {
        preset: 'cloudflare-pages',
        // Blocks, layouts and recipes live at https://recipes.voltui.dev now; every old URL
        // redirects there permanently. See packages/shared/legacy-redirects.ts and docs/recipes-app.md.
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
      volt: resolve(ROOT, 'packages/volt/src/public-api.ts'),
      // The Doqs examples (apps/web/src/app/doqs/examples) are shown as source with `::source`, so they
      // import the package by the name a consumer writes; it is the same public entry point.
      '@voltui/components': resolve(ROOT, 'packages/volt/src/public-api.ts'),
      '@shared': resolve(ROOT, 'packages/shared'),
    },
  },
  build: {
    // Analog's Nitro step reads the client build from `<workspace>/dist/<root>/client`.
    outDir: resolve(ROOT, 'dist/apps/web/client'),
    emptyOutDir: true,
  },
  server: {
    fs: { allow: [ROOT] },
  },
}));
