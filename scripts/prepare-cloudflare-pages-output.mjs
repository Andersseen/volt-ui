#!/usr/bin/env node
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Prepares one application's Nitro output for Cloudflare Pages: `_routes.json` (which paths bypass the
 * worker) and the `_headers` / `_redirects` files Nitro writes next to the public directory.
 *
 *   node scripts/prepare-cloudflare-pages-output.mjs            # Volt UI  -> dist/apps/web/analog
 *   node scripts/prepare-cloudflare-pages-output.mjs --app recipes  # Recipes -> dist/apps/recipes/analog
 */
const APPS = {
  docs: {
    nitroDir: 'dist/apps/web/analog',
    staticRoutes: [
      '/assets/*',
      '/favicon.svg',
      '/manifest.json',
      '/robots.txt',
      '/sitemap.xml',
      '/llms.txt',
      '/og.png',
      '/apple-touch-icon.png',
      '/favicon.ico',
      '/vertex-sw.js',
      '/web-editor-lite.min.js',
      '/.well-known/*',
    ],
  },
  recipes: {
    nitroDir: 'dist/apps/recipes/analog',
    staticRoutes: [
      '/assets/*',
      '/favicon.svg',
      '/robots.txt',
      '/sitemap.xml',
      '/llms.txt',
      '/og.png',
      '/apple-touch-icon.png',
      '/favicon.ico',
      '/vertex-sw.js',
      '/web-editor-lite.min.js',
      '/.well-known/*',
    ],
  },
};

const flag = process.argv.indexOf('--app');
const appName = flag === -1 ? 'docs' : process.argv[flag + 1];
const app = APPS[appName];
if (!app) {
  console.error(`Unknown --app "${appName}". Expected one of: ${Object.keys(APPS).join(', ')}.`);
  process.exit(1);
}

const outputDir = `${app.nitroDir}/public`;
const staticRoutes = app.staticRoutes;

async function copyIfExists(from, to) {
  try {
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

await writeFile(
  `${outputDir}/_routes.json`,
  `${JSON.stringify(
    {
      version: 1,
      include: ['/*'],
      exclude: staticRoutes,
    },
    null,
    2
  )}\n`
);

await copyIfExists(`${app.nitroDir}/_headers`, `${outputDir}/_headers`);
await copyIfExists(`${app.nitroDir}/_redirects`, `${outputDir}/_redirects`);

console.log(`Cloudflare Pages output prepared for ${appName} (${outputDir}).`);
