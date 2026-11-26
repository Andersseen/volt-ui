import { defineConfig, devices } from '@playwright/test';

/**
 * The onboarding apps are built and served by scripts/check-consumer.mjs (outside the repository, from
 * the packed tarballs); this config only runs the browser checks against E2E_ONBOARDING_APPS.
 */
export default defineConfig({
  testDir: './e2e/consumer-onboarding',
  testMatch: /onboarding\.spec\.ts/,
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
