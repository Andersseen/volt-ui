// Runtime dependencies of one `volt add`, and the policy for installing them.
//
//   what      the npm packages the copied files import (`import type` included), so a component
//             that needs no `class-variance-authority` never asks for it, and a Quartz copy never
//             asks for ng-primitives
//   ranges    the manifest's `runtime` table, generated from packages/volt/package.json — the CLI
//             holds no version list of its own
//   policy    an installed version inside the range is kept; a missing package is added with the
//             library's range; an installed or declared version outside it is reported and never
//             changed; Angular is checked against the supported range and never installed or
//             upgraded (a missing @angular/<x> is added at the installed core's major.minor)
//   install   once per operation, in the resolved consumer package, verified afterwards

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { bareImports, isFrameworkPackage } = require('./imports');
const semver = require('./semver');

/** Names the copied files import, split into Volt runtime packages and Angular's own. */
function importedPackages(sources) {
  const packages = new Set();
  const framework = new Set();
  for (const source of sources) {
    for (const pkg of bareImports(source)) {
      (isFrameworkPackage(pkg) ? framework : packages).add(pkg);
    }
  }
  return { packages, framework };
}

/**
 * What a set of copied sources needs, with ranges from the manifest. A manifest from before the
 * `runtime` table existed yields names without ranges (the v1 behaviour).
 */
function requiredDependencies({ sources, manifest, base, defaultBase = 'ng-primitives' }) {
  const runtime = (manifest && manifest.runtime) || { packages: {}, angular: {} };
  const { packages, framework } = importedPackages(sources);
  if (base !== defaultBase) {
    // A backend's packages come together (Quartz primitives need its core), whether or not the
    // copied source names each of them.
    const backend = manifest.backends && manifest.backends[base];
    for (const spec of (backend && backend.packages) || []) {
      packages.add(spec.slice(0, spec.lastIndexOf('@')));
    }
  }
  const packageList = [...packages].sort().map(name => {
    const meta = runtime.packages[name];
    return { name, range: meta ? meta.range : null, tested: meta ? meta.tested : null };
  });
  const angularList = [...framework]
    .filter(name => name.startsWith('@angular/'))
    .concat(packageList.length || framework.size ? ['@angular/core'] : [])
    .filter((name, i, all) => all.indexOf(name) === i)
    .sort()
    .map(name => ({ name, range: (runtime.angular && runtime.angular[name]) || null }));
  return { packages: packageList, angular: angularList };
}

const specOf = dep => (dep.range ? `${dep.name}@${dep.range}` : dep.name);

/** Version of `pkg` as Node would resolve it from `dir` (walking up node_modules), or null. */
function installedVersion(dir, pkg) {
  let current = path.resolve(dir);
  for (;;) {
    const file = path.join(current, 'node_modules', pkg, 'package.json');
    if (fs.existsSync(file)) {
      try {
        return { version: JSON.parse(fs.readFileSync(file, 'utf-8')).version, file };
      } catch {
        return null;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function declaredRange(pkgJson, name) {
  if (!pkgJson) return null;
  for (const field of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    if (pkgJson[field] && pkgJson[field][name]) return { field, range: pkgJson[field][name] };
  }
  return null;
}

/**
 * Compares what the copy needs with the consumer package. Each entry gets a status:
 *
 *   ok             installed and inside the range: kept as it is
 *   add            neither declared nor installed: will be added with the library's range
 *   install        declared with a compatible range, not installed yet: a plain install fetches it
 *   incompatible   installed or declared outside the range: reported, never changed
 *   unknown        the declaration is not a semver range (a tag, URL or workspace:) and nothing is
 *                  installed: left to the consumer
 */
function assessDependencies(project, required) {
  const dir = project.packageDir;
  const pkgJson = project.packageJson;
  const core = dir ? installedVersion(dir, '@angular/core') : null;
  const assess = (dep, isAngular) => {
    const installed = dir ? installedVersion(dir, dep.name) : null;
    const declared = declaredRange(pkgJson, dep.name);
    const base = {
      ...dep,
      angular: isAngular,
      installed: installed && installed.version,
      declared,
    };
    if (installed) {
      if (!dep.range || semver.satisfies(installed.version, dep.range)) {
        return { ...base, status: 'ok' };
      }
      return {
        ...base,
        status: 'incompatible',
        reason: `${dep.name} ${installed.version} is installed; Volt UI needs ${dep.range}`,
      };
    }
    if (declared) {
      if (!semver.validRange(declared.range)) return { ...base, status: 'unknown' };
      const probe = isAngular ? core && core.version : dep.tested;
      if (!dep.range || !probe || semver.satisfies(probe, declared.range)) {
        return { ...base, status: 'install' };
      }
      return {
        ...base,
        status: 'incompatible',
        reason: `package.json declares ${dep.name}@${declared.range} (${declared.field}); Volt UI needs ${dep.range}`,
      };
    }
    if (isAngular) {
      // A missing @angular/<x> is added at the application's own Angular version — the installed
      // core's major.minor, else the range its package.json declares for core — never a newer one.
      const parsed = core && semver.parse(core.version);
      const declaredCore = declaredRange(pkgJson, '@angular/core');
      const sameAsApp = parsed
        ? `~${parsed.major}.${parsed.minor}.0`
        : declaredCore && semver.validRange(declaredCore.range)
          ? declaredCore.range
          : null;
      if (dep.name === '@angular/core' || !sameAsApp) {
        return {
          ...base,
          status: 'missing-angular',
          reason: `${dep.name} is not installed or declared: Volt UI components run inside an Angular application (${dep.range || 'Angular'})`,
        };
      }
      return { ...base, status: 'add', range: sameAsApp };
    }
    return { ...base, status: 'add' };
  };
  const entries = [
    ...required.angular.map(dep => assess(dep, true)),
    ...required.packages.map(dep => assess(dep, false)),
  ];
  const by = status => entries.filter(e => e.status === status);
  return {
    entries,
    toAdd: by('add'),
    toInstall: by('install'),
    incompatible: by('incompatible'),
    missingAngular: by('missing-angular'),
    unknown: by('unknown'),
  };
}

function shellQuote(arg) {
  return /^[\w@/.:=^~+-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`;
}

/**
 * The command that adds `specs` to the resolved package, run where that manager expects it. pnpm
 * and Yarn Berry/Bun add to the package whose folder they run in; npm workspaces need the root plus
 * `--workspace`; a workspace root itself needs pnpm's `-w` / Yarn 1's `-W`.
 */
function installInvocation(project, specs) {
  const pm = project.manager.name;
  const dir = project.packageDir;
  const root = project.workspace && project.workspace.root;
  let args;
  let cwd = dir;
  switch (pm) {
    case 'pnpm':
      args = specs.length ? ['add', ...specs] : ['install'];
      if (specs.length && project.isWorkspaceRoot) args.push('-w');
      break;
    case 'yarn': {
      args = specs.length ? ['add', ...specs] : ['install'];
      const berry = root
        ? fs.existsSync(path.join(root, '.yarnrc.yml'))
        : fs.existsSync(path.join(dir, '.yarnrc.yml'));
      if (specs.length && project.isWorkspaceRoot && !berry) args.push('-W');
      break;
    }
    case 'bun':
      args = specs.length ? ['add', ...specs] : ['install'];
      break;
    default:
      args = ['install', ...specs];
      if (root && root !== dir) {
        cwd = root;
        args.push('--workspace', path.relative(root, dir).split(path.sep).join('/'));
      }
  }
  return { command: pm, args, cwd };
}

function displayInvocation(invocation, fromDir = process.cwd()) {
  const line = [invocation.command, ...invocation.args.map(shellQuote)].join(' ');
  const rel = path.relative(fromDir, invocation.cwd);
  return rel ? `cd ${shellQuote(rel)} && ${line}` : line;
}

/** The manual command for everything that is missing, or null when nothing is. */
function manualInstall(project, assessment) {
  if (!project.packageDir || !project.manager.name) return null;
  const specs = assessment.toAdd.map(specOf);
  if (specs.length === 0 && assessment.toInstall.length === 0) return null;
  return installInvocation(project, specs);
}

/** Problems that make `--install` unsafe; checked before anything is written. */
function installBlockers(project, assessment) {
  const problems = [];
  if (!project.packageDir) {
    problems.push(
      `No package.json found at or above ${project.targetDir}, so there is no project to install into.`
    );
  }
  if (project.voltRepository) {
    problems.push(
      `${project.packageDir} is the Volt UI repository itself; --install never adds consumer dependencies to it.`
    );
  }
  if (project.manager.ambiguous) {
    problems.push(
      `Cannot tell which package manager ${project.packageDir} uses: found ${project.manager.lockfiles.join(', ')}.\n` +
        '   Set "packageManager" in package.json (e.g. "pnpm@10.0.0") or delete the stale lockfile.'
    );
  }
  for (const entry of [...assessment.incompatible, ...assessment.missingAngular]) {
    problems.push(entry.reason);
  }
  return problems;
}

function describeEntry(entry) {
  const range = entry.range ? ` ${entry.range}` : '';
  switch (entry.status) {
    case 'ok':
      return `keep     ${entry.name} ${entry.installed} (satisfies${range})`;
    case 'add':
      return `add      ${entry.name}${range}${entry.tested ? ` (tested with ${entry.tested})` : ''}`;
    case 'install':
      return `install  ${entry.name} (declared ${entry.declared.range}, not installed yet)`;
    case 'unknown':
      return `check    ${entry.name} (declared "${entry.declared.range}", not installed; cannot compare with${range})`;
    default:
      return `problem  ${entry.reason}`;
  }
}

/**
 * Runs the install once and verifies the result. Throws with the manual command when the package
 * manager fails or when, after it reports success, a package still does not resolve in range.
 */
function runInstall(project, required, assessment, { spawn = spawnSync, log = console.log } = {}) {
  const invocation = manualInstall(project, assessment);
  if (!invocation) return { executed: false, invocation: null };
  log(`\n📦 ${displayInvocation(invocation, project.cwd)}`);
  const result = spawn(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error || result.status !== 0) {
    const why = result.error ? result.error.message : `exit code ${result.status}`;
    const err = new Error(`${invocation.command} failed (${why}).`);
    err.invocation = invocation;
    throw err;
  }
  const after = assessDependencies(
    { ...project, packageJson: readPackageJson(project.packageDir) },
    required
  );
  const still = after.entries.filter(e => e.status !== 'ok' && e.status !== 'unknown');
  if (still.length > 0) {
    const err = new Error(
      `${invocation.command} finished, but these packages still do not resolve inside the required range:\n` +
        still
          .map(
            e =>
              `   - ${e.name}${e.installed ? ` (${e.installed})` : ' (missing)'} — needs ${e.range}`
          )
          .join('\n')
    );
    err.invocation = invocation;
    throw err;
  }
  return { executed: true, invocation };
}

function readPackageJson(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
  } catch {
    return null;
  }
}

module.exports = {
  importedPackages,
  requiredDependencies,
  assessDependencies,
  installedVersion,
  installInvocation,
  displayInvocation,
  manualInstall,
  installBlockers,
  describeEntry,
  runInstall,
  specOf,
  shellQuote,
};
