import { expect, test, type Page } from '@playwright/test';
import { load } from './helpers';

/*
 * Plan 04 (overlays): a form inside a dialog submits once per Enter or click, and nested layers —
 * dialog → dialog, drawer → dialog — close one at a time on Escape, each returning focus to the
 * control that opened it.
 */

const dialog = (page: Page, name: string) => page.getByRole('dialog', { name });

test.describe('nested overlays', () => {
  test.beforeEach(async ({ page }) => load(page, 'nested-overlays'));

  test.afterEach(async ({ page }) => {
    expect((page as Page & { __errors?: string[] }).__errors ?? []).toEqual([]);
  });

  test('a form in a dialog submits once per Enter and once per click', async ({ page }) => {
    await page.getByRole('button', { name: 'Open profile' }).click();
    const field = page.getByRole('textbox', { name: 'Display name' });
    await field.fill('Ada L.');
    await field.press('Enter');
    await expect(page.locator('#submits')).toHaveText('1');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.locator('#submits')).toHaveText('2');
    await expect(dialog(page, 'Profile')).toBeVisible();
  });

  test('dialog → dialog: Escape closes the top one and focus returns level by level', async ({
    page,
  }) => {
    const opener = page.getByRole('button', { name: 'Open profile' });
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'Profile')).toBeVisible();

    const nestedOpener = page.getByRole('button', { name: 'Delete account' });
    await nestedOpener.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'Delete account?')).toBeVisible();
    await expect(dialog(page, 'Delete account?')).toContainText('Keep account');
    await expect(page.getByRole('button', { name: 'Keep account' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog(page, 'Delete account?')).toHaveCount(0);
    await expect(dialog(page, 'Profile')).toBeVisible();
    await expect(nestedOpener).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog(page, 'Profile')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('drawer → dialog: Escape closes the dialog first, then the drawer', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Open settings drawer' });
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'Settings drawer')).toBeVisible();

    const reset = page.getByRole('button', { name: 'Reset settings' });
    await reset.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'Delete account?')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog(page, 'Delete account?')).toHaveCount(0);
    await expect(dialog(page, 'Settings drawer')).toBeVisible();
    await expect(reset).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog(page, 'Settings drawer')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('focus stays inside the top dialog while it is open', async ({ page }) => {
    await page.getByRole('button', { name: 'Open profile' }).click();
    await page.getByRole('button', { name: 'Delete account' }).click();
    await expect(page.getByRole('button', { name: 'Keep account' })).toBeFocused();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      await expect(
        page.locator(':focus').locator('xpath=ancestor-or-self::*[@role="dialog"]')
      ).toHaveAttribute('aria-labelledby', /.+/);
      expect(
        await page.evaluate(() => document.activeElement?.closest('[role="dialog"]')?.textContent)
      ).toContain('Delete account?');
    }
  });
});
