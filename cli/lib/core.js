const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const COMPONENTS_ROOT = path.join(REPO_ROOT, 'projects/volt/src/lib');
const MANIFEST_PATH = path.join(REPO_ROOT, 'public/manifest.json');

// Runtime dependencies required by copied components.
const RUNTIME_DEPENDENCIES = [
  'ng-primitives',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
];

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
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
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
    'Unable to load Volt UI manifest. Run "pnpm manifest" from the volt-ui repository first.'
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

  return content;
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

function copySingleComponent(componentName, targetDir, manifest) {
  const component = findComponentInManifest(componentName, manifest);
  if (!component) {
    throw new Error(`Component "${componentName}" not found in manifest.`);
  }

  const componentDir = path.join(targetDir, componentName);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  for (const file of component.files) {
    const sourcePath = path.join(COMPONENTS_ROOT, file);
    const fileName = path.basename(file);
    const targetPath = path.join(componentDir, fileName);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    const content = fs.readFileSync(sourcePath, 'utf-8');
    const transformed = transformContent(content);
    fs.writeFileSync(targetPath, transformed);
  }
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

function updateIndexFile(targetDir, addedComponents) {
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

  copySingleComponent(componentName, targetDir, manifest);
  for (const dep of dependencies) {
    copySingleComponent(dep, targetDir, manifest);
  }

  updateIndexFile(targetDir, [componentName, ...dependencies]);

  const packageManager = detectPackageManager(process.cwd());
  const installCmd = `${installCommand(packageManager)} ${RUNTIME_DEPENDENCIES.join(' ')}`;

  let installResult = null;
  if (options.install) {
    installResult = installDependencies(process.cwd(), { dryRun: false });
  }

  return {
    componentName,
    className: `Ui${capitalize(componentName.replace(/-/g, ' ')).replace(/\s/g, '')}`,
    targetDir,
    dependencies,
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

module.exports = {
  getLocalManifest,
  loadManifest,
  transformContent,
  copyComponent,
  initProject,
  installDependencies,
  detectPackageManager,
  installCommand,
  RUNTIME_DEPENDENCIES,
};
