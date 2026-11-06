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
    await expect
      .poll(async () => Number(await thumb.getAttribute('aria-valuenow')))
      .toBeGreaterThanOrEqual(73);
    const value = Number(await thumb.getAttribute('aria-valuenow'));
    expect(value).toBeLessThanOrEqual(77);
    await expect(page.locator('#volume')).toHaveText(String(value));
  });

  test('the thumb is painted where the value says: left edge ≈ value% of the track', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Volume' });
    await thumb.focus();
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
    const host = (await page.locator('volt-slider').first().boundingBox())!;
    // The value is announced first; the paint follows, so poll for it instead of reading once.
    await expect
      .poll(async () => {
        const t = (await thumb.boundingBox())!;
        return t.x + t.width / 2;
      })
      .toBeGreaterThan(host.x + host.width - 16);
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

  test('pointer: dragging the low thumb to 40% of the real track geometry moves only the low value', async ({
    page,
  }) => {
    const low = page.getByRole('slider', { name: 'Minimum' });
    const host = page.locator('volt-range-slider');
    const track = await trackBox(host);
    await dragTo(page, low, track.x + track.width * 0.4, track.y);
    await expect
      .poll(async () => Number(await low.getAttribute('aria-valuenow')))
      .toBeGreaterThanOrEqual(38);
    const value = Number(await low.getAttribute('aria-valuenow'));
    expect(value).toBeLessThanOrEqual(42);
    await expect(page.getByRole('slider', { name: 'Maximum' })).toHaveAttribute(
      'aria-valuenow',
      '80'
    );
  });
});

/** The centre of a thumb, in page pixels. */
async function centre(thumb: Locator) {
  const box = (await thumb.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const now = async (thumb: Locator) => Number(await thumb.getAttribute('aria-valuenow'));

test.describe('vertical orientation', () => {
  test.beforeEach(async ({ page }) => load(page, 'slider-contract'));

  test('slider: the track stands upright and the thumb sits on it, value going up', async ({
    page,
  }) => {
    const host = page.locator('volt-slider').first();
    const thumb = page.getByRole('slider', { name: 'Vertical volume' });
    await expect(thumb).toHaveAttribute('aria-orientation', 'vertical');

    const box = (await host.boundingBox())!;
    expect(box.height, 'the consumer height is honoured').toBeCloseTo(192, 0);
    expect(box.width, 'the host shrinks to the thumb, not the whole row').toBeLessThan(48);

    const track = (await host.locator('[data-orientation]').first().boundingBox())!;
    expect(track.height).toBeGreaterThan(track.width * 4);

    const at30 = await centre(thumb);
    expect(Math.abs(at30.x - (box.x + box.width / 2)), 'centred on the track').toBeLessThan(2);
    // 30% up from the bottom edge.
    expect(Math.abs(at30.y - (box.y + box.height * 0.7))).toBeLessThan(4);

    await thumb.focus();
    await page.keyboard.press('ArrowUp');
    await expect(thumb).toHaveAttribute('aria-valuenow', '31');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(thumb).toHaveAttribute('aria-valuenow', '29');
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await expect.poll(async () => (await centre(thumb)).y).toBeLessThan(box.y + 4);
  });

  test('slider: the filled range grows from the bottom and matches the value', async ({ page }) => {
    const host = page.locator('volt-slider').first();
    const box = (await host.boundingBox())!;
    const range = (await host.locator('[data-orientation] > *').first().boundingBox())!;
    expect(Math.abs(range.height - box.height * 0.3)).toBeLessThan(4);
    expect(Math.abs(range.y + range.height - (box.y + box.height))).toBeLessThan(2);
  });

  test('slider: dragging along the real track height sets the value, repeatedly', async ({
    page,
  }) => {
    const host = page.locator('volt-slider').first();
    const thumb = page.getByRole('slider', { name: 'Vertical volume' });
    const box = (await host.boundingBox())!;
    const x = box.x + box.width / 2;
    await dragTo(page, thumb, x, box.y + box.height * 0.25);
    await expect.poll(() => now(thumb)).toBeGreaterThanOrEqual(73);
    expect(await now(thumb)).toBeLessThanOrEqual(77);
    await dragTo(page, thumb, x, box.y + box.height * 0.75);
    await expect.poll(() => now(thumb)).toBeLessThanOrEqual(27);
    expect(await now(thumb)).toBeGreaterThanOrEqual(23);
  });

  test('range slider: both thumbs sit on one upright track and cannot cross', async ({ page }) => {
    const host = page.locator('volt-range-slider').first();
    const low = page.getByRole('slider', { name: 'Vertical low' });
    const high = page.getByRole('slider', { name: 'Vertical high' });
    const box = (await host.boundingBox())!;
    expect(box.width).toBeLessThan(48);
    const [l, h] = [await centre(low), await centre(high)];
    expect(Math.abs(l.x - h.x)).toBeLessThan(1);
    expect(Math.abs(l.y - (box.y + box.height * 0.8))).toBeLessThan(4);
    expect(Math.abs(h.y - (box.y + box.height * 0.4))).toBeLessThan(4);

    const range = (await host.locator('[data-orientation] > *').first().boundingBox())!;
    expect(Math.abs(range.height - box.height * 0.4)).toBeLessThan(4);

    await dragTo(page, low, l.x, box.y + box.height * 0.1);
    await expect.poll(() => now(low)).toBe(await now(high));
    expect(await now(high)).toBe(60);
  });
});

test.describe('forms', () => {
  test.beforeEach(async ({ page }) => load(page, 'slider-contract'));

  const reset = (page: Page, name: string) =>
    page.getByRole('button', { name, exact: true }).click();

  test('reset() with no value returns to the resting value, repaints, and does not emit', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Form level' });
    await expect(thumb).toHaveAttribute('aria-valuenow', '20');
    await reset(page, 'Reset level');
    // `[value]` is unset, so the resting value is the input default clamped into [min, max].
    await expect(thumb).toHaveAttribute('aria-valuenow', '10');
    const output = JSON.parse((await page.locator('#level').textContent())!);
    expect(output).toEqual({ value: null, emits: [] });
  });

  test('reset() falls back to the template value when there is one', async ({ page }) => {
    const thumb = page.getByRole('slider', { name: 'Seeded level' });
    await expect(thumb).toHaveAttribute('aria-valuenow', '15');
    await reset(page, 'Reset seeded');
    await expect(thumb).toHaveAttribute('aria-valuenow', '35');
  });

  test('reset(value) writes that value without echoing it back as a user change', async ({
    page,
  }) => {
    const thumb = page.getByRole('slider', { name: 'Form level' });
    await reset(page, 'Reset level to 40');
    await expect(thumb).toHaveAttribute('aria-valuenow', '40');
    const output = JSON.parse((await page.locator('#level').textContent())!);
    expect(output).toEqual({ value: 40, emits: [] });
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '41');
    await expect
      .poll(async () => JSON.parse((await page.locator('#level').textContent())!))
      .toEqual({ value: 41, emits: [41] });
  });

  test('disabling a control stops the keyboard and enabling restores it', async ({ page }) => {
    const thumb = page.getByRole('slider', { name: 'Form level' });
    await page.getByRole('button', { name: 'Toggle disabled' }).click();
    await thumb.focus({ timeout: 1000 }).catch(() => undefined);
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '20');
    await page.getByRole('button', { name: 'Toggle disabled' }).click();
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '21');
  });

  test('range: reset() restores low and high; reset(pair) writes both, in either direction', async ({
    page,
  }) => {
    const low = page.getByRole('slider', { name: 'Form low' });
    const high = page.getByRole('slider', { name: 'Form high' });
    await expect(low).toHaveAttribute('aria-valuenow', '25');
    await expect(high).toHaveAttribute('aria-valuenow', '75');
    await reset(page, 'Reset span');
    await expect(low).toHaveAttribute('aria-valuenow', '10');
    await expect(high).toHaveAttribute('aria-valuenow', '90');
    await expect(page.locator('#span')).toHaveText('null');
    await reset(page, 'Reset span to 30-40');
    await expect(low).toHaveAttribute('aria-valuenow', '30');
    await expect(high).toHaveAttribute('aria-valuenow', '40');
  });

  test('geometry follows a resize: a drag after the page narrows still lands on the track', async ({
    page,
  }) => {
    const host = page.locator('volt-slider').nth(1);
    const thumb = page.getByRole('slider', { name: 'Form level' });
    await page.setViewportSize({ width: 700, height: 800 });
    const track = await trackBox(host);
    await dragTo(page, thumb, track.x + track.width * 0.5, track.y);
    // min 10, max 50: the middle of the track is 30.
    await expect.poll(() => now(thumb)).toBeGreaterThanOrEqual(28);
    expect(await now(thumb)).toBeLessThanOrEqual(32);
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
    await expect
      .poll(async () => (await left.boundingBox())!.width - before.width)
      .toBeGreaterThan(90);
    const after = (await left.boundingBox())!;
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
    await expect.poll(async () => (await left.boundingBox())!.width).toBeGreaterThan(before.width);
    const after = (await left.boundingBox())!;
    const now = Number(await handle.getAttribute('aria-valuenow'));
    const max = Number(await handle.getAttribute('aria-valuemax'));
    expect(now).toBeGreaterThan(0);
    expect(now).toBeLessThanOrEqual(max);

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await left.boundingBox())!.width).toBeLessThan(after.width);
  });
});
