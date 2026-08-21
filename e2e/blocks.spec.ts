import { expect, test } from '@playwright/test';

test.describe('Blocks gallery', () => {
  test('walks from the header into a block and back to the component it uses', async ({ page }) => {
    await page.goto('/');

    await page
      .locator('header')
      .getByRole('navigation')
      .getByRole('link', { name: 'Gallery' })
      .click();
    await expect(page).toHaveURL(/\/docs\/blocks$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Blocks' })).toBeVisible();

    await page
      .getByRole('link', { name: /^Pricing Tiers/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/docs\/blocks\/pricing$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Pricing Tiers' })).toBeVisible();

    // The atom chips are the way back to the component a block is made of.
    await page.getByRole('link', { name: 'VoltSwitch' }).click();
    await expect(page).toHaveURL(/\/docs\/components\/switch$/);
  });

  test('drives the pricing switch and swaps every price', async ({ page }) => {
    await page.goto('/docs/blocks/pricing');

    const billing = page.getByRole('switch', { name: 'Bill annually' });
    await expect(billing).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('$19', { exact: true })).toBeVisible();

    // Via the label, which only works because the id is bound onto the inner button.
    await page.getByText('Monthly', { exact: true }).click();

    await expect(billing).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('$24', { exact: true })).toBeVisible();
    await expect(page.getByText('$19', { exact: true })).toBeHidden();
  });

  test('keeps every thumbnail out of the tab order', async ({ page }) => {
    await page.goto('/docs/blocks');

    const focusableInsideThumbnails = await page.evaluate(
      () =>
        [...document.querySelectorAll('app-block-thumbnail')]
          .flatMap(thumb => [...thumb.querySelectorAll('button, a[href], input')])
          .filter(el => {
            (el as HTMLElement).focus();
            return document.activeElement === el;
          }).length
    );

    expect(focusableInsideThumbnails).toBe(0);
  });
});

test.describe('Blocks with reduced motion', () => {
  // page.emulateMedia rather than test.use({ reducedMotion }): the fixture option does not
  // reach the page in this setup, and a preference test that silently tests the default is
  // worse than no test at all.
  test('holds the marquee still and drops the magnetic pull', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/docs/blocks/testimonials');
    // goto resolves on load; the rows only exist once Angular has rendered them.
    await page.locator('.marquee-row').first().waitFor();

    const marquee = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.marquee-row')];
      return {
        rows: rows.length,
        running: rows.filter(row => row.getAnimations().length > 0).length,
        // Nothing scrolls itself now, so the row becomes an ordinary scroller instead.
        overflowX: getComputedStyle(document.querySelector('.marquee-viewport')!).overflowX,
      };
    });

    expect(marquee.rows).toBe(2);
    expect(marquee.running).toBe(0);
    expect(marquee.overflowX).toBe('auto');

    await page.goto('/docs/blocks/cta');
    await page.locator('.magnet').hover();

    const pulled = await page.evaluate(
      () => document.querySelector<HTMLElement>('.magnet')!.style.translate
    );
    expect(pulled).toBe('');
  });
});

test.describe('Gallery tabs', () => {
  test('crosses between blocks and layouts under one navbar entry', async ({ page }) => {
    await page.goto('/docs/blocks/hero');

    const tabs = page.getByRole('navigation', { name: 'Gallery sections' });
    await expect(tabs.getByRole('link', { name: 'Blocks' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await tabs.getByRole('link', { name: 'Layouts' }).click();

    await expect(page).toHaveURL(/\/docs\/layouts\/admin-dashboard$/);
    await expect(tabs.getByRole('link', { name: 'Layouts' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    // The sidebar belongs to the tab, not to the page.
    await expect(page.getByRole('complementary', { name: 'Layouts' })).toBeVisible();
  });

  test('keeps one navbar entry lit for both halves', async ({ page }) => {
    const gallery = page
      .locator('header')
      .getByRole('navigation')
      .getByRole('link', { name: 'Gallery' });

    // A deep link into either half has to arrive with the entry already active,
    // which rules out anything that only updates on click.
    for (const url of ['/docs/blocks/cta', '/docs/layouts/kanban']) {
      await page.goto(url);
      await expect(gallery).toHaveClass(/text-foreground/);
    }
  });
});

test.describe('Blocks gallery cards', () => {
  test('never nests one anchor inside another, which would break hydration', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/docs/blocks');
    await page.locator('app-block-thumbnail').first().waitFor();

    // The thumbnails render whole blocks, and some blocks contain their own links. An
    // <a> inside an <a> is invalid, and the parser rewrites it — which desynchronises the
    // DOM from the server's markup and leaves duplicated sections behind.
    expect(await page.locator('a a').count()).toBe(0);
    expect(errors.filter(text => text.includes('NG0500'))).toEqual([]);

    const headings = await page
      .locator('app-blocks-index-page > div > section > div > h2')
      .allInnerTexts();
    expect(new Set(headings).size).toBe(headings.length);
  });

  test('keeps the whole card clickable from the thumbnail', async ({ page }) => {
    await page.goto('/docs/blocks');

    const thumbnail = page.locator('app-block-thumbnail').first();
    await thumbnail.waitFor();
    await thumbnail.click({ position: { x: 40, y: 40 }, force: true });

    await expect(page).toHaveURL(/\/docs\/blocks\/hero$/);
  });
});

test.describe('Blocks respond to their container', () => {
  // The gallery renders blocks inside a documentation column that is far narrower than
  // the window. Viewport breakpoints cannot see that, so a block laid out with them
  // stays in its desktop shape and overflows; these are container queries instead, and
  // this is the test that says so — the viewport never moves.
  test('lays a block out by the space it gets, not by the window width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/docs/blocks/hero-split');

    const section = page.locator('app-hero-split section');
    await section.waitFor();

    expect(await section.evaluate(el => getComputedStyle(el).containerType)).toBe('inline-size');

    const columnsAt = (width: number) =>
      section.evaluate((el, target) => {
        const frame = el.closest('.overflow-hidden') as HTMLElement;
        const previous = frame.style.width;
        frame.style.width = `${target}px`;
        const grid = el.querySelector('.grid')!;
        const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        frame.style.width = previous;
        return columns;
      }, width);

    expect(await columnsAt(600)).toBe(1);
    expect(await columnsAt(1100)).toBe(2);
  });

  test('drops the login block brand panel when the section is too narrow for it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/docs/blocks/login');

    const section = page.locator('app-auth-login section');
    await section.waitFor();

    const brandVisibleAt = (width: number) =>
      section.evaluate((el, target) => {
        const frame = el.closest('.overflow-hidden') as HTMLElement;
        const previous = frame.style.width;
        frame.style.width = `${target}px`;
        const visible = (el.querySelector('.brand') as HTMLElement).offsetParent !== null;
        frame.style.width = previous;
        return visible;
      }, width);

    expect(await brandVisibleAt(700)).toBe(false);
    expect(await brandVisibleAt(1200)).toBe(true);
  });
});
