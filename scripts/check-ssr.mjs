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
import { RECIPES } from '../src/app/lib/recipes-metadata.ts';

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
    'ng-primitives 0.128+ NgpCollapsible calls `new MutationObserver` on subscribe when an item is open; the docs index renders an open Accordion item — upstream, no Volt-level guard (Listbox, which had the same kind of entry before 0.131, no longer does)',
  ],
]);

const routes = [
  ...BLOCKS.map(b => b.path),
  ...LAYOUTS.map(l => l.path),
  ...RECIPES.map(r => r.path),
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

// The worker logs asynchronously, so a route's error can land after its response (and after a
// fixed sleep) and get blamed on the NEXT route — '/docs/components' (known listbox error)
// was showing up as '/docs/components/button'. Wait until the log stops growing.
async function quiet(idleMs = 400, maxMs = 5000) {
  const start = Date.now();
  let last = log.length;
  let since = Date.now();
  while (Date.now() - start < maxMs) {
    await sleep(100);
    if (log.length !== last) {
      last = log.length;
      since = Date.now();
    } else if (Date.now() - since >= idleMs) return;
  }
}

const failures = [];
const known = [];
try {
  await ready();
  for (const route of routes) {
    // The worker fetches the Glossa catalog over the network; a dropped connection is not an
    // SSR defect in our code, so that one cause (and only that one) is retried.
    let status = 0;
    let errors = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      const before = log.length;
      const res = await fetch(`http://127.0.0.1:${PORT}${route}`);
      status = res.status;
      await res.text();
      await quiet();
      const chunk = log.slice(before).replace(/\x1b\[[0-9;]*m/g, '');
      errors = chunk.match(/ERROR[^\n]*/g) ?? [];
      const networkOnly =
        errors.length > 0 && errors.every(e => /Failed to fetch message catalog/.test(e));
      if (!(networkOnly || (status === 500 && errors.length === 0))) break;
    }
    if (status !== 200) failures.push(`${route}: HTTP ${status}`);
    if (errors.length) {
      const reason = KNOWN.get(route);
      (reason ? known : failures).push(
        `${route}: ${errors[0].trim()}${reason ? `  (known: ${reason})` : ''}`
      );
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
