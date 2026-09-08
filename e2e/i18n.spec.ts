import { expect, test } from '@playwright/test';

const ORIGIN = 'https://volt-ui.andersseen.dev';
const RUNS_SSR = process.env['E2E_SERVER'] === 'wrangler';
const localeChunk = (locale: string) => new RegExp(`/assets/etyma-locale-${locale}-[^/]+\\.js$`);

async function headLinks(page: import('@playwright/test').Page) {
  return page.evaluate(() => ({
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(link => ({
      hreflang: link.getAttribute('hreflang'),
      href: link.getAttribute('href'),
    })),
  }));
}

async function openLanguageMenu(page: import('@playwright/test').Page) {
  const trigger = page.getByTestId('language-trigger');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByTestId('language-option-en')).toBeVisible();
}

async function chooseLanguage(page: import('@playwright/test').Page, locale: 'en' | 'es' | 'uk') {
  await openLanguageMenu(page);
  const option = page.getByTestId(`language-option-${locale}`);
  await expect(option).toBeVisible();
  await option.click({ force: true });
}

test.describe('Localised site', () => {
  test('opens each locale in its own language', async ({ page }) => {
    for (const [path, lang, docs] of [
      ['/', 'en', 'Docs'],
      ['/es', 'es', 'Documentación'],
      ['/uk', 'uk', 'Документація'],
    ] as const) {
      await page.goto(path);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
      await expect(
        page.locator('header').getByRole('navigation').getByRole('link', { name: docs })
      ).toBeVisible();
    }
  });

  test('redirects duplicate source-locale URLs to the unprefixed route', async ({ page }) => {
    await page.goto('/en/docs?tab=api#usage');

    await expect(page).toHaveURL(/\/docs\?tab=api#usage$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('writes absolute canonical, hreflang and x-default links', async ({ page }) => {
    await page.goto('/es/docs/themes?preset=ember#presets');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    expect(await headLinks(page)).toEqual({
      canonical: `${ORIGIN}/es/docs/themes`,
      alternates: [
        { hreflang: 'en', href: `${ORIGIN}/docs/themes` },
        { hreflang: 'es', href: `${ORIGIN}/es/docs/themes` },
        { hreflang: 'uk', href: `${ORIGIN}/uk/docs/themes` },
        { hreflang: 'x-default', href: `${ORIGIN}/docs/themes` },
      ],
    });
  });

  test('keeps the reader in their language when they navigate', async ({ page }) => {
    await page.goto('/uk');

    await page
      .locator('header')
      .getByRole('navigation')
      .getByRole('link', { name: 'Компоненти' })
      .click();

    await expect(page).toHaveURL(/\/uk\/docs\/components$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });

  for (const [label, start, locale, expected, lang] of [
    [
      'source to Spanish',
      '/docs/themes?preset=ember#presets',
      'es',
      /\/es\/docs\/themes\?preset=ember#presets$/,
      'es',
    ],
    [
      'Spanish to Ukrainian',
      '/es/docs/themes?preset=ember#presets',
      'uk',
      /\/uk\/docs\/themes\?preset=ember#presets$/,
      'uk',
    ],
    [
      'Ukrainian to source',
      '/uk/docs/themes?preset=ember#presets',
      'en',
      /\/docs\/themes\?preset=ember#presets$/,
      'en',
    ],
  ] as const) {
    test(`switches language in place and preserves query and fragment: ${label}`, async ({
      page,
    }) => {
      await page.goto(start);
      await page.waitForLoadState('networkidle');
      await chooseLanguage(page, locale);
      await expect(page).toHaveURL(expected);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }

  test('renders a deep localised link without any client-side redirect', async ({ page }) => {
    const response = await page.goto('/uk/docs/blocks/hero');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/uk\/docs\/blocks\/hero$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Hero Spotlight' })).toBeVisible();
  });

  test('updates SEO metadata after same-locale SPA navigation', async ({ page }) => {
    await page.goto('/es/docs/components/button');
    await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();

    await page.locator('a[href="/es/docs/components/card"]').first().click();
    await expect(page).toHaveURL(/\/es\/docs\/components\/card$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Card' })).toBeVisible();

    const links = await headLinks(page);
    expect(links.canonical).toBe(`${ORIGIN}/es/docs/components/card`);
    expect(links.alternates).toEqual([
      { hreflang: 'en', href: `${ORIGIN}/docs/components/card` },
      { hreflang: 'es', href: `${ORIGIN}/es/docs/components/card` },
      { hreflang: 'uk', href: `${ORIGIN}/uk/docs/components/card` },
      { hreflang: 'x-default', href: `${ORIGIN}/docs/components/card` },
    ]);
  });

  test('returns translated HTML from SSR', async ({ request }) => {
    test.skip(!RUNS_SSR, 'Raw SSR is served by Wrangler/Nitro, not vite preview.');

    const spanish = await request.get('/es/docs');
    const ukrainian = await request.get('/uk/docs');

    await expect(spanish).toBeOK();
    await expect(ukrainian).toBeOK();
    expect(await spanish.text()).toContain('Documentación');
    expect(await ukrainian.text()).toContain('Документація');
  });

  test('hydrates without a source-language flash or mismatch', async ({ page }) => {
    test.skip(!RUNS_SSR, 'Hydration transfer is only meaningful against the SSR server.');
    test.fail(
      RUNS_SSR,
      'Etyma 0.1.0 briefly resets translated SSR output to the source locale during hydration.'
    );

    const problems: string[] = [];

    page.on('console', message => {
      if (message.type() === 'error' || message.type() === 'warning') {
        problems.push(message.text());
      }
    });
    page.on('pageerror', error => problems.push(error.message));

    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { __voltSeen: string[] }).__voltSeen = seen;

      const sample = () => {
        const link = [...document.querySelectorAll('header nav a')].find(anchor =>
          /Docs|Documentación/.test(anchor.textContent ?? '')
        )?.textContent;

        if (link && !seen.includes(link.trim())) {
          seen.push(link.trim());
        }
      };

      const observer = new MutationObserver(sample);
      document.addEventListener('DOMContentLoaded', () => {
        sample();
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
      });
    });

    await page.goto('/es/docs');
    await expect(
      page.locator('header').getByRole('navigation').getByRole('link', { name: 'Documentación' })
    ).toBeVisible();
    await page.waitForLoadState('networkidle');

    const seen = await page.evaluate(
      () => (window as unknown as { __voltSeen: string[] }).__voltSeen
    );
    expect(seen).toEqual(['Documentación']);
    expect(problems.filter(text => /NG0500|NG050[0-9]|hydration/i.test(text))).toEqual([]);
  });

  test('does not fetch the active locale catalog again after SSR', async ({ page }) => {
    test.skip(!RUNS_SSR, 'The active locale catalog is only transferred by the SSR server.');

    const requested: string[] = [];
    page.on('request', request => requested.push(new URL(request.url()).pathname));

    await page.goto('/es/docs');
    await expect(
      page.locator('header').getByRole('navigation').getByRole('link', { name: 'Documentación' })
    ).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(requested.filter(path => localeChunk('es').test(path))).toEqual([]);
  });

  test('lazy-loads secondary locale catalogs only when requested', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', request => requested.push(new URL(request.url()).pathname));

    await page.goto('/docs');
    await page.waitForLoadState('networkidle');

    expect(requested.filter(path => localeChunk('es').test(path))).toEqual([]);
    expect(requested.filter(path => localeChunk('uk').test(path))).toEqual([]);

    await chooseLanguage(page, 'es');
    await expect(page).toHaveURL(/\/es\/docs\/introduction$/);
    await expect(
      page.locator('header').getByRole('navigation').getByRole('link', { name: 'Documentación' })
    ).toBeVisible();

    await page.goto('/es/docs');
    await page.waitForLoadState('networkidle');
    requested.length = 0;

    await chooseLanguage(page, 'uk');
    await expect(page).toHaveURL(/\/uk\/docs\/introduction$/);
    await expect(
      page.locator('header').getByRole('navigation').getByRole('link', { name: 'Документація' })
    ).toBeVisible();

    expect(requested.filter(path => localeChunk('uk').test(path))).toHaveLength(1);
    expect(requested.filter(path => localeChunk('es').test(path))).toHaveLength(0);
  });
});
