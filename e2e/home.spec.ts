import { test, expect } from '@playwright/test';

test.describe('Official landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('communicates the product and exposes the primary journeys', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Ship Angular interfaces from components you can own.' })
    ).toBeVisible();
    await expect(page.getByText('npx @voltui/cli add button dialog form-field')).toBeVisible();
    await expect(page.getByText('Release confidence')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start building' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse components' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Own the source' })).toBeVisible();
  });

  test('keeps the complete landing page inside a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    await expect(
      page.getByRole('heading', { name: 'Ship Angular interfaces from components you can own.' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start building' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // The scrollWidth check above cannot see content that overflows and is then
    // silently clipped by `overflow-hidden` on <main> — which is exactly how the
    // hero column used to run past the right edge on a phone. Assert the far edge
    // of the install command bar stays inside the viewport instead.
    const copyCommand = page.getByRole('button', { name: 'Copy install command' });
    const box = await copyCommand.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });

  test('centers a width-constrained component demo in its preview frame', async ({ page }) => {
    await page.goto('/docs/components/search');

    const frame = page.locator('.min-h-\\[400px\\]').first();
    const demo = frame.locator('volt-search');
    const frameBox = await frame.boundingBox();
    const demoBox = await demo.boundingBox();
    expect(frameBox).not.toBeNull();
    expect(demoBox).not.toBeNull();

    // Equal gutters either side: the demo constrains its own width (max-w-md), so
    // it must be centered by the preview container rather than pinned left.
    const leftGap = demoBox!.x - frameBox!.x;
    const rightGap = frameBox!.x + frameBox!.width - (demoBox!.x + demoBox!.width);
    expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(2);
  });
});
