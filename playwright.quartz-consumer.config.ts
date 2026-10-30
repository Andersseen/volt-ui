import { defineConfig, devices } from '@playwright/test';

/**
 * The two fixture apps built by `scripts/check-quartz-consumer.mjs` are already being served
 * (E2E_PRIMITIVES_URL / E2E_QUARTZ_URL); this config only runs the shared browser contract.
 */
export default defineConfig({
  testDir: './e2e/quartz-consumer',
  testMatch: /browser\.spec\.ts/,
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
