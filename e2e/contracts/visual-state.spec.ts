import { expect, test, type Locator } from '@playwright/test';
import { load, paint } from './helpers';

/**
 * Semantics are not enough: a 1.3.1 Toggle announced `aria-pressed` correctly while looking the
 * same pressed and unpressed. For every control whose visible state carries meaning, the on and
 * off states must differ in something a person can see. Computed styles, not pixels — the
 * assertion is that they differ, never what colour they are.
 */
test.describe('selected, pressed and checked states are visibly different', () => {
  test.beforeEach(async ({ page }) => load(page, 'visual'));

  async function differs(on: Locator, off: Locator) {
    const [a, b] = await Promise.all([paint(on), paint(off)]);
    expect(a, 'the on and off states paint identically').not.toBe(b);
  }

  test('toggle', async ({ page }) => {
    const on = page.getByRole('button', { name: 'Toggle on' });
    const off = page.getByRole('button', { name: 'Toggle off' });
    await expect(on).toHaveAttribute('aria-pressed', 'true');
    await expect(off).toHaveAttribute('aria-pressed', 'false');
    await differs(on, off);
    // And a click flips what is painted, not only what is announced.
    const before = await paint(off);
    await off.click();
    await page.mouse.move(2, 2);
    await expect(off).toHaveAttribute('aria-pressed', 'true');
    expect(await paint(off)).not.toBe(before);
  });

  test('toggle group item', async ({ page }) => {
    await differs(
      page.getByRole('radio', { name: 'Pressed' }),
      page.getByRole('radio', { name: 'Unpressed' })
    );
  });

  test('checkbox', async ({ page }) => {
    await differs(
      page.getByRole('checkbox', { name: 'Checked box' }),
      page.getByRole('checkbox', { name: 'Unchecked box' })
    );
  });

  test('switch', async ({ page }) => {
    await differs(
      page.getByRole('switch', { name: 'Switch on' }),
      page.getByRole('switch', { name: 'Switch off' })
    );
  });

  test('radio', async ({ page }) => {
    const on = page.getByRole('radio', { name: 'Radio on' });
    const off = page.getByRole('radio', { name: 'Radio off' });
    await expect(on).toHaveAttribute('aria-checked', 'true');
    await differs(on, off);
    // The dot inside is only displayed when checked.
    await expect(on.locator('[ngpradioindicator]')).toBeVisible();
    await expect(off.locator('[ngpradioindicator]')).toBeHidden();
  });

  test('tab', async ({ page }) => {
    await differs(
      page.getByRole('tab', { name: 'Tab selected' }),
      page.getByRole('tab', { name: 'Tab other' })
    );
  });

  test('listbox option', async ({ page }) => {
    await differs(
      page.getByRole('option', { name: 'Option selected' }),
      page.getByRole('option', { name: 'Option other' })
    );
  });
});
