import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectBox(locator: Locator, label: string): Promise<void> {
  await expect(locator, label).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} should have a layout box`).not.toBeNull();
  expect(box!.width, `${label} width`).toBeGreaterThan(0);
  expect(box!.height, `${label} height`).toBeGreaterThan(0);
}

async function openAndExpectBox(
  page: Page,
  triggerTestId: string,
  targetTestId: string
): Promise<void> {
  await page.getByTestId(triggerTestId).click();
  await expectBox(page.getByTestId(targetTestId), targetTestId);
}

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
    await page.getByTestId('select').click();
    await expectBox(page.getByRole('listbox'), 'select listbox');
    await page.keyboard.press('Escape');

    await openAndExpectBox(page, 'popover-trigger', 'popover-content');
    await page.keyboard.press('Escape');

    await openAndExpectBox(page, 'dropdown-trigger', 'dropdown-menu');
    await page.keyboard.press('Escape');

    await page.getByTestId('tooltip-trigger').hover();
    await expectBox(page.getByTestId('tooltip-content'), 'tooltip content');

    await openAndExpectBox(page, 'dialog-trigger', 'dialog-content');
    await page.keyboard.press('Escape');

    await openAndExpectBox(page, 'drawer-trigger', 'drawer-content');
  });
});
