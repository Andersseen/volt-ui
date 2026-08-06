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
  });
});
