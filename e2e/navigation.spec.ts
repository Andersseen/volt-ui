import { expect, test } from '@playwright/test';

test.describe('Site navigation', () => {
  test('connects the main desktop journeys without a full reload', async ({ page }) => {
    await page.goto('/');
    const navigation = page.locator('header').getByRole('navigation');

    await navigation.getByRole('link', { name: 'Docs' }).click();
    await expect(page).toHaveURL(/\/docs\/introduction$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await navigation.getByRole('link', { name: 'Components' }).click();
    await expect(page).toHaveURL(/\/docs\/components$/);

    await navigation.getByRole('link', { name: 'Create Theme' }).click();
    await expect(page).toHaveURL(/\/create-theme$/);
    await expect(page.getByRole('heading', { name: 'Design your system.' })).toBeVisible();
  });

  test('opens, closes and navigates through the mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Open menu' }).click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('link', { name: 'Components' }).click();

    await expect(page).toHaveURL(/\/docs\/components$/);
    await expect(dialog).toBeHidden();
  });
});
