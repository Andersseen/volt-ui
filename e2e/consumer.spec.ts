import { expect, test } from '@playwright/test';
import {
  expectBox,
  expectEscapeCloses,
  expectFocusReturn,
  expectFocusTrap,
  expectInViewport,
  expectOutsideClickCloses,
  focusWithKeyboard,
  openAndExpectBox,
} from './utils/overlay';

test.describe('npm consumer fixture', () => {
  test.beforeEach(async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        runtimeErrors.push(message.text());
      }
    });
    page.on('pageerror', error => {
      runtimeErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    if (runtimeErrors.length > 0) {
      throw new Error(`Consumer fixture runtime error:\n${runtimeErrors.join('\n')}`);
    }
  });

  test('renders package-owned primitives without Tailwind scanning the library source', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { name: 'Volt Consumer Fixture' })).toBeVisible();

    await expectBox(page.locator('[ngpSliderTrack]'), 'slider track');
    await expectBox(page.locator('[ngpSliderThumb]'), 'slider thumb');
    await expectBox(page.locator('[ngpProgressTrack]'), 'progress track');
    await expectBox(page.locator('[ngpProgressIndicator]'), 'progress indicator');
    await expectBox(page.getByTestId('meter-track'), 'meter track');
    await expectBox(page.getByTestId('meter-indicator'), 'meter indicator');
    await expectBox(page.locator('[ngpSwitch]'), 'switch');
    await expectBox(page.locator('[ngpSwitchThumb]'), 'switch thumb');
    await expectBox(page.locator('[ngpCheckbox]'), 'checkbox');
    await expectBox(page.locator('[ngpRadioItem]').first(), 'radio item');
    await expectBox(page.getByTestId('avatar'), 'avatar');
    await expectBox(page.getByTestId('separator'), 'separator');
    await expectBox(page.getByTestId('select'), 'select');
    await expectBox(page.getByTestId('tabs-list'), 'tabs list');
    await expectBox(page.getByTestId('tabs-content'), 'tabs content');
  });

  test('opens overlay components with visible positioned content', async ({ page }) => {
    const select = page.getByRole('combobox');
    await focusWithKeyboard(page, select);
    await expect(select, 'keyboard focus should reach the select trigger').toBeFocused();

    await select.click();
    const listbox = page.getByRole('listbox');
    await expectBox(listbox, 'select listbox');
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();

    const popoverTrigger = page.getByTestId('popover-trigger');
    await openAndExpectBox(page, 'popover-trigger', 'popover-content');
    await expect(popoverTrigger).toBeFocused();
    await expectInViewport(page, page.getByTestId('popover-content'), 'popover content');
    await expectEscapeCloses(page, page.getByTestId('popover-content'));
    await openAndExpectBox(page, 'popover-trigger', 'popover-content');
    await expectOutsideClickCloses(page, page.getByTestId('popover-content'));

    const dropdownTrigger = page.getByTestId('dropdown-trigger');
    await dropdownTrigger.focus();
    await expect(dropdownTrigger).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expectBox(page.getByTestId('dropdown-menu'), 'dropdown-menu');
    await expectInViewport(page, page.getByTestId('dropdown-menu'), 'dropdown menu');
    await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Second action' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('menuitem', { name: 'Third action' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-action')).toHaveText('third');
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await dropdownTrigger.focus();
    await page.keyboard.press('ArrowDown');
    await expectBox(page.getByTestId('dropdown-menu'), 'dropdown-menu');
    await expectEscapeCloses(page, page.getByTestId('dropdown-menu'));
    await openAndExpectBox(page, 'dropdown-trigger', 'dropdown-menu');
    await expectOutsideClickCloses(page, page.getByTestId('dropdown-menu'));

    const tooltipTrigger = page.getByTestId('tooltip-trigger');
    await tooltipTrigger.hover();
    await expectBox(page.getByTestId('tooltip-content'), 'tooltip content');
    await expectInViewport(page, page.getByTestId('tooltip-content'), 'tooltip content');
    await page.mouse.move(0, 0);
    await expect(page.getByTestId('tooltip-content')).toBeHidden();

    await tooltipTrigger.focus();
    await expectBox(page.getByTestId('tooltip-content'), 'tooltip content');
    await expect(tooltipTrigger).toHaveAttribute('aria-describedby', /.+/);
    await expectEscapeCloses(page, page.getByTestId('tooltip-content'));
    await page.getByTestId('dialog-trigger').focus();
    await tooltipTrigger.focus();
    await expectBox(page.getByTestId('tooltip-content'), 'tooltip content');
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('tooltip-content')).toBeHidden();

    const dialogTrigger = page.getByTestId('dialog-trigger');
    await openAndExpectBox(page, 'dialog-trigger', 'dialog-content');
    const dialogContent = page.getByTestId('dialog-content');
    await expect(dialogContent).toHaveAttribute('role', 'dialog');
    await expect(dialogContent).toHaveAttribute('aria-modal', 'true');
    const dialogTitleId = await page.getByText('Dialog title').getAttribute('id');
    await expect(dialogContent).toHaveAttribute('aria-labelledby', dialogTitleId ?? '');
    await expectFocusTrap(
      page,
      page.getByTestId('dialog-content'),
      page.getByTestId('dialog-first'),
      page.getByTestId('dialog-close')
    );
    await expectFocusReturn(page, dialogTrigger, page.getByTestId('dialog-content'));

    await openAndExpectBox(page, 'dialog-trigger', 'dialog-content');
    await expectOutsideClickCloses(page, page.getByTestId('dialog-content'));

    await openAndExpectBox(page, 'dialog-nested-trigger', 'dialog-content');
    await page.getByTestId('nested-dropdown-trigger').click();
    await expectBox(page.getByTestId('nested-dropdown-menu'), 'nested dropdown menu');
    await page.getByRole('menuitem', { name: 'Nested action' }).focus();
    await expect(page.getByRole('menuitem', { name: 'Nested action' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('nested-dropdown-menu')).toBeHidden();
    await expect(page.getByTestId('dialog-content')).toBeVisible();
    await page.getByTestId('dialog-close').click();
    await expect(page.getByTestId('dialog-content')).toBeHidden();

    const drawerTrigger = page.getByTestId('drawer-trigger');
    await openAndExpectBox(page, 'drawer-trigger', 'drawer-content');
    const drawerContent = page.getByTestId('drawer-content');
    await expect(drawerContent).toHaveAttribute('role', 'dialog');
    await expect(drawerContent).toHaveAttribute('aria-modal', 'true');
    const drawerTitleId = await page.getByText('Drawer title').getAttribute('id');
    await expect(drawerContent).toHaveAttribute('aria-labelledby', drawerTitleId ?? '');
    await expectFocusTrap(
      page,
      page.getByTestId('drawer-content'),
      page.getByTestId('drawer-first'),
      page.getByTestId('drawer-close')
    );
    await expectFocusReturn(page, drawerTrigger, page.getByTestId('drawer-content'));

    await openAndExpectBox(page, 'drawer-trigger', 'drawer-content');
    await expectOutsideClickCloses(page, page.getByTestId('drawer-content'));

    const toastErrors: string[] = [];
    page.on('pageerror', error => toastErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') toastErrors.push(message.text());
    });
    await page.getByTestId('toast-trigger').click();
    expect(toastErrors).toEqual([]);
    await expectBox(page.getByTestId('toast'), 'toast');
    await expect(page.getByTestId('toast')).toHaveAttribute('role', 'status');
    await page.getByTestId('toast').hover();
    await page.waitForTimeout(600);
    await expect(page.getByTestId('toast')).toBeVisible();
    await page.getByTestId('toast-close').focus();
    await expect(page.getByTestId('toast-close')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('toast')).toBeHidden();

    await page.getByTestId('toast-error-trigger').click();
    await expectBox(page.getByTestId('toast-error'), 'toast-error');
    await expect(page.getByTestId('toast-error')).toHaveAttribute('role', 'alert');
    await page.getByTestId('toast-error-close').click();
    await expect(page.getByTestId('toast-error')).toBeHidden();
  });
});
