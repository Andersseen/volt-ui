// Which consumer project a `volt` command acts on.
//
// The project is resolved from the selected destination, never assumed to be `process.cwd()`:
//
//   destination  explicit (--path or positional) → resolved against the cwd;
//                implicit → `src/app/ui` of the nearest package.json above the cwd, so running the
//                CLI from `src/app` does not create `src/app/src/app/ui`
//   package      the nearest directory holding a package.json at or above the destination: where
//                `volt.json` lives and where `--install` adds dependencies
//   workspace    the pnpm / npm / Yarn / Bun workspace root that lists that package, if any: where
//                the lockfile usually lives and, for npm, where the install command runs
//   manager      the `packageManager` field, else the lockfile(s) of the package or workspace root
//
// Ambiguity is reported, not guessed: a workspace root that is not itself an application with no
// explicit destination, or lockfiles of two different managers with no `packageManager` field.

const fs = require('fs');
const path = require('path');

const DEFAULT_TARGET = path.join('src', 'app', 'ui');
const CONFIG_FILE = 'volt.json';

const LOCKFILES = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
];
const MANAGERS = ['pnpm', 'yarn', 'npm', 'bun'];

class ProjectError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ProjectError';
    this.code = code;
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

/** The closest directory at or above `start` that exists (a destination may not exist yet). */
function nearestExisting(start) {
  let dir = path.resolve(start);
  while (!fs.existsSync(dir)) {
    const parent = path.dirname(dir);
    if (parent === dir) return dir;
    dir = parent;
  }
  return isDirectory(dir) ? dir : path.dirname(dir);
}

function* ancestors(start) {
  let dir = path.resolve(start);
  for (;;) {
    yield dir;
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

function findPackageDir(start) {
  for (const dir of ancestors(nearestExisting(start))) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
  }
  return null;
}

/** `packages:` of a pnpm-workspace.yaml: a list of quoted or bare globs. */
function pnpmWorkspaceGlobs(file) {
  const globs = [];
  let inPackages = false;
  for (const raw of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '');
    if (/^packages\s*:/.test(line)) {
      inPackages = true;
      const inline = line.match(/\[(.*)\]/);
      if (inline) {
        inline[1]
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
          .forEach(g => globs.push(g));
        inPackages = false;
      }
      continue;
    }
    if (inPackages) {
      const item = line.match(/^\s+-\s*['"]?([^'"]+?)['"]?\s*$/);
      if (item) globs.push(item[1]);
      else if (/^\S/.test(line)) inPackages = false;
    }
  }
  return globs;
}

/** Workspace member globs declared in `dir`, or null when `dir` is not a workspace root. */
function workspaceAt(dir) {
  const pnpmFile = path.join(dir, 'pnpm-workspace.yaml');
  if (fs.existsSync(pnpmFile)) return { kind: 'pnpm', globs: pnpmWorkspaceGlobs(pnpmFile) };
  const pkg = readJson(path.join(dir, 'package.json'));
  const ws = pkg && pkg.workspaces;
  const globs = Array.isArray(ws) ? ws : ws && Array.isArray(ws.packages) ? ws.packages : null;
  return globs ? { kind: 'package.json', globs } : null;
}

function globToRegExp(glob) {
  const clean = glob.replace(/^\.\//, '').replace(/\/+$/, '');
  let re = '';
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === '*' && clean[i + 1] === '*') {
      re += '.*';
      i++;
      if (clean[i + 1] === '/') i++;
    } else if (ch === '*') re += '[^/]*';
    else if (ch === '?') re += '[^/]';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function matchesWorkspace(globs, rel) {
  const posix = rel.split(path.sep).join('/');
  const include = globs.filter(g => !g.startsWith('!'));
  const exclude = globs.filter(g => g.startsWith('!')).map(g => g.slice(1));
  return (
    include.some(g => globToRegExp(g).test(posix)) &&
    !exclude.some(g => globToRegExp(g).test(posix))
  );
}

/** The workspace root whose globs include `packageDir` (or that is `packageDir`), else null. */
function findWorkspaceRoot(packageDir) {
  for (const dir of ancestors(packageDir)) {
    const ws = workspaceAt(dir);
    if (!ws) continue;
    if (dir === packageDir) return { root: dir, ...ws };
    if (matchesWorkspace(ws.globs, path.relative(dir, packageDir))) return { root: dir, ...ws };
    // The nearest workspace does not list this package: it is a standalone project inside it.
    return null;
  }
  return null;
}

/** Member packages of a workspace (bounded walk), for the "which one?" message. */
function workspaceMembers(workspace, maxDepth = 4) {
  const members = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }
      const full = path.join(dir, entry.name);
      const rel = path.relative(workspace.root, full);
      if (
        fs.existsSync(path.join(full, 'package.json')) &&
        matchesWorkspace(workspace.globs, rel)
      ) {
        members.push(full);
      }
      walk(full, depth + 1);
    }
  };
  walk(workspace.root, 1);
  return members.sort();
}

/** A directory that holds an Angular application (or at least the default component folder's parent). */
function looksLikeApp(dir) {
  return (
    fs.existsSync(path.join(dir, 'angular.json')) ||
    fs.existsSync(path.join(dir, 'project.json')) ||
    isDirectory(path.join(dir, 'src', 'app'))
  );
}

function managerFromField(pkg) {
  const name = pkg && typeof pkg.packageManager === 'string' && pkg.packageManager.split('@')[0];
  return MANAGERS.includes(name) ? name : null;
}

/**
 * The package manager for a package: an explicit `packageManager` field wins (package first, then
 * workspace root); otherwise the lockfiles beside the package, then beside the workspace root.
 * Two different managers' lockfiles in one directory with no field is ambiguous.
 */
function detectManager(packageDir, workspaceRoot) {
  const dirs = [...new Set([packageDir, workspaceRoot].filter(Boolean))];
  for (const dir of dirs) {
    const name = managerFromField(readJson(path.join(dir, 'package.json')));
    if (name) return { name, source: `"packageManager" in ${path.join(dir, 'package.json')}` };
  }
  for (const dir of dirs) {
    const found = LOCKFILES.filter(([file]) => fs.existsSync(path.join(dir, file)));
    const names = [...new Set(found.map(([, name]) => name))];
    if (names.length > 1) {
      return {
        name: null,
        ambiguous: true,
        lockfiles: found.map(([file]) => path.join(dir, file)),
        source: `lockfiles of ${names.join(' and ')} in ${dir}`,
      };
    }
    if (names.length === 1) return { name: names[0], source: path.join(dir, found[0][0]) };
  }
  if (workspaceRoot && fs.existsSync(path.join(workspaceRoot, 'pnpm-workspace.yaml'))) {
    return { name: 'pnpm', source: path.join(workspaceRoot, 'pnpm-workspace.yaml') };
  }
  return { name: 'npm', source: 'default (no lockfile or "packageManager" field found)' };
}

/** This repository: the CLI must never install consumer dependencies into Volt UI itself. */
function isVoltRepository(dir) {
  if (!dir) return false;
  const pkg = readJson(path.join(dir, 'package.json'));
  return (
    !!pkg &&
    pkg.name === 'volt-ui' &&
    fs.existsSync(path.join(dir, 'packages', 'volt', 'src', 'public-api.ts'))
  );
}

function describeProject(project) {
  if (!project.packageDir) return 'no package.json';
  const lines = [project.packageDir];
  if (project.workspace && project.workspace.root !== project.packageDir) {
    lines.push(`workspace root ${project.workspace.root}`);
  }
  return lines.join(', ');
}

/**
 * Resolves the destination directory and the project it belongs to.
 *
 * @param {{ cwd?: string, destination?: string | null }} options `destination` is what the user
 *   wrote (--path or positional), relative to `cwd`; omit it for the default `src/app/ui`.
 */
function resolveProject({ cwd = process.cwd(), destination = null } = {}) {
  let targetDir;
  let packageDir;
  if (destination) {
    targetDir = path.resolve(cwd, destination);
    packageDir = findPackageDir(targetDir);
  } else {
    packageDir = findPackageDir(cwd);
    const base = packageDir || cwd;
    const workspace = packageDir && findWorkspaceRoot(packageDir);
    if (workspace && workspace.root === packageDir && !looksLikeApp(packageDir)) {
      const apps = workspaceMembers(workspace).filter(looksLikeApp);
      const hint = (apps.length ? apps : workspaceMembers(workspace)).slice(0, 6);
      throw new ProjectError(
        [
          `${packageDir} is a workspace root, not an application, and no destination was given.`,
          hint.length
            ? `Workspace packages: ${hint.map(dir => path.relative(cwd, dir) || '.').join(', ')}.`
            : 'It lists no packages that hold an Angular application.',
          'Run the command inside the application, or choose the folder explicitly, e.g.:',
          `  volt add <component> --path=${path
            .join(
              path.relative(cwd, hint[0] || path.join(packageDir, 'apps', '<app>')),
              DEFAULT_TARGET
            )
            .split(path.sep)
            .join('/')}`,
        ].join('\n'),
        'AMBIGUOUS_PROJECT'
      );
    }
    targetDir = path.join(base, DEFAULT_TARGET);
  }

  const workspace = packageDir ? findWorkspaceRoot(packageDir) : null;
  const manager = packageDir
    ? detectManager(packageDir, workspace && workspace.root)
    : { name: 'npm', source: 'default (no package.json found)' };
  return {
    cwd,
    targetDir,
    explicit: !!destination,
    packageDir,
    packageJson: packageDir ? readJson(path.join(packageDir, 'package.json')) : null,
    workspace,
    isWorkspaceRoot: !!workspace && workspace.root === packageDir,
    manager,
    voltRepository: isVoltRepository(packageDir) || isVoltRepository(workspace && workspace.root),
    // volt.json sits beside the package.json; without one, the cwd keeps the v1 behaviour.
    configRoot: packageDir || cwd,
  };
}

module.exports = {
  DEFAULT_TARGET,
  CONFIG_FILE,
  LOCKFILES,
  ProjectError,
  resolveProject,
  findPackageDir,
  findWorkspaceRoot,
  workspaceMembers,
  matchesWorkspace,
  detectManager,
  isVoltRepository,
  looksLikeApp,
  describeProject,
  pnpmWorkspaceGlobs,
};
