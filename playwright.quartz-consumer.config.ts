import { defineConfig, devices } from '@playwright/test';
import { evidenceOutputDir, evidenceReporters, evidenceUse } from './e2e/utils/evidence';

/**
 * The two fixture apps built by `scripts/check-quartz-consumer.mjs` are already being served
 * (E2E_PRIMITIVES_URL / E2E_QUARTZ_URL); this config only runs the shared browser contract.
 */
export default defineConfig({
  testDir: './e2e/quartz-consumer',
  testMatch: /(browser|forms-state|a11y-paint)\.spec\.ts/,
  outputDir: evidenceOutputDir(`quartz-consumer-${process.env['EVIDENCE_LABEL'] ?? 'local'}`),
  fullyParallel: true,
  retries: 0,
  reporter: evidenceReporters(
    `quartz-consumer-${process.env['EVIDENCE_LABEL'] ?? 'local'}`,
    process.env.CI ? [['github'], ['list']] : 'list'
  ),
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure', ...evidenceUse },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
