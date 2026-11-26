/**
 * What a consumer's project can actually do, for the MCP tools: which versions this server
 * describes, which ones npm serves, and whether a capability exists in the version a consumer says
 * they have. Plus the one place a CLI command is built from untrusted arguments.
 *
 * Every version fact comes from packages/shared/lib/release-capabilities.ts (explicit, checked
 * against the published artifacts by `pnpm check:published`) and the generated
 * release-availability file. Nothing here infers a capability from the source version.
 */
import { RELEASES } from '../../../../../../packages/shared/lib/release-availability.generated';
import {
  RELEASE_CAPABILITIES,
  capabilityStatus,
  compareVersions,
  type PackageName,
  type ReleaseCapability,
} from '../../../../../../packages/shared/lib/release-capabilities';

export interface ConsumerVersions {
  /** Installed @voltui/components (package mode). */
  readonly components?: string;
  /** The @voltui/cli the consumer runs (copy mode). */
  readonly cli?: string;
  /** Installed @voltui/agent. */
  readonly agent?: string;
}

const VERSION = /^\d+\.\d+\.\d+$/;

/** A plain release version, `1.3.3`; ranges and tags (`^1.3.0`, `latest`) are refused. */
export function isPlainVersion(value: string | undefined): value is string {
  return !!value && VERSION.test(value);
}

const INSTALLED_KEY: Record<PackageName, keyof ConsumerVersions> = {
  '@voltui/components': 'components',
  '@voltui/cli': 'cli',
  '@voltui/agent': 'agent',
};

export interface CapabilityReport {
  readonly id: string;
  readonly package: PackageName;
  readonly since: string;
  readonly summary: string;
  /** In npm's latest (as of the last site build). */
  readonly published: 'available' | 'unreleased' | 'unknown';
  /** In the version the consumer supplied, when they supplied one. */
  readonly installed?: 'available' | 'unavailable';
}

export function capabilityReport(
  capability: ReleaseCapability,
  installed: ConsumerVersions = {}
): CapabilityReport {
  const version = installed[INSTALLED_KEY[capability.package]];
  return {
    id: capability.id,
    package: capability.package,
    since: capability.since,
    summary: capability.summary,
    published: capabilityStatus(capability, RELEASES),
    ...(isPlainVersion(version)
      ? {
          installed:
            compareVersions(version, capability.since) >= 0
              ? ('available' as const)
              : ('unavailable' as const),
        }
      : {}),
  };
}

/** The version facts every answer is relative to, for get_project_info and friends. */
export function versionContext(installed: ConsumerVersions = {}) {
  return {
    describes: Object.fromEntries(Object.entries(RELEASES).map(([name, r]) => [name, r.source])),
    publishedOnNpm: Object.fromEntries(
      Object.entries(RELEASES).map(([name, r]) => [name, r.published])
    ),
    ...(Object.keys(installed).length ? { installed } : {}),
    note:
      'This server describes the source versions. "publishedOnNpm" is npm latest when the server was built. ' +
      'Capabilities listed as unreleased are not in what `npm install` / `npx` get today; pass your installed versions ' +
      '(componentsVersion, cliVersion) to be told what your project has.',
    capabilities: RELEASE_CAPABILITIES.map(c => capabilityReport(c, installed)),
  };
}

// ---------------------------------------------------------------------------------------------
// CLI commands
// ---------------------------------------------------------------------------------------------

export type CliAction = 'init' | 'add' | 'diff' | 'list';

export interface CliCommandRequest {
  readonly action: CliAction;
  /** One or more component keys (add, diff). */
  readonly components: readonly string[];
  readonly targetDir?: string;
  readonly track?: boolean;
  readonly json?: boolean;
  /** The @voltui/cli version the command is for; default: what the server describes. */
  readonly cliVersion?: string;
}

export interface CliCommand {
  /** The command for a POSIX shell, every argument quoted where needed. */
  readonly command: string;
  /** The same command as an argument vector, for a process API (no shell involved). */
  readonly argv: readonly string[];
  /** Release capabilities the command relies on. */
  readonly requires: readonly string[];
  readonly notes: readonly string[];
  /**
   * Present when npm latest (or the supplied version) lacks something the command relies on: what
   * is missing and, where one exists, an equivalent command for the version that can be installed.
   */
  readonly availability?: {
    readonly status: 'unreleased' | 'unknown';
    readonly missing: readonly CapabilityReport[];
    readonly publishedAlternative?: { readonly command: string; readonly argv: readonly string[] };
  };
}

export interface CliCommandError {
  readonly error: string;
  readonly suggestions?: Record<string, readonly string[]>;
  readonly missing?: readonly CapabilityReport[];
}

/** Characters a POSIX shell leaves alone in a word. */
const SAFE_WORD = /^[A-Za-z0-9_./=@%+:,-]+$/;

/** Quotes one argument for a POSIX shell: `my dir` → `'my dir'`, `it's` → `'it'\''s'`. */
export function shellQuote(arg: string): string {
  if (arg !== '' && SAFE_WORD.test(arg)) return arg;
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

/** Levenshtein distance, for "did you mean". */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

function suggest(name: string, known: readonly string[]): string[] {
  const lower = name.toLowerCase();
  return known
    .map(key => ({ key, d: distance(lower, key) }))
    .filter(({ key, d }) => d <= 2 || key.includes(lower) || lower.includes(key))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map(({ key }) => key);
}

const PREFIX = ['npx', '@voltui/cli'];

/**
 * Builds a CLI command from untrusted tool arguments. Never executes anything.
 *
 * Validation: component names must be known keys (with suggestions otherwise); the target directory
 * must be a relative or absolute path without control characters, a leading `-`, or a `..` segment
 * that climbs out of the project. Shell-special characters are quoted, not stripped, and `argv`
 * carries the unquoted vector for callers that spawn without a shell.
 *
 * Version awareness: each flag and action maps to a release capability. With `cliVersion`, a
 * capability that version lacks is an error naming what is missing (with the equivalent where one
 * exists). Without it, the command describes the source (as before) and `availability` says what
 * npm latest lacks.
 */
export function buildCliCommand(
  request: CliCommandRequest,
  knownComponents: readonly string[]
): CliCommand | CliCommandError {
  const { action, components, targetDir, track, json, cliVersion } = request;

  if (cliVersion !== undefined && !isPlainVersion(cliVersion)) {
    return { error: `cliVersion must be a plain version such as "1.3.3", not "${cliVersion}"` };
  }
  if ((action === 'add' || action === 'diff') && components.length === 0) {
    return { error: `component is required for the "${action}" action` };
  }
  if ((action === 'init' || action === 'list') && components.length > 0) {
    return { error: `"${action}" takes no component` };
  }
  if (action === 'list' && targetDir) return { error: '"list" takes no targetDir' };
  if (track && action !== 'add') return { error: 'track applies only to the "add" action' };
  if (json && action !== 'diff') return { error: 'json applies only to the "diff" action' };

  const unknown = components.filter(name => !knownComponents.includes(name));
  if (unknown.length) {
    return {
      error: `Unknown component${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. Use list_components or find_components for valid keys.`,
      suggestions: Object.fromEntries(unknown.map(name => [name, suggest(name, knownComponents)])),
    };
  }
  const unique = [...new Set(components)];

  if (targetDir !== undefined) {
    if (!targetDir.trim()) return { error: 'targetDir is empty' };
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f\u007f]/.test(targetDir)) {
      return { error: 'targetDir contains a control character (newline, tab, NUL…)' };
    }
    if (targetDir.startsWith('-')) {
      return { error: 'targetDir starts with "-" and would be read as an option' };
    }
    if (targetDir.split(/[\\/]/).includes('..')) {
      return { error: 'targetDir must not contain ".." segments; give a path inside the project' };
    }
  }

  const requires: string[] = [];
  if (targetDir !== undefined) requires.push('cli.path');
  if (action === 'diff') requires.push('cli.diff');
  if (track) requires.push('cli.track');
  if (action === 'add' && unique.length > 1) requires.push('cli.multi-add');

  const capabilities = requires.map(id => RELEASE_CAPABILITIES.find(c => c.id === id)!);
  const supplied = cliVersion ? { cli: cliVersion } : {};
  const reports = capabilities.map(c => capabilityReport(c, supplied));

  const build = (usePath: boolean) => {
    const argv = [
      ...PREFIX,
      action,
      ...unique,
      ...(targetDir !== undefined ? (usePath ? [`--path=${targetDir}`] : [targetDir]) : []),
      ...(track ? ['--track'] : []),
      ...(json ? ['--json'] : []),
    ];
    return { argv, command: argv.map(shellQuote).join(' ') };
  };

  const notes: string[] = [];
  if (action === 'diff') {
    notes.push(
      'Compares with the source inside the @voltui/cli version that runs (pin one with npx @voltui/cli@<version>), not the latest on npm. Read-only: exit 0 no differences, 1 differences, 2 error. Copies added with --track report who changed each file; others report unknown origin.'
    );
  }

  // A supplied version is authoritative: what it lacks is an error, not a guess.
  if (cliVersion) {
    const lacking = reports.filter(r => r.installed === 'unavailable');
    const onlyPath = lacking.length > 0 && lacking.every(r => r.id === 'cli.path');
    const multiOnly = lacking.length > 0 && lacking.every(r => r.id === 'cli.multi-add');
    if (lacking.length && !onlyPath && !multiOnly) {
      return {
        error: `@voltui/cli ${cliVersion} cannot run this: ${lacking
          .map(r => `${r.summary} (needs ${r.since})`)
          .join(' ')} Upgrade the CLI once ${lacking[0].since} is on npm, or do without it.`,
        missing: lacking,
      };
    }
    // --path has a positional equivalent every version understands.
    const { argv, command } = build(!onlyPath && !lacking.some(r => r.id === 'cli.path'));
    if (lacking.some(r => r.id === 'cli.multi-add')) {
      notes.push(
        `@voltui/cli ${cliVersion} can refuse a multi-component add when one component's dependency was copied earlier in the same command (tooltip, then sidebar). If it does, run one component per command.`
      );
    }
    if (lacking.some(r => r.id === 'cli.path')) {
      notes.push(
        `@voltui/cli ${cliVersion} has no --path; the destination is the positional last argument.`
      );
    }
    return { command, argv, requires, notes };
  }

  const { argv, command } = build(true);
  const missing = reports.filter(r => r.published !== 'available');
  if (!missing.length) return { command, argv, requires, notes };

  const alternativePossible = missing.every(r => r.id === 'cli.path' || r.id === 'cli.multi-add');
  return {
    command,
    argv,
    requires,
    notes,
    availability: {
      status: missing.some(r => r.published === 'unknown') ? 'unknown' : 'unreleased',
      missing,
      ...(alternativePossible ? { publishedAlternative: build(false) } : {}),
    },
  };
}
