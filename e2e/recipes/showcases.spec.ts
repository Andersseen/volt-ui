import { expect, test } from '../fixtures';

/**
 * The six interactive showcases, in a real browser: what jsdom cannot prove — that the
 * scroll story really stacks (and really does not when it should not), that nothing traps the
 * page, and that the playground and explorer work through a hydrated page.
 */
test.describe('Scroll story', () => {
  const steps = (page: import('@playwright/test').Page) => page.locator('app-scroll-story li.step');
  const positions = (page: import('@playwright/test').Page) =>
    steps(page).evaluateAll(els => els.map(el => getComputedStyle(el).position));

  test('stacks its cards with native sticky positioning on a wide screen', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/blocks/scroll-story');
    await page.waitForLoadState('networkidle');

    expect(await positions(page)).toEqual(['sticky', 'sticky', 'sticky', 'sticky']);

    // Scrolling reaches the end of the page: nothing holds the scroll position.
    await steps(page).last().scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  });

  test('falls back to an ordinary list on a phone', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/blocks/scroll-story');
    await page.waitForLoadState('networkidle');

    expect(await positions(page)).toEqual(['static', 'static', 'static', 'static']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      376
    );
  });

  test('falls back to an ordinary list under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/blocks/scroll-story');
    await page.waitForLoadState('networkidle');

    expect(await positions(page)).toEqual(['static', 'static', 'static', 'static']);
  });

  test('keeps story order for assistive technology and the keyboard', async ({ page }) => {
    await page.goto('/blocks/scroll-story');
    await expect(page.locator('app-scroll-story ol > li')).toHaveCount(4);
    await expect(page.locator('app-scroll-story h3').first()).toContainText('Describe the outcome');
  });
});

test.describe('Live playground', () => {
  test('a control change reaches both the preview and the generated code', async ({ page }) => {
    await page.goto('/recipes/live-playground');
    await page.waitForLoadState('networkidle');

    await page.getByRole('radio', { name: 'success' }).click();
    await expect(page.locator('app-live-playground volt-alert')).toHaveAttribute(
      'data-variant',
      'success'
    );
    await expect(page.getByLabel('Generated code')).toContainText('variant="success"');

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByLabel('Generated code')).toContainText('variant="info"');
  });

  test('copies the code on screen', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
    await page.goto('/recipes/live-playground');
    await page.waitForLoadState('networkidle');

    await page.getByRole('radio', { name: 'warning' }).click();
    await page.locator('app-live-playground').getByRole('button', { name: 'Copy code' }).click();

    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await page.getByLabel('Generated code').innerText()
    );
  });
});

test.describe('Component explorer', () => {
  test('variant and state controls drive the real component', async ({ page }) => {
    await page.goto('/recipes/component-explorer');
    await page.waitForLoadState('networkidle');

    await page.getByRole('radio', { name: 'destructive' }).click();
    await page.getByRole('radio', { name: 'disabled' }).click();

    const preview = page.locator('app-component-explorer volt-button button').first();
    await expect(preview).toBeDisabled();
    await expect(page.getByLabel('Usage code')).toContainText('variant="destructive" disabled');
  });

  test('arrow keys move through a control group', async ({ page }) => {
    await page.goto('/recipes/component-explorer');
    await page.waitForLoadState('networkidle');

    await page.getByRole('radio', { name: 'Button' }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');

    await expect(page.getByLabel('Usage code')).toContainText('volt-badge');
  });
});

test.describe('Block previews', () => {
  test('hero-product board is interactive after hydration', async ({ page }) => {
    await page.goto('/blocks/hero-product');
    await page.waitForLoadState('networkidle');

    await page.getByRole('switch', { name: 'Mark Ship the billing webhook as done' }).click();
    await expect(page.getByText('2 of 4 complete')).toBeVisible();
  });

  test('source-preview source and card change together', async ({ page }) => {
    await page.goto('/blocks/source-preview');
    await page.waitForLoadState('networkidle');

    await page.getByRole('radio', { name: 'Quota' }).click();
    await expect(page.getByLabel('Notice source')).toContainText("tone: 'warning'");
    await expect(page.locator('app-source-preview volt-alert-title')).toHaveText('Usage at 92%');
  });
});
