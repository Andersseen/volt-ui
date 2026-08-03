#!/usr/bin/env node
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const outputDir = 'dist/analog/public';

const staticRoutes = [
  '/assets/*',
  '/favicon.svg',
  '/manifest.json',
  '/vertex-sw.js',
  '/web-editor-lite.min.js',
  '/.well-known/*',
];

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

await copyIfExists('dist/analog/_headers', `${outputDir}/_headers`);
await copyIfExists('dist/analog/_redirects', `${outputDir}/_redirects`);

console.log('Cloudflare Pages output prepared.');
