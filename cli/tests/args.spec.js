// `volt` argument parsing: every command validates its own flags and positionals.
import { describe, it, expect } from 'vitest';

const { parseArgs, ArgsError, closest } = require('../lib/args.js');
const semver = require('../lib/semver.js');

const parse = line => parseArgs(line ? line.split(' ') : []);
const error = line => {
  try {
    parse(line);
  } catch (err) {
    expect(err).toBeInstanceOf(ArgsError);
    return err.message;
  }
  throw new Error(`"${line}" parsed without an error`);
};

describe('parseArgs', () => {
  it('treats no command, help, --help and -h as help', () => {
    expect(parse('').command).toBe('help');
    expect(parse('help').command).toBe('help');
    expect(parse('--help').command).toBe('help');
    expect(parse('add -h')).toEqual({ command: 'help', positionals: ['add'], flags: {} });
  });

  it('accepts --path=<dir> and --path <dir> as the same thing', () => {
    expect(parse('add button --path=./src/app/ui').flags.path).toBe('./src/app/ui');
    const spaced = parse('add button --path ./src/app/ui card');
    expect(spaced.flags.path).toBe('./src/app/ui');
    expect(spaced.positionals).toEqual(['button', 'card']);
  });

  it('keeps v1 positionals untouched (interpreted later, against the manifest)', () => {
    expect(parse('add button custom-ui').positionals).toEqual(['button', 'custom-ui']);
  });

  it('rejects unknown flags with a suggestion and the valid list', () => {
    const message = error('add button --forse');
    expect(message).toContain('Unknown option "--forse" for "volt add"');
    expect(message).toContain('Did you mean "--force"?');
    expect(message).toContain('--path, --base, --install, --dry-run, --force');
    expect(error('add button --yes')).toContain('Unknown option "--yes"');
  });

  it('rejects a flag another command owns', () => {
    expect(error('list --force')).toContain('Unknown option "--force" for "volt list"');
    expect(error('init --install')).toContain('Unknown option "--install" for "volt init"');
  });

  it('rejects short options', () => {
    expect(error('add button -f')).toContain('Unknown option "-f"');
  });

  it('requires a value for value flags', () => {
    expect(error('add button --path')).toBe('--path needs a value: --path=<dir>');
    expect(error('add button --path --force')).toContain('--path needs a value');
    expect(error('add button --base')).toContain('--base needs a value');
    expect(error('list --status')).toContain('--status needs a value');
    expect(error('add button --path=')).toContain('--path was given an empty value');
  });

  it('rejects a value on a boolean flag', () => {
    expect(error('add button --force=yes')).toContain('--force does not take a value');
    expect(error('add button --install=false')).toContain('--install does not take a value');
  });

  it('rejects repeated value flags that disagree, accepts identical repeats', () => {
    expect(error('add button --path=a --path=b')).toContain('--path was given twice');
    expect(parse('add button --path=a --path a').flags.path).toBe('a');
    expect(parse('add button --force --force').flags.force).toBe(true);
  });

  it('rejects unknown commands with a suggestion', () => {
    expect(error('ad button')).toContain('Did you mean "volt add"?');
    expect(error('remove button')).toContain('Unknown command "remove"');
  });

  it('treats everything after -- as positionals', () => {
    expect(parse('add button -- --odd-dir').positionals).toEqual(['button', '--odd-dir']);
  });

  it('suggests only close names', () => {
    expect(closest('buton', ['button', 'badge'])).toBe('button');
    expect(closest('xyz', ['button', 'badge'])).toBe(null);
  });
});

describe('semver.satisfies', () => {
  it.each([
    ['0.131.4', '^0.131.4', true],
    ['0.131.9', '^0.131.4', true],
    ['0.132.0', '^0.131.4', false],
    ['0.131.3', '^0.131.4', false],
    ['22.2.4', '^21.2.0 || ^22.0.0', true],
    ['21.1.9', '^21.2.0 || ^22.0.0', false],
    ['23.0.0', '^21.2.0 || ^22.0.0', false],
    ['2.1.1', '^2.0.0', true],
    ['3.0.0', '^2.0.0', false],
    ['22.1.7', '~22.1.0', true],
    ['22.2.0', '~22.1.0', false],
    ['1.2.3', '1.2.3', true],
    ['1.2.4', '1.2.x', true],
    ['5.0.0', '>=4.0.0 <6', true],
    ['6.0.0', '>=4.0.0 <6', false],
    ['1.0.0', '*', true],
    ['22.0.0-rc.1', '^22.0.0', false],
    ['22.0.0-rc.1', '^22.0.0-rc.0', true],
    ['not-a-version', '^1.0.0', false],
  ])('%s satisfies %s → %s', (version, range, expected) => {
    expect(semver.satisfies(version, range)).toBe(expected);
  });

  it('recognises ranges it cannot evaluate', () => {
    expect(semver.validRange('^1.2.0')).toBe(true);
    expect(semver.validRange('latest')).toBe(false);
    expect(semver.validRange('workspace:*')).toBe(false);
    expect(semver.validRange('github:user/repo')).toBe(false);
  });
});
