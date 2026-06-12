const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const MANIFEST_URL = 'https://volt-ui.pages.dev/manifest.json';
const LOCAL_MANIFEST_PATH = path.resolve(__dirname, '../../public/manifest.json');
const CACHE_DIR = path.join(os.homedir(), '.volt-ui', 'cache');
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

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

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchFile(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      })
      .on('error', reject);
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

async function copyComponent(componentName, targetDir, manifest) {
  const component = manifest.components[componentName];

  if (!component) {
    throw new Error(`Component "${componentName}" not found.`);
  }

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

  return {
    componentName,
    className: `Ui${capitalize(componentName.replace(/-/g, ' ')).replace(/\s/g, '')}`,
    targetDir,
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
