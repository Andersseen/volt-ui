import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { etymaRemoteContract, etymaRemoteValidation } from '@etyma/tooling/vite';
import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { catalogUrl, I18N_PROJECT } from './src/app/i18n/project';

/**
 * Ensures that ?raw imports of TypeScript files are always served as raw
 * string content (export default "..."), preventing the Angular compiler
 * plugin from transforming them into compiled Angular modules.
 * Uses enforce: 'post' to run AFTER the analog Angular plugin's transform,
 * which otherwise strips ?raw and processes the file through Angular's compiler.
 */
function rawTypeScriptPlugin(): Plugin {
  return {
    name: 'raw-typescript-fix',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('.ts') && id.includes('?raw')) {
        const filePath = id.split('?')[0];
        try {
          const rawContent = readFileSync(filePath, 'utf-8');
          return {
            code: `export default ${JSON.stringify(rawContent)}`,
            map: null,
          };
        } catch {
          return null;
        }
      }
    },
  };
}

/**
 * Makes Angular's browser-only hooks actually browser-only in the server bundle.
 *
 * `afterNextRender`/`afterEveryRender` return early when `ngServerMode` is truthy, and Angular
 * 21 compiled that guard into internal chunks (`_effect-chunk2.mjs`, `_debug_node-chunk.mjs`,
 * `_dom_renderer-chunk.mjs`, …). Analog's own `serverModePlugin` rewrites `ngServerMode` only in
 * files named `core.mjs` and `platform-server.mjs`, so in the Cloudflare worker those chunks see
 * an undefined global and *run browser hooks on the server* — `window is not defined` from every
 * component that correctly puts its `window` access inside `afterNextRender`.
 *
 * Mirrors Analog's approach for the remaining `@angular/*` chunks. Server build only.
 */
function serverModeChunksPlugin(): Plugin {
  return {
    name: 'volt-server-mode-chunks',
    enforce: 'pre',
    transform(code, id, options) {
      if (
        options?.ssr &&
        /node_modules\/@angular\/(core|common|forms|platform-browser)\/fesm2022\/[^/]+\.mjs$/.test(
          id
        ) &&
        /\bngServerMode\b/.test(code)
      ) {
        return { code: code.replace(/\bngServerMode\b/g, 'true'), map: null };
      }
      return null;
    },
  };
}

/**
 * Stops the browser caching a stale route table in dev.
 *
 * `@analogjs/router` builds the route table with `import.meta.glob`, so Vite inlines the
 * full list of page files into that module at transform time. Vite then serves it as a
 * dependency: `Cache-Control: max-age=31536000, immutable`, keyed by the optimizer's
 * `browserHash` — which is derived from the lockfile and the config, and therefore does
 * not change when a page file is added, moved or deleted.
 *
 * The result is a genuinely confusing failure: the file on disk is right, the server
 * serves the right thing, and an already-open tab keeps routing against the page list it
 * cached before the change, for a year. It survives restarting the dev server and a
 * normal reload; only a hard reload clears it. Anyone adding a page hits this, and the
 * error it produces — a 404 for a deleted `.page.ts`, reported as a MIME type complaint —
 * points nowhere near the cause.
 *
 * Dev only. Production builds resolve the routes at build time, where none of this
 * applies.
 */
function freshRouteTablePlugin(): Plugin {
  return {
    name: 'analog-route-table-no-cache',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('@analogjs/router')) {
          // Patch the setter rather than the header: Vite writes Cache-Control from
          // deeper in its own middleware stack, after this point.
          const setHeader = res.setHeader.bind(res);
          res.setHeader = (name: string, value: never) =>
            setHeader(name, name.toLowerCase() === 'cache-control' ? 'no-cache' : value);
        }

        next();
      });
    },
  };
}

export default defineConfig(() => ({
  // Expose PUBLIC_* env vars to import.meta.env (not a Vite default prefix).
  envPrefix: ['VITE_', 'PUBLIC_'],
  ssr: {
    noExternal: ['@analogjs/router', '@etyma/analog', '@etyma/angular', '@etyma/core'],
  },
  plugins: [
    freshRouteTablePlugin(),
    serverModeChunksPlugin(),
    rawTypeScriptPlugin(),
    // Both read src/app/i18n/project.ts, so the contract and the validation can never be pointed
    // at different catalogs.
    etymaRemoteContract({
      source: catalogUrl(I18N_PROJECT.sourceLocale),
      output: resolve(__dirname, 'src/app/i18n/etyma.generated.ts'),
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
        externals: {
          inline: ['@analogjs/router'],
        },
      },
    }),
  ],
  resolve: {
    dedupe: ['@analogjs/router'],
    alias: {
      volt: resolve(__dirname, 'projects/volt/src/public-api.ts'),
    },
  },
}));
