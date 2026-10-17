import { expect, test } from '@playwright/test';
import { load, TAB_SKIPS_BUTTONS } from './helpers';

test.describe('dialog and drawer', () => {
  test.beforeEach(async ({ page }) => load(page, 'overlays'));

  for (const [name, trigger, title] of [
    ['dialog', 'Open dialog', 'Dialog title'],
    ['drawer', 'Open drawer', 'Drawer title'],
  ] as const) {
    test(`${name}: opens named by its title, moves focus inside, Escape closes and returns focus`, async ({
      page,
    }) => {
      const opener = page.getByRole('button', { name: trigger });
      await opener.click();
      const dialog = page.getByRole('dialog', { name: title });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test(`${name}: Tab stays inside while open`, async ({ page, browserName }) => {
      test.skip(browserName === TAB_SKIPS_BUTTONS, 'Safari does not Tab to buttons by default');
      await page.getByRole('button', { name: trigger }).click();
      const dialog = page.getByRole('dialog', { name: title });
      await expect(dialog).toBeVisible();
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
      }
    });

    test(`${name}: the close button closes it and focus returns to the trigger`, async ({
      page,
    }) => {
      const opener = page.getByRole('button', { name: trigger });
      await opener.click();
      await page.getByRole('button', { name: new RegExp(`Close ${name}`) }).click();
      await expect(page.getByRole('dialog', { name: title })).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test(`${name}: clicking outside dismisses it`, async ({ page }) => {
      await page.getByRole('button', { name: trigger }).click();
      const dialog = page.getByRole('dialog', { name: title });
      await expect(dialog).toBeVisible();
      await page.mouse.click(2, 2);
      await expect(dialog).toBeHidden();
    });
  }

  test('dialog: content is centred in the viewport', async ({ page }) => {
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const box = (await page.getByRole('dialog', { name: 'Dialog title' }).boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(8);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  });

  test('drawer: docks to the right edge', async ({ page }) => {
    await page.getByRole('button', { name: 'Open drawer' }).click();
    const box = (await page.getByRole('dialog', { name: 'Drawer title' }).boundingBox())!;
    const viewport = page.viewportSize()!;
    await expect
      .poll(async () => Math.round(box.x + box.width))
      .toBeGreaterThanOrEqual(viewport.width - 2);
  });
});

test.describe('popover', () => {
  test.beforeEach(async ({ page }) => load(page, 'overlays'));

  test('opens next to its trigger, Escape closes and returns focus, outside click dismisses', async ({
    page,
  }) => {
    const opener = page.getByRole('button', { name: 'Open popover' });
    await opener.click();
    const action = page.getByRole('button', { name: 'Popover action' });
    await expect(action).toBeVisible();

    const t = (await opener.boundingBox())!;
    const a = (await action.boundingBox())!;
    expect(Math.abs(a.y - (t.y + t.height))).toBeLessThan(60);

    await page.keyboard.press('Escape');
    await expect(action).toBeHidden();
    await expect(opener).toBeFocused();

    await opener.click();
    await expect(action).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(action).toBeHidden();
  });
});

test.describe('tooltip', () => {
  test.beforeEach(async ({ page }) => load(page, 'overlays'));

  test('shows on hover and on keyboard focus, hides on leave and on Escape', async ({
    page,
    browserName,
  }) => {
    const trigger = page.getByRole('button', { name: 'Hover for tip' });
    await trigger.hover();
    const tip = page.getByRole('tooltip');
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText('Helpful tip');
    await page.mouse.move(2, 300);
    await expect(tip).toBeHidden();

    // Safari does not Tab to buttons by default, so keyboard focus cannot be reached there.
    test.skip(browserName === TAB_SKIPS_BUTTONS, 'keyboard focus part needs Tab to reach buttons');
    await trigger.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
  });
});

test.describe('dropdown menu', () => {
  test.beforeEach(async ({ page }) => load(page, 'overlays'));

  test('Enter opens, arrows move between items, Enter picks and returns focus to the trigger', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.locator('#menu-picked')).toHaveText('settings');
    await expect(trigger).toBeFocused();
  });

  test('Escape closes without choosing and returns focus', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(page.locator('#menu-picked')).toHaveText('none');
    await expect(trigger).toBeFocused();
  });

  test('clicking outside closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.mouse.click(2, 300);
    await expect(page.getByRole('menu')).toBeHidden();
  });
});
