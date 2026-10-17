#!/usr/bin/env node
/**
 * Renders the 1200×630 social card (`public/og.png`) from the existing brand mark
 * (`public/favicon.svg`). Not part of the build: run it by hand if the card ever changes, and
 * commit the PNG. It lives outside the visible site on purpose.
 *
 * Usage: node scripts/generate-og-image.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = readFileSync(join(ROOT, 'public/favicon.svg'), 'utf8')
  .replace(/id="voltGrad"/g, 'id="cardGrad"')
  .replace(/url\(#voltGrad\)/g, 'url(#cardGrad)')
  .replace(/id="glow"/g, 'id="cardGlow"')
  .replace(/url\(#glow\)/g, 'url(#cardGlow)');

const html = `<!doctype html><html><body style="margin:0">
<div style="width:1200px;height:630px;box-sizing:border-box;padding:72px;background:radial-gradient(900px 500px at 85% 0%, #2b2a6b 0%, #07070b 62%);color:#fff;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;align-items:center;gap:24px">
    <div style="width:96px;height:96px">${mark}</div>
    <div style="font-size:64px;font-weight:700;letter-spacing:-0.02em">Volt UI</div>
  </div>
  <div>
    <div style="font-size:78px;line-height:1.05;font-weight:700;letter-spacing:-0.035em;max-width:980px">Accessible Angular components you can own.</div>
    <div style="margin-top:28px;font-size:32px;color:#a5a8c4">Signals · Zoneless · Tailwind CSS v4 · ng-primitives</div>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:30px;color:#a5a8c4"><span>npm install @voltui/components</span><span style="color:#fff;font-weight:600">voltui.dev</span></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({
  path: join(ROOT, 'public/og.png'),
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
console.log('Wrote public/og.png');
