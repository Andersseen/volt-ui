import { createRequire } from 'node:module';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { BACKENDS, open, paint } from './harness';

/**
 * Accessibility scans and visual parity for the nine dual-backend families, against the four
 * packed consumers. Automated evidence only: axe finds what rules can find (roles, names, ARIA
 * references, contrast of what is painted). It is not a screen-reader test; that checklist is in
 * docs/quality/manual-a11y-checklist.md and stays a human task.
 */
const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core/axe.min.js');

interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
}

async function axe(page: Page, state: string) {
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async () => {
    const w = window as unknown as {
      axe: {
        run: (
          c: Document,
          o: object
        ) => Promise<{ violations: AxeViolation[]; passes: unknown[]; incomplete: unknown[] }>;
      };
    };
    // WCAG 2.0/2.1/2.2 A + AA rules, plus axe's best practices.
    return w.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
  });
  await test.info().attach(`axe — ${state}`, {
    body: JSON.stringify(
      {
        state,
        violations: result.violations,
        passes: result.passes.length,
        incomplete: result.incomplete.length,
      },
      null,
      2
    ),
    contentType: 'application/json',
  });
  return result.violations
    .filter(v => v.impact === 'serious' || v.impact === 'critical')
    .map(v => `${state}: ${v.id} (${v.impact}) ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

const stable = (page: Page) =>
  page.addStyleTag({
    content:
      '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }',
  });

for (const [name, url] of BACKENDS) {
  test.describe(`${name} consumer — accessibility evidence`, () => {
    test.skip(!url, `the URL for ${name} is not set`);

    test('axe: no serious or critical WCAG A/AA violation in representative functional states', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, url!);
      const found: string[] = [];
      found.push(...(await axe(page, 'initial')));

      // Open disclosure: an expanded accordion region and a non-default tab.
      await page.getByRole('button', { name: 'Shipping', exact: true }).click();
      await page.getByRole('button', { name: 'Faq one', exact: true }).click();
      await page.getByRole('tab', { name: 'Security', exact: true }).click();
      await expect(page.getByRole('region', { name: 'Shipping' })).toBeVisible();
      found.push(...(await axe(page, 'disclosure open')));

      // Invalid form controls.
      await page.getByRole('button', { name: 'Touch all', exact: true }).click();
      await expect(
        page.getByRole('region', { name: 'Programmatic' }).locator('[aria-invalid="true"]')
      ).toHaveCount(7);
      found.push(...(await axe(page, 'invalid controls')));

      // An open select popup with a selected, an active and a disabled option.
      await page.getByRole('combobox', { name: 'Meta framework' }).click();
      await expect(page.getByRole('option', { name: 'Next', exact: true })).toBeVisible();
      await stable(page);
      await test.info().attach('screenshot — select open', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      found.push(...(await axe(page, 'select open')));
      await page.keyboard.press('Escape');

      // An open multi-select.
      await page.getByRole('combobox', { name: 'Tooling' }).click();
      await expect(page.getByRole('option', { name: 'Vite', exact: true })).toBeVisible();
      found.push(...(await axe(page, 'multi-select open')));
      await page.keyboard.press('Escape');

      expect(found).toEqual([]);
    });

    // 1.4.0: `grid … block` went through twMerge, which kept `block`: the 0fr grid row never applied,
    // so with Quartz (visibility only) every closed panel left its full height as blank space.
    test('layout: a closed accordion panel takes no space; an open one does', async ({ page }) => {
      await open(page, url!);
      const height = (text: string) =>
        page
          .getByText(text, { exact: true })
          .locator(
            // `volt-accordion-content` in package mode, `ui-accordion-content` in a CLI copy.
            'xpath=ancestor::*[self::volt-accordion-content or self::ui-accordion-content][1]'
          )
          .evaluate(el => Math.round(el.getBoundingClientRect().height));
      for (const text of ['Faq answer one', 'Faq answer two', 'P answer x']) {
        expect(await height(text), `${text} (closed)`).toBe(0);
      }
      await page.getByRole('button', { name: 'Faq one', exact: true }).click();
      await expect.poll(() => height('Faq answer one')).toBeGreaterThan(10);
      expect(await height('Faq answer two')).toBe(0);
      await page.getByRole('button', { name: 'Faq one', exact: true }).click();
      await expect.poll(() => height('Faq answer one')).toBe(0);
    });

    test('keyboard focus is always visible and never lands on hidden content', async ({
      page,
      browserName,
    }) => {
      // Safari does not Tab to buttons by default (specs/TESTING.md, TAB_SKIPS_BUTTONS).
      test.skip(browserName === 'webkit', 'WebKit does not Tab to buttons by default');
      await open(page, url!);
      await page.getByRole('checkbox', { name: 'Accept terms' }).focus();
      const visited: string[] = [];
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          let hidden = false;
          for (let n: HTMLElement | null = el; n; n = n.parentElement) {
            const ns = getComputedStyle(n);
            if (
              ns.display === 'none' ||
              ns.visibility === 'hidden' ||
              n.hidden ||
              n.getAttribute('aria-hidden') === 'true'
            )
              hidden = true;
          }
          const ring =
            (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
            /rgb|oklch|oklab/.test(s.boxShadow);
          return {
            label: `${el.getAttribute('role') ?? el.tagName.toLowerCase()}:${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 24)}`,
            hidden,
            ring,
            size: rect.width > 0 && rect.height > 0,
            focusVisible: el.matches(':focus-visible'),
          };
        });
        if (!info) break;
        visited.push(info.label);
        expect(info.hidden, `${info.label} is focusable while hidden`).toBe(false);
        expect(info.size, `${info.label} has no box`).toBe(true);
        expect(info.focusVisible, `${info.label} matches :focus-visible`).toBe(true);
        expect(info.ring, `${info.label} paints a focus indicator`).toBe(true);
      }
      await test.info().attach('tab order', {
        body: visited.join('\n'),
        contentType: 'text/plain',
      });
      expect(visited.length).toBeGreaterThan(10);
    });
  });
}

/**
 * The paint comparison in browser.spec.ts runs under the default theme (Volt colour, Sharp style,
 * light). This repeats a representative subset under the other axes a consumer can choose: dark
 * mode, two other colour × style presets and a custom theme that only overrides tokens. Equal
 * computed paint across engines is required; pixel-identical screenshots are not.
 */
const THEMES = [
  { id: 'dark', dark: true },
  { id: 'ember-brutal', color: 'ember', style: 'brutal' },
  { id: 'glacier-soft-dark', color: 'glacier', style: 'soft', dark: true },
  {
    id: 'custom-tokens',
    custom:
      '--primary: oklch(0.55 0.2 145); --primary-foreground: oklch(0.99 0 0); --border: oklch(0.8 0.05 145); --ring: oklch(0.6 0.2 145); --muted: oklch(0.95 0.02 145); --radius: 0.9rem;',
  },
] as const;

const TARGETS = [
  ['checkbox', 'Checked box'],
  ['checkbox', 'Unchecked box'],
  ['checkbox', 'Disabled box'],
  ['switch', 'Switch on'],
  ['switch', 'Switch off'],
  ['button', 'Toggle on'],
  ['button', 'Toggle off'],
  ['radio', 'Radio A'],
  ['radio', 'Radio B'],
  ['button', 'Group on'],
  ['button', 'Group off'],
  ['tab', 'Profile'],
  ['tab', 'Security'],
  ['button', 'Faq one'],
  ['option', 'Angular stack'],
  ['option', 'React stack'],
  ['combobox', 'Meta framework'],
] as const;

async function sample(browser: Browser, url: string, theme: (typeof THEMES)[number]) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await page.emulateMedia({
    reducedMotion: 'reduce',
    colorScheme: 'dark' in theme ? 'dark' : 'light',
  });
  await open(page, url);
  await page.evaluate(
    t => {
      const html = document.documentElement;
      html.classList.toggle('dark', !!t.dark);
      if (t.color) html.dataset['color'] = t.color;
      if (t.style) html.dataset['style'] = t.style;
      if (t.custom) html.style.cssText = t.custom;
    },
    theme as { dark?: boolean; color?: string; style?: string; custom?: string }
  );
  await stable(page);
  const out: Record<string, string> = {};
  for (const [role, label] of TARGETS)
    out[label] = await paint(page.getByRole(role, { name: label, exact: true }));
  // The page background and text: colours only (the body's height is the whole page's content).
  out['body'] = await page
    .locator('body')
    .evaluate(el => `${getComputedStyle(el).backgroundColor}|${getComputedStyle(el).color}`);
  // After interaction: an open accordion panel and an open select popup.
  await page.getByRole('button', { name: 'Faq one', exact: true }).click();
  await page.getByRole('button', { name: 'Faq one', exact: true }).evaluate(el => el.blur());
  out['Faq panel'] = await paint(page.getByText('Faq answer one'));
  await page.getByRole('combobox', { name: 'Meta framework' }).click();
  await expect
    .poll(async () => (await page.getByRole('option', { name: 'Next' }).boundingBox())?.width ?? 0)
    .toBeGreaterThan(300);
  out['Popup Next'] = await paint(page.getByRole('option', { name: 'Next', exact: true }));
  out['Popup panel'] = await paint(
    page
      .getByRole('option', { name: 'Next' })
      .locator('xpath=ancestor::*[contains(@class,"shadow-md")][1]')
  );
  const shot = await page.screenshot({ fullPage: false });
  await page.close();
  return { out, shot };
}

test('every backend paints the same in dark mode, other presets and a custom theme', async ({
  browser,
}) => {
  // 4 themes × 4 consumers, each a fresh page: a budget for the work, not a wait for a race.
  test.setTimeout(240_000);
  const urls = BACKENDS.filter(([, u]) => u) as unknown as [string, string][];
  test.skip(urls.length < 2, 'needs at least two URLs');
  const measurements: Record<string, Record<string, Record<string, string>>> = {};
  for (const theme of THEMES) {
    measurements[theme.id] = {};
    let reference: Record<string, string> | undefined;
    for (const [name, url] of urls) {
      const { out, shot } = await sample(browser, url, theme);
      measurements[theme.id]![name] = out;
      if (name === 'ng-primitives' || name === 'quartz') {
        await test.info().attach(`screenshot — ${theme.id} — ${name}`, {
          body: shot,
          contentType: 'image/png',
        });
      }
      if (!reference) {
        reference = out;
        // The sweep is meaningless if the theme did not apply or the states look alike.
        expect(out['Checked box'], `${theme.id}: checked ≠ unchecked`).not.toBe(
          out['Unchecked box']
        );
        expect(out['Profile'], `${theme.id}: selected ≠ unselected tab`).not.toBe(out['Security']);
        continue;
      }
      expect(out, `${theme.id}: ${name} paints differently from ${urls[0]![0]}`).toEqual(reference);
    }
  }
  await test.info().attach('paint measurements', {
    body: JSON.stringify(measurements, null, 2),
    contentType: 'application/json',
  });
  // The themes really differ from each other (the presets loaded).
  const checked = THEMES.map(t => measurements[t.id]![urls[0]![0]]!['Checked box']);
  expect(new Set(checked).size).toBe(THEMES.length);
});
