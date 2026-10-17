import { expect, test } from '@playwright/test';
import { load } from './helpers';

/**
 * The 1.3.0 class of failure, in a real browser: a literal initial value renders correctly and
 * then the component ignores every click. See projects/volt/src/lib/static-value.spec.ts.
 */
test.describe('a static initial value stays interactive', () => {
  test.beforeEach(async ({ page }) => load(page, 'static'));

  test('radio', async ({ page }) => {
    const a = page.getByRole('radio', { name: 'Radio A' });
    const b = page.getByRole('radio', { name: 'Radio B' });
    await expect(a).toHaveAttribute('aria-checked', 'true');
    await b.click();
    await expect(b).toHaveAttribute('aria-checked', 'true');
    await expect(a).toHaveAttribute('aria-checked', 'false');
  });

  test('toggle-group', async ({ page }) => {
    const a = page.getByRole('radio', { name: 'TG A' });
    const b = page.getByRole('radio', { name: 'TG B' });
    await expect(a).toHaveAttribute('aria-checked', 'true');
    await b.click();
    await expect(b).toHaveAttribute('aria-checked', 'true');
    await expect(a).toHaveAttribute('aria-checked', 'false');
  });

  test('slider', async ({ page }) => {
    const thumb = page.getByRole('slider', { name: 'Slider' });
    await expect(thumb).toHaveAttribute('aria-valuenow', '40');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '41');
  });

  test('range-slider', async ({ page }) => {
    const low = page.getByRole('slider', { name: 'Low' });
    const high = page.getByRole('slider', { name: 'High' });
    await expect(low).toHaveAttribute('aria-valuenow', '20');
    await expect(high).toHaveAttribute('aria-valuenow', '80');
    await low.focus();
    await page.keyboard.press('ArrowRight');
    await expect(low).toHaveAttribute('aria-valuenow', '21');
    await high.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(high).toHaveAttribute('aria-valuenow', '79');
  });

  test('listbox', async ({ page }) => {
    const a = page.getByRole('option', { name: 'LB A' });
    const b = page.getByRole('option', { name: 'LB B' });
    await expect(a).toHaveAttribute('aria-selected', 'true');
    await b.click();
    await expect(b).toHaveAttribute('aria-selected', 'true');
    await expect(a).toHaveAttribute('aria-selected', 'false');
  });

  test('tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Tab B' }).click();
    await expect(page.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Panel B')).toBeVisible();
    await expect(page.getByText('Panel A')).toBeHidden();
  });

  test('accordion', async ({ page }) => {
    const a = page.getByRole('button', { name: 'Acc A' });
    const b = page.getByRole('button', { name: 'Acc B' });
    await expect(a).toHaveAttribute('aria-expanded', 'true');
    await b.click();
    await expect(b).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Acc content B')).toBeVisible();
  });

  test('select', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Select' });
    await expect(trigger).toContainText('a');
    await trigger.click();
    await page.getByRole('option', { name: 'Sel B' }).click();
    await expect(trigger).toContainText('b');
  });

  test('combobox: the selected value does not hide the other options', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    await expect(input).toHaveValue('Angular');
    await input.click();
    await expect(page.getByRole('option', { name: /^(Angular|React|Vue)$/ })).toHaveCount(3);
    await page.getByRole('option', { name: 'Vue' }).click();
    await expect(input).toHaveValue('Vue');
  });

  test('checkbox, switch and toggle', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'Checkbox' });
    const sw = page.getByRole('switch', { name: 'Switch' });
    const toggle = page.getByRole('button', { name: 'Toggle', exact: true });
    await expect(checkbox).toBeChecked();
    await expect(sw).toBeChecked();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await checkbox.click();
    await sw.click();
    await toggle.click();
    await expect(checkbox).not.toBeChecked();
    await expect(sw).not.toBeChecked();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});
