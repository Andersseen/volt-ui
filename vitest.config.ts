import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    angular({
      include: ['src/**/*.spec.ts', 'projects/volt/src/**/*.spec.ts', 'projects/volt/src/**/*.ts'],
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
    include: ['src/**/*.spec.ts', 'projects/volt/src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', '.angular/', '**/*.d.ts'],
    },
  },
});
