import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

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

export default defineConfig({
  ssr: {
    noExternal: ['@analogjs/router'],
  },
  plugins: [
    freshRouteTablePlugin(),
    rawTypeScriptPlugin(),
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
});
