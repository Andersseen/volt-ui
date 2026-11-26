import { expect, test } from '../fixtures';

/**
 * The workflow patterns in a real browser, where jsdom's timing hides what users meet: when a
 * microtask runs relative to zoneless change detection, and what moves under the pointer between
 * press and release.
 */
test.describe('Settings form pattern', () => {
  test('an invalid Save with the mouse submits and focuses the first invalid field', async ({
    page,
  }) => {
    await page.goto('/patterns/settings-form');
    await page.waitForLoadState('networkidle');
    const form = page.locator('app-settings-form-recipe');
    const name = form.getByLabel('Name');

    await name.fill('');
    // Pressing Save takes the focus off the field; nothing may move under the pointer meanwhile.
    await form.getByRole('button', { name: 'Save changes' }).click();

    await expect(form.getByText('Enter your name.')).toBeVisible();
    await expect(name).toBeFocused();
  });

  test('a failed save keeps the input and a second Save retries', async ({ page }) => {
    await page.goto('/patterns/settings-form');
    await page.waitForLoadState('networkidle');
    const form = page.locator('app-settings-form-recipe');

    await form.getByLabel('Email').fill('ada@fail.test');
    await form.getByRole('button', { name: 'Save changes' }).click();
    await expect(form.getByText('Could not save your settings')).toBeVisible();
    await expect(form.getByLabel('Email')).toHaveValue('ada@fail.test');

    await form.getByLabel('Email').fill('ada@example.com');
    await form.getByRole('button', { name: 'Save changes' }).click();
    await expect(form.getByText('Settings saved')).toBeVisible();
  });
});
