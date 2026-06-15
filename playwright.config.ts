import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env['E2E_PORT'] ?? 5174);
const baseURL = `http://127.0.0.1:${port}`;
const serverMode = process.env['E2E_SERVER'] ?? 'dev';
const webServerCommand =
  serverMode === 'preview'
    ? `pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`
    : `pnpm dev -- --host 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: process.env['PLAYWRIGHT_REUSE_SERVER'] === '1',
  },
});
