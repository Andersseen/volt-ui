import { expect, test } from '@playwright/test';
import { focusRoving, load, TAB_SKIPS_BUTTONS } from './helpers';

test.describe('radio group', () => {
  test.beforeEach(async ({ page }) => load(page, 'radio'));

  test('Tab enters on the checked radio, arrows move focus and selection, Tab leaves', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === TAB_SKIPS_BUTTONS, 'Safari does not Tab to buttons by default');
    await page.locator('#before').focus();
    await page.keyboard.press('Tab');
    const pro = page.getByRole('radio', { name: 'Pro' });
    await expect(pro).toBeFocused();
    await expect(pro).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('ArrowDown');
    const team = page.getByRole('radio', { name: 'Team' });
    await expect(team).toBeFocused();
    await expect(team).toHaveAttribute('aria-checked', 'true');
    await expect(pro).toHaveAttribute('aria-checked', 'false');

    // The group is one tab stop: the next Tab leaves it instead of walking the other radios.
    await page.keyboard.press('Tab');
    await expect(page.locator('#after')).toBeFocused();
  });

  test('arrows wrap around the group', async ({ page }) => {
    await focusRoving(page.getByRole('radio', { name: 'Pro' }));
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Team' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Free' })).toBeFocused();
    await expect(page.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('toggle group and toolbar', () => {
  test.beforeEach(async ({ page }) => load(page, 'toggle-toolbar'));

  test('toggle group: arrows move focus, Space/Enter selects, one item is pressed', async ({
    page,
  }) => {
    const left = page.getByRole('radio', { name: 'Left' });
    const centre = page.getByRole('radio', { name: 'Centre' });
    const right = page.getByRole('radio', { name: 'Right' });
    await expect(centre).toHaveAttribute('aria-checked', 'true');

    // The tab stop is the first item (not the pressed one): a known gap against the APG radio
    // pattern, tracked in specs/plans/reliability-dogfood-agent-dx.md.
    await focusRoving(left);
    await page.keyboard.press('ArrowRight');
    await expect(centre).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(right).toBeFocused();
    await page.keyboard.press('Space');
    await expect(right).toHaveAttribute('aria-checked', 'true');
    await expect(centre).toHaveAttribute('aria-checked', 'false');
    await expect(left).toHaveAttribute('aria-checked', 'false');
  });

  test('toolbar: the buttons are one tab stop, arrows and Home/End move between them', async ({
    page,
  }) => {
    const bold = page.getByRole('button', { name: 'Bold' });
    const italic = page.getByRole('button', { name: 'Italic' });
    const save = page.getByRole('button', { name: 'Save' });

    await focusRoving(bold);
    await page.keyboard.press('ArrowRight');
    await expect(italic).toBeFocused();
    await page.keyboard.press('End');
    await expect(save).toBeFocused();
    await page.keyboard.press('Home');
    await expect(bold).toBeFocused();

    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Enter');
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('tabs and accordion', () => {
  test.beforeEach(async ({ page }) => load(page, 'tabs-accordion'));

  test('tabs: arrows move focus, the panel follows, only the active panel is visible', async ({
    page,
  }) => {
    const one = page.getByRole('tab', { name: 'One' });
    const two = page.getByRole('tab', { name: 'Two' });
    const three = page.getByRole('tab', { name: 'Three' });
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveText('Panel one');

    await focusRoving(one);
    await page.keyboard.press('ArrowRight');
    await expect(two).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(two).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveText('Panel two');
    await expect(page.getByText('Panel one')).toBeHidden();

    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(three).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveText('Panel three');
  });

  test('tabs: the selected tab is the single tab stop and the panel is named by it', async ({
    page,
  }) => {
    await expect(page.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '0');
    await expect(page.getByRole('tab', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
    await expect(page.getByRole('tabpanel', { name: 'One' })).toBeVisible();
  });

  test('accordion: Enter and Space toggle, aria-expanded and visibility agree', async ({
    page,
  }) => {
    const q1 = page.getByRole('button', { name: 'Question one' });
    const q2 = page.getByRole('button', { name: 'Question two' });
    await expect(q1).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('Answer one')).toBeHidden();

    await q1.focus();
    await page.keyboard.press('Enter');
    await expect(q1).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Answer one')).toBeVisible();

    await q2.focus();
    await page.keyboard.press('Space');
    await expect(q2).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Answer two')).toBeVisible();
  });
});
