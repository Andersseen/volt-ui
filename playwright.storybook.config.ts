import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke tests for the static Storybook (`pnpm build:storybook` first). `STORYBOOK_URL` points the
 * tests at an already running Storybook (for example `pnpm storybook`) instead of serving the build.
 */
const external = process.env['STORYBOOK_URL'];
const port = Number(process.env['STORYBOOK_PORT'] ?? 6007);
const baseURL = external ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e/storybook',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: external
    ? undefined
    : {
        command: `node scripts/serve-static.mjs dist/storybook ${port}`,
        url: `${baseURL}/index.json`,
        reuseExistingServer: false,
      },
});
