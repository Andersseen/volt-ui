import { expect, type Locator, type Page } from '@playwright/test';

/** Loads one contract fixture (see `e2e/consumer/src/contracts/host.ts`) and waits for it to mount. */
export async function load(page: Page, fixture: string): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/contracts.html#${fixture}`);
  await expect(page.locator('app-contracts main > *')).toHaveCount(1);
  // Surfaced by the test that loaded the page, so a runtime error cannot hide behind a pass.
  (page as Page & { __errors?: string[] }).__errors = errors;
}

/** A computed style property of an element's first match. */
export function style(locator: Locator, property: string): Promise<string> {
  return locator
    .first()
    .evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/** The visible paint of an element: the properties a user can tell apart. */
export function paint(locator: Locator): Promise<string> {
  return locator.first().evaluate(el => {
    const s = getComputedStyle(el);
    return [s.backgroundColor, s.color, s.borderTopColor, s.boxShadow, s.fontWeight].join('|');
  });
}

/**
 * Focuses an item of a roving-focus group and waits until the group has made it the tab stop.
 * A key pressed in the same tick as a programmatic `focus()` can beat the group's own bookkeeping,
 * which a person tabbing in and then pressing an arrow never does.
 */
export async function focusRoving(item: Locator): Promise<void> {
  await item.focus();
  await expect(item).toHaveAttribute('tabindex', '0');
}

/** Safari does not Tab to buttons unless a system keyboard setting is on, so Tab-order checks skip it. */
export const TAB_SKIPS_BUTTONS = 'webkit';
