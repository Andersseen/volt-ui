/**
 * Volt UI agent setup (@voltui/agent)
 *
 * Configures AI agents to use the Volt UI MCP server and writes the Volt UI context files
 * (skill, rules, snippets) into a project.
 *
 * Usage:
 *   npx @voltui/agent                      interactive
 *   npx @voltui/agent claude               one agent
 *   npx @voltui/agent cursor copilot       several agents
 *   npx @voltui/agent --all --yes          every agent, no prompts
 *   npx @voltui/agent claude --dry-run     show what would be written
 *   npx @voltui/agent claude --uninstall   remove what the installer wrote
 *
 * Run `npx @voltui/agent --help` for every flag.
 *
 * Re-running is safe: JSON configs are merged, files shared with the user (rules, instructions) get
 * a delimited block that is replaced in place, and files the installer owns are rewritten.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { DEFAULT_MCP_URL, buildContent } = require('./content');

const VERSION = require('./package.json').version;

const BLOCK_START =
  '<!-- volt-ui:begin (managed by @voltui/agent — edits inside are overwritten) -->';
const BLOCK_END = '<!-- volt-ui:end -->';

// A block lives inside a file the user also edits, so its markers must be a comment in that file's
// own syntax: HTML for Markdown rules files, `#` for TOML.
const MARKERS = {
  html: { start: BLOCK_START, end: BLOCK_END },
  hash: {
    start: '# volt-ui:begin (managed by @voltui/agent — edits inside are overwritten)',
    end: '# volt-ui:end',
  },
};
const markersOf = spec => MARKERS[spec.style ?? 'html'];

// ---------------------------------------------------------------------------
// Agent plans
//
// An agent is a list of files. `kind` decides how an existing file is treated:
//   json   merged into the existing JSON (the user's other keys survive)
//   block  a delimited block inside a file the user also edits (`style`: html | hash comment markers)
//   owned  a file that is entirely Volt's (rewritten each run, deleted on uninstall)
// ---------------------------------------------------------------------------

function buildAgents(mcpUrl) {
  const { CURSOR_RULES, COPILOT_INSTRUCTIONS, VOLT_UI_SKILL, VSCODE_SNIPPETS } =
    buildContent(mcpUrl);
  // Cursor / Windsurf accept a bare `url` entry; Claude Code's `.mcp.json` and VS Code's
  // `.vscode/mcp.json` use the `http` transport type.
  const urlEntry = { type: 'url', url: mcpUrl };
  const httpEntry = { type: 'http', url: mcpUrl };
  const snippets = {
    path: '.vscode/volt-snippets.code-snippets',
    kind: 'owned',
    content: JSON.stringify(VSCODE_SNIPPETS, null, 2) + '\n',
  };

  return {
    claude: {
      label: 'Claude Code',
      files: [
        {
          path: '.mcp.json',
          kind: 'json',
          content: { mcpServers: { 'volt-ui': httpEntry } },
          owns: ['mcpServers', 'volt-ui'],
        },
        { path: '.claude/skills/volt-ui/SKILL.md', kind: 'owned', content: VOLT_UI_SKILL },
      ],
      notes: [
        'Restart Claude Code for the MCP server and skill to load.',
        'Claude Desktop: remote MCP servers are added via Settings -> Connectors, not by editing claude_desktop_config.json.',
      ],
    },
    cursor: {
      label: 'Cursor',
      files: [
        {
          path: '.cursor/mcp.json',
          kind: 'json',
          content: { mcpServers: { 'volt-ui': urlEntry } },
          owns: ['mcpServers', 'volt-ui'],
        },
        { path: '.cursorrules', kind: 'block', content: CURSOR_RULES },
      ],
      notes: ['Restart Cursor for MCP changes to take effect.'],
    },
    windsurf: {
      label: 'Windsurf',
      files: [
        {
          path: '.codeium/windsurf/mcp_config.json',
          kind: 'json',
          content: { mcpServers: { 'volt-ui': urlEntry } },
          owns: ['mcpServers', 'volt-ui'],
        },
      ],
      notes: ['Restart Windsurf for MCP changes to take effect.'],
    },
    copilot: {
      label: 'GitHub Copilot (VS Code)',
      files: [
        {
          path: '.vscode/mcp.json',
          kind: 'json',
          content: { servers: { 'volt-ui': httpEntry } },
          owns: ['servers', 'volt-ui'],
        },
        { path: '.github/copilot-instructions.md', kind: 'block', content: COPILOT_INSTRUCTIONS },
        snippets,
      ],
      notes: [
        'Reload the VS Code window; start the volt-ui server from the MCP view if prompted.',
        'The instructions file gives Copilot Chat context even where MCP is unavailable.',
      ],
    },
    codex: {
      label: 'OpenAI Codex',
      files: [
        {
          path: '.codex/config.toml',
          kind: 'block',
          style: 'hash',
          content: `[mcp_servers.volt-ui]\nurl = "${mcpUrl}"`,
          unlessPresent: /^\s*\[mcp_servers\.(?:"volt-ui"|volt-ui)\]/m,
        },
        { path: '.agents/skills/volt-ui/SKILL.md', kind: 'owned', content: VOLT_UI_SKILL },
      ],
      notes: [
        'Codex reads .codex/config.toml only for projects you have marked as trusted.',
        'Restart Codex for the MCP server and skill to load.',
      ],
    },
    gemini: {
      label: 'Gemini CLI',
      files: [
        {
          path: '.gemini/settings.json',
          kind: 'json',
          content: { mcpServers: { 'volt-ui': { httpUrl: mcpUrl } } },
          owns: ['mcpServers', 'volt-ui'],
        },
        { path: 'GEMINI.md', kind: 'block', content: COPILOT_INSTRUCTIONS },
      ],
      notes: ['Restart Gemini CLI; `/mcp` lists the connected servers.'],
    },
    opencode: {
      label: 'OpenCode',
      files: [
        {
          path: 'opencode.json',
          kind: 'json',
          content: {
            $schema: 'https://opencode.ai/config.json',
            mcp: { 'volt-ui': { type: 'remote', url: mcpUrl, enabled: true } },
          },
          owns: ['mcp', 'volt-ui'],
        },
        { path: '.agents/skills/volt-ui/SKILL.md', kind: 'owned', content: VOLT_UI_SKILL },
      ],
      notes: ['Restart OpenCode for the MCP server and skill to load.'],
    },
    vscode: {
      label: 'VS Code (snippets)',
      files: [snippets],
      notes: [
        'Type "volt-button", "volt-card", etc. and press Tab to expand.',
        'Reload the VS Code window to activate snippets.',
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// File operations — each returns a short status string and honours `dryRun`
// ---------------------------------------------------------------------------

function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function write(file, text, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const current = out[key];
    out[key] =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current &&
      typeof current === 'object'
        ? deepMerge(current, value)
        : value;
  }
  return out;
}

function parseJsonStrict(file, text) {
  try {
    return JSON.parse(text);
  } catch {
    // A config the user wrote by hand (comments, trailing commas) must never be overwritten.
    throw new Error(
      `${file} is not valid JSON, so it was left untouched. Fix or remove it, then re-run.`
    );
  }
}

function wrapBlock(content, { start, end }) {
  return `${start}\n${content.trim()}\n${end}\n`;
}

function blockPattern({ start, end }) {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${esc(start)}[\\s\\S]*?${esc(end)}\\n?`);
}

function install(file, spec, dryRun) {
  const existing = readIfExists(file);

  if (spec.kind === 'json') {
    const merged =
      existing === null ? spec.content : deepMerge(parseJsonStrict(file, existing), spec.content);
    const next = JSON.stringify(merged, null, 2) + '\n';
    if (existing === next) return 'unchanged';
    write(file, next, dryRun);
    return existing === null ? 'created' : 'updated';
  }

  if (spec.kind === 'block') {
    const markers = markersOf(spec);
    const block = wrapBlock(spec.content, markers);
    let next;
    if (existing === null) next = block;
    else if (blockPattern(markers).test(existing)) {
      next = existing.replace(blockPattern(markers), () => block);
    } else if (spec.unlessPresent?.test(existing)) {
      // The user already configures this by hand; a second copy would be a duplicate TOML table.
      return 'kept';
    } else next = existing.replace(/\s*$/, '\n\n') + block;
    if (existing === next) return 'unchanged';
    write(file, next, dryRun);
    return existing === null ? 'created' : 'updated';
  }

  // owned
  if (existing === spec.content) return 'unchanged';
  write(file, spec.content, dryRun);
  return existing === null ? 'created' : 'updated';
}

function uninstall(file, spec, dryRun) {
  const existing = readIfExists(file);
  if (existing === null) return 'absent';

  if (spec.kind === 'json') {
    const json = parseJsonStrict(file, existing);
    const [group, key] = spec.owns;
    if (!json[group] || !(key in json[group])) return 'absent';
    delete json[group][key];
    if (!Object.keys(json[group]).length) delete json[group];
    if (!dryRun) {
      // A lone `$schema` is what this installer wrote into a file it created; nothing of the user's.
      const left = Object.keys(json).filter(k => k !== '$schema');
      if (left.length) write(file, JSON.stringify(json, null, 2) + '\n', false);
      else fs.rmSync(file);
    }
    return 'removed';
  }

  if (spec.kind === 'block') {
    const markers = markersOf(spec);
    if (!blockPattern(markers).test(existing)) return 'absent';
    const next = existing
      .replace(blockPattern(markers), '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (!dryRun) {
      if (next) write(file, next + '\n', false);
      else fs.rmSync(file);
    }
    return 'removed';
  }

  if (!dryRun) fs.rmSync(file);
  return 'removed';
}

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const HELP = `Volt UI agent setup (@voltui/agent ${VERSION})

Usage: npx @voltui/agent [agent...] [options]
       npx @voltui/agent doctor [agent...] [options]

Agents: claude, cursor, windsurf, copilot, codex, gemini, opencode, vscode
        With no agent and no --all, you are asked which to set up.

doctor  checks what is installed: files up to date, and the MCP endpoint answering.
        With no agent it checks every agent that has files in the project.

Options:
  --all             set up every agent
  --dir <path>      project directory (default: current directory)
  --url <url>       MCP endpoint to write (default: ${DEFAULT_MCP_URL})
  --dry-run         print what would change, write nothing
  --offline         doctor: skip the MCP endpoint check
  --uninstall       remove what this installer wrote (your other config is kept)
  -y, --yes         never prompt; with no agent given, set up every agent
  -v, --version     print the version
  -h, --help        print this help

Exit codes: 0 ok · 1 failed (doctor: a problem was found) · 2 bad usage`;

class UsageError extends Error {}

function parseArgs(argv, agentKeys) {
  const opts = {
    command: 'setup',
    offline: false,
    agents: [],
    all: false,
    dir: null,
    url: DEFAULT_MCP_URL,
    dryRun: false,
    uninstall: false,
    yes: false,
    help: false,
    version: false,
  };
  const value = (i, flag) => {
    if (i + 1 >= argv.length || argv[i + 1].startsWith('-')) {
      throw new UsageError(`${flag} needs a value.`);
    }
    return argv[i + 1];
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const eq = arg.startsWith('--') ? arg.indexOf('=') : -1;
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    const inline = eq === -1 ? null : arg.slice(eq + 1);
    const next = name => {
      if (inline !== null) return inline;
      const v = value(i, name);
      i++;
      return v;
    };

    if (flag === '--all') opts.all = true;
    else if (flag === '--dry-run') opts.dryRun = true;
    else if (flag === '--uninstall') opts.uninstall = true;
    else if (flag === '--offline') opts.offline = true;
    else if (flag === '-y' || flag === '--yes') opts.yes = true;
    else if (flag === '-h' || flag === '--help') opts.help = true;
    else if (flag === '-v' || flag === '--version') opts.version = true;
    else if (flag === '--dir') opts.dir = next('--dir');
    else if (flag === '--url') opts.url = next('--url');
    else if (arg.startsWith('-')) throw new UsageError(`Unknown option: ${arg}`);
    else if (arg === 'doctor' && opts.command === 'setup' && !opts.agents.length)
      opts.command = 'doctor';
    else if (agentKeys.includes(arg)) opts.agents.push(arg);
    else throw new UsageError(`Unknown agent: ${arg}. Available: ${agentKeys.join(', ')}.`);
  }

  if (opts.all && opts.agents.length) {
    throw new UsageError('Pass either agent names or --all, not both.');
  }
  try {
    const u = new URL(opts.url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
  } catch {
    throw new UsageError(`--url must be an http(s) URL, got: ${opts.url}`);
  }
  if (opts.command === 'doctor' && (opts.uninstall || opts.dryRun)) {
    throw new UsageError('doctor only reads; --uninstall and --dry-run do not apply to it.');
  }
  opts.agents = [...new Set(opts.agents)];
  return opts;
}

// ---------------------------------------------------------------------------
// Interactive prompts
// ---------------------------------------------------------------------------

const ask = (rl, question) => new Promise(resolve => rl.question(question, resolve));

async function promptAgents(rl, agents, out) {
  const keys = Object.keys(agents);
  out.log('\nAvailable agents:\n');
  keys.forEach((key, i) => out.log(`  ${i + 1}. ${agents[key].label}  (${key})`));
  out.log('  a. All of the above\n');

  const answer = (
    await ask(rl, `Select agent(s) [1-${keys.length}, comma-separated, or "a" for all]: `)
  )
    .trim()
    .toLowerCase();
  if (!answer || answer === 'a' || answer === 'all') return keys;

  const picked = answer.split(/[,\s]+/).map(token => {
    const n = parseInt(token, 10);
    if (n >= 1 && n <= keys.length) return keys[n - 1];
    if (agents[token]) return token;
    throw new UsageError(`Not an agent: "${token}".`);
  });
  return [...new Set(picked)];
}

// ---------------------------------------------------------------------------
// doctor
// ---------------------------------------------------------------------------

const FILE_STATE = {
  unchanged: 'ok',
  kept: 'ok (your own entry)',
  updated: 'outdated',
  created: 'missing',
};

/** Ask the endpoint for an MCP `initialize`, the way a real client does. */
async function pingEndpoint(url, fetchImpl) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: '@voltui/agent doctor', version: VERSION },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const server = json?.result?.serverInfo;
  if (!server) throw new Error(json?.error?.message ?? 'not an MCP initialize response');
  return `${server.name} ${server.version}`;
}

async function doctor({ agents, selected, projectDir, opts, out, fetchImpl }) {
  out.log(`Checking: ${projectDir}`);
  let problems = 0;

  const keys = selected.length
    ? selected
    : Object.keys(agents).filter(key =>
        agents[key].files.some(spec => fs.existsSync(path.join(projectDir, spec.path)))
      );
  if (!keys.length) {
    out.log('\nNo Volt UI agent files found here. Set one up with: npx @voltui/agent <agent>');
    return 1;
  }

  for (const key of keys) {
    out.log(`\n${agents[key].label}`);
    for (const spec of agents[key].files) {
      let state;
      try {
        state = FILE_STATE[install(path.join(projectDir, spec.path), spec, true)];
      } catch (err) {
        state = `invalid — ${err.message}`;
      }
      if (!state.startsWith('ok')) problems++;
      out.log(`  ${state.padEnd(10)} ${spec.path}`);
    }
  }

  if (!opts.offline) {
    out.log(`\nMCP endpoint: ${opts.url}`);
    try {
      out.log(`  ok         ${await pingEndpoint(opts.url, fetchImpl)}`);
    } catch (err) {
      problems++;
      out.log(`  failed     ${err.message}`);
    }
  }

  if (problems) {
    out.log(`\n${problems} problem(s). Re-run \`npx @voltui/agent <agent>\` to repair the files.`);
    return 1;
  }
  out.log('\nAll good.');
  return 0;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * @param {string[]} argv arguments after the program name
 * @param {{ cwd?: string, stdin?: NodeJS.ReadableStream, stdout?: NodeJS.WritableStream, isTTY?: boolean }} [env] injectable for tests
 * @returns {Promise<number>} the exit code
 */
async function run(argv, env = {}) {
  const cwd = env.cwd ?? process.cwd();
  const out = { log: msg => console.log(msg) };
  const isTTY = env.isTTY ?? Boolean(process.stdin.isTTY);

  try {
    const baseAgents = buildAgents(DEFAULT_MCP_URL);
    const opts = parseArgs(argv, Object.keys(baseAgents));

    if (opts.help || opts.version) {
      out.log(opts.help ? HELP : VERSION);
      return 0;
    }

    const agents = buildAgents(opts.url);
    let selected = opts.all ? Object.keys(agents) : opts.agents;
    let projectDir = opts.dir ? path.resolve(cwd, opts.dir) : cwd;

    if (opts.command === 'doctor') {
      if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
        throw new UsageError(`Project directory does not exist: ${projectDir}`);
      }
      return await doctor({
        agents,
        selected,
        projectDir,
        opts,
        out,
        fetchImpl: env.fetch ?? fetch,
      });
    }

    if (!selected.length) {
      if (opts.yes) selected = Object.keys(agents);
      else if (!isTTY) {
        throw new UsageError('No agent given and no terminal to ask on. Pass an agent or --all.');
      } else {
        const rl = readline.createInterface({
          input: env.stdin ?? process.stdin,
          output: env.stdout ?? process.stdout,
        });
        try {
          selected = await promptAgents(rl, agents, out);
          if (!opts.dir) {
            const dir = (await ask(rl, `\nProject directory [${projectDir}]: `)).trim();
            if (dir) projectDir = path.resolve(cwd, dir);
          }
        } finally {
          rl.close();
        }
      }
    }

    if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
      throw new UsageError(`Project directory does not exist: ${projectDir}`);
    }

    const verb = opts.uninstall ? 'Removing from' : 'Setting up';
    out.log(`${verb}: ${projectDir}${opts.dryRun ? '  (dry run — nothing is written)' : ''}`);
    if (!opts.uninstall) out.log(`MCP endpoint: ${opts.url}`);

    for (const key of selected) {
      const agent = agents[key];
      out.log(`\n${agent.label}`);
      for (const spec of agent.files) {
        const file = path.join(projectDir, spec.path);
        const status = opts.uninstall
          ? uninstall(file, spec, opts.dryRun)
          : install(file, spec, opts.dryRun);
        out.log(`  ${status.padEnd(9)} ${spec.path}`);
      }
      if (!opts.uninstall) agent.notes.forEach(note => out.log(`  → ${note}`));
    }

    if (!opts.uninstall && !opts.dryRun) {
      out.log('\nDone. Next steps:');
      out.log('  npx @voltui/cli init        scaffold the ui/ folder');
      out.log('  npx @voltui/cli add button  add a component');
      out.log('  npx @voltui/cli list        list every component');
    }
    return 0;
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`Error: ${err.message}\n\nRun with --help for usage.`);
      return 2;
    }
    console.error(`Error: ${err.message}`);
    return 1;
  }
}

module.exports = { run, buildAgents, parseArgs, BLOCK_START, BLOCK_END };
