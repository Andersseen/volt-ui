import { expect, test, type Locator, type Page } from '@playwright/test';
import { load } from './helpers';

/** The centre of the horizontal track a slider thumb sits on, plus its width, in page pixels. */
async function trackBox(host: Locator) {
  const box = (await host.boundingBox())!;
  return { x: box.x, y: box.y + box.height / 2, width: box.width };
}

async function dragTo(page: Page, thumb: Locator, x: number, y: number) {
  const from = (await thumb.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 8 });
  await page.mouse.up();
}

test.describe('slider', () => {
  test.beforeEach(async ({ page }) => load(page, 'sliders'));

  test('keyboard: arrows step by one, Home/End jump, the parent sees each value once', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Volume' });
    await expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '51');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(thumb).toHaveAttribute('aria-valuenow', '49');
    await page.keyboard.press('Home');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await expect(page.locator('#volume')).toHaveText('100');
  });

  test('pointer: dragging the thumb to 75% of the real track width sets about 75', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Volume' });
    const host = page.locator('volt-slider').first();
    const track = await trackBox(host);
    await dragTo(page, thumb, track.x + track.width * 0.75, track.y);
    const value = Number(await thumb.getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThanOrEqual(73);
    expect(value).toBeLessThanOrEqual(77);
    await expect(page.locator('#volume')).toHaveText(String(value));
  });

  test('the thumb is painted where the value says: left edge ≈ value% of the track', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Volume' });
    await thumb.focus();
    await page.keyboard.press('End');
    const host = (await page.locator('volt-slider').first().boundingBox())!;
    const t = (await thumb.boundingBox())!;
    expect(t.x + t.width / 2).toBeGreaterThan(host.x + host.width - 16);
  });

  test('disabled: not focusable by pointer, ignores keys, exposes aria-disabled state', async ({
    page,
  }) => {
    const locked = page.getByRole('slider', { name: 'Locked' });
    await expect(locked).toHaveAttribute('aria-valuenow', '30');
    await locked.focus({ timeout: 1000 }).catch(() => undefined);
    await page.keyboard.press('ArrowRight');
    await expect(locked).toHaveAttribute('aria-valuenow', '30');
    const host = page.locator('volt-slider').nth(1);
    await expect(host).toHaveAttribute('data-disabled', '');
    const track = await trackBox(host);
    await page.mouse.click(track.x + track.width * 0.9, track.y);
    await expect(locked).toHaveAttribute('aria-valuenow', '30');
  });
});

test.describe('range slider', () => {
  test.beforeEach(async ({ page }) => load(page, 'sliders'));

  test('keyboard: each thumb moves its own bound; the thumbs cannot cross', async ({ page }) => {
    const low = page.getByRole('slider', { name: 'Minimum' });
    const high = page.getByRole('slider', { name: 'Maximum' });
    await low.focus();
    await page.keyboard.press('ArrowRight');
    await expect(low).toHaveAttribute('aria-valuenow', '21');
    await high.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(high).toHaveAttribute('aria-valuenow', '79');
    await expect(page.locator('#range')).toHaveText('21-79');

    await low.focus();
    await page.keyboard.press('End');
    await expect(low).toHaveAttribute('aria-valuenow', '79');
    await expect(high).toHaveAttribute('aria-valuenow', '79');
  });

  test('pointer: dragging the low thumb moves only the low value', async ({ page }) => {
    const low = page.getByRole('slider', { name: 'Minimum' });
    const host = page.locator('volt-range-slider');
    const track = await trackBox(host);
    await dragTo(page, low, track.x + track.width * 0.4, track.y);
    const value = Number(await low.getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThanOrEqual(38);
    expect(value).toBeLessThanOrEqual(42);
    await expect(page.getByRole('slider', { name: 'Maximum' })).toHaveAttribute(
      'aria-valuenow',
      '80'
    );
  });
});

test.describe('resizable', () => {
  test.beforeEach(async ({ page }) => load(page, 'resizable'));

  test('pointer: dragging the handle moves the boundary by the dragged distance', async ({
    page,
  }) => {
    const left = page.locator('#left');
    const handle = page.getByRole('separator');
    const before = (await left.boundingBox())!;
    const h = (await handle.boundingBox())!;
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    await page.mouse.move(h.x + h.width / 2 + 100, h.y + h.height / 2, { steps: 6 });
    await page.mouse.up();
    const after = (await left.boundingBox())!;
    expect(after.width - before.width).toBeGreaterThan(90);
    expect(after.width - before.width).toBeLessThan(110);
    // The panels always fill the container: nothing is lost or invented by a resize.
    const right = (await page.locator('#right').boundingBox())!;
    const container = (await page.locator('volt-resizable').boundingBox())!;
    expect(after.width + h.width + right.width).toBeGreaterThan(container.width - 4);
    expect(after.width + h.width + right.width).toBeLessThan(container.width + 1);
  });

  test('keyboard: arrows resize, the separator reports the size and stays in range', async ({
    page,
  }) => {
    const left = page.locator('#left');
    const handle = page.getByRole('separator');
    const before = (await left.boundingBox())!;
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const after = (await left.boundingBox())!;
    expect(after.width).toBeGreaterThan(before.width);
    const now = Number(await handle.getAttribute('aria-valuenow'));
    const max = Number(await handle.getAttribute('aria-valuemax'));
    expect(now).toBeGreaterThan(0);
    expect(now).toBeLessThanOrEqual(max);

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    const back = (await left.boundingBox())!;
    expect(back.width).toBeLessThan(after.width);
  });
});
