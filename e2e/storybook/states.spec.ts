import { createRequire } from 'node:module';
import { expect, test, type Page } from '@playwright/test';

/**
 * Targeted interaction and state checks against the static Storybook.
 *
 * `storybook.spec.ts` proves every story *renders*; this proves that the states Storybook
 * advertises actually exist and are visibly distinct, and that a few representative stories pass
 * an accessibility scan. Deeper behaviour (keyboard, focus, geometry) is owned by the unit specs
 * and by e2e/contracts — not duplicated here.
 */
const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core/axe.min.js');

interface IndexEntry {
  id: string;
  type: 'story' | 'docs';
  title: string;
  name: string;
}

let index: IndexEntry[] = [];

test.beforeAll(async ({ request }) => {
  const body = (await (await request.get('/index.json')).json()) as {
    entries: Record<string, IndexEntry>;
  };
  index = Object.values(body.entries).filter(e => e.type === 'story');
});

/** Opens a story by its component title suffix and story name (the label in the sidebar). */
async function open(page: Page, component: string, name: string, globals = ''): Promise<void> {
  const entry = index.find(e => e.title.endsWith(`/${component}`) && e.name === name);
  if (!entry) throw new Error(`No story "${component} / ${name}" in the index`);
  await page.goto(
    `/iframe.html?id=${entry.id}&viewMode=story${globals ? `&globals=${globals}` : ''}`
  );
  await page.waitForFunction(() => document.querySelector('#storybook-root')?.childElementCount);
  await expect(page.locator('body')).not.toHaveClass(/sb-show-errordisplay/);
}

/** What a person can tell apart: background, text, border and shadow of the element. */
const paint = (el: import('@playwright/test').Locator) =>
  el.first().evaluate(e => {
    const s = getComputedStyle(e);
    return [s.backgroundColor, s.color, s.borderTopColor, s.boxShadow].join('|');
  });

test.describe('advertised states exist', () => {
  test('Toggle / States: pressed is visibly distinct, disabled ignores input', async ({ page }) => {
    await open(page, 'Toggle', 'States');
    const off = page.getByRole('button', { name: 'Not pressed' });
    const on = page.getByRole('button', { name: 'Pressed', exact: true });
    await expect(off).toHaveAttribute('aria-pressed', 'false');
    await expect(on).toHaveAttribute('aria-pressed', 'true');
    expect(await paint(on)).not.toBe(await paint(off));

    const disabled = page.getByRole('button', { name: 'Disabled', exact: true });
    const both = page.getByRole('button', { name: 'Pressed, disabled' });
    await expect(disabled).toBeDisabled();
    await expect(both).toBeDisabled();
    await expect(both).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible();
  });

  test('Checkbox / Switch / Radio: invalid is exposed to assistive technology', async ({
    page,
  }) => {
    await open(page, 'Checkbox', 'Invalid');
    await expect(page.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    await open(page, 'Switch', 'Invalid');
    await expect(page.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
    await open(page, 'Radio', 'Invalid');
    await expect(page.getByRole('radiogroup', { name: 'Plan' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  test('Radio / States: exactly one item is checked, the disabled one cannot be chosen', async ({
    page,
  }) => {
    await open(page, 'Radio', 'States');
    const group = page.getByRole('radiogroup', { name: 'States' });
    await expect(group.getByRole('radio', { name: 'Checked', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
    await group.getByRole('radio', { name: 'Disabled' }).click({ force: true });
    await expect(group.getByRole('radio', { name: 'Checked', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  test('Input / States: error and success are visually distinct from default', async ({ page }) => {
    await open(page, 'Input', 'States');
    const base = await paint(page.getByRole('textbox', { name: 'Default' }));
    expect(await paint(page.getByRole('textbox', { name: 'Error' }))).not.toBe(base);
    expect(await paint(page.getByRole('textbox', { name: 'Success' }))).not.toBe(base);
    await expect(page.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();
    await expect(page.getByRole('textbox', { name: 'Read only' })).toHaveAttribute('readonly', '');
  });

  test('Combobox: the manual-filtering states are opened and on screen', async ({ page }) => {
    await open(page, 'Combobox', 'Manual filtering — loading');
    await expect(page.getByText('Searching…').first()).toBeVisible();

    await open(page, 'Combobox', 'Manual filtering — results');
    await expect(page.getByRole('option')).toHaveCount(3);

    await open(page, 'Combobox', 'Manual filtering — no results');
    await expect(page.getByText('No framework matches').first()).toBeVisible();
  });

  test('Dialog / Not dismissible: Escape does nothing until Done', async ({ page }) => {
    await open(page, 'Dialog', 'Not dismissible while pending');
    await page.getByRole('button', { name: 'Open' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe('themes', () => {
  test('a pressed Toggle stays distinguishable in another colour and style preset, in dark mode', async ({
    page,
  }) => {
    await open(page, 'Toggle', 'States', 'voltColor:ember;voltStyle:brutal;voltAppearance:dark');
    await expect(page.locator('html')).toHaveAttribute('data-color', 'ember');
    const off = page.getByRole('button', { name: 'Not pressed' });
    const on = page.getByRole('button', { name: 'Pressed', exact: true });
    expect(await paint(on)).not.toBe(await paint(off));
  });
});

interface AxeResult {
  violations: { id: string; impact: string; nodes: { target: string[]; html: string }[] }[];
}

test.describe('accessibility scan', () => {
  const stories: [string, string][] = [
    ['Button', 'Default'],
    ['Checkbox', 'States'],
    ['Radio', 'Default'],
    ['Radio', 'States'],
    ['Slider', 'Default'],
    ['Textarea', 'States'],
    ['Alert', 'Variants'],
    ['Badge', 'Variants'],
    ['Switch', 'States'],
    ['Input', 'States'],
    ['Tabs', 'Default'],
    ['Toggle', 'States'],
  ];

  for (const [component, name] of stories) {
    test(`${component} / ${name} has no serious or critical axe violations`, async ({ page }) => {
      await open(page, component, name);
      await page.addScriptTag({ path: AXE });
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (c: Element) => Promise<AxeResult> } }).axe;
        const result = await axe.run(document.querySelector('#storybook-root')!);
        return result.violations
          .filter(v => v.impact === 'serious' || v.impact === 'critical')
          .map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
      });
      expect(violations).toEqual([]);
    });
  }
});
