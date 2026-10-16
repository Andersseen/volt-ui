import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    angular({
      include: [
        'test-setup.ts',
        'src/**/*.spec.ts',
        'projects/volt/src/**/*.spec.ts',
        'projects/volt/src/**/*.ts',
      ],
    }),
  ],
  resolve: {
    alias: {
      volt: resolve(__dirname, 'projects/volt/src/public-api.ts'),
    },
  },
  test: {
    globals: true,
    // Vitest blanks every CSS import by default, `?raw` included. The theme presets are read as
    // text by src/app/lib/theme-presets.ts, so those files have to come through as written.
    css: { include: [/projects\/volt\/src\/themes\/((colors|styles)\/[\w-]+|core)\.css/] },
    environment: 'jsdom',
    // Every render loads three Etyma catalogs (~0.6s locally). On a shared CI runner running ~100
    // files in parallel that approaches the 5s default and fails the same few tests at random.
    // This bounds a hang, it does not relax any assertion.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.spec.ts', 'projects/volt/src/**/*.spec.ts', 'cli/**/*.spec.js'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: [
        'projects/volt/src/lib/**/*.ts',
        'src/server/routes/mcp.ts',
        'cli/lib/**/*.js',
        'src/app/components/**/*.ts',
        'src/app/services/**/*.ts',
        'src/app/pages/index.page.ts',
        'src/app/pages/create-theme.page.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '.angular/',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/variants.ts',
        'src/app/lib/snippets/**',
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
