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
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.spec.ts', 'projects/volt/src/**/*.spec.ts', 'cli/**/*.spec.js'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: ['projects/volt/src/lib/**/*.ts', 'src/server/routes/mcp.ts', 'cli/lib/**/*.js'],
      exclude: [
        'node_modules/',
        'dist/',
        '.angular/',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/variants.ts',
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
