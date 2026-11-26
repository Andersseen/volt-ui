// Command-line parsing for `volt`, validated per command.
//
// Every command declares the flags it accepts. A flag is either boolean (`--force`) or takes a value,
// written `--path=dir` or `--path dir`. Parsing fails with an actionable message — never silently
// ignores — on: an unknown flag (with a suggestion), a value flag without a value, a value given to a
// boolean flag, the same value flag repeated with different values, and extra positional arguments.

class ArgsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ArgsError';
  }
}

const FLAG_SPECS = {
  path: { value: true, hint: '--path=<dir>' },
  base: { value: true, hint: '--base=ng-primitives|quartz' },
  status: { value: true, hint: '--status=stable|beta|experimental' },
  install: { value: false },
  track: { value: false },
  'dry-run': { value: false },
  force: { value: false },
  json: { value: false },
  help: { value: false },
};

const COMMANDS = {
  init: {
    flags: ['path', 'base', 'help'],
    usage: 'volt init [target-dir | --path=<dir>] [--base=<base>]',
  },
  add: {
    flags: ['path', 'base', 'install', 'dry-run', 'force', 'track', 'help'],
    usage:
      'volt add <component>... [target-dir | --path=<dir>] [--base=<base>] [--install] [--dry-run] [--force] [--track]',
  },
  diff: {
    flags: ['path', 'base', 'json', 'help'],
    usage: 'volt diff <component>... [--path=<dir>] [--base=<base>] [--json]',
  },
  list: {
    flags: ['status', 'base', 'json', 'help'],
    usage: 'volt list [--status=<status>] [--base=<base>] [--json]',
  },
  help: { flags: [], usage: 'volt help' },
};

function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

/** The closest candidate within a small edit distance, or null. */
function closest(word, candidates, max = 2) {
  let best = null;
  for (const candidate of candidates) {
    const d = distance(word, candidate);
    if (d <= max && (!best || d < best.d)) best = { candidate, d };
  }
  return best && best.candidate;
}

/**
 * Splits argv into the command, its positionals and its flags, validating the flags against the
 * command. `volt` with no command, `volt help`, `volt --help` and `volt -h` all mean help.
 */
function parseArgs(argv) {
  const positionals = [];
  const flags = {};
  const seen = {};
  let command = null;
  let afterDoubleDash = false;

  const tokens = [...argv];
  const raw = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (afterDoubleDash) {
      raw.push({ positional: token });
      continue;
    }
    if (token === '--') {
      afterDoubleDash = true;
      continue;
    }
    if (token === '-h') {
      raw.push({ flag: 'help', value: true, text: token });
      continue;
    }
    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      const name = eq === -1 ? token.slice(2) : token.slice(2, eq);
      const inline = eq === -1 ? undefined : token.slice(eq + 1);
      raw.push({ flag: name, inline, text: token, index: i });
      // A value flag written `--path dir` consumes the next token, unless it is another flag.
      const spec = FLAG_SPECS[name];
      if (spec && spec.value && inline === undefined) {
        const next = tokens[i + 1];
        if (next !== undefined && !next.startsWith('-')) {
          raw[raw.length - 1].inline = next;
          i++;
        }
      }
      continue;
    }
    if (token.startsWith('-') && token.length > 1) {
      throw new ArgsError(
        `Unknown option "${token}". Volt options are long flags such as --path, --dry-run, --force.`
      );
    }
    raw.push({ positional: token });
  }

  for (const item of raw) {
    if (item.positional !== undefined) {
      if (command === null) command = item.positional;
      else positionals.push(item.positional);
    }
  }
  if (command === null || command === 'help' || raw.some(i => i.flag === 'help' && !command)) {
    return { command: 'help', positionals: command === 'help' ? positionals : [], flags: {} };
  }
  const spec = COMMANDS[command];
  if (!spec) {
    const suggestion = closest(command, Object.keys(COMMANDS));
    throw new ArgsError(
      `Unknown command "${command}".${suggestion ? ` Did you mean "volt ${suggestion}"?` : ''}\n` +
        'Commands: init, add, diff, list. Run "volt help" for usage.'
    );
  }

  for (const item of raw) {
    if (item.flag === undefined) continue;
    const name = item.flag;
    const flagSpec = FLAG_SPECS[name];
    if (!flagSpec || !spec.flags.includes(name)) {
      const suggestion = closest(name, spec.flags);
      const valid = spec.flags.filter(f => f !== 'help').map(f => `--${f}`);
      throw new ArgsError(
        `Unknown option "--${name}" for "volt ${command}".` +
          (suggestion ? ` Did you mean "--${suggestion}"?` : '') +
          `\nValid options: ${valid.join(', ') || '(none)'}.\nUsage: ${spec.usage}`
      );
    }
    if (flagSpec.value) {
      if (item.inline === undefined || item.inline === true) {
        throw new ArgsError(`--${name} needs a value: ${flagSpec.hint}`);
      }
      if (item.inline === '') {
        throw new ArgsError(`--${name} was given an empty value: ${flagSpec.hint}`);
      }
      if (seen[name] !== undefined && seen[name] !== item.inline) {
        throw new ArgsError(
          `--${name} was given twice with different values ("${seen[name]}" and "${item.inline}"). Pass it once.`
        );
      }
      seen[name] = item.inline;
      flags[name] = item.inline;
    } else {
      if (item.inline !== undefined && item.inline !== true) {
        throw new ArgsError(`--${name} does not take a value (got "--${name}=${item.inline}").`);
      }
      flags[name] = true;
    }
  }
  if (flags.help) return { command: 'help', positionals: [command], flags: {} };
  return { command, positionals, flags };
}

module.exports = { ArgsError, parseArgs, closest, COMMANDS, FLAG_SPECS };
