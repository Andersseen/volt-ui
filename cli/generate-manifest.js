#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/components');
const LAYOUTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/layouts');
const OUTPUT = path.resolve(__dirname, '../public/manifest.json');

/**
 * Map a relative import path to a component/layout name if it points to another
 * Volt component. Handles both 'volt' alias imports and relative imports.
 */
function resolveInternalImport(importPath, currentCategory, currentName) {
  // 'volt' alias: e.g. 'volt/button' -> button
  if (importPath === 'volt' || importPath.startsWith('volt/')) {
    const segments = importPath.split('/').filter(Boolean);
    // 'volt' or 'volt/button' -> take the first segment after 'volt'
    return segments.length > 1 ? segments[1] : null;
  }

  // Relative imports between component/layout folders:
  // ../../components/tooltip  -> tooltip
  // ../../lib/components/tooltip -> tooltip
  // ../button (when inside same category) -> button
  const normalized = importPath.replace(/\\/g, '/');
  const match = normalized.match(/(?:components|layouts)\/([^/]+)(?:\/|$)/);
  if (match) {
    const target = match[1];
    return target === currentName ? null : target;
  }

  return null;
}

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
      category,
      files,
      dependencies: [],
    };
  }

  return components;
}

function extractDependencies(componentDir, currentCategory, currentName, allComponents) {
  const dependencies = new Set();
  const files = fs.readdirSync(componentDir);

  for (const file of files) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts') || file.endsWith('.test.ts')) continue;
    const content = fs.readFileSync(path.join(componentDir, file), 'utf-8');

    // Match ES module import sources
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const target = resolveInternalImport(match[1], currentCategory, currentName);
      if (target && allComponents.has(target)) {
        dependencies.add(target);
      }
    }
  }

  return Array.from(dependencies).sort();
}

const components = {
  ...scanComponents(COMPONENTS_DIR, 'components'),
  ...scanComponents(LAYOUTS_DIR, 'layouts'),
};

const allComponentNames = new Set(Object.keys(components));

// Second pass: populate dependencies now that every component is known.
for (const [name, meta] of Object.entries(components)) {
  const componentDir = path.join(
    meta.category === 'layouts' ? LAYOUTS_DIR : COMPONENTS_DIR,
    name
  );
  meta.dependencies = extractDependencies(componentDir, meta.category, name, allComponentNames);
}

const manifest = {
  version: require('../package.json').version,
  components,
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Manifest written to ${OUTPUT}`);
