import { expect, test } from '@playwright/test';
import { focusRoving, load } from './helpers';

test.describe('input otp', () => {
  test.beforeEach(async ({ page }) => load(page, 'otp'));

  test('typing fills slots in order, ignores characters that do not match, and completes at the length', async ({
    page,
  }) => {
    const input = page.getByRole('textbox', { name: 'One-time password' });
    await input.focus();
    await page.keyboard.type('12a3');
    await expect(page.locator('#otp-value')).toHaveText('123');
    await expect(page.locator('#otp-complete')).toHaveText('incomplete');

    const slots = page.locator('volt-input-otp-slot');
    await expect(slots.nth(0)).toContainText('1');
    await expect(slots.nth(2)).toContainText('3');
    // The slot to type into next is marked active.
    await expect(slots.nth(3)).toHaveAttribute('data-active', '');

    await page.keyboard.type('456');
    await expect(page.locator('#otp-value')).toHaveText('123456');
    await expect(page.locator('#otp-complete')).toHaveText('complete');
  });

  test('Backspace removes the last digit', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'One-time password' });
    await input.focus();
    await page.keyboard.type('1234');
    await page.keyboard.press('Backspace');
    await expect(page.locator('#otp-value')).toHaveText('123');
  });

  test('pasting a code fills the slots and truncates to the length', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const input = page.getByRole('textbox', { name: 'One-time password' });
    await input.focus();
    await page.evaluate(() => navigator.clipboard.writeText('98765432'));
    await page.keyboard.press('ControlOrMeta+V');
    await expect(page.locator('#otp-value')).toHaveText('987654');
    await expect(page.locator('#otp-complete')).toHaveText('complete');
  });

  test('a paste event fills the slots', async ({ page, browserName }) => {
    test.skip(
      browserName === 'firefox',
      'Firefox ignores clipboardData on a synthetic ClipboardEvent'
    );
    const input = page.getByRole('textbox', { name: 'One-time password' });
    await input.focus();
    await input.evaluate(el => {
      const data = new DataTransfer();
      data.setData('text/plain', '246810');
      el.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true })
      );
    });
    await expect(page.locator('#otp-value')).toHaveText('246810');
  });
});

test.describe('file upload', () => {
  test.beforeEach(async ({ page }) => load(page, 'file-upload'));

  test('dropping files reports them; the dropzone shows the drag-over state meanwhile', async ({
    page,
  }) => {
    const zone = page.locator('volt-file-dropzone');
    const data = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['hello'], 'notes.txt', { type: 'text/plain' }));
      dt.items.add(new File(['world'], 'plan.md', { type: 'text/markdown' }));
      return dt;
    });
    await zone.dispatchEvent('dragenter', { dataTransfer: data });
    await zone.dispatchEvent('dragover', { dataTransfer: data });
    await expect(zone).toHaveAttribute('data-dragover', '');
    await zone.dispatchEvent('drop', { dataTransfer: data });
    await expect(zone).not.toHaveAttribute('data-dragover', '');
    await expect(page.locator('#files')).toHaveText('notes.txt,plan.md');
  });

  test('the browse button opens the native file chooser and reports the choice', async ({
    page,
  }) => {
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Browse files' }).click();
    await (
      await chooser
    ).setFiles([{ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('a') }]);
    await expect(page.locator('#files')).toHaveText('a.txt');
  });
});

test.describe('date picker', () => {
  test.beforeEach(async ({ page }) => load(page, 'date-picker'));

  const day = (page: import('@playwright/test').Page, n: string) =>
    page
      .locator('volt-date-picker-date-button:not([data-outside-month])')
      .getByText(n, { exact: true });

  test('a static initial date is selected, and clicking another day moves the selection', async ({
    page,
  }) => {
    await expect(day(page, '15')).toHaveAttribute('data-selected', '');
    await day(page, '8').click();
    await expect(day(page, '8')).toHaveAttribute('data-selected', '');
    await expect(day(page, '15')).not.toHaveAttribute('data-selected', '');
    await expect(page.locator('#picked')).toHaveText('Wed Jul 08 2026');
  });

  test('a disabled date cannot be selected', async ({ page }) => {
    const twenty = day(page, '20');
    await expect(twenty).toHaveAttribute('data-disabled', '');
    await twenty.click({ force: true });
    await expect(twenty).not.toHaveAttribute('data-selected', '');
    await expect(day(page, '15')).toHaveAttribute('data-selected', '');
  });

  test('previous/next move the month and the label follows', async ({ page }) => {
    const label = page.locator('volt-date-picker-label');
    await expect(label).toHaveText('July 2026');
    await page.getByRole('button', { name: 'Next month' }).click();
    await expect(label).toHaveText('August 2026');
    await page.getByRole('button', { name: 'Previous month' }).click();
    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(label).toHaveText('June 2026');
  });

  test('keyboard: arrows move the focused day, PageDown moves a month, Enter selects', async ({
    page,
  }) => {
    await focusRoving(day(page, '15'));
    await page.keyboard.press('ArrowRight');
    await expect(day(page, '16')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(day(page, '23')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(day(page, '23')).toHaveAttribute('data-selected', '');

    await page.keyboard.press('PageDown');
    await expect(page.locator('volt-date-picker-label')).toHaveText('August 2026');
  });

  test('keyboard focus skips a disabled date', async ({ page }) => {
    // Keys move relative to the focused date, which is the calendar's one tab stop.
    await focusRoving(day(page, '15'));
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
    await expect(day(page, '19')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    // The 20th is unavailable: focus lands on the next enabled day instead.
    await expect(day(page, '21')).toBeFocused();
  });
});
