import { expect, test } from './fixtures';

test.describe('Site navigation', () => {
  test('keeps one visibly active desktop destination through route changes and localization', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const navigation = page.locator('header nav');

    for (const destination of [
      { name: 'Docs', url: /\/docs\/introduction$/ },
      { name: 'Components', url: /\/docs\/components$/ },
      { name: 'Gallery', url: /\/docs\/blocks$/ },
      { name: 'Create Theme', url: /\/create-theme$/ },
      { name: 'Home', url: /\/$/ },
    ]) {
      await navigation.getByRole('link', { name: destination.name }).click();
      await expect(page).toHaveURL(destination.url);
      const active = navigation.locator('a[aria-current="page"]');
      await expect(active).toHaveCount(1);
      await expect(active).toHaveAccessibleName(destination.name);
      const idlePaint = await active.evaluate(element => getComputedStyle(element).backgroundColor);
      expect(idlePaint).not.toMatch(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)$/);

      await active.hover();
      await expect
        .poll(() => active.evaluate(element => getComputedStyle(element).boxShadow))
        .not.toBe('none');
    }

    await page.goto('/docs/introduction');
    const docs = navigation.getByRole('link', { name: 'Docs' });
    await navigation.getByRole('link', { name: 'Home' }).focus();
    await page.keyboard.press('Tab');
    await expect(docs).toBeFocused();
    expect(await docs.evaluate(element => element.matches(':focus-visible'))).toBe(true);
    expect(await docs.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');

    await page.goto('/docs/components/button');
    await expect(navigation.locator('a[aria-current="page"]')).toHaveAccessibleName('Components');

    await page.goto('/es/docs/components/button');
    const localizedActive = navigation.locator('a[aria-current="page"]');
    await expect(localizedActive).toHaveCount(1);
    await expect(localizedActive).toHaveAttribute('href', /\/es\/docs\/components$/);
  });

  test('connects the main desktop journeys without a full reload', async ({ page }) => {
    await page.goto('/');
    const navigation = page.locator('header').getByRole('navigation');

    await navigation.getByRole('link', { name: 'Docs' }).click();
    await expect(page).toHaveURL(/\/docs\/introduction$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await navigation.getByRole('link', { name: 'Components' }).click();
    await expect(page).toHaveURL(/\/docs\/components$/);

    await navigation.getByRole('link', { name: 'Create Theme' }).click();
    await expect(page).toHaveURL(/\/create-theme$/);
    await expect(page.getByRole('heading', { name: 'Design your system.' })).toBeVisible();
  });

  test('marks the current docs sidebar link with theme-safe text and boundary contrast', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/radio');
    await page.addStyleTag({
      content:
        '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
    const current = page.locator('app-docs-nav-list a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName('Radio');

    const failures = await page.evaluate(
      async presets => {
        const root = document.documentElement;
        const link = document.querySelector<HTMLElement>(
          'app-docs-nav-list a[aria-current="page"]'
        )!;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true })!;
        const rgb = (color: string) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return Array.from(
            context.getImageData(0, 0, 1, 1).data.slice(0, 3),
            channel => channel / 255
          );
        };
        const luminance = (color: number[]) => {
          const linear = color.map(channel =>
            channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          );
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        };
        const contrast = (first: number[], second: number[]) => {
          const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
          return (values[0] + 0.05) / (values[1] + 0.05);
        };
        const failures: string[] = [];

        for (const preset of presets) {
          root.dataset.color = preset.color;
          root.dataset.style = preset.style;
          root.classList.toggle('dark', preset.dark);
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

          const style = getComputedStyle(link);
          const foreground = rgb(style.color);
          const accentSurface = rgb(style.backgroundColor);
          const ring = rgb(getComputedStyle(root).getPropertyValue('--ring'));
          const name = `${preset.color}/${preset.dark ? 'dark' : 'light'}/${preset.style}`;
          const textContrast = contrast(foreground, accentSurface);
          const ringContrast = contrast(ring, accentSurface);
          if (textContrast < 4.5)
            failures.push(`${name}: sidebar text ${textContrast.toFixed(2)}:1`);
          if (ringContrast < 3)
            failures.push(`${name}: sidebar boundary ${ringContrast.toFixed(2)}:1`);
        }

        for (const fixture of [
          {
            mode: 'light',
            tokens: {
              '--foreground': '#0f172a',
              '--muted': '#e2e8f0',
              '--ring': '#1d4ed8',
            },
          },
          {
            mode: 'dark',
            tokens: {
              '--foreground': '#f8fafc',
              '--muted': '#1e293b',
              '--ring': '#93c5fd',
            },
          },
        ]) {
          root.classList.toggle('dark', fixture.mode === 'dark');
          for (const [token, value] of Object.entries(fixture.tokens)) {
            root.style.setProperty(token, value);
          }
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const style = getComputedStyle(link);
          const textContrast = contrast(rgb(style.color), rgb(style.backgroundColor));
          const ringContrast = contrast(
            rgb(getComputedStyle(root).getPropertyValue('--ring')),
            rgb(style.backgroundColor)
          );
          if (textContrast < 4.5)
            failures.push(`custom ${fixture.mode}: sidebar text ${textContrast.toFixed(2)}:1`);
          if (ringContrast < 3)
            failures.push(`custom ${fixture.mode}: sidebar boundary ${ringContrast.toFixed(2)}:1`);
        }

        return failures;
      },
      ['volt', 'ember', 'sage', 'dusk', 'glacier'].flatMap(color =>
        [false, true].flatMap(dark =>
          ['sharp', 'soft', 'brutal', 'ghost', 'retro'].map(style => ({ color, dark, style }))
        )
      )
    );
    expect(failures).toEqual([]);
  });

  test('names the read-only source editor and keeps component page headings sequential', async ({
    page,
  }) => {
    await page.goto('/docs/components/radio');
    await expect(page.locator('.docs-content h1')).toHaveText('Radio');
    const headings = await page
      .locator('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content h4')
      .evaluateAll(elements =>
        elements.map(element => ({
          level: Number(element.tagName.slice(1)),
          label: element.textContent?.trim(),
        }))
      );
    expect(headings.length).toBeGreaterThan(0);
    for (let index = 1; index < headings.length; index++) {
      expect(headings[index].level).toBeLessThanOrEqual(headings[index - 1].level + 1);
    }

    const sourceEditor = page.locator('app-code-panel vertex-editor-lite').last();
    await expect
      .poll(() =>
        sourceEditor.evaluate(editor =>
          (editor as HTMLElement).shadowRoot
            ?.querySelector<HTMLElement>('.cm-content[role="textbox"]')
            ?.getAttribute('aria-label')
        )
      )
      .toBe(headings.at(-1)?.label);
  });

  test('opens, closes and navigates through the mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Open menu' }).click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('link', { name: 'Components' }).click();

    await expect(page).toHaveURL(/\/docs\/components$/);
    await expect(dialog).toBeHidden();

    await page.locator('app-mobile-menu button').click();
    const reopenedDialog = page.getByRole('dialog', { name: 'Menu' });
    const mobileNavigation = reopenedDialog.getByRole('navigation');
    await expect(mobileNavigation.locator('a[aria-current="page"]')).toHaveCount(1);
    await expect(mobileNavigation.locator('a[aria-current="page"]')).toHaveAccessibleName(
      'Components'
    );
  });
});
