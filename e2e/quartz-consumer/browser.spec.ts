import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Both fixture apps (ng-primitives and Quartz) are built from the packed tarball by
 * `scripts/check-quartz-consumer.mjs` and served at E2E_PRIMITIVES_URL / E2E_QUARTZ_URL. The same
 * assertions run against each — the Volt contract — and a last test compares what the two paint.
 */
const BACKENDS = [
  ['ng-primitives', process.env['E2E_PRIMITIVES_URL']],
  ['quartz', process.env['E2E_QUARTZ_URL']],
  ['ng-primitives (CLI copy)', process.env['E2E_PRIMITIVES_COPY_URL']],
  ['quartz (CLI copy)', process.env['E2E_QUARTZ_COPY_URL']],
] as const;

async function open(page: Page, url: string) {
  const problems: string[] = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  await page.goto(url);
  await expect(page.getByRole('checkbox', { name: 'Accept terms' })).toBeVisible();
  return problems;
}

const paint = (l: Locator) =>
  l.first().evaluate(el => {
    const s = getComputedStyle(el);
    return [
      s.backgroundColor,
      s.color,
      s.borderTopColor,
      s.borderTopWidth,
      s.boxShadow,
      s.opacity,
      s.cursor,
      s.width,
      s.height,
      s.borderRadius,
    ].join('|');
  });

for (const [name, url] of BACKENDS) {
  test.describe(`${name} consumer`, () => {
    test.skip(!url, `the URL for ${name} is not set`);

    test('server HTML is prerendered, hydrates cleanly, ids are unique', async ({
      page,
      request,
    }) => {
      const html = await (await request.get(url!)).text();
      expect(html).toContain('role="checkbox"');
      expect(html).toContain('role="switch"');
      expect(html).toContain('aria-pressed=');
      expect(html).toContain('ngh='); // hydration annotations

      const problems = await open(page, url!);
      await page.waitForTimeout(300);
      const ids = await page.locator('[id]').evaluateAll(els => els.map(e => e.id));
      expect(new Set(ids).size, `duplicate ids: ${ids}`).toBe(ids.length);
      // The prerendered controls are adopted, not replaced.
      expect(await page.locator('body').getAttribute('ng-version')).toBeNull();
      expect(problems).toEqual([]);
    });

    test('native label, pointer and keyboard drive the Forms value', async ({ page }) => {
      const problems = await open(page, url!);
      const value = page.locator('#value');
      const box = page.getByRole('checkbox', { name: 'Accept terms' });
      await expect(box).toHaveAttribute('aria-checked', 'false');

      await page.getByText('Accept terms').click(); // <label for>
      await expect(box).toHaveAttribute('aria-checked', 'true');
      await expect(value).toContainText('"accept": true');
      await expect(page.locator('#dirty')).toHaveText('true');

      const sw = page.getByRole('switch', { name: 'Notifications' });
      await expect(sw).toHaveAttribute('aria-checked', 'true');
      await sw.focus();
      await page.keyboard.press('Space');
      await expect(sw).toHaveAttribute('aria-checked', 'false');
      await expect(value).toContainText('"notify": false');

      const bold = page.getByRole('button', { name: 'Bold', exact: true });
      await bold.focus();
      await page.keyboard.press('Space');
      await expect(bold).toHaveAttribute('aria-pressed', 'true');
      await page.keyboard.press('Enter');
      await expect(bold).toHaveAttribute('aria-pressed', 'false');
      await expect(value).toContainText('"bold": false');

      expect(problems).toEqual([]);
    });

    test('blur marks the control touched', async ({ page }) => {
      await open(page, url!);
      await expect(page.locator('#touched')).toHaveText('false');
      await page.getByRole('switch', { name: 'Notifications' }).focus();
      await expect(page.locator('#touched')).toHaveText('false');
      await page.keyboard.press('Tab');
      await expect(page.locator('#touched')).toHaveText('true');
    });

    test('mixed resolves to checked on activation', async ({ page }) => {
      await open(page, url!);
      const mixed = page.getByRole('checkbox', { name: 'Mixed box' });
      await expect(mixed).toHaveAttribute('aria-checked', 'mixed');
      await mixed.click();
      await expect(mixed).toHaveAttribute('aria-checked', 'true');
    });

    test('focus ring shows for keyboard focus only', async ({ page }) => {
      await open(page, url!);
      const sw = page.getByRole('switch', { name: 'Switch off' });
      await sw.click();
      await page.mouse.move(0, 0);
      expect(await sw.evaluate(el => getComputedStyle(el).boxShadow)).toBe('none');
      // Reach a control with the keyboard from the top of the page (WebKit/Safari does not
      // Tab onto buttons unless the control was focused by keyboard navigation).
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      const box = page.getByRole('checkbox', { name: 'Accept terms' });
      for (let i = 0; i < 6 && !(await box.evaluate(el => el === document.activeElement)); i++) {
        await page.keyboard.press('Tab');
      }
      await expect(box).toBeFocused();
      const ring = await box.evaluate(el => getComputedStyle(el).boxShadow);
      expect(ring).not.toBe('none');
    });

    test('radio group: prerendered, forms-bound, roving focus, label-for, touched', async ({
      page,
      request,
    }) => {
      const html = await (await request.get(url!)).text();
      expect(html).toContain('role="radiogroup"');
      expect(html).toMatch(
        /role="radio"[^>]*aria-checked="true"|aria-checked="true"[^>]*role="radio"/
      );

      const problems = await open(page, url!);
      const value = page.locator('#value');
      const pear = page.getByRole('radio', { name: 'Pear' });
      await expect(pear).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('#dirty')).toHaveText('false');

      // Tab lands on the checked radio only; arrows move and select; Home/End are not part of the contract.
      await page.getByRole('checkbox', { name: 'Accept terms' }).focus();
      await page.keyboard.press('Tab'); // switch
      await page.keyboard.press('Tab'); // toggle
      await page.keyboard.press('Tab'); // radio group
      await expect(pear).toBeFocused();
      await page.keyboard.press('ArrowRight');
      const plum = page.getByRole('radio', { name: 'Plum' });
      await expect(plum).toBeFocused();
      await expect(plum).toHaveAttribute('aria-checked', 'true');
      await expect(value).toContainText('"fruit": "plum"');
      await page.keyboard.press('ArrowRight'); // wraps
      await expect(page.getByRole('radio', { name: 'Apple' })).toBeFocused();
      await expect(value).toContainText('"fruit": "apple"');

      // An external <label for> names the radio button and clicking it selects.
      const email = page.getByRole('radio', { name: 'Email me' });
      await expect(email).toHaveAttribute('id', 'email-radio');
      await page.getByText('Email me').click();
      await expect(email).toHaveAttribute('aria-checked', 'true');
      await expect(value).toContainText('"contact": "email"');
      await expect(page.locator('#dirty')).toHaveText('true');
      expect(problems).toEqual([]);
    });

    test('toggle groups: multiple keeps order, single replaces, arrows only move focus', async ({
      page,
    }) => {
      const problems = await open(page, url!);
      const value = page.locator('#value');
      const italic = page.getByRole('button', { name: 'Italic text' });
      await expect(italic).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: 'Bold text' }).click();
      const compact = async () => (await value.textContent())!.replace(/\s+/g, '');
      await expect.poll(compact).toContain('"format":["italic","bold"]');

      const left = page.getByRole('radio', { name: 'Left' });
      await left.click();
      await expect(left).toHaveAttribute('aria-checked', 'true');
      await expect.poll(compact).toContain('"align":["left"]');
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('radio', { name: 'Center' })).toBeFocused();
      await expect(left).toHaveAttribute('aria-checked', 'true'); // focus moved, value did not
      await page.keyboard.press('Space');
      await expect(page.getByRole('radio', { name: 'Center' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      await expect(left).toHaveAttribute('aria-checked', 'false');
      await page.getByRole('radio', { name: 'Center' }).click(); // deselect
      await expect.poll(compact).toContain('"align":[]');
      expect(problems).toEqual([]);
    });

    test('server ids equal client ids: nothing is renumbered by hydration', async ({
      page,
      request,
    }) => {
      const html = await (await request.get(url!)).text();
      const server = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]).sort();
      expect(server.length).toBeGreaterThan(0);
      await open(page, url!);
      await page.waitForTimeout(300);
      const client = (await page.locator('[id]').evaluateAll(els => els.map(e => e.id))).sort();
      expect(client).toEqual(server);
      expect(client.filter(id => /^qz-/.test(id))).toEqual([]);
    });

    test('RTL: horizontal arrows and the reading direction', async ({ page }) => {
      await open(page, url!);
      // Quartz mirrors Left/Right in an RTL group (the WAI-ARIA expectation). ng-primitives 0.131 does
      // not: ArrowLeft always means "previous". Documented in docs/headless-backends.md; the test pins
      // each engine's actual behaviour so a change in either is noticed.
      const mirrors = name.startsWith('quartz');
      const radios = ['RTL one', 'RTL two', 'RTL three'];
      await page.getByRole('radio', { name: 'RTL one' }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(
        page.getByRole('radio', { name: mirrors ? radios[1] : radios[2] })
      ).toBeFocused();

      await page.getByRole('button', { name: 'RTL tone' }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(
        page.getByRole('button', { name: mirrors ? 'RTL ttwo' : 'RTL tthree' })
      ).toBeFocused();
    });

    test('tabs: roles and relationships are prerendered; keyboard drives selection and the model', async ({
      page,
      request,
      browserName,
    }) => {
      const html = await (await request.get(url!)).text();
      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tabpanel"');
      const problems = await open(page, url!);
      const profile = page.getByRole('tab', { name: 'Profile', exact: true });
      const security = page.getByRole('tab', { name: 'Security', exact: true });
      await expect(profile).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#tab-value')).toHaveText('profile');

      // Every aria-controls / aria-labelledby points at a real element, once.
      const dangling = await page.evaluate(() => {
        const bad: string[] = [];
        for (const el of document.querySelectorAll('[aria-controls],[aria-labelledby]')) {
          for (const attr of ['aria-controls', 'aria-labelledby']) {
            for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
              if (document.querySelectorAll(`[id="${id}"]`).length !== 1) bad.push(`${attr}=${id}`);
            }
          }
        }
        return bad;
      });
      expect(dangling).toEqual([]);

      // Only the selected panel is exposed; its content is the only panel content in the Tab order.
      await expect(page.getByRole('button', { name: 'Edit profile' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Change password' })).toHaveCount(0);
      await profile.focus();
      await page.keyboard.press('ArrowRight');
      await expect(security).toBeFocused();
      await expect(security).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#tab-value')).toHaveText('security');
      await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit profile' })).toHaveCount(0);
      // Tab leaves the tablist for the active panel (it is focusable), then its content.
      await page.keyboard.press('Tab');
      await expect(page.locator('[role="tabpanel"][value="security"]')).toBeFocused();
      // WebKit (Safari) does not Tab onto buttons by default.
      if (browserName !== 'webkit') {
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Change password' })).toBeFocused();
      }
      await security.focus();
      await page.keyboard.press('End');
      await expect(page.getByRole('tab', { name: 'Billing', exact: true })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await page.keyboard.press('Home');
      await expect(profile).toHaveAttribute('aria-selected', 'true');
      expect(problems).toEqual([]);
    });

    test('tabs: with activateOnFocus off, arrows move focus and a click selects', async ({
      page,
    }) => {
      await open(page, url!);
      const one = page.getByRole('tab', { name: 'Manual one' });
      const two = page.getByRole('tab', { name: 'Manual two' });
      await one.focus();
      await page.keyboard.press('ArrowRight');
      await expect(two).toBeFocused();
      await expect(two).toHaveAttribute('aria-selected', 'false');
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await two.click();
      await expect(two).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByText('Manual panel two')).toBeVisible();
      await expect(page.getByText('Manual panel one')).toBeHidden();
      if (name.startsWith('quartz')) {
        // ng-primitives' tab is a custom element with no Enter/Space handling; Quartz's is activated by both.
        await one.focus();
        await page.keyboard.press('Enter');
        await expect(one).toHaveAttribute('aria-selected', 'true');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Space');
        await expect(two).toHaveAttribute('aria-selected', 'true');
      }
    });

    test('tabs: RTL mirrors Left/Right (Quartz); ng-primitives keeps ArrowLeft as previous', async ({
      page,
    }) => {
      await open(page, url!);
      await page.getByRole('tab', { name: 'RTL first' }).focus();
      await page.keyboard.press('ArrowLeft');
      // Either engine lands on the other tab of a two-tab list; Quartz does so because it mirrors.
      await expect(page.getByRole('tab', { name: 'RTL second' })).toBeFocused();
      if (name.startsWith('quartz')) {
        await page.keyboard.press('ArrowRight');
        await expect(page.getByRole('tab', { name: 'RTL first' })).toBeFocused();
      }
    });

    test('accordion: toggles by pointer and keyboard, hides closed content from the keyboard and the a11y tree', async ({
      page,
      request,
      browserName,
    }) => {
      const html = await (await request.get(url!)).text();
      expect(html).toContain('aria-expanded="false"');
      const problems = await open(page, url!);
      const shipping = page.getByRole('button', { name: 'Shipping' });
      const returns = page.getByRole('button', { name: 'Returns' });
      await expect(shipping).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('button', { name: 'Track parcel' })).toHaveCount(0);

      await shipping.click();
      await expect(shipping).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#section-value')).toHaveText('shipping');
      await expect(page.getByRole('button', { name: 'Track parcel' })).toBeVisible();
      // WebKit (Safari) does not Tab onto buttons by default, so the Tab order is checked elsewhere.
      if (browserName !== 'webkit') {
        await shipping.focus();
        // The panel content is next in the Tab order; the closed one after "Returns" is skipped.
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Track parcel' })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(returns).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Start return' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Faq one' })).toBeFocused();
      }

      await returns.focus();
      await page.keyboard.press('Enter');
      await expect(returns).toHaveAttribute('aria-expanded', 'true');
      await expect(shipping).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#section-value')).toHaveText('returns');
      await page.keyboard.press('Space'); // collapsible: closes
      await expect(returns).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#section-value')).toHaveText('none');

      // A panel is a labelled region, wired both ways.
      await shipping.click();
      const region = page.getByRole('region', { name: 'Shipping' });
      await expect(region).toBeVisible();
      expect(problems).toEqual([]);
    });

    test('accordion: multiple keeps several panels open', async ({ page }) => {
      await open(page, url!);
      await expect(page.getByText('Faq answer one')).toBeHidden();
      await page.getByRole('button', { name: 'Faq one' }).click();
      await expect(page.getByText('Faq answer one')).toBeVisible();
      await expect(page.getByText('Faq answer two')).toBeHidden();
      await page.getByRole('button', { name: 'Faq two' }).click();
      await expect(page.getByText('Faq answer one')).toBeVisible();
      await expect(page.getByText('Faq answer two')).toBeVisible();
    });

    test('group items: disabled ones and disabled groups ignore input', async ({ page }) => {
      await open(page, url!);
      for (const [role, label, attr] of [
        ['radio', 'Radio C', 'aria-checked'],
        ['radio', 'Radio D', 'aria-checked'],
        ['button', 'Group disabled', 'aria-pressed'],
      ] as const) {
        const el = page.getByRole(role, { name: label });
        const before = await el.getAttribute(attr);
        await el.click({ force: true });
        await expect(el).toHaveAttribute(attr, before!);
      }
    });

    test('disabled controls ignore input', async ({ page }) => {
      await open(page, url!);
      for (const [role, label, attr] of [
        ['checkbox', 'Disabled box', 'aria-checked'],
        ['switch', 'Switch disabled', 'aria-checked'],
        ['button', 'Toggle disabled', 'aria-pressed'],
      ] as const) {
        const el = page.getByRole(role, { name: label });
        const before = await el.getAttribute(attr);
        await el.click({ force: true });
        await expect(el).toHaveAttribute(attr, before!);
      }
    });
  });
}

test('every backend paints and measures the same', async ({ browser }) => {
  const urls = BACKENDS.map(([name, url]) => [name, url] as const).filter(([, url]) => url);
  test.skip(urls.length < 2, 'needs at least two URLs');
  const targets = [
    ['checkbox', 'Checked box'],
    ['checkbox', 'Unchecked box'],
    ['checkbox', 'Mixed box'],
    ['checkbox', 'Disabled box'],
    ['switch', 'Switch on'],
    ['switch', 'Switch off'],
    ['switch', 'Switch disabled'],
    ['button', 'Toggle on'],
    ['button', 'Toggle off'],
    ['button', 'Toggle disabled'],
    ['button', 'Bold'],
    ['radio', 'Radio A'],
    ['radio', 'Radio B'],
    ['radio', 'Radio C'],
    ['radio', 'Radio D'],
    ['button', 'Group on'],
    ['button', 'Group off'],
    ['button', 'Group disabled'],
    ['tab', 'Profile'],
    ['tab', 'Security'],
    ['tab', 'Manual one'],
    ['button', 'Faq one'],
    ['button', 'Faq two'],
  ] as const;
  const read = async (url: string) => {
    const page = await browser.newPage();
    await open(page, url);
    // Computed values are sampled: let no transition (the switch thumb slides) be caught mid-way.
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    const out: Record<string, string> = {};
    for (const [role, name] of targets)
      out[name] = await paint(page.getByRole(role, { name, exact: true }));
    // The switch thumb moves by `translate`: the "on" thumb must sit further right than the "off" one.
    for (const name of ['Switch on', 'Switch off']) {
      out[`${name} thumb`] = await page
        .getByRole('switch', { name })
        .locator('span')
        .evaluate(
          el => getComputedStyle(el).translate + '|' + getComputedStyle(el).backgroundColor
        );
    }
    // The radio dot (indicator) is painted only on the checked item.
    for (const name of ['Radio A', 'Radio B']) {
      out[`${name} dot`] = await page
        .getByRole('radio', { name })
        .locator('span span')
        .evaluate(el => {
          const s = getComputedStyle(el);
          return [s.display, s.backgroundColor, s.width, s.height].join('|');
        });
    }
    // Tab panel, accordion panel and chevron: shown and hidden states paint alike.
    await page.getByRole('button', { name: 'Faq one', exact: true }).click();
    await page.getByRole('button', { name: 'Faq one', exact: true }).evaluate(el => el.blur());
    out['Tab panel'] = await paint(page.getByRole('tabpanel'));
    out['Faq panel'] = await paint(page.getByText('Faq answer one'));
    for (const name of ['Faq one', 'Faq two']) {
      out[`${name} chevron`] = await page
        .getByRole('button', { name, exact: true })
        .locator('svg')
        .evaluate(el => getComputedStyle(el).rotate);
    }
    await page.close();
    return out;
  };
  const [[, firstUrl], ...others] = urls;
  const reference = await read(firstUrl!);
  for (const [name, url] of others) {
    expect(await read(url!), `${name} paints differently from ${urls[0][0]}`).toEqual(reference);
  }
  // The comparison would pass for blank pages: the states must differ from each other.
  expect(reference['Checked box']).not.toBe(reference['Unchecked box']);
  expect(reference['Switch on thumb']).not.toBe(reference['Switch off thumb']);
  expect(reference['Toggle on']).not.toBe(reference['Toggle off']);
  expect(reference['Radio A']).not.toBe(reference['Radio B']);
  expect(reference['Radio A dot']).not.toBe(reference['Radio B dot']);
  expect(reference['Group on']).not.toBe(reference['Group off']);
  expect(reference['Profile']).not.toBe(reference['Security']);
  expect(reference['Faq one chevron']).not.toBe(reference['Faq two chevron']);
});
