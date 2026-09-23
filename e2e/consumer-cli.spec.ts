import { expect, test } from '@playwright/test';

test.describe('volt add CLI consumer fixture', () => {
  test('boots with every CLI-copied component and no runtime errors', async ({ page }) => {
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
      throw new Error(`Consumer CLI fixture runtime error:\n${runtimeErrors.join('\n')}`);
    }

    await expect(page.getByRole('heading', { name: 'Volt CLI Consumer Fixture' })).toBeVisible();

    const countText = await page.getByTestId('component-count').innerText();
    const count = Number(countText.match(/^\d+/)?.[0] ?? 0);
    expect(count).toBeGreaterThan(40);

    const cliButton = page.getByTestId('cli-button');
    await expect(cliButton).toBeVisible();
    await expect(cliButton).toHaveText('CLI-copied button');

    // 1.1 surface after the ui* transform.
    await expect(page.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'data-variant',
      'outline'
    );
    const px = (testId: string, selector: string, prop: string) =>
      page
        .getByTestId(testId)
        .locator(selector)
        .first()
        .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
    expect(
      await page
        .getByTestId('cli-card-content')
        .evaluate(el => getComputedStyle(el).getPropertyValue('padding-top'))
    ).toBe('12px');
    expect(await px('cli-input', 'input', 'width')).toBe('96px');
    await expect(page.getByRole('textbox', { name: 'Quantity' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Loading' })).toBeAttached();

    await page.getByTestId('cli-toast').click();
    await expect(page.getByRole('status').filter({ hasText: 'CLI toast' })).toBeVisible();
    expect(runtimeErrors).toEqual([]);
  });
});
