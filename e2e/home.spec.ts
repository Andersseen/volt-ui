import { test, expect } from '@playwright/test';

test.describe('Official landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('communicates the product and exposes the primary journeys', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Angular components you actually own.' })
    ).toBeVisible();
    await expect(page.getByText('npx @voltui/cli add button dialog form-field')).toBeVisible();
    await expect(page.getByText('Live components')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start building' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explore components' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Own the source' })).toBeVisible();
  });

  test('keeps the complete landing page inside a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    await expect(
      page.getByRole('heading', { name: 'Angular components you actually own.' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start building' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
