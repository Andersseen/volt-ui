import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test';

/**
 * Evidence mode for the contract-evidence workflow (.github/workflows/contract-evidence.yml).
 *
 * With `EVIDENCE_DIR` set, a Playwright config writes a self-contained HTML report, the JSON
 * results `scripts/contract-evidence-summary.mjs` reads, and JUnit, all under
 * `$EVIDENCE_DIR/<suite>/`; failures keep their trace and screenshot. Retries are off: a flaky
 * result is evidence too, and a retry would turn it into a pass. Without the variable the config
 * keeps its normal behaviour (`fallback`).
 */
const dir = process.env['EVIDENCE_DIR'];

export const evidenceEnabled = Boolean(dir);

export function evidenceReporters(
  suite: string,
  fallback: PlaywrightTestConfig['reporter']
): PlaywrightTestConfig['reporter'] {
  if (!dir) return fallback;
  const out = `${dir}/${suite}`;
  const reporters: ReporterDescription[] = [
    ['list'],
    ['html', { open: 'never', outputFolder: `${out}/html` }],
    ['json', { outputFile: `${out}/results.json` }],
    ['junit', { outputFile: `${out}/junit.xml` }],
  ];
  if (process.env['GITHUB_ACTIONS']) reporters.unshift(['github']);
  return reporters;
}

/** `use` overrides in evidence mode: keep what explains a failure, nothing for passes. */
export const evidenceUse: PlaywrightTestConfig['use'] = dir
  ? { trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'off' }
  : {};

export const evidenceOutputDir = (suite: string) =>
  dir ? `${dir}/${suite}/test-results` : undefined;
