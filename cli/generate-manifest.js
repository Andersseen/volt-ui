#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/components');
const LAYOUTS_DIR = path.resolve(__dirname, '../projects/volt/src/lib/layouts');
const OUTPUT = path.resolve(__dirname, '../public/manifest.json');

const COMPONENT_METADATA = {
  accordion: {
    group: 'Display',
    label: 'Accordion',
    description: 'Collapsible panels',
    stability: 'beta',
  },
  autofill: {
    group: 'Forms',
    label: 'Autofill',
    description: 'Browser autofill detection',
    stability: 'experimental',
  },
  avatar: {
    group: 'Display',
    label: 'Avatar',
    description: 'User images',
    stability: 'stable',
  },
  badge: {
    group: 'Display',
    label: 'Badge',
    description: 'Status indicators',
    stability: 'stable',
  },
  breadcrumbs: {
    group: 'Navigation',
    label: 'Breadcrumbs',
    description: 'Path trail',
    stability: 'stable',
  },
  button: {
    group: 'Forms',
    label: 'Button',
    description: 'Interactive buttons',
    stability: 'stable',
  },
  card: {
    group: 'Display',
    label: 'Card',
    description: 'Content containers',
    stability: 'stable',
  },
  checkbox: {
    group: 'Forms',
    label: 'Checkbox',
    description: 'Boolean selection',
    stability: 'beta',
  },
  combobox: {
    group: 'Forms',
    label: 'Combobox',
    description: 'Searchable select',
    stability: 'experimental',
  },
  'date-picker': {
    group: 'Controls',
    label: 'Date Picker',
    description: 'Calendar input',
    stability: 'experimental',
  },
  dialog: {
    group: 'Overlays',
    label: 'Dialog',
    description: 'Modal dialogs',
    stability: 'experimental',
  },
  drawer: {
    group: 'Overlays',
    label: 'Drawer',
    description: 'Slide-in panels',
    stability: 'experimental',
  },
  'dropdown-menu': {
    group: 'Overlays',
    label: 'Dropdown Menu',
    description: 'Action menus',
    stability: 'experimental',
  },
  'file-upload': {
    group: 'Forms',
    label: 'File Upload',
    description: 'Upload controls',
    stability: 'experimental',
  },
  'form-field': {
    group: 'Forms',
    label: 'Form Field',
    description: 'Labels, hints, and errors',
    stability: 'beta',
  },
  input: {
    group: 'Forms',
    label: 'Input',
    description: 'Text input fields',
    stability: 'stable',
  },
  'input-otp': {
    group: 'Forms',
    label: 'Input OTP',
    description: 'PIN code input',
    stability: 'experimental',
  },
  listbox: {
    group: 'Controls',
    label: 'Listbox',
    description: 'Selection list',
    stability: 'experimental',
  },
  meter: {
    group: 'Display',
    label: 'Meter',
    description: 'Known-range values',
    stability: 'stable',
  },
  'navigation-menu': {
    group: 'Navigation',
    label: 'Navigation Menu',
    description: 'Navbar with dropdowns',
    stability: 'experimental',
  },
  pagination: {
    group: 'Controls',
    label: 'Pagination',
    description: 'Page navigation',
    stability: 'beta',
  },
  popover: {
    group: 'Overlays',
    label: 'Popover',
    description: 'Floating panels',
    stability: 'experimental',
  },
  progress: {
    group: 'Display',
    label: 'Progress',
    description: 'Task completion',
    stability: 'stable',
  },
  radio: {
    group: 'Forms',
    label: 'Radio',
    description: 'Single-select options',
    stability: 'beta',
  },
  resizable: {
    group: 'Layout',
    label: 'Resizable',
    description: 'Resizable panels',
    stability: 'experimental',
  },
  search: {
    group: 'Forms',
    label: 'Search',
    description: 'Search with clear action',
    stability: 'beta',
  },
  select: {
    group: 'Forms',
    label: 'Select',
    description: 'Dropdown selection',
    stability: 'experimental',
  },
  separator: {
    group: 'Display',
    label: 'Separator',
    description: 'Visual dividers',
    stability: 'stable',
  },
  sidebar: {
    group: 'Layout',
    label: 'Sidebar',
    description: 'Application sidebar layout',
    stability: 'experimental',
  },
  skeleton: {
    group: 'Display',
    label: 'Skeleton',
    description: 'Loading placeholders',
    stability: 'stable',
  },
  slider: {
    group: 'Forms',
    label: 'Slider',
    description: 'Range input',
    stability: 'beta',
  },
  switch: {
    group: 'Forms',
    label: 'Switch',
    description: 'On/off controls',
    stability: 'beta',
  },
  table: {
    group: 'Display',
    label: 'Table',
    description: 'Data tables',
    stability: 'beta',
  },
  tabs: {
    group: 'Navigation',
    label: 'Tabs',
    description: 'Tabbed interface',
    stability: 'beta',
  },
  textarea: {
    group: 'Forms',
    label: 'Textarea',
    description: 'Multi-line input',
    stability: 'stable',
  },
  theme: {
    group: 'Theming',
    label: 'Theme',
    description: 'Document-level theme provider',
    stability: 'experimental',
  },
  toast: {
    group: 'Overlays',
    label: 'Toast',
    description: 'Notifications',
    stability: 'experimental',
  },
  toggle: {
    group: 'Controls',
    label: 'Toggle',
    description: 'Pressed state button',
    stability: 'beta',
  },
  'toggle-group': {
    group: 'Controls',
    label: 'Toggle Group',
    description: 'Grouped toggle controls',
    stability: 'beta',
  },
  toolbar: {
    group: 'Controls',
    label: 'Toolbar',
    description: 'Grouped actions',
    stability: 'beta',
  },
  tooltip: {
    group: 'Overlays',
    label: 'Tooltip',
    description: 'Hover information',
    stability: 'experimental',
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
      stability: COMPONENT_METADATA[entry.name]?.stability || 'experimental',
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
