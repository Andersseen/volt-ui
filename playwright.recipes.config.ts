import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for Volt UI Recipes (apps/recipes), run against its own server.
 *
 * Mirrors playwright.config.ts for the docs site. `E2E_SERVER` picks the server:
 *   dev      vite dev server for the Recipes app (default)
 *   preview  `vite preview` of dist/apps/recipes/client
 *   wrangler the built Cloudflare worker (dist/apps/recipes/analog/public) — what ships
 */
const port = Number(process.env['E2E_PORT'] ?? 5175);
const baseURL = `http://127.0.0.1:${port}`;
const serverMode = process.env['E2E_SERVER'] ?? 'dev';
const webServerCommand =
  serverMode === 'wrangler'
    ? `pnpm exec wrangler pages dev --ip 127.0.0.1 --port ${port}`
    : serverMode === 'preview'
      ? `pnpm exec vite preview --config apps/recipes/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`
      : `pnpm exec vite --config apps/recipes/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`;

export default defineConfig({
  testDir: './e2e/recipes',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  outputDir: 'test-results/recipes',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: webServerCommand,
    // wrangler runs from the app's folder so its wrangler.toml (output dir, compatibility date) applies.
    cwd: serverMode === 'wrangler' ? 'apps/recipes' : undefined,
    url: baseURL,
    reuseExistingServer: process.env['PLAYWRIGHT_REUSE_SERVER'] === '1',
  },
});
