const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const MANIFEST_URL = 'https://volt-ui.pages.dev/manifest.json';
const LOCAL_MANIFEST_PATH = path.resolve(__dirname, '../../public/manifest.json');
const CACHE_DIR = path.join(os.homedir(), '.volt-ui', 'cache');
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// ---------------------------------------------------------------------------
// Known component dependencies (transitive)
// ---------------------------------------------------------------------------

const COMPONENT_DEPENDENCIES = {
  'dropdown-menu': ['button'],
  accordion: [],
  avatar: [],
  breadcrumbs: [],
  button: [],
  card: [],
  checkbox: [],
  combobox: [],
  'date-picker': [],
  dialog: [],
  drawer: [],
  'file-upload': [],
  'form-field': [],
  'input-otp': [],
  input: [],
  listbox: [],
  meter: [],
  'navigation-menu': [],
  pagination: [],
  popover: [],
  progress: [],
  radio: [],
  resizable: [],
  search: [],
  select: [],
  separator: [],
  skeleton: [],
  slider: [],
  switch: [],
  table: [],
  tabs: [],
  textarea: [],
  toast: [],
  toggle: [],
  'toggle-group': ['toggle'],
  toolbar: [],
  tooltip: [],
};

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
// HTTP helpers
// ---------------------------------------------------------------------------

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchJson(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Invalid JSON from ${url}`));
          }
        });
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

async function fetchFile(url, retries = 2) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchFile(res.headers.location, retries).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      })
      .on('error', async err => {
        if (retries > 0) {
          try {
            const result = await fetchFile(url, retries - 1);
            resolve(result);
          } catch (retryErr) {
            reject(retryErr);
          }
        } else {
          reject(err);
        }
      });
  });
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachedManifest() {
  ensureCacheDir();
  const cachePath = path.join(CACHE_DIR, 'manifest.json');
  if (!fs.existsSync(cachePath)) return null;
  const stat = fs.statSync(cachePath);
  if (Date.now() - stat.mtimeMs > CACHE_TTL_MS) return null;
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch {
    return null;
  }
}

function setCachedManifest(manifest) {
  ensureCacheDir();
  const cachePath = path.join(CACHE_DIR, 'manifest.json');
  fs.writeFileSync(cachePath, JSON.stringify(manifest, null, 2));
}

function getCachedFile(url) {
  ensureCacheDir();
  const hash = Buffer.from(url).toString('base64url');
  const cachePath = path.join(CACHE_DIR, hash);
  if (!fs.existsSync(cachePath)) return null;
  return fs.readFileSync(cachePath, 'utf-8');
}

function setCachedFile(url, content) {
  ensureCacheDir();
  const hash = Buffer.from(url).toString('base64url');
  const cachePath = path.join(CACHE_DIR, hash);
  fs.writeFileSync(cachePath, content);
}

// ---------------------------------------------------------------------------
// Manifest loader
// ---------------------------------------------------------------------------

function getLocalManifest() {
  if (fs.existsSync(LOCAL_MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_MANIFEST_PATH, 'utf-8'));
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

  let manifest = getCachedManifest();
  if (manifest) {
    return manifest;
  }
  manifest = await fetchJson(MANIFEST_URL);
  setCachedManifest(manifest);
  return manifest;
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

function collectDependencies(componentName, manifest, collected = new Set()) {
  if (collected.has(componentName)) return collected;
  const component = manifest.components[componentName];
  if (!component) return collected;

  collected.add(componentName);

  const direct = COMPONENT_DEPENDENCIES[componentName] || component.dependencies || [];
  for (const dep of direct) {
    collectDependencies(dep, manifest, collected);
  }

  return collected;
}

async function copySingleComponent(componentName, targetDir, manifest) {
  const component = manifest.components[componentName];
  const componentDir = path.join(targetDir, componentName);

  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  for (const file of component.files) {
    const url = `${manifest.baseUrl}/${file}`;
    const fileName = path.basename(file);
    const targetPath = path.join(componentDir, fileName);

    let content = getCachedFile(url);
    if (!content) {
      content = await fetchFile(url);
      setCachedFile(url, content);
    }

    const transformed = transformContent(content);
    fs.writeFileSync(targetPath, transformed);
  }
}

async function copyComponent(componentName, targetDir, manifest) {
  const component = manifest.components[componentName];

  if (!component) {
    throw new Error(
      `Component "${componentName}" not found. Run "volt list" to see available components.`
    );
  }

  const dependencies = Array.from(collectDependencies(componentName, manifest)).filter(
    name => name !== componentName
  );

  await copySingleComponent(componentName, targetDir, manifest);

  for (const dep of dependencies) {
    await copySingleComponent(dep, targetDir, manifest);
  }

  const packageManager = detectPackageManager(process.cwd());
  const installCmd = `${installCommand(packageManager)} ${RUNTIME_DEPENDENCIES.join(' ')}`;

  return {
    componentName,
    className: `Ui${capitalize(componentName.replace(/-/g, ' ')).replace(/\s/g, '')}`,
    targetDir,
    dependencies,
    installCommand: installCmd,
  };
}

function initProject(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const indexContent = `// UI Components
// Generated by volt CLI

export {};
`;
  fs.writeFileSync(path.join(targetDir, 'index.ts'), indexContent);
  return targetDir;
}

function clearCache() {
  ensureCacheDir();
  fs.rmSync(CACHE_DIR, { recursive: true, force: true });
}

module.exports = {
  fetchJson,
  fetchFile,
  getCachedManifest,
  setCachedManifest,
  getCachedFile,
  setCachedFile,
  getLocalManifest,
  loadManifest,
  transformContent,
  copyComponent,
  initProject,
  clearCache,
  CACHE_DIR,
};
