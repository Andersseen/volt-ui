#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CLI_ROOT = __dirname;
const REPO_ROOT = path.resolve(CLI_ROOT, '..');
const REGISTRY_ROOT = path.join(CLI_ROOT, 'registry');

function copyRegistry() {
  const manifestPath = path.join(REPO_ROOT, 'public/manifest.json');
  const sourceRoot = path.join(REPO_ROOT, 'projects/volt/src/lib');
  const targetSourceRoot = path.join(REGISTRY_ROOT, 'src/lib');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('Missing public/manifest.json. Run "pnpm manifest" before packing the CLI.');
  }

  if (!fs.existsSync(sourceRoot)) {
    throw new Error('Missing projects/volt/src/lib. Run this script from the volt-ui repository.');
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

if (process.argv.includes('--clean')) {
  cleanRegistry();
} else {
  copyRegistry();
}
