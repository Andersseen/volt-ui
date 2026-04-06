import { test, expect } from '@playwright/test';

test.describe('Button Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/button');
  });

  test('should load page and display title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Button' })).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.getByRole('link', { name: 'Components' }).click();
    await expect(page).toHaveURL('/docs/components');
  });

  test('should render all variant buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Solid' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Outline' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ghost' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Destructive' })).toBeVisible();
  });

  test('should render size variants', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Small (sm)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Default (md)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Large (lg)' })).toBeVisible();
  });

  test('should render disabled button', async ({ page }) => {
    const disabledButton = page.getByRole('button', { name: 'Disabled' });
    await expect(disabledButton).toBeVisible();
    await expect(disabledButton).toBeDisabled();
  });

  test('should render CLI command', async ({ page }) => {
    await expect(page.getByText('npx github:Andersseen/volt-ui add button')).toBeVisible();
  });
});

test.describe('Card Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/card');
  });

  test('should load page and display title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Card' })).toBeVisible();
  });

  test('should render card with form', async ({ page }) => {
    await expect(page.getByPlaceholder('Name of your project')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Deploy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});

test.describe('Input Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/input');
  });

  test('should load page and display title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /input/i })).toBeVisible();
  });

  test('should render email input', async ({ page }) => {
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('should render textarea', async ({ page }) => {
    await expect(page.getByPlaceholder('Type your message here.')).toBeVisible();
  });
});
