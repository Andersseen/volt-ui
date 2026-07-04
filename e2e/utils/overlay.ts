import { expect, type Locator, type Page } from '@playwright/test';

export async function expectBox(locator: Locator, label: string): Promise<void> {
  await expect(locator, label).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} should have a layout box`).not.toBeNull();
  expect(box!.width, `${label} width`).toBeGreaterThan(0);
  expect(box!.height, `${label} height`).toBeGreaterThan(0);
}

export async function expectInViewport(page: Page, locator: Locator, label: string): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, `${label} should have a layout box`).not.toBeNull();

  const viewport = page.viewportSize();
  expect(viewport, 'viewport should be available').not.toBeNull();

  expect(box!.x, `${label} left edge`).toBeGreaterThanOrEqual(0);
  expect(box!.y, `${label} top edge`).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, `${label} right edge`).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height, `${label} bottom edge`).toBeLessThanOrEqual(viewport!.height);
}

export async function openAndExpectBox(
  page: Page,
  triggerTestId: string,
  targetTestId: string
): Promise<void> {
  await page.getByTestId(triggerTestId).click();
  await expectBox(page.getByTestId(targetTestId), targetTestId);
}

export async function focusWithKeyboard(page: Page, locator: Locator, maxTabs = 12): Promise<void> {
  for (let i = 0; i < maxTabs; i++) {
    if (await locator.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
}

export async function expectEscapeCloses(page: Page, target: Locator): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(target).toBeHidden();
}

export async function expectOutsideClickCloses(
  page: Page,
  target: Locator,
  x = 8,
  y = 8
): Promise<void> {
  await page.mouse.click(x, y);
  await expect(target).toBeHidden();
}

export async function expectFocusReturn(
  page: Page,
  trigger: Locator,
  target: Locator
): Promise<void> {
  await expectEscapeCloses(page, target);
  await expect(trigger).toBeFocused();
}

export async function expectFocusTrap(
  page: Page,
  container: Locator,
  first: Locator,
  last: Locator
): Promise<void> {
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect
    .poll(() =>
      container.evaluate(element => {
        const active = element.ownerDocument.activeElement;
        return active instanceof Node && element.contains(active);
      })
    )
    .toBe(true);

  await last.focus();
  await expect(last).toBeFocused();
  await page.keyboard.press('Tab');
  await expect
    .poll(() =>
      container.evaluate(element => {
        const active = element.ownerDocument.activeElement;
        return active instanceof Node && element.contains(active);
      })
    )
    .toBe(true);
}
