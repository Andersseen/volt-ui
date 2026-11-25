// Writes a validated add plan and undoes this operation's own writes if one of them fails.
//
// Guarantee: when a write throws, files this operation replaced get their previous bytes back,
// files it created are removed, and directories it created are removed if they are empty again.
// Nothing it did not create or replace is touched. This is not crash-proof: a killed process or a
// full disk during the restore can still leave a partial state, which the error then names.

const fs = require('fs');
const path = require('path');

class ApplyError extends Error {
  constructor(message, { cause, restoreFailures }) {
    super(message);
    this.name = 'ApplyError';
    this.cause = cause;
    this.restoreFailures = restoreFailures;
  }
}

/** Creates the missing ancestors of `dir` one by one, recording each so rollback can remove it. */
function ensureDirectory(dir, journal, io) {
  const missing = [];
  let current = path.resolve(dir);
  while (!io.existsSync(current)) {
    missing.unshift(current);
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  for (const directory of missing) {
    io.mkdirSync(directory);
    journal.createdDirs.push(directory);
  }
}

/** `wx` refuses to replace a file that appeared after planning; it is recorded once it exists. */
function writeNewFile(target, content, journal, io) {
  const fd = io.openSync(target, 'wx');
  journal.createdFiles.push(target);
  try {
    io.writeFileSync(fd, content);
  } finally {
    io.closeSync(fd);
  }
}

function replaceFile(target, content, journal, io) {
  journal.backups.push({ path: target, data: io.readFileSync(target) });
  io.writeFileSync(target, content);
}

function rollback(journal, io) {
  const failures = [];
  const attempt = (label, fn) => {
    try {
      fn();
    } catch (err) {
      failures.push(`${label}: ${err.message}`);
    }
  };
  for (const { path: target, data } of [...journal.backups].reverse()) {
    attempt(target, () => io.writeFileSync(target, data));
  }
  for (const target of [...journal.createdFiles].reverse()) {
    attempt(target, () => {
      if (io.existsSync(target)) io.unlinkSync(target);
    });
  }
  for (const directory of [...journal.createdDirs].reverse()) {
    // Only empty directories go: a consumer file placed there meanwhile keeps its folder.
    try {
      if (io.readdirSync(directory).length === 0) io.rmdirSync(directory);
    } catch (err) {
      failures.push(`${directory}: ${err.message}`);
    }
  }
  return failures;
}

/**
 * Writes every `create`/`replace` file of the plan, then the barrel. Returns what was written.
 * `io` defaults to `fs`; tests pass a wrapper to simulate a failing write.
 */
function applyPlan(plan, io = fs) {
  const journal = { createdFiles: [], createdDirs: [], backups: [] };
  const writes = plan.files.filter(file => file.action === 'create' || file.action === 'replace');

  try {
    for (const file of writes) {
      ensureDirectory(path.dirname(file.targetPath), journal, io);
      if (file.action === 'create') writeNewFile(file.targetPath, file.content, journal, io);
      else replaceFile(file.targetPath, file.content, journal, io);
    }
    const { barrel } = plan;
    if (barrel.action === 'create') {
      ensureDirectory(path.dirname(barrel.path), journal, io);
      writeNewFile(barrel.path, barrel.after, journal, io);
    } else if (barrel.action === 'update') {
      replaceFile(barrel.path, barrel.after, journal, io);
    }
  } catch (err) {
    const restoreFailures = rollback(journal, io);
    const lines = [`Could not write the component files: ${err.message}`];
    if (restoreFailures.length === 0) {
      lines.push('Every file this command wrote was rolled back; your project is as it was.');
    } else {
      lines.push(
        'The rollback could not restore everything. Check these paths by hand:',
        ...restoreFailures.map(failure => `  - ${failure}`)
      );
    }
    throw new ApplyError(lines.join('\n'), { cause: err, restoreFailures });
  }

  return {
    created: journal.createdFiles,
    replaced: journal.backups.map(backup => backup.path),
    createdDirs: journal.createdDirs,
  };
}

module.exports = { applyPlan, ApplyError };
