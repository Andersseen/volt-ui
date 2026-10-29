#!/usr/bin/env node
/**
 * Renders the 1200×630 social cards (`apps/web/public/og.png`, `apps/recipes/public/og.png`) from
 * the existing brand mark (`apps/web/public/favicon.svg`). Not part of the build: run it by hand if a card ever changes, and
 * commit the PNGs. It lives outside the visible site on purpose.
 *
 * Usage: node scripts/generate-og-image.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = readFileSync(join(ROOT, 'apps/web/public/favicon.svg'), 'utf8')
  .replace(/id="voltGrad"/g, 'id="cardGrad"')
  .replace(/url\(#voltGrad\)/g, 'url(#cardGrad)')
  .replace(/id="glow"/g, 'id="cardGlow"')
  .replace(/url\(#glow\)/g, 'url(#cardGlow)');

const card = ({
  name,
  headline,
  tagline,
  footer,
  host,
}) => `<!doctype html><html><body style="margin:0">
<div style="width:1200px;height:630px;box-sizing:border-box;padding:72px;background:radial-gradient(900px 500px at 85% 0%, #2b2a6b 0%, #07070b 62%);color:#fff;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;align-items:center;gap:24px">
    <div style="width:96px;height:96px">${mark}</div>
    <div style="font-size:64px;font-weight:700;letter-spacing:-0.02em">${name}</div>
  </div>
  <div>
    <div style="font-size:78px;line-height:1.05;font-weight:700;letter-spacing:-0.035em;max-width:980px">${headline}</div>
    <div style="margin-top:28px;font-size:32px;color:#a5a8c4">${tagline}</div>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:30px;color:#a5a8c4"><span>${footer}</span><span style="color:#fff;font-weight:600">${host}</span></div>
</div></body></html>`;

// The Recipes card's headline is the home page's title, which its og:image:alt repeats.
const CARDS = [
  {
    out: 'apps/web/public/og.png',
    name: 'Volt UI',
    headline: 'Accessible Angular components you can own.',
    tagline: 'Signals · Zoneless · Tailwind CSS v4 · ng-primitives',
    footer: 'npm install @voltui/components',
    host: 'voltui.dev',
  },
  {
    out: 'apps/recipes/public/og.png',
    name: 'Volt UI Recipes',
    headline: 'Whole screens, built from Volt&nbsp;UI.',
    tagline: 'Blocks · Layouts · Recipes · live preview and full source',
    footer: 'Copy the source, not a dependency',
    host: 'recipes.voltui.dev',
  },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const { out, ...content } of CARDS) {
  await page.setContent(card(content));
  await page.screenshot({ path: join(ROOT, out), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`Wrote ${out}`);
}
await browser.close();
