const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const PACKAGE_ROOT = path.resolve(__dirname, '..');

function resolveRegistryPaths() {
  const localManifestPath = path.join(REPO_ROOT, 'public/manifest.json');
  const localComponentsRoot = path.join(REPO_ROOT, 'projects/volt/src/lib');

  if (fs.existsSync(localManifestPath) && fs.existsSync(localComponentsRoot)) {
    return {
      manifestPath: localManifestPath,
      componentsRoot: localComponentsRoot,
    };
  }

  return {
    manifestPath: path.join(PACKAGE_ROOT, 'registry/manifest.json'),
    componentsRoot: path.join(PACKAGE_ROOT, 'registry/src/lib'),
  };
}

// Runtime dependencies required by copied components.
const RUNTIME_DEPENDENCIES = [
  'ng-primitives',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
];

// Files living directly in projects/volt/src/lib (not under components/ or layouts/)
// that some components import via a relative path, e.g. `from '../../utils'`. The
// manifest's dependency detector only resolves components/layouts imports, so these are
// tracked and copied separately, flat into the target dir (sibling to each component's
// own subfolder), since that's what the rewritten `../utils` import path expects.
const SHARED_LIB_FILES = ['utils.ts', 'form-control-state.ts'];

// ---------------------------------------------------------------------------
// Package manager detection
// ---------------------------------------------------------------------------

function detectPackageManager(targetDir) {
  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(targetDir, 'package-lock.json'))) return 'npm';
  if (fs.existsSync(path.join(targetDir, 'bun.lockb'))) return 'bun';
  return 'npm';
}

function installCommand(packageManager) {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm add';
    case 'yarn':
      return 'yarn add';
    case 'bun':
      return 'bun add';
    default:
      return 'npm install';
  }
}

// ---------------------------------------------------------------------------
// Manifest loader
// ---------------------------------------------------------------------------

function getLocalManifest() {
  const { manifestPath } = resolveRegistryPaths();

  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

async function loadManifest() {
  const local = getLocalManifest();
  if (local) {
    return local;
  }

  throw new Error(
    'Unable to load Volt UI manifest. Run "pnpm manifest" from the volt-ui repository first, or reinstall @voltui/cli.'
  );
}

// ---------------------------------------------------------------------------
// Content transformer
// ---------------------------------------------------------------------------

function transformContent(content) {
  // Replace selector volt- with ui-
  content = content.replace(/selector:\s*['"]([^'"]*)['"]/g, (_match, selector) => {
    const newSelector = selector.replace(/volt-/g, 'ui-').replace(/\bvolt([A-Z]\w*)/g, 'ui$1');
    return `selector: '${newSelector}'`;
  });

  // Replace all VoltXxx identifiers with UiXxx
  content = content.replace(/\bVolt([A-Z]\w*)/g, 'Ui$1');
  content = content.replace(/\bvolt([A-Z]\w*)/g, 'ui$1');

  // Replace imports from 'volt'
  content = content.replace(/from\s+['"]volt['"]/g, "from './index'");
  content = content.replace(/from\s+['"]\.\.\/index['"]/g, "from '../index'");

  // Cross-component imports written as a relative path into components/ or layouts/
  // (e.g. `../../components/tooltip`) instead of the 'volt' barrel. The CLI always
  // copies components flat as siblings under targetDir, so the category segment is
  // dropped and any depth of `../` collapses to a single one.
  content = content.replace(
    /from\s+(['"])(?:\.\.\/)+(?:components|layouts)\/([^'"]+)\1/g,
    "from '../$2'"
  );

  // Shared lib-root files (utils.ts, form-control-state.ts) are copied flat into the
  // target dir, one level up from each component's own subfolder, regardless of how
  // deeply nested the import was in the original source.
  for (const sharedFile of SHARED_LIB_FILES) {
    const baseName = sharedFile.replace(/\.ts$/, '');
    const importPattern = new RegExp(`from\\s+(['"])(?:\\.\\./)+${baseName}\\1`, 'g');
    content = content.replace(importPattern, `from '../${baseName}'`);
  }

  return content;
}

// ---------------------------------------------------------------------------
// Shared lib-root file dependencies (utils.ts, form-control-state.ts)
// ---------------------------------------------------------------------------

function detectSharedFileDependencies(componentNames, manifest) {
  const { componentsRoot } = resolveRegistryPaths();
  const shared = new Set();

  for (const name of componentNames) {
    const component = findComponentInManifest(name, manifest);
    if (!component) continue;

    for (const file of component.files) {
      const sourcePath = path.join(componentsRoot, file);
      if (!fs.existsSync(sourcePath)) continue;
      const content = fs.readFileSync(sourcePath, 'utf-8');

      for (const sharedFile of SHARED_LIB_FILES) {
        const baseName = sharedFile.replace(/\.ts$/, '');
        const importPattern = new RegExp(`from\\s+['"](?:\\.\\./)+${baseName}['"]`);
        if (importPattern.test(content)) {
          shared.add(sharedFile);
        }
      }
    }
  }

  return Array.from(shared);
}

// Shared files are reused across multiple `add` calls (e.g. `add button` then
// `add badge` both need utils.ts), so they're idempotent: skip silently if already
// present rather than requiring --force like a normal component file would.
function copySharedFileIfNeeded(sharedFile, targetDir, options = {}) {
  const { componentsRoot } = resolveRegistryPaths();
  const sourcePath = path.join(componentsRoot, sharedFile);
  const targetPath = path.join(targetDir, sharedFile);

  if (options.dryRun) {
    return targetPath;
  }

  if (fs.existsSync(targetPath) && !options.force) {
    return targetPath;
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.copyFileSync(sourcePath, targetPath);
  return targetPath;
}

// ---------------------------------------------------------------------------
// Component copy logic
// ---------------------------------------------------------------------------

function capitalize(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function findComponentInManifest(componentName, manifest) {
  return manifest.components[componentName] || null;
}

function collectDependencies(componentName, manifest, collected = new Set()) {
  if (collected.has(componentName)) return collected;
  const component = findComponentInManifest(componentName, manifest);
  if (!component) return collected;

  collected.add(componentName);

  const direct = component.dependencies || [];
  for (const dep of direct) {
    collectDependencies(dep, manifest, collected);
  }

  return collected;
}

function listComponents(manifest, options = {}) {
  const status = options.status;
  const components = Object.entries(manifest.components)
    .map(([name, meta]) => ({
      name,
      group: meta.group || (meta.category === 'layouts' ? 'Layout' : 'Components'),
      label: meta.label || name,
      description: meta.description || '',
      stability: meta.stability || 'experimental',
      category: meta.category || 'components',
      dependencies: meta.dependencies || [],
    }))
    .filter(component => !status || component.stability === status)
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

  return components;
}

function groupComponents(components) {
  return components.reduce((groups, component) => {
    if (!groups[component.group]) groups[component.group] = [];
    groups[component.group].push(component);
    return groups;
  }, {});
}

function getComponentFiles(componentName, targetDir, manifest) {
  const { componentsRoot } = resolveRegistryPaths();
  const component = findComponentInManifest(componentName, manifest);
  if (!component) {
    throw new Error(`Component "${componentName}" not found in manifest.`);
  }

  const componentDir = path.join(targetDir, componentName);
  return component.files.map(file => {
    const sourcePath = path.join(componentsRoot, file);
    const fileName = path.basename(file);
    const targetPath = path.join(componentDir, fileName);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    return { sourcePath, targetPath, componentDir };
  });
}

function assertCanWriteFiles(files, options = {}) {
  if (options.force) return;

  const existing = files.filter(file => fs.existsSync(file.targetPath));
  if (existing.length === 0) return;

  const formatted = existing.map(file => `  - ${file.targetPath}`).join('\n');
  throw new Error(
    `Refusing to overwrite existing file(s):\n${formatted}\n\nPass --force to overwrite, or choose a different target-dir.`
  );
}

function copySingleComponent(componentName, targetDir, manifest, options = {}) {
  const files = getComponentFiles(componentName, targetDir, manifest);

  if (options.dryRun) {
    return files.map(file => file.targetPath);
  }

  for (const { sourcePath, targetPath, componentDir } of files) {
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    const content = fs.readFileSync(sourcePath, 'utf-8');
    const transformed = transformContent(content);
    fs.writeFileSync(targetPath, transformed);
  }

  return files.map(file => file.targetPath);
}

function installDependencies(targetDir, options = {}) {
  const packageManager = detectPackageManager(targetDir);
  const cmd = `${installCommand(packageManager)} ${RUNTIME_DEPENDENCIES.join(' ')}`;

  if (options.dryRun) {
    return { packageManager, cmd, executed: false };
  }

  try {
    execSync(cmd, { cwd: targetDir, stdio: 'inherit' });
    return { packageManager, cmd, executed: true };
  } catch (err) {
    throw new Error(`Failed to install dependencies. Run manually:\n  ${cmd}`);
  }
}

function updateIndexFile(targetDir, addedComponents, options = {}) {
  const indexPath = path.join(targetDir, 'index.ts');
  let content = '';

  if (fs.existsSync(indexPath)) {
    content = fs.readFileSync(indexPath, 'utf-8');
  }

  const exports = addedComponents
    .map(name => `export * from './${name}';`)
    .filter(line => !content.includes(line));

  if (exports.length === 0) return;

  const updated = content.replace(/export \{\};\n?/, '').trimEnd();
  const newContent = updated ? `${updated}\n${exports.join('\n')}\n` : `${exports.join('\n')}\n`;
  if (options.dryRun) return;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(indexPath, newContent);
}

function copyComponent(componentName, targetDir, manifest, options = {}) {
  const component = findComponentInManifest(componentName, manifest);

  if (!component) {
    throw new Error(
      `Component "${componentName}" not found. Run "volt list" to see available components.`
    );
  }

  const dependencies = Array.from(collectDependencies(componentName, manifest)).filter(
    name => name !== componentName
  );
  const componentNames = [componentName, ...dependencies];
  const plannedFiles = componentNames.flatMap(name => getComponentFiles(name, targetDir, manifest));

  assertCanWriteFiles(plannedFiles, options);

  const sharedFiles = detectSharedFileDependencies(componentNames, manifest);

  if (!options.dryRun) {
    copySingleComponent(componentName, targetDir, manifest, options);
    for (const dep of dependencies) {
      copySingleComponent(dep, targetDir, manifest, options);
    }
    for (const sharedFile of sharedFiles) {
      copySharedFileIfNeeded(sharedFile, targetDir, options);
    }
  }

  updateIndexFile(targetDir, componentNames, options);

  const packageManager = detectPackageManager(process.cwd());
  const installCmd = `${installCommand(packageManager)} ${RUNTIME_DEPENDENCIES.join(' ')}`;

  let installResult = null;
  if (options.install) {
    installResult = installDependencies(process.cwd(), { dryRun: options.dryRun });
  }

  return {
    componentName,
    className: `Ui${capitalize(componentName.replace(/-/g, ' ')).replace(/\s/g, '')}`,
    targetDir,
    dependencies,
    files: [
      ...plannedFiles.map(file => file.targetPath),
      ...sharedFiles.map(sharedFile => path.join(targetDir, sharedFile)),
    ],
    sharedFiles,
    dryRun: !!options.dryRun,
    force: !!options.force,
    installCommand: installCmd,
    installResult,
  };
}

function initProject(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const indexPath = path.join(targetDir, 'index.ts');
  const indexContent = `// UI Components
// Generated by volt CLI

export {};
`;
  fs.writeFileSync(indexPath, indexContent);
  return targetDir;
}

// ---------------------------------------------------------------------------
// Tailwind v4 setup detection (guidance only, never blocks `volt init`)
// ---------------------------------------------------------------------------

const STYLESHEET_CANDIDATES = [
  'src/styles.css',
  'src/style.css',
  'src/index.css',
  'src/app/styles.css',
  'styles.css',
];

function detectTailwindSetup(projectRoot = process.cwd()) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  let hasTailwindDependency = false;

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      hasTailwindDependency = Boolean(deps['tailwindcss']);
    } catch {
      hasTailwindDependency = false;
    }
  }

  const stylesheetPath = STYLESHEET_CANDIDATES.map(candidate =>
    path.join(projectRoot, candidate)
  ).find(candidatePath => fs.existsSync(candidatePath));

  const hasTailwindImport = Boolean(
    stylesheetPath && /@import\s+['"]tailwindcss['"]/.test(fs.readFileSync(stylesheetPath, 'utf-8'))
  );

  return {
    hasTailwindDependency,
    hasTailwindImport,
    stylesheetPath: stylesheetPath || null,
    configured: hasTailwindDependency && hasTailwindImport,
  };
}

function formatTailwindGuidance(tailwind) {
  const lines = [
    '⚠️  Tailwind CSS v4 does not look configured in this project.',
    '   Volt UI components rely on Tailwind utility classes to render correctly.',
  ];

  if (!tailwind.hasTailwindDependency) {
    lines.push('   - Install it: pnpm add -D tailwindcss @tailwindcss/vite');
  }
  if (!tailwind.hasTailwindImport) {
    lines.push("   - Add `@import 'tailwindcss';` to your global stylesheet (e.g. src/styles.css)");
  }
  lines.push('   Setup guide: https://tailwindcss.com/docs/installation/framework-guides');

  return lines.join('\n');
}

module.exports = {
  getLocalManifest,
  loadManifest,
  listComponents,
  groupComponents,
  transformContent,
  copyComponent,
  initProject,
  installDependencies,
  detectPackageManager,
  installCommand,
  RUNTIME_DEPENDENCIES,
  SHARED_LIB_FILES,
  detectSharedFileDependencies,
  detectTailwindSetup,
  formatTailwindGuidance,
};
