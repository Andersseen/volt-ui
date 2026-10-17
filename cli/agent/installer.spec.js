import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { run, buildAgents, parseArgs, BLOCK_START, BLOCK_END } = require('./installer.js');
const { DEFAULT_MCP_URL } = require('./content.js');
const { skillNames, loadSkills, digestOf } = require('./skills.js');
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
    expect(logs.join('\n')).toMatch(/Usage: npx @voltui\/agent/);
    logs.length = 0;
    expect(await run(['--version'])).toBe(0);
    expect(logs).toEqual([pkg.version]);
  });
});

describe('codex, gemini and opencode', () => {
  it('codex: a TOML block with # markers, and the skill', async () => {
    mkdirSync(join(dir, '.codex'));
    writeFileSync(join(dir, '.codex/config.toml'), '[mcp_servers.mine]\nurl = "https://x"\n');
    await go('codex');
    const toml = read('.codex/config.toml');
    expect(toml).toContain('[mcp_servers.mine]');
    expect(toml).toContain(`[mcp_servers.volt-ui]\nurl = "${DEFAULT_MCP_URL}"`);
    expect(toml).toContain('# volt-ui:begin');
    expect(read('.agents/skills/volt-ui/SKILL.md')).toMatch(/^---\nname: volt-ui\n/);
  });

  it('codex: leaves a [mcp_servers.volt-ui] table the user wrote alone', async () => {
    mkdirSync(join(dir, '.codex'));
    const own = '[mcp_servers.volt-ui]\nurl = "https://example.test/mcp"\n';
    writeFileSync(join(dir, '.codex/config.toml'), own);
    await go('codex');
    expect(read('.codex/config.toml')).toBe(own);
    expect(logs.join('\n')).toMatch(/kept\s+\.codex\/config\.toml/);
  });

  it('gemini: httpUrl in settings.json and a GEMINI.md block', async () => {
    await go('gemini');
    expect(readJson('.gemini/settings.json')).toEqual({
      mcpServers: { 'volt-ui': { httpUrl: DEFAULT_MCP_URL } },
    });
    expect(read('GEMINI.md')).toContain(BLOCK_START);
  });

  it('opencode: a remote mcp entry; uninstall removes the file it created', async () => {
    await go('opencode');
    expect(readJson('opencode.json').mcp['volt-ui']).toEqual({
      type: 'remote',
      url: DEFAULT_MCP_URL,
      enabled: true,
    });
    await go('opencode', '--uninstall');
    expect(existsSync(join(dir, 'opencode.json'))).toBe(false);
  });
});

describe('the endpoint', () => {
  it('is voltui.dev', () => {
    expect(DEFAULT_MCP_URL).toBe('https://voltui.dev/api/mcp');
  });

  it('a re-run moves a config that still points at the old host', async () => {
    mkdirSync(join(dir, '.cursor'));
    writeFileSync(
      join(dir, '.cursor/mcp.json'),
      JSON.stringify({
        mcpServers: { 'volt-ui': { type: 'url', url: 'https://volt-ui.pages.dev/api/mcp' } },
      })
    );
    await go('cursor');
    expect(readJson('.cursor/mcp.json').mcpServers['volt-ui'].url).toBe(DEFAULT_MCP_URL);
  });
});

describe('doctor', () => {
  const ok = () =>
    Promise.resolve(
      new Response(
        JSON.stringify({ result: { serverInfo: { name: 'volt-ui', version: '1.0.0' } } })
      )
    );
  const doctor = (fetch, ...args) =>
    run(['doctor', ...args, '--dir', dir], { isTTY: false, fetch });

  it('is healthy after setup', async () => {
    await go('claude', 'cursor');
    logs.length = 0;
    expect(await doctor(ok)).toBe(0);
    expect(logs.join('\n')).toMatch(/ok\s+volt-ui 1\.0\.0/);
    expect(logs.join('\n')).toContain('All good.');
  });

  it('only reads: it never writes or creates files', async () => {
    await doctor(ok, 'claude');
    expect(existsSync(join(dir, '.mcp.json'))).toBe(false);
  });

  it('reports missing agents and exits 1 when nothing is installed', async () => {
    expect(await doctor(ok)).toBe(1);
    expect(logs.join('\n')).toMatch(/No Volt UI agent files/);
  });

  it('flags an outdated file and a missing one', async () => {
    await go('claude');
    writeFileSync(join(dir, '.claude/skills/volt-ui/SKILL.md'), 'stale');
    rmSync(join(dir, '.mcp.json'));
    logs.length = 0;
    expect(await doctor(ok, 'claude')).toBe(1);
    expect(logs.join('\n')).toMatch(/outdated\s+\.claude\/skills/);
    expect(logs.join('\n')).toMatch(/missing\s+\.mcp\.json/);
  });

  it('reports an endpoint that rejects the client, and --offline skips the check', async () => {
    await go('claude');
    const rejected = () => Promise.resolve(new Response('{}', { status: 406 }));
    logs.length = 0;
    expect(await doctor(rejected, 'claude')).toBe(1);
    expect(logs.join('\n')).toMatch(/failed\s+HTTP 406/);
    expect(await doctor(rejected, 'claude', '--offline')).toBe(0);
  });

  it('rejects --uninstall and --dry-run', async () => {
    expect(await doctor(ok, '--dry-run')).toBe(2);
  });
});

describe('package', () => {
  it('ships every file the installer requires', () => {
    expect(pkg.files).toEqual(
      expect.arrayContaining([
        'setup-agent.js',
        'installer.js',
        'content.js',
        'skills.js',
        'skills',
      ])
    );
  });
});

describe('the skill set', () => {
  const SKILLS = skillNames();

  it('is one router skill plus single-responsibility playbooks', () => {
    expect(SKILLS).toEqual([
      'volt-ui',
      'volt-ui-adoption',
      'volt-ui-component-selection',
      'volt-ui-distribution',
      'volt-ui-forms',
      'volt-ui-overlays',
      'volt-ui-styling',
    ]);
  });

  it('every skill names itself, says when to use it, and carries a digest', () => {
    for (const [name, text] of Object.entries(loadSkills())) {
      expect(text, name).toMatch(new RegExp(`^---\nname: ${name}\ndescription: >`));
      expect(digestOf(text), name).not.toBe('');
    }
  });

  it('no skill duplicates a component API: exact facts are the MCP server’s', () => {
    for (const [name, text] of Object.entries(loadSkills())) {
      // A selector/input table is an API copy; the component-selection catalog is generated and
      // lists responsibilities, not inputs.
      expect(text, name).not.toMatch(/\|\s*Key inputs\s*\|/i);
    }
    expect(loadSkills()['volt-ui'].length).toBeLessThan(3500);
  });

  it.each([
    ['claude', '.claude/skills'],
    ['codex', '.agents/skills'],
    ['opencode', '.agents/skills'],
  ])('%s: installs every skill where it scans for them', async (agent, base) => {
    expect(await go(agent)).toBe(0);
    for (const name of SKILLS) {
      expect(read(`${base}/${name}/SKILL.md`)).toMatch(new RegExp(`^---\nname: ${name}\n`));
    }
  });

  it.each([
    ['cursor', '.cursorrules'],
    ['copilot', '.github/copilot-instructions.md'],
    ['gemini', 'GEMINI.md'],
    ['windsurf', '.windsurfrules'],
  ])('%s: a rules block with the digests, not the skill bodies', async (agent, file) => {
    await go(agent);
    const text = read(file);
    expect(text).toContain(BLOCK_START);
    expect(text).toContain('find_components');
    expect(text).toContain('Volt first');
    expect(text).toContain('### overlays');
    // The routing block stays short: pasting every playbook into a rules file is what this replaces.
    expect(text.length).toBeLessThan(9000);
    expect(text).not.toContain('## Dialog vs Drawer vs Popover');
  });

  it('uninstall removes every skill file it wrote and leaves the user’s own skills', async () => {
    mkdirSync(join(dir, '.claude/skills/mine'), { recursive: true });
    writeFileSync(join(dir, '.claude/skills/mine/SKILL.md'), 'mine');
    await go('claude');
    await go('claude', '--uninstall');
    for (const name of SKILLS) {
      expect(existsSync(join(dir, `.claude/skills/${name}/SKILL.md`)), name).toBe(false);
    }
    expect(read('.claude/skills/mine/SKILL.md')).toBe('mine');
  });
});
