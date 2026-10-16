/**
 * GET /api/mcp/setup
 * GET /api/mcp/setup?agent=claude|cursor|copilot|vscode
 *
 * Returns per-agent setup configuration so the CLI (or a user)
 * can grab the exact files/content to install without needing
 * the local volt-ui repo.
 */

import { defineEventHandler, getQuery, setHeaders, createError, sendError } from 'h3';

import {
  MCP_URL,
  CURSOR_RULES,
  COPILOT_INSTRUCTIONS,
  VOLT_UI_SKILL,
  VSCODE_SNIPPETS,
} from './content.generated';

interface FileSpec {
  path: string;
  description: string;
  content: string | Record<string, unknown>;
  format: 'json' | 'text';
}

interface AgentSetup {
  label: string;
  description: string;
  mcpNative: boolean;
  files: FileSpec[];
  notes?: string[];
}

// Cursor / Windsurf accept a bare `url` entry.
const MCP_ENTRY = { type: 'url', url: MCP_URL };
// Claude Code's project-level `.mcp.json` uses the `http` transport type.
const MCP_ENTRY_CLAUDE = { type: 'http', url: MCP_URL };
// VS Code's `.vscode/mcp.json` (Copilot Chat) uses `http` under a `servers` key.
const MCP_ENTRY_VSCODE = { type: 'http', url: MCP_URL };

const agentSetups: Record<string, AgentSetup> = {
  claude: {
    label: 'Claude Code',
    description:
      'Connects Claude Code to the Volt UI MCP server and installs the Volt UI skill so it can query components, examples, and theme info.',
    mcpNative: true,
    files: [
      {
        path: '.mcp.json',
        description:
          'Claude Code project-level MCP config, read from the repo root (merge into existing file if it exists)',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY_CLAUDE } },
        format: 'json',
      },
      {
        path: '.claude/skills/volt-ui/SKILL.md',
        description: 'Volt UI skill, auto-discovered by Claude Code from .claude/skills/<name>/',
        content: VOLT_UI_SKILL,
        format: 'text',
      },
    ],
    notes: [
      'Restart Claude Code for the MCP server and skill to load.',
      'Claude Desktop: remote MCP servers are added via Settings -> Connectors, not by editing claude_desktop_config.json.',
    ],
  },

  cursor: {
    label: 'Cursor',
    description:
      'Connects Cursor to the Volt UI MCP server and adds cursor rules with component context.',
    mcpNative: true,
    files: [
      {
        path: '.cursor/mcp.json',
        description: 'Cursor MCP config',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY } },
        format: 'json',
      },
      {
        path: '.cursorrules',
        description: 'Cursor rules with Volt UI component context',
        content: CURSOR_RULES,
        format: 'text',
      },
    ],
    notes: ['Restart Cursor after adding the config.'],
  },

  windsurf: {
    label: 'Windsurf',
    description: 'Connects Windsurf to the Volt UI MCP server.',
    mcpNative: true,
    files: [
      {
        path: '.codeium/windsurf/mcp_config.json',
        description: 'Windsurf MCP config',
        content: { mcpServers: { 'volt-ui': MCP_ENTRY } },
        format: 'json',
      },
    ],
    notes: ['Restart Windsurf after adding the config.'],
  },

  copilot: {
    label: 'GitHub Copilot (VS Code)',
    description: 'Adds Copilot instructions and VS Code snippets for Volt UI.',
    mcpNative: true,
    files: [
      {
        path: '.vscode/mcp.json',
        description:
          'VS Code MCP config read by Copilot Chat (merge into existing file if it exists)',
        content: { servers: { 'volt-ui': MCP_ENTRY_VSCODE } },
        format: 'json',
      },
      {
        path: '.github/copilot-instructions.md',
        description: 'Copilot instructions with Volt UI context',
        content: COPILOT_INSTRUCTIONS,
        format: 'text',
      },
      {
        path: '.vscode/volt-snippets.code-snippets',
        description: 'VS Code snippets for Volt UI components',
        content: VSCODE_SNIPPETS,
        format: 'json',
      },
    ],
    notes: [
      'Reload the VS Code window; start the volt-ui server from the MCP view if prompted.',
      'The instructions file gives Copilot Chat context even where MCP is unavailable.',
    ],
  },

  vscode: {
    label: 'VS Code (snippets only)',
    description: 'Adds VS Code snippets for fast Volt UI template expansion.',
    mcpNative: false,
    files: [
      {
        path: '.vscode/volt-snippets.code-snippets',
        description: 'VS Code snippets for Volt UI components',
        content: VSCODE_SNIPPETS,
        format: 'json',
      },
    ],
    notes: [
      'Reload VS Code window after adding snippets.',
      'Type "volt-button", "volt-card", etc. and press Tab.',
    ],
  },
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default defineEventHandler(async event => {
  setHeaders(event, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  const { agent } = getQuery(event) as { agent?: string };

  if (!agent) {
    return {
      description: 'Volt UI MCP setup configurations per agent',
      mcpUrl: MCP_URL,
      agents: Object.entries(agentSetups).map(([key, setup]) => ({
        key,
        label: setup.label,
        description: setup.description,
        mcpNative: setup.mcpNative,
        setupUrl: `${MCP_URL}/setup?agent=${key}`,
      })),
      cli: 'npx @voltui/mcp',
    };
  }

  const setup = agentSetups[agent];

  if (!setup) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        message: `Agent "${agent}" not supported. Available: ${Object.keys(agentSetups).join(', ')}`,
      })
    );
  }

  return { agent, ...setup };
});
