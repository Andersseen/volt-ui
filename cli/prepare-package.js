#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CLI_ROOT = __dirname;
const REPO_ROOT = path.resolve(CLI_ROOT, '..');
const REGISTRY_ROOT = path.join(CLI_ROOT, 'registry');

function copyRegistry() {
  const manifestPath = path.join(REPO_ROOT, 'apps/web/public/manifest.json');
  const sourceRoot = path.join(REPO_ROOT, 'packages/volt/src/lib');
  const targetSourceRoot = path.join(REGISTRY_ROOT, 'src/lib');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      'Missing apps/web/public/manifest.json. Run "pnpm manifest" before packing the CLI.'
    );
  }

  if (!fs.existsSync(sourceRoot)) {
    throw new Error('Missing packages/volt/src/lib. Run this script from the volt-ui repository.');
  }

  fs.rmSync(REGISTRY_ROOT, { recursive: true, force: true });
  fs.mkdirSync(REGISTRY_ROOT, { recursive: true });
  fs.copyFileSync(manifestPath, path.join(REGISTRY_ROOT, 'manifest.json'));
  fs.cpSync(sourceRoot, targetSourceRoot, {
    recursive: true,
    filter: source => !source.endsWith('.spec.ts') && !source.endsWith('.test.ts'),
  });
}

function cleanRegistry() {
  fs.rmSync(REGISTRY_ROOT, { recursive: true, force: true });
}

/** The registry must ship the manifest of this source tree: refuse a stale one (pnpm manifest). */
async function assertManifestCurrent() {
  const { buildManifest, serialize } = require('./generate-manifest.js');
  const expected = serialize(await buildManifest());
  const manifestPath = path.join(REPO_ROOT, 'apps/web/public/manifest.json');
  if (fs.existsSync(manifestPath) && fs.readFileSync(manifestPath, 'utf-8') !== expected) {
    throw new Error(
      'apps/web/public/manifest.json is stale for this source tree. Run "pnpm manifest" before packing the CLI.'
    );
  }
}

if (process.argv.includes('--clean')) {
  cleanRegistry();
} else {
  assertManifestCurrent()
    .then(copyRegistry)
    .catch(error => {
      console.error(error.message);
      process.exit(1);
    });
}
