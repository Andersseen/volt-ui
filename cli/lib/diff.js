// `volt diff`: a read-only comparison between the components a consumer copied and the reference
// source shipped inside the @voltui/cli that is running (not the latest release on npm).
//
// It never writes, renames, deletes or touches a file, never applies a patch, needs no network and
// no Git. It reads only the requested components' files, the shared helpers they import and
// `.volt-ui.json`, and only when the resolved path stays inside the target directory.
//
// With a provenance record the baseline hash separates a local edit from a reference change:
//
//   local = base, reference = base           unchanged
//   local = base, reference ≠ base           reference-changed
//   local ≠ base, reference = base           local-changed
//   local = reference ≠ base                 matches-reference
//   local, reference and base all differ     both-changed   (needs review; not a proven conflict)
//   no trustworthy base, local ≠ reference   unknown-origin
//   no trustworthy base, local = reference   matches-reference
//   file missing locally                     missing
//   tracked, no longer in the reference      reference-removed
//
// Without a base hash there is no base text either, so this is a two-way diff: it shows what differs,
// never who changed it.

const fs = require('fs');
const path = require('path');
const core = require('./core');
const provenance = require('./provenance');
const { unifiedDiff, diffStats } = require('./unified-diff');

const DIFF_SCHEMA_VERSION = 1;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const SAME = new Set(['unchanged', 'matches-reference']);

const STATUS_HELP = {
  unchanged: 'matches the recorded copy and the reference',
  'reference-changed': 'your copy is untouched; the reference source changed since it was copied',
  'local-changed': 'you edited this file; the reference has not changed since it was copied',
  'matches-reference': 'your copy already matches the reference',
  'both-changed': 'both your copy and the reference changed since it was copied: review by hand',
  missing: 'the reference has this file and your copy does not',
  'unknown-origin': 'differs from the reference; no baseline says which side changed',
  'reference-removed': 'tracked here, but the reference no longer ships this file',
};

class DiffError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DiffError';
    this.code = code;
  }
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

/** The real target directory; it must exist and be a directory. */
function resolveTarget(targetDir) {
  let real;
  try {
    real = fs.realpathSync(targetDir);
  } catch {
    throw new DiffError(
      `${targetDir} does not exist. Point --path at the folder that holds your copied components.`,
      'TARGET_MISSING'
    );
  }
  if (!fs.statSync(real).isDirectory()) {
    throw new DiffError(`${targetDir} is not a directory.`, 'TARGET_NOT_DIRECTORY');
  }
  return real;
}

/**
 * Reads `<realTarget>/<relPath>` only if it resolves (symlinks included) to a regular file inside
 * the target. Returns null when it does not exist. Never creates or modifies anything.
 */
function readContained(realTarget, relPath) {
  if (!provenance.isSafeRelativePath(relPath)) {
    throw new DiffError(`Refusing to read "${relPath}": not a path inside the target.`, 'UNSAFE_PATH');
  }
  const candidate = path.join(realTarget, ...relPath.split('/'));
  try {
    fs.lstatSync(candidate);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return null;
    throw new DiffError(`Cannot read ${relPath}: ${err.message}`, 'UNREADABLE');
  }
  let real;
  try {
    real = fs.realpathSync(candidate);
  } catch {
    // A dangling symlink: something is there, but it is not a file we may read.
    throw new DiffError(
      `Refusing to read ${relPath}: it is a symbolic link to a missing file.`,
      'UNSAFE_PATH'
    );
  }
  if (!real.startsWith(realTarget + path.sep)) {
    throw new DiffError(
      `Refusing to read ${relPath}: it resolves outside the target directory (symbolic link).`,
      'UNSAFE_PATH'
    );
  }
  const stat = fs.statSync(real);
  if (!stat.isFile()) {
    throw new DiffError(`${relPath} exists but is not a regular file.`, 'NOT_A_FILE');
  }
  if (stat.size > MAX_FILE_BYTES) {
    throw new DiffError(`${relPath} is larger than 5 MiB; not comparing it.`, 'TOO_LARGE');
  }
  return fs.readFileSync(real, 'utf-8');
}

/** Reference files for the requested components and the shared helpers they import, by path. */
function referenceFiles(componentNames, manifest, base) {
  const { componentsRoot } = core.resolveRegistryPaths();
  const files = new Map();
  const add = (relPath, kind, owner, sourcePath) => {
    const existing = files.get(relPath);
    if (existing) {
      if (!existing.owners.includes(owner)) existing.owners.push(owner);
      return;
    }
    if (!fs.existsSync(sourcePath)) {
      throw new DiffError(
        `The reference source is incomplete (missing ${sourcePath}). Reinstall @voltui/cli.`,
        'MISSING_SOURCE'
      );
    }
    files.set(relPath, {
      path: relPath,
      kind,
      owners: [owner],
      content: core.transformContent(fs.readFileSync(sourcePath, 'utf-8')),
    });
  };
  for (const name of componentNames) {
    for (const file of core.filesFor(manifest.components[name], base)) {
      add(`${name}/${path.basename(file)}`, 'component', name, path.join(componentsRoot, file));
    }
    for (const shared of core.detectSharedFileDependencies([name], manifest, base)) {
      add(shared, 'shared', name, path.join(componentsRoot, shared));
    }
  }
  return files;
}

function classify({ local, reference, baseline }) {
  if (local === null) return 'missing';
  if (reference === null) return 'reference-removed';
  if (!baseline) return local === reference ? 'matches-reference' : 'unknown-origin';
  if (local === baseline && reference === baseline) return 'unchanged';
  if (local === reference) return 'matches-reference';
  if (local === baseline) return 'reference-changed';
  if (reference === baseline) return 'local-changed';
  return 'both-changed';
}

/**
 * Compares the requested components in `targetDir` with the reference. Pure read: returns a report
 * object; throws DiffError (or ProvenanceError) for invalid input or anything unsafe to read.
 */
function diffComponents({ componentNames, targetDir, displayDir, manifest, base }) {
  const requested = [...new Set(componentNames)];
  if (requested.length === 0) {
    throw new DiffError('Name at least one component to compare.', 'NO_COMPONENTS');
  }
  const unknown = requested.filter(name => !manifest.components[name]);
  if (unknown.length > 0) {
    throw new DiffError(
      `Unknown component${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. Run "volt list".`,
      'UNKNOWN_COMPONENT'
    );
  }
  try {
    core.assertSupportedForBase(requested, manifest, base);
  } catch (err) {
    throw new DiffError(err.message, 'UNSUPPORTED_BASE');
  }

  const realTarget = resolveTarget(targetDir);
  const record = provenance.readProvenance(realTarget);
  if (record.exists && record.record.base !== base) {
    throw new DiffError(
      `${provenance.PROVENANCE_FILE} records the "${record.record.base}" base, but this comparison uses "${base}". ` +
        `Pass --base=${record.record.base}.`,
      'BASE_MISMATCH'
    );
  }
  const tracked = record.exists ? record.record.files : {};

  const reference = referenceFiles(requested, manifest, base);
  // Tracked files of these components that the reference no longer ships.
  for (const [relPath, entry] of Object.entries(tracked)) {
    if (reference.has(relPath)) continue;
    const owners = entry.owners.filter(owner => requested.includes(owner));
    if (owners.length === 0) continue;
    const isShared = !relPath.includes('/');
    reference.set(relPath, {
      path: relPath,
      kind: isShared ? 'shared' : 'component',
      owners,
      content: null,
    });
  }

  const versions = core.cliVersions(manifest);
  const files = [];
  for (const relPath of [...reference.keys()].sort()) {
    const ref = reference.get(relPath);
    const localText = readContained(realTarget, relPath);
    const entry = tracked[relPath] || null;
    const localHash = localText === null ? null : provenance.hashContent(localText);
    const referenceHash = ref.content === null ? null : provenance.hashContent(ref.content);
    if (localText === null && ref.content === null) continue; // gone on both sides
    const status = classify({
      local: localHash,
      reference: referenceHash,
      baseline: entry ? entry.sha256 : null,
    });
    const notes = [];
    if (ref.kind === 'shared') {
      const allOwners = entry ? [...new Set([...entry.owners, ...ref.owners])].sort() : ref.owners;
      notes.push(
        `shared helper${allOwners.length > 1 ? ` used by ${allOwners.join(', ')}` : ''}: a change here affects every component that imports it`
      );
    }
    if (entry && entry.source.transform !== core.TRANSFORM_VERSION) {
      notes.push(
        `copied with transform v${entry.source.transform}; this CLI uses v${core.TRANSFORM_VERSION}, so part of the difference may come from the copy transform`
      );
    }
    if (!entry && record.exists) notes.push(`not listed in ${provenance.PROVENANCE_FILE}`);
    const different = !SAME.has(status);
    const label = `${toPosix(displayDir)}/${relPath}`;
    files.push({
      path: relPath,
      kind: ref.kind,
      owners: [...ref.owners].sort(),
      status,
      different,
      baseline: entry
        ? {
            sha256: entry.sha256,
            cli: entry.source.cli,
            registry: entry.source.registry,
            transform: entry.source.transform,
          }
        : null,
      local: { sha256: localHash },
      reference: { sha256: referenceHash },
      stats: different ? diffStats(localText, ref.content) : { added: 0, removed: 0 },
      notes,
      diff: different
        ? unifiedDiff(localText, ref.content, {
            fromLabel: localText === null ? '/dev/null' : `a/${relPath}\t(local ${label})`,
            toLabel:
              ref.content === null
                ? '/dev/null'
                : `b/${relPath}\t(reference @voltui/cli ${versions.cli || 'unknown'})`,
          })
        : null,
    });
  }

  const byStatus = {};
  for (const file of files) byStatus[file.status] = (byStatus[file.status] || 0) + 1;
  // A file the reference added cannot have a baseline yet; only local files count for coverage.
  const localFiles = files.filter(file => file.status !== 'missing');
  const trackedCount = localFiles.filter(file => file.baseline).length;
  const differences = files.some(file => file.different);
  const dependencies = [
    ...new Set(
      requested.flatMap(name =>
        [...core.collectDependencies(name, manifest, new Set(), base)].filter(
          dep => !requested.includes(dep)
        )
      )
    ),
  ].sort();

  return {
    schemaVersion: DIFF_SCHEMA_VERSION,
    referenceVersion: versions.registry,
    reference: {
      cli: versions.cli,
      registry: versions.registry,
      transform: core.TRANSFORM_VERSION,
      base,
    },
    component: requested.length === 1 ? requested[0] : null,
    components: requested,
    dependencies,
    target: toPosix(displayDir),
    provenance: {
      status: !record.exists
        ? 'untracked'
        : trackedCount === localFiles.length
          ? 'tracked'
          : trackedCount === 0
            ? 'untracked'
            : 'partial',
      file: record.exists ? provenance.PROVENANCE_FILE : null,
    },
    differences,
    summary: { files: files.length, different: files.filter(f => f.different).length, byStatus },
    files,
  };
}

/** Human-readable report for the terminal. */
function formatReport(report) {
  const lines = [];
  lines.push(
    `Reference: @voltui/cli ${report.reference.cli || 'unknown'} (components ${report.referenceVersion || 'unknown'}, ` +
      `transform v${report.reference.transform}, base ${report.reference.base}) — the CLI you are running, not the latest on npm.`
  );
  const provenanceLine = {
    tracked: `Provenance: tracked (${report.provenance.file}); statuses use the recorded baseline.`,
    partial: `Provenance: partial — some files are not in ${report.provenance.file}; those show unknown origin.`,
    untracked:
      'Provenance: unknown — no baseline was recorded (add with --track to record one). Differences are two-way: they do not say which side changed.',
  }[report.provenance.status];
  lines.push(provenanceLine);
  lines.push(`Compared: ${report.components.join(', ')} in ${report.target}`);
  if (report.dependencies.length > 0) {
    lines.push(
      `Not compared (dependencies, run "volt diff" on them separately): ${report.dependencies.join(', ')}`
    );
  }
  lines.push('');
  const width = Math.max(...report.files.map(f => f.status.length), 8);
  for (const file of report.files) {
    const stats = file.different ? ` (+${file.stats.added} −${file.stats.removed})` : '';
    lines.push(`  ${file.status.padEnd(width)}  ${file.path}${stats}`);
    lines.push(`  ${' '.repeat(width)}  ${STATUS_HELP[file.status]}`);
    file.notes.forEach(note => lines.push(`  ${' '.repeat(width)}  note: ${note}`));
  }
  lines.push('');
  if (!report.differences) {
    lines.push('No differences: your copy matches the reference.');
    return lines.join('\n');
  }
  lines.push(
    `${report.summary.different} of ${report.summary.files} file(s) differ. The diff reads local → reference.`,
    'Nothing was changed. Move the parts you want into your copy by hand, then run your tests.',
    'Do not use "volt add --force" to keep customisations: it replaces your files with the reference.',
    ''
  );
  for (const file of report.files) {
    if (file.diff) lines.push(file.diff);
  }
  return lines.join('\n');
}

module.exports = {
  DIFF_SCHEMA_VERSION,
  DiffError,
  diffComponents,
  formatReport,
  classify,
  STATUS_HELP,
};
