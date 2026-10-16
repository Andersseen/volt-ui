#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/components');
const LAYOUTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/layouts');
const OUTPUT = path.resolve(__dirname, '../public/manifest.json');
const STATUS_FILE = path.resolve(__dirname, '../COMPONENT_STATUS.md');

/**
 * Stability is read from COMPONENT_STATUS.md, the one place it is written by hand. It used to be
 * repeated here, where 24 stable components were still labelled `beta` long after 1.0 — `volt list
 * --status=stable` and the MCP server read this manifest. A component with no row fails the run, so
 * adding one without recording its status (ripple effect 6) is caught by `pnpm manifest`.
 */
function readStabilityTable() {
  const table = {};
  for (const line of fs.readFileSync(STATUS_FILE, 'utf-8').split('\n')) {
    const row = line.match(/^\|\s*([a-z][a-z-]*)\s*\|\s*(stable|beta|experimental)\s*\|/);
    if (row) table[row[1]] = row[2];
  }
  return table;
}

const STABILITY = readStabilityTable();

const COMPONENT_METADATA = {
  accordion: {
    group: 'Display',
    label: 'Accordion',
    description: 'Collapsible panels',
  },
  alert: {
    group: 'Feedback',
    label: 'Alert',
    description: 'Inline feedback panels',
  },
  'empty-state': {
    group: 'Feedback',
    label: 'Empty State',
    description: 'Empty collection and no-results panels',
  },
  autofill: {
    group: 'Forms',
    label: 'Autofill',
    description: 'Browser autofill detection',
  },
  avatar: {
    group: 'Display',
    label: 'Avatar',
    description: 'User images',
  },
  badge: {
    group: 'Display',
    label: 'Badge',
    description: 'Status indicators',
  },
  breadcrumbs: {
    group: 'Navigation',
    label: 'Breadcrumbs',
    description: 'Path trail',
  },
  button: {
    group: 'Forms',
    label: 'Button',
    description: 'Interactive buttons',
  },
  card: {
    group: 'Display',
    label: 'Card',
    description: 'Content containers',
  },
  checkbox: {
    group: 'Forms',
    label: 'Checkbox',
    description: 'Boolean selection',
  },
  combobox: {
    group: 'Forms',
    label: 'Combobox',
    description: 'Searchable select',
  },
  'date-picker': {
    group: 'Controls',
    label: 'Date Picker',
    description: 'Calendar input',
  },
  dialog: {
    group: 'Overlays',
    label: 'Dialog',
    description: 'Modal dialogs',
  },
  drawer: {
    group: 'Overlays',
    label: 'Drawer',
    description: 'Slide-in panels',
  },
  'dropdown-menu': {
    group: 'Overlays',
    label: 'Dropdown Menu',
    description: 'Action menus',
  },
  'file-upload': {
    group: 'Forms',
    label: 'File Upload',
    description: 'Upload controls',
  },
  'form-field': {
    group: 'Forms',
    label: 'Form Field',
    description: 'Labels, hints, and errors',
  },
  input: {
    group: 'Forms',
    label: 'Input',
    description: 'Text input fields',
  },
  'input-otp': {
    group: 'Forms',
    label: 'Input OTP',
    description: 'PIN code input',
  },
  listbox: {
    group: 'Controls',
    label: 'Listbox',
    description: 'Selection list',
  },
  meter: {
    group: 'Display',
    label: 'Meter',
    description: 'Known-range values',
  },
  'navigation-menu': {
    group: 'Navigation',
    label: 'Navigation Menu',
    description: 'Navbar with dropdowns',
  },
  pagination: {
    group: 'Controls',
    label: 'Pagination',
    description: 'Page navigation',
  },
  popover: {
    group: 'Overlays',
    label: 'Popover',
    description: 'Floating panels',
  },
  progress: {
    group: 'Display',
    label: 'Progress',
    description: 'Task completion',
  },
  radio: {
    group: 'Forms',
    label: 'Radio',
    description: 'Single-select options',
  },
  'range-slider': {
    group: 'Forms',
    label: 'Range Slider',
    description: 'Dual-thumb range selection',
  },
  resizable: {
    group: 'Layout',
    label: 'Resizable',
    description: 'Resizable panels',
  },
  search: {
    group: 'Forms',
    label: 'Search',
    description: 'Search with clear action',
  },
  select: {
    group: 'Forms',
    label: 'Select',
    description: 'Dropdown selection',
  },
  separator: {
    group: 'Display',
    label: 'Separator',
    description: 'Visual dividers',
  },
  sidebar: {
    group: 'Layout',
    label: 'Sidebar',
    description: 'Application sidebar layout',
  },
  skeleton: {
    group: 'Display',
    label: 'Skeleton',
    description: 'Loading placeholders',
  },
  spinner: {
    group: 'Feedback',
    label: 'Spinner',
    description: 'Loading indicator',
  },
  slider: {
    group: 'Forms',
    label: 'Slider',
    description: 'Range input',
  },
  switch: {
    group: 'Forms',
    label: 'Switch',
    description: 'On/off controls',
  },
  table: {
    group: 'Display',
    label: 'Table',
    description: 'Data tables',
  },
  tabs: {
    group: 'Navigation',
    label: 'Tabs',
    description: 'Tabbed interface',
  },
  textarea: {
    group: 'Forms',
    label: 'Textarea',
    description: 'Multi-line input',
  },
  theme: {
    group: 'Theming',
    label: 'Theme',
    description: 'Document-level theme provider',
  },
  toast: {
    group: 'Overlays',
    label: 'Toast',
    description: 'Notifications',
  },
  toggle: {
    group: 'Controls',
    label: 'Toggle',
    description: 'Pressed state button',
  },
  'toggle-group': {
    group: 'Controls',
    label: 'Toggle Group',
    description: 'Grouped toggle controls',
  },
  toolbar: {
    group: 'Controls',
    label: 'Toolbar',
    description: 'Grouped actions',
  },
  tooltip: {
    group: 'Overlays',
    label: 'Tooltip',
    description: 'Hover information',
  },
};

function titleFromName(name) {
  return name
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

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

function stabilityOf(name) {
  const stability = STABILITY[name];
  if (!stability) {
    throw new Error(
      `COMPONENT_STATUS.md has no row for "${name}". Add one (stable | beta | experimental) — see specs/GUARDRAILS.md ripple effect 6.`
    );
  }
  return stability;
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
      group: COMPONENT_METADATA[entry.name]?.group || (category === 'layouts' ? 'Layout' : 'Components'),
      label: COMPONENT_METADATA[entry.name]?.label || titleFromName(entry.name),
      description: COMPONENT_METADATA[entry.name]?.description || '',
      stability: stabilityOf(entry.name),
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
