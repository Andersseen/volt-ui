import { expect, test, type Page } from '@playwright/test';
import { focusRoving, load, TAB_SKIPS_BUTTONS } from './helpers';

/*
 * Focus ownership across nested composites, with real key presses against the built package.
 * Each composite owns the arrow keys and the tab stop of its own items: a toggle group or radio
 * group in a tab panel never moves or switches the outer tab, and the tab list keeps its own.
 */

const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true });
const radio = (page: Page, name: string) => page.getByRole('radio', { name, exact: true });

test.describe('nested composites', () => {
  test.beforeEach(async ({ page }) => load(page, 'nested-composites'));

  test.afterEach(async ({ page }) => {
    expect((page as Page & { __errors?: string[] }).__errors ?? []).toEqual([]);
  });

  test('every group in a panel is its own tab stop, next to the active tab', async ({ page }) => {
    await expect(tab(page, 'Photos')).toHaveAttribute('tabindex', '0');
    // Single group: the pressed item is the tab stop (APG radio group).
    await expect(radio(page, 'Three')).toHaveAttribute('tabindex', '0');
    await expect(radio(page, 'One')).toHaveAttribute('tabindex', '-1');
    // Multiple group: the first item.
    await expect(page.getByRole('button', { name: 'Mono' })).toHaveAttribute('tabindex', '0');
  });

  test('Tab walks tab list → groups → out; Shift+Tab walks back', async ({ page, browserName }) => {
    test.skip(browserName === TAB_SKIPS_BUTTONS, 'Safari does not Tab to buttons by default');
    await page.locator('#before').focus();
    await page.keyboard.press('Tab');
    await expect(tab(page, 'Photos')).toBeFocused();
    // ng-primitives makes the active panel itself focusable; Quartz does too only when empty.
    await page.keyboard.press('Tab');
    if (!(await radio(page, 'Three').evaluate(el => el === document.activeElement))) {
      await expect(page.getByRole('tabpanel', { name: 'Photos' })).toBeFocused();
      await page.keyboard.press('Tab');
    }
    await expect(radio(page, 'Three')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Mono' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(radio(page, 'Three')).toBeFocused();
  });

  test('arrows stay inside the toggle group, skip disabled, and never switch the tab', async ({
    page,
  }) => {
    await focusRoving(radio(page, 'Three'));
    for (const [key, name] of [
      ['ArrowRight', 'Four'],
      ['ArrowRight', 'One'],
      ['ArrowRight', 'Three'], // Two is disabled
      ['ArrowLeft', 'One'],
      ['End', 'Four'],
      ['Home', 'One'],
    ] as const) {
      await page.keyboard.press(key);
      await expect(radio(page, name), `${key} → ${name}`).toBeFocused();
    }
    await expect(tab(page, 'Photos')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Photos')).toHaveAttribute('tabindex', '0');
    // Arrowing a single group moves focus only.
    await expect(page.locator('#gallery-state')).toHaveText('photos|three|');

    await page.keyboard.press('Space');
    await expect(radio(page, 'One')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.locator('#gallery-state')).toHaveText('photos|four|');
  });

  test('arrows in the tab list move between the tabs only, repeatedly', async ({ page }) => {
    await focusRoving(tab(page, 'Photos'));
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.keyboard.press('ArrowRight');
      await expect(tab(page, 'Videos')).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(tab(page, 'Files')).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(tab(page, 'Photos')).toBeFocused();
    }
    await expect(page.locator('#gallery-state')).toHaveText('photos|three|');
  });

  test('multiple group: arrows move between its buttons, Space presses', async ({ page }) => {
    const mono = page.getByRole('button', { name: 'Mono' });
    const warm = page.getByRole('button', { name: 'Warm' });
    await focusRoving(mono);
    await page.keyboard.press('ArrowRight');
    await expect(warm).toBeFocused();
    await page.keyboard.press('Space');
    await expect(warm).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('ArrowRight'); // wraps inside its own group
    await expect(mono).toBeFocused();
    await expect(page.locator('#gallery-state')).toHaveText('photos|three|warm');
  });

  test('a group mounted later is independent; a programmatic pick moves only the tab stop', async ({
    page,
  }) => {
    await page.locator('#toggle-size').click();
    const large = radio(page, 'Large');
    await expect(large).toHaveAttribute('tabindex', '0');
    await focusRoving(large);
    await page.keyboard.press('ArrowRight');
    await expect(radio(page, 'Small')).toBeFocused();
    await expect(radio(page, 'Three')).toHaveAttribute('tabindex', '0');

    await page.locator('#pick-four').click();
    await expect(radio(page, 'Four')).toHaveAttribute('tabindex', '0');
    await expect(radio(page, 'Three')).toHaveAttribute('tabindex', '-1');
    // The pick moves the tab stop, never focus (Safari does not focus a clicked button at all).
    await expect(radio(page, 'Four')).not.toBeFocused();

    await page.locator('#toggle-size').click();
    await expect(radio(page, 'Large')).toHaveCount(0);
    await focusRoving(radio(page, 'Four'));
    await page.keyboard.press('ArrowRight');
    await expect(radio(page, 'One')).toBeFocused();
  });

  test('vertical tabs and a radio group with Forms: each owns its axis', async ({ page }) => {
    const pro = radio(page, 'Pro');
    await expect(pro).toHaveAttribute('tabindex', '0');
    await expect(page.locator('#plan-state')).toHaveText('pro|false|false');
    await focusRoving(pro);
    await page.keyboard.press('ArrowDown');
    await expect(radio(page, 'Team')).toBeFocused();
    await expect(radio(page, 'Team')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(radio(page, 'Free')).toBeFocused();
    await expect(page.locator('#plan-state')).toHaveText('free|false|true');
    await expect(tab(page, 'Plan')).toHaveAttribute('aria-selected', 'true');

    // The toolbar in the same panel is a separate tab stop with its own arrows.
    const compare = page.getByRole('button', { name: 'Compare' });
    await focusRoving(compare);
    await expect(page.locator('#plan-state')).toHaveText('free|true|true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Upgrade' })).toBeFocused();

    await focusRoving(tab(page, 'Plan'));
    await page.keyboard.press('ArrowDown');
    await expect(tab(page, 'Layout')).toBeFocused();
    await expect(tab(page, 'Layout')).toHaveAttribute('aria-selected', 'true');
    const cosy = radio(page, 'Cosy');
    await expect(cosy).toHaveAttribute('tabindex', '0');
    await focusRoving(cosy);
    await page.keyboard.press('ArrowDown');
    await expect(radio(page, 'Roomy')).toBeFocused();
    await page.keyboard.press('ArrowRight'); // the other axis: ignored by a vertical group
    await expect(radio(page, 'Roomy')).toBeFocused();
    await expect(tab(page, 'Layout')).toHaveAttribute('aria-selected', 'true');
  });

  test('a tabset in a tab panel: each tab list owns its arrows', async ({ page }) => {
    await expect(tab(page, 'Outer A')).toHaveAttribute('tabindex', '0');
    await expect(tab(page, 'Inner X')).toHaveAttribute('tabindex', '0');
    await focusRoving(tab(page, 'Inner X'));
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 'Inner Y')).toBeFocused();
    await expect(page.locator('#nested-state')).toHaveText('a|y');
    await focusRoving(tab(page, 'Outer A'));
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 'Outer B')).toBeFocused();
    await expect(page.locator('#nested-state')).toHaveText('b|y');
  });

  test('right to left: ArrowLeft moves forward in a group inside a panel', async ({ page }) => {
    await focusRoving(radio(page, 'Alpha'));
    await page.keyboard.press('ArrowLeft');
    await expect(radio(page, 'Beta')).toBeFocused();
    await expect(tab(page, 'First')).toHaveAttribute('aria-selected', 'true');
    await focusRoving(tab(page, 'First'));
    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, 'Second')).toBeFocused();
  });

  test('ids are unique and every ARIA reference resolves', async ({ page }) => {
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dupes.length) out.push(`duplicate ids: ${dupes.join(', ')}`);
      for (const attr of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
        for (const el of document.querySelectorAll(`[${attr}]`)) {
          for (const ref of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
            if (!document.getElementById(ref)) out.push(`${attr}="${ref}" dangles`);
          }
        }
      }
      return out;
    });
    expect(problems).toEqual([]);
  });
});
