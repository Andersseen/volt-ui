#!/usr/bin/env node
/**
 * Server-renders every Block, Layout and component page in the real Cloudflare worker
 * (`wrangler pages dev`) and fails if the worker logs an error while doing it.
 *
 * Why not just look at the HTML: a browser-only API called during server rendering
 * (`window is not defined`) is caught and logged by Angular, and the response is still a
 * perfectly good 200 page. Only the worker's own log shows it — which is how
 * AppDashboard/HeroSplit failed in production while every status-code check stayed green.
 *
 * Requires `pnpm build`. Usage: node scripts/check-ssr.mjs [--port 8799]
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCKS } from '../src/app/lib/blocks-metadata.ts';
import { LAYOUTS } from '../src/app/lib/layouts-metadata.ts';
import { COMPONENTS } from '../src/app/lib/component-metadata.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const portArg = process.argv.indexOf('--port');
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 8799;

/**
 * Routes that currently log an error that is not ours to fix here, with the reason. Anything
 * not listed fails. Blocks and layouts must never appear in this list.
 */
const KNOWN = new Map([
  [
    '/docs/components',
    'ng-primitives 0.110.2 NgpListbox calls window.getComputedStyle in ngAfterContentInit (scrollIntoViewIfNeeded) — upstream',
  ],
  ['/docs/components/listbox', 'same upstream NgpListbox call'],
]);

const routes = [
  ...BLOCKS.map(b => b.path),
  ...LAYOUTS.map(l => l.path),
  '/docs/components',
  ...COMPONENTS.map(c => c.path),
];

if (!existsSync(join(ROOT, 'dist/analog/public'))) {
  console.error('dist/analog/public is missing — run "pnpm build" first.');
  process.exit(1);
}

let log = '';
const server = spawn(
  join(ROOT, 'node_modules/.bin/wrangler'),
  ['pages', 'dev', 'dist/analog/public', '--ip', '127.0.0.1', '--port', String(PORT)],
  { cwd: ROOT, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } }
);
for (const stream of [server.stdout, server.stderr]) stream.on('data', d => (log += d));

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready() {
  for (let i = 0; i < 120; i++) {
    if (log.includes('Ready on')) return;
    await sleep(500);
  }
  throw new Error('wrangler did not start:\n' + log);
}

const failures = [];
const known = [];
try {
  await ready();
  for (const route of routes) {
    const before = log.length;
    const res = await fetch(`http://127.0.0.1:${PORT}${route}`);
    await res.text();
    await sleep(150);
    const chunk = log.slice(before).replace(/\x1b\[[0-9;]*m/g, '');
    const errors = chunk.match(/ERROR[^\n]*/g) ?? [];
    if (res.status !== 200) failures.push(`${route}: HTTP ${res.status}`);
    if (errors.length) {
      const reason = KNOWN.get(route);
      (reason ? known : failures).push(`${route}: ${errors[0].trim()}${reason ? `  (known: ${reason})` : ''}`);
    }
  }
} finally {
  server.kill('SIGTERM');
}

console.log(`Server-rendered ${routes.length} routes in the worker.`);
for (const k of known) console.log(`  known  ${k}`);
if (failures.length) {
  console.error('\nSSR errors:');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('No unexpected SSR errors.');
process.exit(0);
