#!/usr/bin/env node
/**
 * Screenshots `e2e/consumer/themes.html` for chosen palette × style × mode combinations, so a
 * before/after comparison of the theme system comes from rendered code, never from mockups.
 *
 *   pnpm build:lib
 *   pnpm exec vite --config e2e/consumer/vite.config.ts --port 5191 &
 *   node scripts/capture-theme-gallery.mjs --out <dir> [--url http://127.0.0.1:5191]
 *     [--browser chromium] [--all]
 *
 * Without `--all` it takes the representative set used in the PR; with `--all` every one of the 50.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, firefox, webkit } from '@playwright/test';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    url: { type: 'string', default: 'http://127.0.0.1:5191' },
    browser: { type: 'string', default: 'chromium' },
    all: { type: 'boolean', default: false },
  },
});
if (!values.out) throw new Error('--out <dir> is required');

const COLORS = ['volt', 'ember', 'sage', 'dusk', 'glacier'];
const STYLES = ['sharp', 'soft', 'brutal', 'ghost', 'retro'];
const MODES = ['light', 'dark'];
const REPRESENTATIVE = [
  ['volt', 'sharp', 'light'],
  ['volt', 'sharp', 'dark'],
  ['ember', 'soft', 'light'],
  ['ember', 'soft', 'dark'],
  ['sage', 'brutal', 'light'],
  ['sage', 'brutal', 'dark'],
  ['dusk', 'ghost', 'light'],
  ['dusk', 'ghost', 'dark'],
  ['glacier', 'retro', 'light'],
  ['glacier', 'retro', 'dark'],
];
const combos = values.all
  ? COLORS.flatMap(c => STYLES.flatMap(s => MODES.map(m => [c, s, m])))
  : REPRESENTATIVE;

mkdirSync(values.out, { recursive: true });
const engine = { chromium, firefox, webkit }[values.browser];
const browser = await engine.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${values.url}/themes.html`);
await page.locator('volt-card').first().waitFor();
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });

for (const [color, style, mode] of combos) {
  await page.evaluate(
    ([c, s, m]) => {
      const root = document.documentElement;
      root.dataset.color = c;
      root.dataset.style = s;
      root.classList.toggle('dark', m === 'dark');
      root.style.colorScheme = m;
    },
    [color, style, mode]
  );
  await page.screenshot({
    path: join(values.out, `${color}-${style}-${mode}.png`),
  });
}
await browser.close();
console.log(`${combos.length} screenshots in ${values.out} (${values.browser})`);
