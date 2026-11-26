const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const PACKAGE_ROOT = path.resolve(__dirname, '..');

function resolveRegistryPaths() {
  const localManifestPath = path.join(REPO_ROOT, 'apps/web/public/manifest.json');
  const localComponentsRoot = path.join(REPO_ROOT, 'packages/volt/src/lib');

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

// ---------------------------------------------------------------------------
// Headless backend selection
// ---------------------------------------------------------------------------

const DEFAULT_BASE = 'ng-primitives';
const BASES = ['ng-primitives', 'quartz'];
const CONFIG_FILE = 'volt.json';

// Bare module specifiers a copied file may import, mapped to the package to install. Which of them
// a backend needs is read from the files actually copied, so a Quartz-only project is never told to
// install ng-primitives.
// Kept for programmatic callers; the CLI derives packages from the copied files' imports.
const KNOWN_PACKAGES = [
  'ng-primitives',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  '@quartz-headless/core',
  '@quartz-headless/primitives',
];

function validateBase(base) {
  if (!BASES.includes(base)) {
    throw new Error(`Unknown --base "${base}". Use one of: ${BASES.join(', ')}.`);
  }
  return base;
}

function readConfig(projectRoot = process.cwd()) {
  const configPath = path.join(projectRoot, CONFIG_FILE);
  if (!fs.existsSync(configPath)) return null;
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    throw new Error(`${CONFIG_FILE} is not valid JSON. Fix or delete it.`);
  }
  if (config.base !== undefined) validateBase(config.base);
  return config;
}

function writeConfig(base, projectRoot = process.cwd()) {
  fs.writeFileSync(path.join(projectRoot, CONFIG_FILE), `${JSON.stringify({ base }, null, 2)}\n`);
}

/**
 * The backend this invocation uses: an explicit flag, else the project's `volt.json`, else the
 * default. A flag that contradicts the recorded base is an error — engines are never mixed silently.
 */
function resolveBase(flag, projectRoot = process.cwd()) {
  const requested = flag === undefined || flag === true ? undefined : validateBase(flag);
  if (flag === true)
    throw new Error('--base needs a value: --base=ng-primitives or --base=quartz.');
  const config = readConfig(projectRoot);
  const recorded = config && config.base;
  if (requested && recorded && requested !== recorded) {
    throw new Error(
      `This project is configured for the "${recorded}" base (${CONFIG_FILE}), but --base=${requested} was given.\n` +
        `Mixing headless engines is not supported by the CLI. Remove --base, or edit ${CONFIG_FILE} deliberately.`
    );
  }
  return { base: requested || recorded || DEFAULT_BASE, requested, recorded: recorded || null };
}

/** Components that have an implementation for `base` (every component has the default one). */
function componentsForBase(manifest, base) {
  if (base === DEFAULT_BASE) return Object.keys(manifest.components);
  return Object.entries(manifest.components)
    .filter(([, meta]) => meta.backends && meta.backends[base])
    .map(([name]) => name)
    .sort();
}

function assertSupportedForBase(componentNames, manifest, base) {
  if (base === DEFAULT_BASE) return;
  const supported = componentsForBase(manifest, base);
  const unsupported = componentNames.filter(name => !supported.includes(name));
  if (unsupported.length === 0) return;
  throw new Error(
    `The "${base}" base does not support: ${unsupported.join(', ')}.\n` +
      `Components available with --base=${base}: ${supported.join(', ') || '(none)'}.\n` +
      `To use ${unsupported.length === 1 ? 'it' : 'them'} run the same command without --base (ng-primitives, the default).`
  );
}

/** Whether a directory of copied components already contains ng-primitives-based source. */
function targetUsesNgPrimitives(targetDir) {
  if (!fs.existsSync(targetDir)) return false;
  const stack = [targetDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
        if (/from\s+['"]ng-primitives(\/|['"])/.test(fs.readFileSync(full, 'utf-8'))) return true;
      }
    }
  }
  return false;
}

const { SHARED_LIB_FILES } = require('./shared-files');

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

// Identifies the rules below. Bump it whenever `transformContent` produces different output for the
// same input: `.volt-ui.json` records it next to each baseline hash, so `volt diff` can say that a
// difference may come from the transform rather than from the component source.
// cli/tests/provenance.spec.js pins the output of a sample so a change without a bump fails.
const TRANSFORM_VERSION = 1;

/** The version of the running @voltui/cli and of the registry (component source) it ships. */
function cliVersions(manifest) {
  let cli = null;
  try {
    cli = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf-8')).version;
  } catch {
    cli = null;
  }
  return { cli, registry: (manifest && manifest.version) || null };
}

function transformContent(content) {
  // Replace selector volt- with ui-
  content = content.replace(/selector:\s*['"]([^'"]*)['"]/g, (_match, selector) => {
    const newSelector = selector.replace(/volt-/g, 'ui-').replace(/\bvolt([A-Z]\w*)/g, 'ui$1');
    return `selector: '${newSelector}'`;
  });

  // Element tags inside inline templates (`<volt-toast>`, `</volt-toast>`) must follow the
  // renamed selectors, or a component that renders another Volt component matches nothing.
  content = content.replace(/<(\/?)volt-/g, '<$1ui-');

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

function filesBackend(component, base) {
  const backend = component.backends && component.backends[base];
  if (!backend) throw new Error(`No "${base}" implementation for this component.`);
  return backend;
}

function filesFor(component, base = DEFAULT_BASE) {
  if (base === DEFAULT_BASE) return component.files;
  const backend = component.backends && component.backends[base];
  if (!backend) throw new Error(`No "${base}" implementation for this component.`);
  return backend.files;
}

function detectSharedFileDependencies(componentNames, manifest, base = DEFAULT_BASE) {
  const { componentsRoot } = resolveRegistryPaths();
  const shared = new Set();

  for (const name of componentNames) {
    const component = findComponentInManifest(name, manifest);
    if (!component) continue;

    for (const file of filesFor(component, base)) {
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

function collectDependencies(componentName, manifest, collected = new Set(), base = DEFAULT_BASE) {
  if (collected.has(componentName)) return collected;
  const component = findComponentInManifest(componentName, manifest);
  if (!component) return collected;

  collected.add(componentName);

  const direct =
    base === DEFAULT_BASE
      ? component.dependencies || []
      : filesBackend(component, base).dependencies;
  for (const dep of direct) {
    collectDependencies(dep, manifest, collected, base);
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
      bases: [DEFAULT_BASE, ...Object.keys(meta.backends || {})],
    }))
    .filter(component => !status || component.stability === status)
    .filter(component => !options.base || component.bases.includes(options.base))
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

/**
 * Packages (`name@range`) a set of copied files needs at runtime, derived from their imports with the
 * ranges the manifest records from packages/volt/package.json. Called without sources for the
 * default base, it returns the historical fixed list (kept for programmatic callers).
 */
function runtimeDependenciesFor(base, manifest, copiedSources = []) {
  if (base === DEFAULT_BASE && copiedSources.length === 0) return RUNTIME_DEPENDENCIES;
  const { requiredDependencies, specOf } = require('./dependencies');
  return requiredDependencies({
    sources: copiedSources,
    manifest,
    base,
    defaultBase: DEFAULT_BASE,
  }).packages.map(specOf);
}

function installDependencies(targetDir, options = {}) {
  const packageManager = detectPackageManager(targetDir);
  const dependencies = options.dependencies || RUNTIME_DEPENDENCIES;
  const cmd = `${installCommand(packageManager)} ${dependencies.join(' ')}`;

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

function classNameFor(componentName) {
  return `Ui${capitalize(componentName.replace(/-/g, ' ')).replace(/\s/g, '')}`;
}

/**
 * Copies one component (and what it depends on) through the same plan `volt add` uses. Kept for
 * programmatic callers; the CLI plans every requested component together instead.
 */
function copyComponent(componentName, targetDir, manifest, options = {}) {
  // Required lazily: add-plan.js builds on this module.
  const { planAdd, assertNoConflicts } = require('./add-plan');
  const { applyPlan } = require('./apply-plan');
  const base = options.base || DEFAULT_BASE;

  const plan = planAdd({
    componentNames: [componentName],
    targetDir,
    manifest,
    base,
    force: !!options.force,
  });
  if (!options.dryRun) {
    assertNoConflicts(plan);
    applyPlan(plan);
  }

  let installResult = null;
  if (options.install) {
    installResult = installDependencies(process.cwd(), {
      dryRun: options.dryRun,
      dependencies: plan.runtimeDependencies,
    });
  }

  return {
    componentName,
    className: classNameFor(componentName),
    targetDir,
    dependencies: plan.dependencies,
    files: plan.files.map(file => file.targetPath),
    sharedFiles: plan.sharedFiles,
    base,
    runtimeDependencies: plan.runtimeDependencies,
    dryRun: !!options.dryRun,
    force: !!options.force,
    installCommand: plan.installCommand,
    installResult,
    plan,
  };
}

function describeFsError(err, target) {
  if (err && (err.code === 'EACCES' || err.code === 'EPERM' || err.code === 'EROFS')) {
    return `Cannot write ${target}: permission denied. Check the directory's permissions, or choose another target-dir.`;
  }
  return `Cannot write ${target}: ${err.message}`;
}

/**
 * Prepares a target directory. Idempotent: a missing directory is created, a missing `index.ts`
 * gets the initial barrel, and an existing `index.ts` is never read for rewriting or replaced —
 * whatever the consumer keeps there (comments, imports, custom exports) stays byte for byte.
 */
function initProject(targetDir) {
  const { INITIAL_BARREL } = require('./barrel');
  const indexPath = path.join(targetDir, 'index.ts');

  let createdDirectory = false;
  if (fs.existsSync(targetDir)) {
    if (!fs.statSync(targetDir).isDirectory()) {
      throw new Error(`${targetDir} exists and is not a directory. Choose a different target-dir.`);
    }
  } else {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (err) {
      throw new Error(describeFsError(err, targetDir));
    }
    createdDirectory = true;
  }

  if (fs.existsSync(indexPath)) {
    if (!fs.statSync(indexPath).isFile()) {
      throw new Error(
        `${indexPath} exists and is not a file. Move it away or choose another target-dir.`
      );
    }
    return { targetDir, indexPath, createdDirectory, createdIndex: false };
  }

  try {
    // `wx`: never replace a barrel that appeared since the check above.
    fs.writeFileSync(indexPath, INITIAL_BARREL, { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST')
      return { targetDir, indexPath, createdDirectory, createdIndex: false };
    throw new Error(describeFsError(err, indexPath));
  }
  return { targetDir, indexPath, createdDirectory, createdIndex: true };
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
  TRANSFORM_VERSION,
  cliVersions,
  BASES,
  DEFAULT_BASE,
  resolveRegistryPaths,
  collectDependencies,
  filesFor,
  classNameFor,
  CONFIG_FILE,
  validateBase,
  readConfig,
  writeConfig,
  resolveBase,
  componentsForBase,
  assertSupportedForBase,
  targetUsesNgPrimitives,
  runtimeDependenciesFor,
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
