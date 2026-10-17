import { expect, test, type Page } from '@playwright/test';

interface IndexEntry {
  id: string;
  type: 'story' | 'docs';
  title: string;
  name: string;
}

/** Runtime errors only: network noise such as a missing favicon is not a Storybook defect. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) {
      errors.push(`console: ${m.text()}`);
    }
  });
  return errors;
}

async function openStory(page: Page, id: string, globals = '') {
  await page.goto(`/iframe.html?id=${id}&viewMode=story${globals ? `&globals=${globals}` : ''}`);
  await page.waitForFunction(() => {
    const root = document.querySelector('#storybook-root');
    return (
      document.body.classList.contains('sb-show-errordisplay') ||
      (root && root.childElementCount > 0)
    );
  });
  await expect(page.locator('body')).not.toHaveClass(/sb-show-errordisplay/);
}

async function openDocs(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=docs`);
  await page.waitForSelector('.sbdocs-content');
}

test('the story index lists every story and docs page', async ({ request }) => {
  const index = (await (await request.get('/index.json')).json()) as {
    entries: Record<string, IndexEntry>;
  };
  const entries = Object.values(index.entries);
  expect(entries.filter(e => e.type === 'docs').length).toBeGreaterThan(40);
  expect(entries.filter(e => e.type === 'story').length).toBeGreaterThan(100);
});

test('Foundations introduction renders as documentation', async ({ page }) => {
  const errors = collectErrors(page);
  await openDocs(page, 'foundations-introduction--docs');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Volt UI');
  expect(errors).toEqual([]);
});

test('component pages read as documentation: usage, accessibility, API, playground', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await openDocs(page, 'components-forms-inputs-button--docs');
  for (const heading of [
    'When to use',
    'Installation',
    'Examples',
    'Accessibility',
    'API',
    'Playground',
  ]) {
    await expect(page.locator('h2', { hasText: new RegExp(`^${heading}$`) })).toBeVisible();
  }
  await expect(page.getByText('VoltNativeButton').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('form control: Input renders a labelled native input', async ({ page }) => {
  const errors = collectErrors(page);
  await openStory(page, 'components-forms-inputs-input--default');
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Dialog opens, traps focus and closes with Escape', async ({ page }) => {
  const errors = collectErrors(page);
  await openStory(page, 'components-overlays-dialog--default');
  await page.getByRole('button', { name: /open/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test('Select opens a listbox and selects an option', async ({ page }) => {
  const errors = collectErrors(page);
  await openStory(page, 'components-forms-inputs-select--default');
  await page.getByRole('combobox', { name: 'Fruit' }).click();
  await page.getByRole('option', { name: 'Banana' }).click();
  await expect(page.getByRole('combobox', { name: 'Fruit' })).toHaveText(/Banana/);
  expect(errors).toEqual([]);
});

test('Toast appears when triggered', async ({ page }) => {
  const errors = collectErrors(page);
  await openStory(page, 'components-overlays-toast--default');
  await page
    .getByRole('button', { name: /^(show|save)/i })
    .first()
    .click();
  await expect(page.locator('volt-toast').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('theme globals switch colour preset, style preset and appearance', async ({ page }) => {
  await openStory(page, 'components-forms-inputs-button--default');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-color', 'volt');
  await expect(html).toHaveAttribute('data-style', 'sharp');
  await expect(html).not.toHaveClass(/dark/);

  await openStory(
    page,
    'components-forms-inputs-button--default',
    'voltColor:ember;voltStyle:brutal;voltAppearance:dark'
  );
  await expect(html).toHaveAttribute('data-color', 'ember');
  await expect(html).toHaveAttribute('data-style', 'brutal');
  await expect(html).toHaveClass(/dark/);
});

test('every story renders without a runtime error', async ({ page, request }) => {
  test.setTimeout(10 * 60_000);
  const index = (await (await request.get('/index.json')).json()) as {
    entries: Record<string, IndexEntry>;
  };
  const stories = Object.values(index.entries).filter(e => e.type === 'story');
  const failures: string[] = [];
  for (const story of stories) {
    const errors: string[] = [];
    const onError = (e: Error) => errors.push(e.message);
    const onConsole = (m: { type(): string; text(): string }) => {
      if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()))
        errors.push(m.text());
    };
    page.on('pageerror', onError);
    page.on('console', onConsole);
    try {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForFunction(
        () => {
          const root = document.querySelector('#storybook-root');
          return (
            document.body.classList.contains('sb-show-errordisplay') ||
            (root && root.childElementCount > 0)
          );
        },
        undefined,
        { timeout: 15_000 }
      );
      if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) {
        errors.push(await page.locator('#error-message').innerText());
      }
    } catch (e) {
      errors.push(`did not render: ${(e as Error).message.split('\n')[0]}`);
    }
    page.off('pageerror', onError);
    page.off('console', onConsole);
    if (errors.length) failures.push(`${story.title} / ${story.name}: ${errors[0].slice(0, 300)}`);
  }
  expect(failures, failures.join('\n')).toEqual([]);
});

test('every docs page renders with its sections and without a runtime error', async ({
  page,
  request,
}) => {
  test.setTimeout(10 * 60_000);
  const index = (await (await request.get('/index.json')).json()) as {
    entries: Record<string, IndexEntry>;
  };
  const docs = Object.values(index.entries).filter(e => e.type === 'docs');
  const failures: string[] = [];
  for (const entry of docs) {
    const errors: string[] = [];
    const onError = (e: Error) => errors.push(e.message);
    page.on('pageerror', onError);
    try {
      await page.goto(`/iframe.html?id=${entry.id}&viewMode=docs`);
      await page.waitForSelector('.sbdocs-content h1', { timeout: 15_000 });
      if (entry.title.startsWith('Components/')) {
        const headings = await page.locator('.sbdocs-content h2').allInnerTexts();
        for (const wanted of ['When to use', 'Installation', 'Accessibility', 'API']) {
          if (!headings.some(h => h.trim() === wanted)) errors.push(`missing section "${wanted}"`);
        }
      }
    } catch (e) {
      errors.push(`did not render: ${(e as Error).message.split('\n')[0]}`);
    }
    page.off('pageerror', onError);
    if (errors.length) failures.push(`${entry.title}: ${errors[0]}`);
  }
  expect(failures, failures.join('\n')).toEqual([]);
});
