#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/components');
const LAYOUTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/layouts');
const OUTPUT = path.resolve(__dirname, '../public/manifest.json');

function scanComponents(dir, category) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const components = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const componentDir = path.join(dir, entry.name);
    const files = fs
      .readdirSync(componentDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.test.ts'))
      .map(f => path.posix.join(category, entry.name, f));

    if (files.length === 0) continue;

    components[entry.name] = {
      files,
      dependencies: [],
    };
  }

  return components;
}

const manifest = {
  version: require('../package.json').version,
  baseUrl: 'https://raw.githubusercontent.com/Andersseen/volt-ui/main/projects/volt/src/lib',
  components: {
    ...scanComponents(COMPONENTS_DIR, 'components'),
    ...scanComponents(LAYOUTS_DIR, 'layouts'),
  },
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Manifest written to ${OUTPUT}`);
