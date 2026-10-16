import { fileURLToPath } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(root, '../..');

export default defineConfig({
  root,
  plugins: [tailwindcss(), angular({ tsconfig: resolve(root, 'tsconfig.json') })],
  resolve: {
    alias: {
      '@voltui/components/themes.css': resolve(repoRoot, 'dist/volt/themes.css'),
    },
  },
  build: {
    outDir: resolve(repoRoot, 'dist/consumer-cli-fixture'),
    emptyOutDir: true,
  },
});
