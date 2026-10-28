import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

/** This config's directory (the package is ESM, so there is no `__dirname`). */
const ROOT = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    angular({
      include: [
        'test-setup.ts',
        'apps/**/*.ts',
        'packages/shared/**/*.spec.ts',
        'packages/volt/src/**/*.spec.ts',
        'packages/volt/src/**/*.ts',
      ],
    }),
  ],
  resolve: {
    alias: {
      volt: resolve(ROOT, 'packages/volt/src/public-api.ts'),
      '@shared': resolve(ROOT, 'packages/shared'),
    },
  },
  test: {
    globals: true,
    // Vitest 5 persists transformed modules between runs. The Angular plugin keeps JIT inline styles in an
    // in-memory table filled while it transforms, so a cached component asks for a style id that no
    // longer exists ("Cannot find module virtual:angular:jit:style:inline") on every run after the first.
    fsModuleCache: false,
    // Vitest blanks every CSS import by default, `?raw` included. The theme presets are read as
    // text by packages/shared/lib/theme-presets.ts, so those files have to come through as written.
    css: { include: [/packages\/volt\/src\/themes\/((colors|styles)\/[\w-]+|core)\.css/] },
    environment: 'jsdom',
    // Every render loads three Etyma catalogs (~0.6s locally). On a shared CI runner running ~100
    // files in parallel that approaches the 5s default and fails the same few tests at random.
    // This bounds a hang, it does not relax any assertion.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    setupFiles: ['./test-setup.ts'],
    include: [
      'packages/shared/**/*.spec.ts',
      'apps/**/*.spec.ts',
      'packages/volt/src/**/*.spec.ts',
      'cli/**/*.spec.js',
    ],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: [
        'packages/volt/src/lib/**/*.ts',
        'apps/web/src/server/routes/mcp.ts',
        'cli/lib/**/*.js',
        'apps/web/src/app/components/**/*.ts',
        'packages/shared/components/**/*.ts',
        'packages/shared/services/**/*.ts',
        'apps/recipes/src/app/components/**/*.ts',
        'apps/web/src/app/services/**/*.ts',
        'apps/web/src/app/pages/index.page.ts',
        'apps/web/src/app/pages/create-theme.page.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '.angular/',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/variants.ts',
        'apps/web/src/app/lib/snippets/**',
      ],
      thresholds: {
        statements: 75,
        branches: 55,
        functions: 75,
        lines: 75,
      },
    },
  },
});
