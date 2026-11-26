import { expect, test, type Page } from '@playwright/test';

/**
 * Onboarding exercises against the apps scripts/check-consumer.mjs builds outside the repository:
 * the Recipes compositions of e2e/consumer-onboarding/app.ts, installed from the packed tarballs in
 * package mode and in CLI-copy mode (where one copied component was customised), prerendered on the
 * server and hydrated. E2E_ONBOARDING_APPS is a JSON list of { name, url, customised }.
 */
const APPS: { name: string; url: string; customised: boolean }[] = JSON.parse(
  process.env['E2E_ONBOARDING_APPS'] ?? '[]'
);

async function open(page: Page, url: string) {
  const problems: string[] = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible();
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  return problems;
}

test.skip(APPS.length === 0, 'E2E_ONBOARDING_APPS is not set (run scripts/check-consumer.mjs)');

for (const { name, url, customised } of APPS) {
  test.describe(name, () => {
    test('every composition is server-rendered and hydrates without warnings', async ({
      page,
      request,
    }) => {
      const html = await (await request.get(url)).text();
      for (const text of ['Save changes', 'Recent orders', 'Overview', 'Map of Europe']) {
        expect(html, text).toContain(text);
      }
      expect(html).toContain('ngh=');
      const problems = await open(page, url);
      await page.waitForTimeout(300);
      const ids = await page.locator('[id]').evaluateAll(els => els.map(e => e.id));
      expect(new Set(ids).size, `duplicate ids: ${ids}`).toBe(ids.length);
      expect(problems).toEqual([]);
    });

    test('settings form: invalid submit, successful save, failed save keeps the input', async ({
      page,
    }) => {
      await open(page, url);
      const form = page.getByRole('region', { name: 'Settings application' });
      const nameField = form.getByLabel('Name');
      await nameField.fill('');
      await form.getByRole('button', { name: 'Save changes' }).click();
      await expect(form.getByText('Enter your name.')).toBeVisible();
      await expect(nameField).toBeFocused();

      await nameField.fill('Ada Lovelace');
      await form.getByRole('button', { name: 'Save changes' }).click();
      await expect(form.getByText('Settings saved')).toBeVisible();

      await form.getByLabel('Email').fill('ada@fail.test');
      await form.getByRole('button', { name: 'Save changes' }).click();
      await expect(form.getByText('Could not save your settings')).toBeVisible();
      await expect(form.getByLabel('Email')).toHaveValue('ada@fail.test');
    });

    test('data table: sorts, filters and tells "no match" apart', async ({ page }) => {
      await open(page, url);
      const data = page.getByRole('region', { name: 'Data page' });
      await expect(data.getByRole('row').nth(1)).toBeVisible();
      const customer = data.getByRole('columnheader', { name: /Customer/ });
      await customer.getByRole('button').click();
      await expect(customer).toHaveAttribute('aria-sort', /ascending|descending/);
      await data.getByLabel('Filter invoices by customer').fill('zzzz-no-such-customer');
      await expect(data.getByRole('button', { name: 'Clear filter' })).toBeVisible();
    });

    test('theme tokens paint the composed components', async ({ page }) => {
      await open(page, url);
      const save = page.getByRole('button', { name: 'Save changes' });
      const background = await save.evaluate(el => getComputedStyle(el).backgroundColor);
      const primary = await page.evaluate(() => {
        const probe = document.createElement('div');
        probe.style.color = 'var(--primary)';
        document.body.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      expect(background).toBe(primary);
      await expect(page.getByRole('img', { name: /Map of Europe/ })).toBeVisible();
    });

    test(`a customised copy keeps its change (${customised ? 'copy' : 'package'})`, async ({
      page,
    }) => {
      await open(page, url);
      const save = page.getByRole('button', { name: 'Save changes' });
      if (customised) await expect(save).toHaveClass(/onboarding-custom/);
      else await expect(save).not.toHaveClass(/onboarding-custom/);
    });
  });
}
