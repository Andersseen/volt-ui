import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { run, buildAgents, parseArgs, BLOCK_START, BLOCK_END } = require('./installer.js');
const { DEFAULT_MCP_URL } = require('./content.js');
const pkg = require('./package.json');

const AGENTS = Object.keys(buildAgents(DEFAULT_MCP_URL));
let dir;
let logs;
let errors;

const read = rel => readFileSync(join(dir, rel), 'utf-8');
const readJson = rel => JSON.parse(read(rel));
const go = (...argv) => run([...argv, '--dir', dir], { isTTY: false });

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'volt-mcp-'));
  logs = [];
  errors = [];
  vi.spyOn(console, 'log').mockImplementation(msg => logs.push(String(msg)));
  vi.spyOn(console, 'error').mockImplementation(msg => errors.push(String(msg)));
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(dir, { recursive: true, force: true });
});

describe('what each agent writes', () => {
  it('claude: .mcp.json with the http transport, and the skill', async () => {
    expect(await go('claude')).toBe(0);
    expect(readJson('.mcp.json')).toEqual({
      mcpServers: { 'volt-ui': { type: 'http', url: DEFAULT_MCP_URL } },
    });
    expect(read('.claude/skills/volt-ui/SKILL.md')).toMatch(/^---\nname: volt-ui\n/);
  });

  it('cursor: mcp.json and a rules block', async () => {
    await go('cursor');
    expect(readJson('.cursor/mcp.json').mcpServers['volt-ui']).toEqual({
      type: 'url',
      url: DEFAULT_MCP_URL,
    });
    expect(read('.cursorrules')).toContain(BLOCK_START);
  });

  it('windsurf: its mcp_config.json', async () => {
    await go('windsurf');
    expect(readJson('.codeium/windsurf/mcp_config.json').mcpServers['volt-ui'].url).toBe(
      DEFAULT_MCP_URL
    );
  });

  it('copilot: VS Code mcp.json, instructions and snippets', async () => {
    await go('copilot');
    expect(readJson('.vscode/mcp.json')).toEqual({
      servers: { 'volt-ui': { type: 'http', url: DEFAULT_MCP_URL } },
    });
    expect(read('.github/copilot-instructions.md')).toContain(BLOCK_START);
    expect(readJson('.vscode/volt-snippets.code-snippets')['Volt UI Button']).toBeDefined();
  });

  it('vscode: snippets only', async () => {
    await go('vscode');
    expect(existsSync(join(dir, '.vscode/volt-snippets.code-snippets'))).toBe(true);
    expect(existsSync(join(dir, '.vscode/mcp.json'))).toBe(false);
  });

  it('--url flows into configs and the written context', async () => {
    await go('claude', 'cursor', '--url', 'https://mcp.example.dev/api/mcp');
    expect(readJson('.mcp.json').mcpServers['volt-ui'].url).toBe('https://mcp.example.dev/api/mcp');
    expect(read('.cursorrules')).toContain('https://mcp.example.dev/api/mcp');
    expect(read('.cursorrules')).not.toContain(DEFAULT_MCP_URL);
  });
});

describe('re-running', () => {
  it('is idempotent: the second run changes nothing', async () => {
    await go('--all');
    const before = AGENTS.flatMap(() => []).length;
    logs.length = 0;
    await go('--all');
    expect(before).toBe(0);
    const statuses = logs.filter(l => /^\s+(created|updated|unchanged)\s/.test(l));
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every(l => /unchanged/.test(l))).toBe(true);
  });

  it('merges into an existing JSON config and keeps the user’s servers', async () => {
    writeFileSync(
      join(dir, '.mcp.json'),
      JSON.stringify({ mcpServers: { mine: { type: 'stdio', command: 'x' } }, other: 1 })
    );
    await go('claude');
    const json = readJson('.mcp.json');
    expect(json.mcpServers.mine).toEqual({ type: 'stdio', command: 'x' });
    expect(json.mcpServers['volt-ui']).toBeDefined();
    expect(json.other).toBe(1);
  });

  it('appends a block to a rules file the user already has, then replaces it in place', async () => {
    writeFileSync(join(dir, '.cursorrules'), 'Use tabs.\n');
    await go('cursor');
    const first = read('.cursorrules');
    expect(first.startsWith('Use tabs.')).toBe(true);
    expect(first).toContain(BLOCK_END);

    writeFileSync(join(dir, '.cursorrules'), first.replace('Use tabs.', 'Use spaces.'));
    await go('cursor');
    const second = read('.cursorrules');
    expect(second.startsWith('Use spaces.')).toBe(true);
    expect(second.split(BLOCK_START)).toHaveLength(2);
  });

  it('refuses to overwrite a JSON config it cannot parse', async () => {
    writeFileSync(join(dir, '.mcp.json'), '{ // hand written\n "mcpServers": {} }');
    expect(await go('claude')).toBe(1);
    expect(read('.mcp.json')).toContain('hand written');
    expect(errors.join('\n')).toMatch(/not valid JSON/);
  });
});

describe('--dry-run', () => {
  it('reports the plan and writes nothing', async () => {
    expect(await go('--all', '--dry-run')).toBe(0);
    expect(logs.join('\n')).toMatch(/created\s+\.mcp\.json/);
    expect(existsSync(join(dir, '.mcp.json'))).toBe(false);
    expect(existsSync(join(dir, '.vscode'))).toBe(false);
  });
});

describe('--uninstall', () => {
  it('removes only what was written and keeps the user’s content', async () => {
    writeFileSync(join(dir, '.cursorrules'), 'Use tabs.\n');
    mkdirSync(join(dir, '.cursor'));
    writeFileSync(
      join(dir, '.cursor/mcp.json'),
      JSON.stringify({ mcpServers: { mine: { url: 'x' } } })
    );
    await go('--all');
    expect(await go('--all', '--uninstall')).toBe(0);

    expect(read('.cursorrules')).toBe('Use tabs.\n');
    expect(readJson('.cursor/mcp.json')).toEqual({ mcpServers: { mine: { url: 'x' } } });
    expect(existsSync(join(dir, '.mcp.json'))).toBe(false);
    expect(existsSync(join(dir, '.claude/skills/volt-ui/SKILL.md'))).toBe(false);
    expect(existsSync(join(dir, '.github/copilot-instructions.md'))).toBe(false);
  });

  it('is a no-op on a clean project', async () => {
    expect(await go('claude', '--uninstall')).toBe(0);
    expect(logs.join('\n')).toMatch(/absent\s+\.mcp\.json/);
  });
});

describe('arguments', () => {
  it('rejects an unknown agent instead of falling back to the menu', async () => {
    expect(await go('cluade')).toBe(2);
    expect(errors.join('\n')).toMatch(/Unknown agent: cluade/);
  });

  it('rejects unknown options, missing values and bad URLs', async () => {
    expect(await go('claude', '--bogus')).toBe(2);
    expect(await run(['claude', '--dir'], { isTTY: false })).toBe(2);
    expect(await go('claude', '--url', 'ftp://x')).toBe(2);
  });

  it('rejects agents combined with --all', async () => {
    expect(await go('claude', '--all')).toBe(2);
  });

  it('rejects a missing project directory', async () => {
    expect(await run(['claude', '--dir', join(dir, 'nope')], { isTTY: false })).toBe(2);
  });

  it('does not hang without a terminal and without agents', async () => {
    expect(await go()).toBe(2);
    expect(errors.join('\n')).toMatch(/--all/);
  });

  it('--yes with no agent sets up every agent', async () => {
    expect(await go('--yes')).toBe(0);
    expect(existsSync(join(dir, '.cursor/mcp.json'))).toBe(true);
  });

  it('accepts --flag=value', () => {
    expect(parseArgs(['--dir=/x', '--url=https://a.dev/m'], AGENTS)).toMatchObject({
      dir: '/x',
      url: 'https://a.dev/m',
    });
  });

  it('--help and --version print and exit 0', async () => {
    expect(await run(['--help'])).toBe(0);
    expect(logs.join('\n')).toMatch(/Usage: npx @voltui\/mcp/);
    logs.length = 0;
    expect(await run(['--version'])).toBe(0);
    expect(logs).toEqual([pkg.version]);
  });
});

describe('package', () => {
  it('ships every file the installer requires', () => {
    expect(pkg.files).toEqual(
      expect.arrayContaining(['setup-mcp.js', 'installer.js', 'content.js'])
    );
  });
});
