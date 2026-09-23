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
    const select = page.getByTestId('select').getByRole('combobox');
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

test.describe('npm consumer — 1.1 regressions from real apps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  const px = (locator: import('@playwright/test').Locator, property: string) =>
    locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

  test('buttons: real links, named icon buttons, forwarded state, no nested interactives', async ({
    page,
  }) => {
    const docs = page.getByRole('link', { name: 'Docs', exact: true });
    await expect(docs).toHaveAttribute('href', '/docs');
    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/Andersseen/volt-ui'
    );
    await expect(page.locator('a button, button a, a volt-button')).toHaveCount(0);

    // Icon-only: the accessible name is on the focusable element for both APIs.
    const native = page.getByRole('button', { name: 'Switch theme' });
    await expect(native).toHaveAttribute('data-variant', 'solid');
    const wrapped = page.getByRole('button', { name: 'Open settings' });
    await expect(wrapped).toBeVisible();
    expect(await wrapped.evaluate(el => el.tagName)).toBe('BUTTON');
    await expect(page.getByTestId('icon-wrapper')).not.toHaveAttribute('aria-label');

    // aria-expanded / aria-controls land on the native button and track state.
    const settings = page.getByTestId('expand-wrapper').getByRole('button');
    await expect(settings).toHaveAttribute('aria-expanded', 'false');
    await expect(settings).toHaveAttribute('aria-controls', 'settings-panel');
    await settings.focus();
    await page.keyboard.press('Enter');
    await expect(settings).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#settings-panel')).toBeVisible();

    // Leading/trailing icons stay inside the button, name comes from the text.
    const icons = page.getByRole('button', { name: 'Continue' });
    await expect(icons.getByTestId('lead-icon')).toBeAttached();
    await expect(icons.getByTestId('trail-icon')).toBeAttached();

    await expect(page.getByRole('button', { name: 'Disabled' })).toBeDisabled();

    // Keyboard reaches the link and activates nothing unexpected.
    await docs.focus();
    await expect(docs).toBeFocused();
  });

  test('styling: consumer classes win on the element that paints', async ({ page }) => {
    const compact = page.getByTestId('compact-input').locator('input');
    const fallback = page.getByTestId('default-input').locator('input');
    expect(await px(compact, 'width')).toBe('96px');
    expect(await px(compact, 'padding-left')).toBe('10px');
    expect(await px(compact, 'padding-top')).toBe('6px');
    expect(await px(page.getByTestId('compact-input'), 'padding-left')).toBe('0px');
    expect(await px(fallback, 'padding-left')).toBe('12px');

    const content = page.getByTestId('custom-card-content');
    expect(await px(content, 'padding-top')).toBe('48px');
    expect(await px(content, 'text-align')).toBe('center');

    const footer = page.getByTestId('custom-card-footer');
    expect(await px(footer, 'justify-content')).toBe('flex-end');
    expect(await px(footer, 'padding-top')).toBe('12px');
    expect(await px(footer, 'border-top-width')).toBe('1px');

    expect(await px(page.getByTestId('styled-label').locator('label'), 'text-transform')).toBe(
      'uppercase'
    );
    expect(await px(page.getByTestId('styled-hint').locator('span'), 'font-style')).toBe('italic');
    expect(await px(page.getByTestId('styled-error').locator('span'), 'font-size')).toBe('12px');

    await page.getByTestId('wide-dialog-trigger').click();
    const dialog = page.getByRole('dialog', { name: 'Wide dialog' });
    await expect(dialog).toBeVisible();
    expect(await px(dialog, 'max-width')).toBe('672px');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await page.getByTestId('sized-drawer-trigger').click();
    const drawer = page.getByRole('dialog', { name: 'Sized drawer' });
    await expect(drawer).toBeVisible();
    expect(await px(drawer, 'width')).toBe('420px');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('forms: labels, hints, errors, native select, disabled and invalid state', async ({
    page,
  }) => {
    const name = page.getByRole('textbox', { name: 'Workspace name' });
    await expect(name).toHaveAccessibleDescription('Visible to your team.');
    await page.getByText('Workspace name', { exact: true }).click();
    await expect(name).toBeFocused();

    await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();
    const region = page.getByRole('combobox', { name: 'Region' });
    expect(await px(region, 'height')).toBe('32px');
    await region.selectOption('us');

    await expect(page.getByRole('textbox', { name: 'Plan' })).toBeDisabled();

    // Submitting marks everything touched: the OnPush input must reflect it immediately.
    await page.getByTestId('settings-submit').click();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Workspace name is required.')).toBeVisible();

    await name.fill('Acme');
    await page.getByTestId('settings-submit').click();
    await expect(name).not.toHaveAttribute('aria-invalid');
    await expect(page.getByTestId('settings-value')).toContainText('"region":"us"');
  });

  test('feedback: semantic badges, alert semantics, spinner semantics, toast service', async ({
    page,
  }) => {
    const bg = async (id: string) => px(page.getByTestId(id), 'background-color');
    const [success, warning, info] = await Promise.all([
      bg('badge-success'),
      bg('badge-warning'),
      bg('badge-info'),
    ]);
    expect(new Set([success, warning, info]).size).toBe(3);

    await expect(page.getByTestId('static-alert')).not.toHaveAttribute('role');
    await page.getByTestId('alert-trigger').click();
    await expect(page.getByRole('alert').filter({ hasText: 'Payment failed' })).toBeVisible();

    await expect(page.getByTestId('decorative-spinner')).toHaveAttribute('aria-hidden', 'true');
    // role="status" takes no name from content; the label is its visually hidden text.
    await expect(page.getByRole('status').filter({ hasText: 'Loading projects' })).toBeAttached();

    await page.getByTestId('service-toast-success').click();
    const toast = page.getByRole('status').filter({ hasText: 'Copied to clipboard' });
    await expect(toast).toBeVisible();
    await page.getByTestId('service-toast-error').click();
    const errorToast = page.getByRole('alert').filter({ hasText: 'Could not save' });
    await expect(errorToast).toBeVisible();
    await errorToast.getByRole('button', { name: 'Close' }).click();
    await expect(errorToast).toBeHidden();
    await toast.getByRole('button', { name: 'Close' }).focus();
    await page.keyboard.press('Enter');
    await expect(toast).toBeHidden();
  });

  test('dialogs: controlled form modal and confirm dialog without a trigger', async ({ page }) => {
    const trigger = page.getByTestId('controlled-dialog-trigger');
    await trigger.click();
    const form = page.getByRole('dialog', { name: 'Rename workspace' });
    await expect(form).toBeVisible();
    await expect(form).toHaveAccessibleDescription('The new name is visible to your team.');
    await expect(page.getByTestId('controlled-open')).toHaveText('true');

    // Focus is trapped inside and Escape syncs the controlled state back to false.
    await expect.poll(() => form.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    expect(await form.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(form).toBeHidden();
    await expect(page.getByTestId('controlled-open')).toHaveText('false');
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.getByTestId('rename-input').locator('input').fill('Globex');
    await page.getByTestId('form-dialog-save').click();
    await expect(form).toBeHidden();
    await expect(page.getByTestId('dialog-result')).toHaveText('Globex');

    const confirmTrigger = page.getByTestId('confirm-trigger');
    await confirmTrigger.click();
    const confirm = page.getByRole('alertdialog', { name: 'Delete workspace?' });
    await expect(confirm).toBeVisible();
    await page.getByTestId('confirm-accept').click();
    await expect(confirm).toBeHidden();
    await expect(page.getByTestId('dialog-result')).toHaveText('confirm:true');
    await expect(confirmTrigger).toBeFocused();

    await confirmTrigger.click();
    await page.mouse.click(8, 8);
    await expect(confirm).toBeHidden();
    await expect(page.getByTestId('dialog-result')).toHaveText('confirm:undefined');
  });
});
