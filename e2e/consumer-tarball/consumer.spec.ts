import { expect, test, type Page } from '@playwright/test';

/**
 * Runs against the apps scripts/check-consumer.mjs builds outside the repository from the packed
 * tarballs — the package build and the CLI-copy build of e2e/consumer-tarball/app.ts, both
 * prerendered on the server and hydrated. E2E_CONSUMER_APPS is a JSON list of { name, url }.
 */
const APPS: { name: string; url: string }[] = JSON.parse(process.env['E2E_CONSUMER_APPS'] ?? '[]');

async function open(page: Page, url: string) {
  const problems: string[] = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Primary' })).toBeVisible();
  // No transitions: computed colours are read at rest.
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  return problems;
}

/** A CSS colour resolved by the browser, for comparing a token with what an element paints. */
const resolved = (page: Page, css: string) =>
  page.evaluate(value => {
    const probe = document.createElement('div');
    probe.style.color = value;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, css);

test.skip(APPS.length === 0, 'E2E_CONSUMER_APPS is not set (run scripts/check-consumer.mjs)');

for (const { name, url } of APPS) {
  test.describe(name, () => {
    test('server HTML is rendered, hydrates without warnings, ids are unique', async ({
      page,
      request,
    }) => {
      const html = await (await request.get(url)).text();
      expect(html).toContain('Primary');
      expect(html).toMatch(/<input[^>]*type="email"/);
      expect(html).toContain('ngh='); // hydration annotations
      // The label is wired to the input on the server already.
      const labelFor = html.match(/<label[^>]*for="([^"]+)"/)?.[1];
      expect(labelFor, 'server-rendered label[for]').toBeTruthy();
      expect(html).toContain(`id="${labelFor}"`);

      const problems = await open(page, url);
      await page.waitForTimeout(300);
      const ids = await page.locator('[id]').evaluateAll(els => els.map(e => e.id));
      expect(new Set(ids).size, `duplicate ids: ${ids}`).toBe(ids.length);
      // Hydration adopted the server DOM: the id the server rendered is still the input's id.
      await expect(page.getByLabel('Email')).toHaveAttribute('id', labelFor!);
      expect(problems).toEqual([]);
    });

    test('Tailwind and the theme tokens style the components', async ({ page }) => {
      const problems = await open(page, url);
      const button = page.getByRole('button', { name: 'Primary' });
      const paint = await button.evaluate(el => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, fg: s.color, radius: s.borderRadius, height: s.height };
      });
      const primary = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
      );
      expect(primary, '--primary is defined by @voltui/components/themes.css').not.toBe('');
      expect(paint.bg).toBe(await resolved(page, primary));
      expect(paint.bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(parseFloat(paint.height)).toBeGreaterThanOrEqual(32);

      // Switching the preset at runtime changes what the same button paints.
      await page.getByRole('button', { name: 'Ember' }).click();
      await expect
        .poll(() => button.evaluate(el => getComputedStyle(el).backgroundColor))
        .not.toBe(paint.bg);
      await page.getByRole('button', { name: 'Dark' }).click();
      await expect(page.locator('html')).toHaveClass(/\bdark\b/);
      expect(problems).toEqual([]);
    });

    test('the form field wires label, hint and error to the control', async ({ page }) => {
      const problems = await open(page, url);
      const email = page.getByLabel('Email');
      await page.getByText('Email', { exact: true }).click();
      await expect(email).toBeFocused();
      await expect(email).toHaveAccessibleDescription(/account updates/);
      await page.keyboard.type('not-an-email');
      await page.keyboard.press('Tab');
      await expect(page.getByText('Enter a valid email address.')).toBeVisible();
      await expect(email).toHaveAttribute('aria-invalid', 'true');
      await expect(email).toHaveAccessibleDescription(/Enter a valid email address/);

      await email.fill('me@example.com');
      const terms = page.getByRole('checkbox', { name: 'Accept terms' });
      await terms.focus();
      await page.keyboard.press('Space');
      await expect(terms).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('#value')).toContainText('"email": "me@example.com"');
      await expect(page.locator('#value')).toContainText('"terms": true');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('#submitted')).toBeVisible();
      expect(problems).toEqual([]);
    });

    test('the dialog opens from the keyboard, traps focus, closes on Escape and returns focus', async ({
      page,
    }) => {
      const problems = await open(page, url);
      const trigger = page.getByRole('button', { name: 'Delete project' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Delete project?' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleDescription('This action cannot be undone.');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      expect(problems).toEqual([]);
    });
  });
}
