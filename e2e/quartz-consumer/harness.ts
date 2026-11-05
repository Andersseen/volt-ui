import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared by every spec in this folder. The four fixture apps are built from the packed tarball by
 * `scripts/check-quartz-consumer.mjs` (one template, `demo.ts`; only `backend.ts` differs).
 */
export const BACKENDS = [
  ['ng-primitives', process.env['E2E_PRIMITIVES_URL']],
  ['quartz', process.env['E2E_QUARTZ_URL']],
  ['ng-primitives (CLI copy)', process.env['E2E_PRIMITIVES_COPY_URL']],
  ['quartz (CLI copy)', process.env['E2E_QUARTZ_COPY_URL']],
] as const;

export async function open(page: Page, url: string) {
  const problems: string[] = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  await page.goto(url);
  await expect(page.getByRole('checkbox', { name: 'Accept terms' })).toBeVisible();
  return problems;
}

export const paint = (l: Locator) =>
  l.first().evaluate(el => {
    const s = getComputedStyle(el);
    return [
      s.backgroundColor,
      s.color,
      s.borderTopColor,
      s.borderTopWidth,
      s.boxShadow,
      s.opacity,
      s.cursor,
      s.width,
      s.height,
      s.borderRadius,
    ].join('|');
  });
