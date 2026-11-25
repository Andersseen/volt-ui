// One plan for a whole `volt add` invocation: resolve → collect → deduplicate → plan → validate.
//
// Every requested component, its transitive dependencies, the shared lib-root helpers they import
// and the barrel change are computed before anything is written. Each planned file is compared
// with what is already on disk:
//
//   missing                       → create
//   identical to the Volt source  → reuse (left untouched)
//   different                     → conflict, or replace with an explicit --force
//
// `--dry-run` prints this plan; a real run writes it with `applyPlan` (apply-plan.js).

const fs = require('fs');
const path = require('path');
const core = require('./core');
const { addBarrelExports, INITIAL_BARREL } = require('./barrel');
const { resolveProject } = require('./project');
const {
  requiredDependencies,
  assessDependencies,
  manualInstall,
  installInvocation,
  displayInvocation,
  specOf,
} = require('./dependencies');

class PlanError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'PlanError';
    this.code = code;
  }
}

function sameContent(existing, expected) {
  // A checkout that converted line endings has not modified the code.
  return existing.replace(/\r\n/g, '\n') === expected.replace(/\r\n/g, '\n');
}

function unique(values) {
  return [...new Set(values)];
}

/** Requested components first, in the order given, then each one's dependencies as discovered. */
function collectComponents(requested, manifest, base) {
  const ordered = [];
  for (const name of requested) {
    for (const dep of core.collectDependencies(name, manifest, new Set(), base)) {
      if (!ordered.includes(dep)) ordered.push(dep);
    }
  }
  return ordered;
}

function inspectTarget(targetPath, expected, force) {
  let stat;
  try {
    stat = fs.statSync(targetPath);
  } catch {
    return { action: 'create' };
  }
  if (!stat.isFile()) {
    throw new PlanError(
      `${targetPath} exists and is not a file. Move it away or choose a different target-dir.`,
      'NOT_A_FILE'
    );
  }
  const existing = fs.readFileSync(targetPath, 'utf-8');
  if (sameContent(existing, expected)) return { action: 'reuse' };
  return { action: force ? 'replace' : 'conflict' };
}

/**
 * Builds the plan. Throws `PlanError` for anything that makes the operation impossible (unknown
 * component, unsupported base, missing source, a target that is not a file). Conflicts do not
 * throw here — they are part of the plan, so `--dry-run` can report them; `assertNoConflicts`
 * turns them into an error before a real write.
 */
function planAdd({
  componentNames,
  targetDir,
  manifest,
  base = core.DEFAULT_BASE,
  force = false,
  project: projectOption = null,
}) {
  const requested = unique(componentNames);
  if (requested.length === 0) {
    throw new PlanError('Please specify at least one component name.', 'NO_COMPONENTS');
  }

  const unknown = requested.filter(name => !manifest.components[name]);
  if (unknown.length > 0) {
    throw new PlanError(
      `Component${unknown.length > 1 ? 's' : ''} ${unknown.map(n => `"${n}"`).join(', ')} not found. ` +
        'Run "volt list" to see available components.',
      'UNKNOWN_COMPONENT'
    );
  }

  try {
    core.assertSupportedForBase(requested, manifest, base);
  } catch (err) {
    throw new PlanError(err.message, 'UNSUPPORTED_BASE');
  }
  const components = collectComponents(requested, manifest, base);
  try {
    core.assertSupportedForBase(components, manifest, base);
  } catch (err) {
    throw new PlanError(err.message, 'UNSUPPORTED_BASE');
  }
  const dependencies = components.filter(name => !requested.includes(name));

  if (fs.existsSync(targetDir) && !fs.statSync(targetDir).isDirectory()) {
    throw new PlanError(
      `${targetDir} exists and is not a directory. Choose a different target-dir.`,
      'NOT_A_DIRECTORY'
    );
  }

  const { componentsRoot } = core.resolveRegistryPaths();
  const byTarget = new Map();
  const missing = [];
  const addFile = entry => {
    const key = path.resolve(entry.targetPath);
    const previous = byTarget.get(key);
    if (!previous) {
      byTarget.set(key, entry);
      return;
    }
    // Two components shipping the same file (Quartz Toggle and Toggle Group share variants.ts)
    // collapse into one write. Two different files claiming one path would lose one of them.
    if (previous.sourcePath !== entry.sourcePath && previous.content !== entry.content) {
      throw new PlanError(
        `${entry.targetPath} would receive two different source files ` +
          `(${previous.sourcePath} and ${entry.sourcePath}). This is a Volt UI registry bug; please report it.`,
        'PATH_COLLISION'
      );
    }
  };

  const componentEntries = [];
  for (const name of components) {
    const component = manifest.components[name];
    for (const file of core.filesFor(component, base)) {
      const sourcePath = path.join(componentsRoot, file);
      const targetPath = path.join(targetDir, name, path.basename(file));
      if (!fs.existsSync(sourcePath)) {
        missing.push(sourcePath);
        continue;
      }
      componentEntries.push({ kind: 'component', component: name, sourcePath, targetPath });
    }
  }
  if (missing.length > 0) {
    throw new PlanError(
      `Source file${missing.length > 1 ? 's' : ''} not found:\n${missing.map(f => `  - ${f}`).join('\n')}\n` +
        'The Volt UI registry is incomplete. Reinstall @voltui/cli (or run "pnpm manifest" in the volt-ui repository).',
      'MISSING_SOURCE'
    );
  }

  const sharedFiles = core
    .detectSharedFileDependencies(components, manifest, base)
    .sort((a, b) => core.SHARED_LIB_FILES.indexOf(a) - core.SHARED_LIB_FILES.indexOf(b));
  const sharedEntries = sharedFiles.map(file => ({
    kind: 'shared',
    sourcePath: path.join(componentsRoot, file),
    targetPath: path.join(targetDir, file),
  }));
  const missingShared = sharedEntries.filter(entry => !fs.existsSync(entry.sourcePath));
  if (missingShared.length > 0) {
    throw new PlanError(
      `Source file not found:\n${missingShared.map(e => `  - ${e.sourcePath}`).join('\n')}\n` +
        'The Volt UI registry is incomplete. Reinstall @voltui/cli.',
      'MISSING_SOURCE'
    );
  }

  // Shared files go through the same transform as components: one that declares a directive
  // (aria-invalid.ts) must be renamed to match the `ui*` identifiers its callers are rewritten to.
  for (const entry of [...componentEntries, ...sharedEntries]) {
    entry.content = core.transformContent(fs.readFileSync(entry.sourcePath, 'utf-8'));
    addFile(entry);
  }

  const files = [...byTarget.values()].map(entry => ({
    ...entry,
    ...inspectTarget(entry.targetPath, entry.content, force),
  }));

  const barrelPath = path.join(targetDir, 'index.ts');
  let before = null;
  if (fs.existsSync(barrelPath)) {
    if (!fs.statSync(barrelPath).isFile()) {
      throw new PlanError(
        `${barrelPath} exists and is not a file. Move it away or choose a different target-dir.`,
        'NOT_A_FILE'
      );
    }
    before = fs.readFileSync(barrelPath, 'utf-8');
  }
  // A barrel `volt add` creates on its own starts from the same header `volt init` writes.
  const { content: after, added } = addBarrelExports(before ?? INITIAL_BARREL, components);
  const barrel = {
    path: barrelPath,
    before,
    after,
    added,
    action: before === null ? 'create' : added.length > 0 ? 'update' : 'unchanged',
  };

  // What the copied files import, compared with the consumer package the destination belongs to.
  const project = projectOption || resolveProject({ cwd: process.cwd(), destination: targetDir });
  const required = requiredDependencies({
    sources: [...byTarget.values()].map(entry => fs.readFileSync(entry.sourcePath, 'utf-8')),
    manifest,
    base,
    defaultBase: core.DEFAULT_BASE,
  });
  const assessment = assessDependencies(project, required);
  const runtimeDependencies = required.packages.map(specOf);
  const missingInstall = manualInstall(project, assessment);
  const everything =
    project.packageDir && project.manager.name
      ? installInvocation(project, runtimeDependencies)
      : null;

  return {
    targetDir,
    base,
    force,
    requested,
    dependencies,
    components,
    sharedFiles,
    files,
    barrel,
    conflicts: files.filter(file => file.action === 'conflict'),
    runtimeDependencies,
    project,
    required,
    assessment,
    // The command for what is actually missing (null when nothing is), and the full one.
    installInvocation: missingInstall,
    installCommand: everything
      ? displayInvocation(missingInstall || everything, project.cwd)
      : `npm install ${runtimeDependencies.join(' ')}`,
  };
}

function describeFile(file) {
  return file.kind === 'shared' ? 'shared helper' : `component ${file.component}`;
}

function formatConflicts(plan, { dryRun = false } = {}) {
  const list = plan.conflicts.map(file => `  - ${file.targetPath} (${describeFile(file)})`);
  return [
    dryRun
      ? 'The real command would refuse to overwrite existing file(s) that differ from the Volt UI source:'
      : 'Refusing to overwrite existing file(s) that differ from the Volt UI source:',
    ...list,
    '',
    dryRun
      ? 'It would write nothing at all, not even the files that do not conflict.'
      : 'Nothing was written; your files are unchanged.',
    'To keep your edits, leave them in place and add to a different target-dir.',
    'To replace them with the Volt UI source, review the difference and re-run with --force.',
  ].join('\n');
}

function assertNoConflicts(plan) {
  if (plan.conflicts.length > 0) throw new PlanError(formatConflicts(plan), 'CONFLICT');
}

function filesWithAction(plan, action) {
  return plan.files.filter(file => file.action === action);
}

module.exports = {
  PlanError,
  planAdd,
  assertNoConflicts,
  formatConflicts,
  filesWithAction,
  describeFile,
};
