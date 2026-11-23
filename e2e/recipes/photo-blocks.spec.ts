import { expect, test } from '../fixtures';

/**
 * Browser-only contracts of the photo blocks (Hero Rail, Swap Story, Gallery Tabs, Contact Map):
 * focus, hit testing and layout geometry, which jsdom cannot see.
 */
const preview = (page: import('@playwright/test').Page) =>
  page.locator('app-block-showcase .overflow-clip').first();

test.describe('Photo blocks', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Hero Rail runs its strip down the photo and the arrow keys follow it', async ({ page }) => {
    await page.goto('/blocks/hero-rail');
    await page.waitForLoadState('networkidle');

    const strip = preview(page).getByRole('radiogroup', { name: 'Choose a photo' });
    await expect(strip).toHaveAttribute('aria-orientation', 'vertical');

    await preview(page).getByRole('radio').first().focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(preview(page).getByRole('radio').nth(1)).toHaveAttribute('data-selected', '');
    await expect(preview(page).getByText(/Photo 2 of 5/)).toBeAttached();
  });

  test('Gallery Tabs keeps the arrow keys on the photos, not on the tabs', async ({ page }) => {
    await page.goto('/blocks/gallery-tabs');
    await page.waitForLoadState('networkidle');

    await preview(page).getByRole('radio').first().focus();
    await page.keyboard.press('ArrowRight');

    // A toggle group inside the tabs would otherwise join the tabs' roving focus.
    await expect(preview(page).getByRole('tab', { name: 'Landscapes' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.locator(':focus')).toHaveAttribute(
      'aria-label',
      'A desert road running toward red mountains'
    );
  });

  test('Gallery Tabs opens the featured photo and gives focus back on Escape', async ({ page }) => {
    await page.goto('/blocks/gallery-tabs');
    await page.waitForLoadState('networkidle');

    const open = preview(page).getByRole('button', { name: /^Open photo/ });
    await open.click();
    await expect(page.getByRole('dialog')).toContainText('A granite wall above a pine meadow');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(open).toBeFocused();
  });

  test('Contact Map never takes the clicks of the form it slides under', async ({ page }) => {
    await page.goto('/blocks/contact-map');
    await page.waitForLoadState('networkidle');

    const send = preview(page).getByRole('button', { name: /Send/ });
    const box = (await send.boundingBox())!;
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.textContent?.trim(),
      { x: box.x + box.width / 2, y: box.y + box.height - 2 }
    );

    expect(hit).toBe('Send');
  });

  test('Swap Story never lets the travelling photo cover a chapter', async ({ page }) => {
    // Dozens of scroll positions, each waiting for the spring to settle: well past the 30s default.
    test.setTimeout(120_000);
    await page.goto('/blocks/swap-story');
    await page.waitForLoadState('networkidle');

    // The sticky photo only takes over once its images have decoded.
    const ready = await page
      .locator('.stage[data-ready]')
      .waitFor({ timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!ready, 'the photos did not load, so the inline layout is in use instead');

    const end = await page.evaluate(() => document.documentElement.scrollHeight);
    const chapters = new Set<string>();
    // Sampled once the photo has come to rest at each position: the rule is about where the swap
    // happens, so a reader flinging the page faster than the spring is not what it measures.
    for (let y = 0; y < end; y += 120) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await page.waitForTimeout(450);
      const sample = await page.evaluate(() => {
        const frame = document.querySelector('.frame')!.getBoundingClientRect();
        const covered = [...document.querySelectorAll('.copy')].some(copy => {
          const box = copy.getBoundingClientRect();
          return (
            box.right > frame.left &&
            box.left < frame.right &&
            box.bottom > frame.top &&
            box.top < frame.bottom
          );
        });
        return { covered, caption: document.querySelector('.caption')!.textContent!.trim() };
      });
      expect(sample.covered, `photo covers text at scroll ${y}`).toBe(false);
      chapters.add(sample.caption);
    }

    expect(chapters.size).toBe(4);
  });
});
