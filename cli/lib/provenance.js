// Optional copy provenance: `.volt-ui.json` inside the target UI directory.
//
// `volt add --track` records, for every file the CLI copied (or verified identical), the SHA-256 of
// the bytes it wrote, which components own the file, and which CLI/registry/transform produced
// them. Once a valid record exists, later `volt add` runs keep it coherent. `volt diff` reads it to
// tell a local edit from a change in the reference source. The record is never needed at runtime:
// deleting it only loses that baseline.
//
// The file holds no source text, no absolute paths and nothing from the consumer project besides
// relative file names inside the target directory.
//
// Schema version 1:
//   {
//     "schemaVersion": 1,
//     "base": "ng-primitives" | "quartz",
//     "files": {
//       "<relative/posix/path>": {
//         "sha256": "<64 hex chars>",          // of the copied bytes, CRLF normalised to LF
//         "owners": ["<component>", ...],      // sorted, unique; shared helpers list every owner
//         "source": { "cli": "<version>"|null, "registry": "<version>"|null, "transform": <int> }
//       }
//     }
//   }

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROVENANCE_FILE = '.volt-ui.json';
const PROVENANCE_SCHEMA_VERSION = 1;
const MAX_RECORD_BYTES = 1024 * 1024;
const BASES = ['ng-primitives', 'quartz'];

class ProvenanceError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ProvenanceError';
    this.code = code;
  }
}

/** SHA-256 of the text as copied: the CLI always writes LF, and a CRLF checkout is not an edit. */
function hashContent(text) {
  return crypto.createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

/**
 * A path inside the target directory, written with `/`: no absolute path, drive letter, backslash,
 * empty, `.` or `..` segment, and no NUL. Anything else could make a reader leave the directory.
 */
function isSafeRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512) return false;
  if (value.includes('\\') || value.includes('\0') || value.startsWith('/')) return false;
  if (/^[a-zA-Z]:/.test(value)) return false;
  return value.split('/').every(segment => segment !== '' && segment !== '.' && segment !== '..');
}

function fail(file, detail, code = 'CORRUPT') {
  const fix =
    code === 'UNSUPPORTED'
      ? 'Use the @voltui/cli version that wrote it, or move the file away to stop tracking.'
      : 'Fix it, or move it away (the copied components do not need it) and add again with --track.';
  return new ProvenanceError(`${file} ${detail}\n   ${fix} Nothing was changed.`, code);
}

const isVersion = value => value === null || (typeof value === 'string' && value.length <= 64);

/** Validates a parsed record; throws ProvenanceError naming the first problem. */
function validateRecord(record, file = PROVENANCE_FILE) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw fail(file, 'is not a JSON object.');
  }
  const { schemaVersion } = record;
  if (!Number.isInteger(schemaVersion)) {
    throw fail(file, 'has no integer "schemaVersion".');
  }
  if (schemaVersion !== PROVENANCE_SCHEMA_VERSION) {
    throw fail(
      file,
      `uses schemaVersion ${schemaVersion}; this @voltui/cli reads version ${PROVENANCE_SCHEMA_VERSION}` +
        (schemaVersion > PROVENANCE_SCHEMA_VERSION ? ' (it was written by a newer CLI).' : '.'),
      'UNSUPPORTED'
    );
  }
  const unknownKeys = Object.keys(record).filter(
    key => !['schemaVersion', 'base', 'files'].includes(key)
  );
  if (unknownKeys.length > 0) throw fail(file, `has unknown fields: ${unknownKeys.join(', ')}.`);
  if (!BASES.includes(record.base)) {
    throw fail(file, `has an unknown "base" (${JSON.stringify(record.base)}).`);
  }
  const { files } = record;
  if (!files || typeof files !== 'object' || Array.isArray(files)) {
    throw fail(file, 'has no "files" object.');
  }
  for (const [relPath, entry] of Object.entries(files)) {
    const label = JSON.stringify(relPath);
    if (!isSafeRelativePath(relPath)) {
      throw fail(file, `lists ${label}, which is not a relative path inside the UI directory.`);
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw fail(file, `has an invalid entry for ${label}.`);
    }
    if (typeof entry.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(entry.sha256)) {
      throw fail(file, `has an invalid sha256 for ${label}.`);
    }
    const { owners } = entry;
    if (
      !Array.isArray(owners) ||
      owners.length === 0 ||
      owners.some(o => typeof o !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(o)) ||
      new Set(owners).size !== owners.length
    ) {
      throw fail(file, `has invalid owners for ${label}.`);
    }
    const { source } = entry;
    if (
      !source ||
      typeof source !== 'object' ||
      !isVersion(source.cli) ||
      !isVersion(source.registry) ||
      !Number.isInteger(source.transform) ||
      source.transform < 1
    ) {
      throw fail(file, `has an invalid source for ${label}.`);
    }
    const extra = Object.keys(entry).filter(key => !['sha256', 'owners', 'source'].includes(key));
    if (extra.length > 0) throw fail(file, `has unknown fields for ${label}: ${extra.join(', ')}.`);
  }
  return record;
}

/**
 * Reads `<targetDir>/.volt-ui.json` without following a symlink and without writing anything.
 * Returns `{ exists: false }` or `{ exists: true, record, text }`; throws ProvenanceError when the
 * file exists but cannot be trusted.
 */
function readProvenance(targetDir) {
  const file = path.join(targetDir, PROVENANCE_FILE);
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch (err) {
    if (err.code === 'ENOENT') return { exists: false, path: file };
    throw new ProvenanceError(`Cannot read ${file}: ${err.message}`, 'UNREADABLE');
  }
  if (stat.isSymbolicLink()) {
    throw fail(file, 'is a symbolic link; Volt only reads a regular file there.', 'UNSAFE');
  }
  if (!stat.isFile()) throw fail(file, 'is not a regular file.', 'UNSAFE');
  if (stat.size > MAX_RECORD_BYTES) throw fail(file, 'is larger than 1 MiB.');
  let text;
  try {
    text = fs.readFileSync(file, 'utf-8');
  } catch (err) {
    throw new ProvenanceError(`Cannot read ${file}: ${err.message}`, 'UNREADABLE');
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw fail(file, 'is not valid JSON.');
  }
  return { exists: true, path: file, record: validateRecord(parsed, file), text };
}

/** Deterministic JSON: files sorted by path, owners sorted, two-space indent, final newline. */
function serializeRecord(record) {
  const files = {};
  for (const relPath of Object.keys(record.files).sort()) {
    const entry = record.files[relPath];
    files[relPath] = {
      sha256: entry.sha256,
      owners: [...entry.owners].sort(),
      source: {
        cli: entry.source.cli,
        registry: entry.source.registry,
        transform: entry.source.transform,
      },
    };
  }
  return `${JSON.stringify(
    { schemaVersion: PROVENANCE_SCHEMA_VERSION, base: record.base, files },
    null,
    2
  )}\n`;
}

/**
 * The record after an add. `entries` are the files the operation copied or verified identical:
 * `{ relPath, owners, sha256 }` where sha256 is the hash of the reference bytes (equal to what is on
 * disk once the write succeeds). Existing entries for other files are kept as they are; an entry
 * for a re-copied file keeps its original source when its hash did not change.
 */
function mergeRecord(existing, entries, { base, source }) {
  if (existing && existing.base !== base) {
    throw new ProvenanceError(
      `${PROVENANCE_FILE} records the "${existing.base}" base, but this add uses "${base}".\n` +
        '   Mixing headless engines in one directory is not supported. Nothing was changed.',
      'BASE_MISMATCH'
    );
  }
  const files = existing ? { ...existing.files } : {};
  for (const { relPath, owners, sha256 } of entries) {
    const previous = files[relPath];
    const mergedOwners = [...new Set([...(previous ? previous.owners : []), ...owners])].sort();
    files[relPath] = {
      sha256,
      owners: mergedOwners,
      source: previous && previous.sha256 === sha256 ? previous.source : { ...source },
    };
  }
  return { schemaVersion: PROVENANCE_SCHEMA_VERSION, base, files };
}

module.exports = {
  PROVENANCE_FILE,
  PROVENANCE_SCHEMA_VERSION,
  ProvenanceError,
  hashContent,
  isSafeRelativePath,
  validateRecord,
  readProvenance,
  serializeRecord,
  mergeRecord,
};
