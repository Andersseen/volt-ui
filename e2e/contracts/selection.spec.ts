import { expect, test } from '@playwright/test';
import { load } from './helpers';

test.describe('select', () => {
  test.beforeEach(async ({ page }) => load(page, 'select'));

  test('opens, moves the active option, selects with Enter and returns focus to the trigger', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(listbox).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText('banana');
    await expect(page.locator('#log')).toHaveText('banana');
  });

  test('Escape closes without changing the value and returns focus', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText('apple');
    await expect(page.locator('#log')).toHaveText('');
  });

  test('the list is a portal positioned against the trigger inside the viewport', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const t = (await trigger.boundingBox())!;
    const l = (await listbox.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(l.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
    expect(l.y - (t.y + t.height)).toBeLessThan(24);
    expect(Math.abs(l.x - t.x)).toBeLessThan(24);
    expect(l.x + l.width).toBeLessThanOrEqual(viewport.width);
    expect(l.y + l.height).toBeLessThanOrEqual(viewport.height);
    // A portal: the list lives outside the component that opened it.
    expect(await listbox.evaluate(el => !!el.closest('app-select'))).toBe(false);
  });

  test('clicking outside closes it', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Fruit' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('listbox')).toBeHidden();
  });
});

test.describe('listbox', () => {
  test.beforeEach(async ({ page }) => load(page, 'listbox'));

  test('arrows move the active option, Enter selects it, the selection is visible', async ({
    page,
  }) => {
    const angular = page.getByRole('option', { name: 'Angular' });
    const react = page.getByRole('option', { name: 'React' });
    await expect(angular).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('listbox').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(react).toHaveAttribute('aria-selected', 'true');
    await expect(angular).toHaveAttribute('aria-selected', 'false');
  });
});

test.describe('combobox', () => {
  test.beforeEach(async ({ page }) => load(page, 'combobox'));

  test('local filtering narrows by label, ArrowDown + Enter selects, the input shows the label', async ({
    page,
  }) => {
    const input = page.getByRole('combobox', { name: 'Local' });
    await input.click();
    await expect(page.getByRole('option', { name: /^(Angular|React|Vue|Svelte)$/ })).toHaveCount(4);
    await input.fill('s');
    await expect(page.getByRole('option', { name: 'Svelte' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Angular' })).toBeHidden();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Svelte');
    await expect(page.locator('#local-value')).toHaveText('Svelte');
    await expect(page.getByRole('listbox')).toBeHidden();
  });

  test('Escape closes the list and restores the selected label', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Local' });
    await input.click();
    await page.getByRole('option', { name: 'React' }).click();
    await expect(input).toHaveValue('React');
    await input.fill('zzz');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
  });

  test('manual filtering: the app owns the results; Volt reports queries and renders them as given', async ({
    page,
  }) => {
    const input = page.getByRole('combobox', { name: 'Remote' });
    await input.click();
    await input.pressSequentially('zz');
    // The fake server returns ids 1 and 3 whatever was typed: neither label contains "zz", so a
    // second, local filter would leave this empty.
    await expect(page.getByRole('option', { name: 'Alan Turing' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Ada Lovelace' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Grace Hopper' })).toHaveCount(0);
    await expect(page.locator('#remote-queries')).toContainText('z|zz');

    await page.getByRole('option', { name: 'Ada Lovelace' }).click();
    await expect(input).toHaveValue('Ada Lovelace');
    await expect(page.locator('#remote-value')).toHaveText('Ada Lovelace');
  });

  test('manual filtering: loading is announced while the request is in flight', async ({
    page,
  }) => {
    const input = page.getByRole('combobox', { name: 'Remote' });
    await input.click();
    await input.pressSequentially('a');
    await expect(page.getByText('Searching…').first()).toBeVisible();
    await expect(page.getByRole('option', { name: 'Alan Turing' })).toBeVisible();
  });
});
