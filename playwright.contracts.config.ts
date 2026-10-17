import { defineConfig, devices } from '@playwright/test';

/**
 * Component behaviour contracts in real browsers — the things jsdom cannot prove: focus order,
 * keyboard navigation, pointer geometry, portals, drag and drop, computed styles.
 *
 * Deliberately small and fixture-driven (`e2e/consumer/src/contracts`), and run against the built
 * `@voltui/components` package rather than the library source. All three engines are defined;
 * pick one with `--project=firefox`.
 *
 *   pnpm test:e2e:contracts                         every engine
 *   pnpm test:e2e:contracts -- --project=chromium   one engine
 */
const port = Number(process.env['E2E_CONTRACTS_PORT'] ?? 5185);
// `E2E_CONTRACTS_URL` points the same tests at an already served build — the Angular compatibility
// check serves a project it built from the packed tarball (scripts/check-angular-compat.mjs).
const external = process.env['E2E_CONTRACTS_URL'];
const baseURL = external ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e/contracts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: external
    ? undefined
    : {
        command: `pnpm exec vite --config e2e/consumer/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`,
        url: `${baseURL}/contracts.html`,
        reuseExistingServer: process.env['PLAYWRIGHT_REUSE_SERVER'] === '1',
      },
});
