import { expect, test, type Page } from '@playwright/test';
import { load } from './helpers';

/*
 * Select and Combobox inside the overlays a form lives in. The list is a layer of its own: Escape
 * and an outside click close the list, not the overlay around it; focus returns to the control;
 * one pick is one value change; touched waits until focus leaves the control; aria-controls and
 * aria-activedescendant never point at a list that is gone.
 */

const state = (page: Page) => page.locator('#state');

/**
 * ARIA references that point at nothing. `aria-controls` on a collapsed control may name a popup
 * that is not rendered (APG; axe accepts it with aria-expanded="false"); an expanded control's
 * `aria-controls`, and any `aria-activedescendant`, must resolve. Polled by the callers: the list
 * leaves the DOM one frame before the input's bindings catch up.
 */
async function danglingRefs(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const attr of ['aria-controls', 'aria-activedescendant']) {
      for (const el of document.querySelectorAll(`[${attr}]`)) {
        if (attr === 'aria-controls' && el.getAttribute('aria-expanded') !== 'true') continue;
        const ref = el.getAttribute(attr);
        if (ref && !document.getElementById(ref)) out.push(`${attr}="${ref}"`);
      }
    }
    return out;
  });
}

test.describe('select and combobox inside overlays', () => {
  test.beforeEach(async ({ page }) => load(page, 'overlay-forms'));

  test.afterEach(async ({ page }) => {
    expect((page as Page & { __errors?: string[] }).__errors ?? []).toEqual([]);
  });

  test('dialog → select: Escape closes the list only, a pick is one change, touched on leave', async ({
    page,
  }) => {
    const opener = page.getByRole('button', { name: 'Open form dialog' });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Form dialog' });
    await expect(dialog).toBeVisible();
    const trigger = page.getByRole('combobox', { name: 'Dialog fruit' });

    for (let cycle = 0; cycle < 2; cycle++) {
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('listbox')).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('listbox')).toBeHidden();
      await expect(dialog).toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect.poll(() => danglingRefs(page)).toEqual([]);
    }
    await expect(state(page)).toHaveText(/^apple\|false\|false\|0\|/);

    // ArrowDown skips the disabled option; Enter picks; focus returns to the trigger.
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(state(page)).toHaveText(/^cherry\|false\|true\|1\|/);

    // Up to here focus never left the field (the trigger or its own list): still untouched.
    await expect(state(page)).toHaveText(/^cherry\|false\|true\|1\|/);

    // An outside click inside the dialog closes the list, not the dialog. Focus moves to the
    // dialog, so the reader has left the field: touched, without another value change.
    await trigger.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('heading', { name: 'Form dialog' }).click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(trigger).not.toBeFocused();
    await expect(state(page)).toHaveText(/^cherry\|true\|true\|1\|/);
    await expect.poll(() => danglingRefs(page)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('dialog → combobox: typing filters without committing, Escape closes the list only', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open form dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Form dialog' });
    const input = page.getByRole('combobox', { name: 'Dialog framework' });
    await input.click();
    await input.fill('v');
    await expect(page.getByRole('option', { name: 'Vue' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Angular' })).toBeHidden();
    // Typing is not a commit.
    await expect(state(page)).toHaveText(/\|none\|false\|0\|/);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(input).toBeFocused();
    await expect.poll(() => danglingRefs(page)).toEqual([]);

    await input.fill('re');
    await page.keyboard.press('ArrowDown');
    const active = await input.getAttribute('aria-activedescendant');
    if (active) await expect(page.locator(`[id="${active}"]`)).toHaveText(/React/);
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('React');
    await expect(state(page)).toHaveText(/\|React\|false\|1\|/);
    await expect(dialog).toBeVisible();
    await expect.poll(() => danglingRefs(page)).toEqual([]);

    await page.locator('#dialog-done').focus();
    await expect(state(page)).toHaveText(/\|React\|true\|1\|/);
    await page.locator('#dialog-done').click();
    await expect(dialog).toBeHidden();
  });

  test('drawer → select: the list opens above the drawer, Escape closes only the list', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open form drawer' }).click();
    const drawer = page.getByRole('dialog', { name: 'Form drawer' });
    const trigger = page.getByRole('combobox', { name: 'Drawer fruit' });
    await trigger.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(listbox).toBeHidden();
    await expect(drawer).toBeVisible();
    await expect(state(page)).toHaveText(/^cherry\|false\|true\|1\|/);

    await trigger.click();
    await expect(listbox).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('popover → select: picking an option keeps the popover open', async ({ page }) => {
    await page.getByRole('button', { name: 'Open form popover' }).click();
    const trigger = page.getByRole('combobox', { name: 'Popover fruit' });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText(/cherry/i);
    await expect(state(page)).toHaveText(/^cherry\|false\|true\|1\|/);
  });

  test('select in a scrolling panel: the list sits against the trigger and picks', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Scrolled fruit' });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const t = (await trigger.boundingBox())!;
    const l = (await listbox.boundingBox())!;
    expect(Math.abs(l.x - t.x)).toBeLessThan(24);
    expect(
      Math.min(Math.abs(l.y - (t.y + t.height)), Math.abs(t.y - (l.y + l.height)))
    ).toBeLessThan(24);
    await page.getByRole('option', { name: 'Pear' }).click();
    await expect(listbox).toBeHidden();
    await expect(state(page)).toHaveText(/\|pear$/);
  });
});
