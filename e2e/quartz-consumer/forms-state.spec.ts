import { expect, test, type Page } from '@playwright/test';
import { BACKENDS, open } from './harness';

/**
 * The Stateful Value Contract (specs/TESTING.md) for the nine dual-backend families, in a real
 * browser, against the four packed consumers (package and CLI copy, each engine). The "Programmatic"
 * and "Template-driven" sections of `demo.ts` exist for this file.
 *
 * What a jsdom spec cannot show and this does: a programmatic write paints the control, the control
 * is still operable by a real pointer afterwards, a user action is exactly one `valueChanges`, and a
 * programmatic write is never echoed back as a user change (the form stays pristine).
 */
const prog = (page: Page) => page.getByRole('region', { name: 'Programmatic' });
const changes = (page: Page) => page.locator('#prog-changes');

// A select trigger shows `displayWith(value)` (by default `String(value)`), not the option's label.
async function expectAllSetToY(page: Page) {
  const p = prog(page);
  await expect(p.getByRole('checkbox', { name: 'P check' })).toHaveAttribute(
    'aria-checked',
    'true'
  );
  await expect(p.getByRole('switch', { name: 'P switch' })).toHaveAttribute('aria-checked', 'true');
  await expect(p.getByRole('button', { name: 'P toggle' })).toHaveAttribute('aria-pressed', 'true');
  await expect(p.getByRole('radio', { name: 'P radio y' })).toHaveAttribute('aria-checked', 'true');
  await expect(p.getByRole('radio', { name: 'P radio x' })).toHaveAttribute(
    'aria-checked',
    'false'
  );
  // A single-mode toggle group is a group of `radio`s (docs/headless-backends.md).
  await expect(p.getByRole('radio', { name: 'P group y' })).toHaveAttribute('aria-checked', 'true');
  await expect(p.getByRole('option', { name: 'P list y' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(p.getByRole('option', { name: 'P list x' })).toHaveAttribute(
    'aria-selected',
    'false'
  );
  await expect(p.getByRole('combobox', { name: 'P select' })).toHaveText('y');
  await expect(p.getByRole('tab', { name: 'P tab y' })).toHaveAttribute('aria-selected', 'true');
  await expect(p.getByText('P tab panel y')).toBeVisible();
  await expect(p.getByText('P tab panel x')).toBeHidden();
  await expect(p.getByRole('button', { name: 'P section y' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
}

for (const [name, url] of BACKENDS) {
  test.describe(`${name} consumer — state ownership`, () => {
    test.skip(!url, `the URL for ${name} is not set`);

    test('programmatic writes reach the DOM, are not echoed, and the controls stay interactive', async ({
      page,
    }) => {
      const problems = await open(page, url!);
      const p = prog(page);
      await expect(changes(page)).toHaveText('0');

      await page.getByRole('button', { name: 'Set all', exact: true }).click();
      await expectAllSetToY(page);
      // One setValue → one valueChanges; no control called onChange back (that would mark it dirty
      // and emit again).
      await expect(changes(page)).toHaveText('1');
      await expect(page.locator('#prog-dirty')).toHaveText('false');

      // Each real user action after the write: the DOM follows, exactly one emission each.
      let expected = 1;
      const step = async (action: () => Promise<void>) => {
        await action();
        expected += 1;
        await expect(changes(page)).toHaveText(String(expected));
      };
      await step(() => p.getByRole('checkbox', { name: 'P check' }).click());
      await expect(p.getByRole('checkbox', { name: 'P check' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
      await expect(page.locator('#prog-dirty')).toHaveText('true');
      await step(() => p.getByRole('switch', { name: 'P switch' }).click());
      await step(() => p.getByRole('button', { name: 'P toggle' }).click());
      await step(() => p.getByRole('radio', { name: 'P radio x' }).click());
      await expect(p.getByRole('radio', { name: 'P radio x' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      await step(() => p.getByRole('radio', { name: 'P group x' }).click());
      await expect(p.getByRole('radio', { name: 'P group y' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
      await step(() => p.getByRole('option', { name: 'P list x' }).click());
      await expect(p.getByRole('option', { name: 'P list x' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await step(async () => {
        await p.getByRole('combobox', { name: 'P select' }).click();
        await page.getByRole('option', { name: 'P select x' }).click();
      });
      await expect(p.getByRole('combobox', { name: 'P select' })).toHaveText('x');
      await expect(page.getByRole('option', { name: 'P select x' })).toHaveCount(0);

      // One-way bound Tabs and Accordion: the parent wrote 'y'; the user can still move them.
      await p.getByRole('tab', { name: 'P tab x' }).click();
      await expect(p.getByRole('tab', { name: 'P tab x' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await expect(p.getByText('P tab panel x')).toBeVisible();
      await p.getByRole('button', { name: 'P section x' }).click();
      await expect(p.getByRole('button', { name: 'P section x' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      await expect(p.getByRole('button', { name: 'P section y' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );

      await expect(page.locator('#prog-value')).toHaveText(
        JSON.stringify(
          {
            check: false,
            sw: false,
            tog: false,
            radio: 'x',
            group: ['x'],
            list: ['x'],
            sel: 'x',
          },
          null,
          2
        ).replace(/\s+/g, ' '),
        { useInnerText: false }
      );
      expect(problems).toEqual([]);
    });

    test('reset restores, disable propagates, enable restores interactivity', async ({ page }) => {
      await open(page, url!);
      const p = prog(page);
      await page.getByRole('button', { name: 'Set all', exact: true }).click();
      await expectAllSetToY(page);

      await page.getByRole('button', { name: 'Reset all', exact: true }).click();
      await expect(p.getByRole('checkbox', { name: 'P check' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
      await expect(p.getByRole('switch', { name: 'P switch' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
      await expect(p.getByRole('button', { name: 'P toggle' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      for (const radio of ['P radio x', 'P radio y', 'P group x', 'P group y']) {
        await expect(p.getByRole('radio', { name: radio })).toHaveAttribute(
          'aria-checked',
          'false'
        );
      }
      for (const option of ['P list x', 'P list y']) {
        await expect(p.getByRole('option', { name: option })).toHaveAttribute(
          'aria-selected',
          'false'
        );
      }
      await expect(p.getByRole('combobox', { name: 'P select' })).toContainText('P pick');
      await expect(page.locator('#prog-dirty')).toHaveText('false');

      await page.getByRole('button', { name: 'Disable all', exact: true }).click();
      const controls = [
        p.getByRole('checkbox', { name: 'P check' }),
        p.getByRole('switch', { name: 'P switch' }),
        p.getByRole('button', { name: 'P toggle' }),
        p.getByRole('radio', { name: 'P radio x' }),
        p.getByRole('radio', { name: 'P group x' }),
        p.getByRole('combobox', { name: 'P select' }),
      ];
      // Native `disabled` or `aria-disabled="true"` (an allowed backend difference, see
      // docs/headless-backends.md "Known differences"): Playwright's toBeDisabled accepts either.
      for (const control of controls) await expect(control).toBeDisabled();
      await expect(p.getByRole('listbox', { name: 'P list' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      // Investigating disabled behaviour is the one place a forced click is the point: the pointer
      // reaches the control and nothing must change.
      const before = await changes(page).textContent();
      for (const control of controls) await control.click({ force: true });
      await p.getByRole('option', { name: 'P list x' }).click({ force: true });
      await expect(page.getByRole('option', { name: 'P select x' })).toHaveCount(0);
      await expect(changes(page)).toHaveText(before!);
      await expect(p.getByRole('checkbox', { name: 'P check' })).toHaveAttribute(
        'aria-checked',
        'false'
      );

      await page.getByRole('button', { name: 'Enable all', exact: true }).click();
      for (const control of controls) await expect(control).toBeEnabled();
      await p.getByRole('checkbox', { name: 'P check' }).click();
      await expect(p.getByRole('checkbox', { name: 'P check' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      await p.getByRole('option', { name: 'P list y' }).click();
      await expect(p.getByRole('option', { name: 'P list y' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    test('validation: touched + invalid is aria-invalid on every form control, and clears', async ({
      page,
    }) => {
      await open(page, url!);
      const invalid = prog(page).locator('[aria-invalid="true"]');
      // Untouched: never invalid on first paint, even though every control is required.
      await expect(invalid).toHaveCount(0);
      await page.getByRole('button', { name: 'Touch all', exact: true }).click();
      // checkbox, switch, toggle, radio group, toggle group, listbox, select trigger.
      await expect(invalid).toHaveCount(7);
      const carriers = await invalid.evaluateAll(els =>
        els.map(e => e.getAttribute('role') ?? e.tagName.toLowerCase()).sort()
      );
      await test.info().attach('aria-invalid carriers', {
        body: JSON.stringify(carriers),
        contentType: 'application/json',
      });
      await page.getByRole('button', { name: 'Set all', exact: true }).click();
      await expect(invalid).toHaveCount(0);
    });

    test('template-driven Forms: ngModel writes reach the DOM; user changes reach ngModel', async ({
      page,
    }) => {
      await open(page, url!);
      const td = page.getByRole('region', { name: 'Template-driven' });
      const value = page.locator('#td-value');
      await expect(value).toHaveText('false||');
      await page.getByRole('button', { name: 'TD set all', exact: true }).click();
      await expect(td.getByRole('checkbox', { name: 'TD check' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      await expect(td.getByRole('radio', { name: 'TD radio y' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      await expect(td.getByRole('combobox', { name: 'TD select' })).toHaveText('y');

      await td.getByRole('radio', { name: 'TD radio x' }).click();
      await expect(value).toHaveText('true|x|y');
      await td.getByRole('combobox', { name: 'TD select' }).click();
      await page.getByRole('option', { name: 'TD select x' }).click();
      await expect(value).toHaveText('true|x|x');
      await td.getByRole('checkbox', { name: 'TD check' }).click();
      await expect(value).toHaveText('false|x|x');
    });

    test('repeated interaction cycles stay consistent and log nothing', async ({ page }) => {
      const problems = await open(page, url!);
      const p = prog(page);
      const section = p.getByRole('button', { name: 'P section x' });
      const select = p.getByRole('combobox', { name: 'P select' });
      for (let i = 0; i < 6; i++) {
        await section.click();
        await expect(section).toHaveAttribute('aria-expanded', 'true');
        await section.click();
        await expect(section).toHaveAttribute('aria-expanded', 'false');
        await p.getByRole('tab', { name: i % 2 ? 'P tab x' : 'P tab y' }).click();
        await expect(p.getByRole('tab', { name: i % 2 ? 'P tab x' : 'P tab y' })).toHaveAttribute(
          'aria-selected',
          'true'
        );
        await select.click();
        await page.getByRole('option', { name: i % 2 ? 'P select x' : 'P select y' }).click();
        await expect(select).toHaveText(i % 2 ? 'x' : 'y');
      }
      // Exactly one emission per select commit (6) — nothing accumulated across cycles.
      await expect(changes(page)).toHaveText('6');
      // One tab panel visible, one accordion region open at most, no orphaned popup.
      await expect(p.getByRole('tabpanel')).toHaveCount(1);
      await expect(page.getByRole('option', { name: /^P select/ })).toHaveCount(0);
      expect(problems).toEqual([]);
    });
  });
}
