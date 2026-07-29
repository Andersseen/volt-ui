import { test, expect } from '@playwright/test';

test.describe('Theme studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-theme');
  });

  test('updates the generated theme while preserving the live preview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Design your system.' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Theme name' }).fill('Northern Lights');

    await expect(page.getByText(":root[data-color='northern-lights']")).toBeVisible();
    await expect(page.getByRole('heading', { name: 'northern-lights' })).toBeVisible();

    await page.getByRole('switch', { name: 'Dark' }).click();
    await expect(page.getByRole('switch', { name: 'Dark' })).toBeChecked();
  });

  test('fits the editor and preview within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
    await expect(page.getByRole('heading', { name: 'Live preview' })).toBeVisible();
  });
});
