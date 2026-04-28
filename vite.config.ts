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

export default defineConfig({
  ssr: {
    noExternal: ['@analogjs/router'],
  },
  plugins: [
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
    alias: {
      volt: resolve(__dirname, 'projects/volt/src/public-api.ts'),
    },
  },
});
