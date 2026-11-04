import { createRequire } from 'node:module';
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

  // 1.4.0: Toggle's classes skipped twMerge, so the base `data-[selected]:bg-primary/15` survived next
  // to `solid`'s `data-[selected]:bg-primary` and won: primary-foreground text on a 15% tint.
  for (const scheme of ['light', 'dark'] as const) {
    test(`toggle: every pressed variant meets WCAG AA text contrast (${scheme})`, async ({
      page,
    }) => {
      await page.evaluate(
        dark => document.documentElement.classList.toggle('dark', dark),
        scheme === 'dark'
      );
      await page.addStyleTag({
        content: '*, *::before, *::after { transition: none !important; }',
      });
      await page.addScriptTag({
        path: createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
      });
      const failures = await page.evaluate(async () => {
        const axe = (
          window as unknown as {
            axe: {
              run: (
                c: unknown,
                o: object
              ) => Promise<{
                violations: { nodes: { target: string[]; any: { message: string }[] }[] }[];
              }>;
            };
          }
        ).axe;
        const result = await axe.run(
          { include: [['[data-testid^="pressed-"]']] },
          { runOnly: { type: 'rule', values: ['color-contrast'] } }
        );
        return result.violations.flatMap(v =>
          v.nodes.map(n => `${n.target.join(' ')}: ${n.any[0]?.message}`)
        );
      });
      expect(failures).toEqual([]);
    });
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

  test('date picker: the selected day', async ({ page }) => {
    await page.goto('/contracts.html#date-picker');
    await page.reload();
    const days = page.locator('volt-date-picker-date-button:not([data-outside-month])');
    const selected = days.getByText('15', { exact: true });
    await expect(selected).toHaveAttribute('data-selected', '');
    await differs(selected, days.getByText('16', { exact: true }));
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
