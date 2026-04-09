import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconSparkles, IconCheck, IconExternalLink, IconTabs } from '../../../icons';

const MCP_URL = 'https://volt-ui.pages.dev/api/mcp';

@Component({
  selector: 'app-mcp-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconSparkles, IconCheck, IconExternalLink, IconTabs],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">AI Integration (MCP)</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Connect any AI assistant to a hosted MCP server that knows every Volt UI component,
          variant, theme, and CLI command — no local setup required.
        </p>
      </div>

      <!-- What is MCP -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <div class="flex items-start gap-3">
          <icon-sparkles class="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 class="font-semibold">How it works</h3>
            <p class="text-sm text-muted-foreground mt-1">
              The Volt UI MCP server runs on Cloudflare Pages at
              <code class="bg-muted px-1 rounded">{{ mcpUrl }}</code
              >. Point your AI agent at that URL — it exposes tools to list components, get usage
              examples, query the theme system, and generate CLI commands.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Setup -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Quick Setup
        </h2>
        <p class="text-muted-foreground">
          Run the interactive installer from your project directory:
        </p>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <code>npx volt-ui-mcp</code>
        </div>
        <p class="text-sm text-muted-foreground">
          It asks which agent(s) to set up, then writes the right config files automatically. You
          can also pass the agent directly:
        </p>
        <div
          class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto space-y-1"
        >
          <div>
            <code><span class="text-zinc-500"># one agent</span></code>
          </div>
          <div><code>npx volt-ui-mcp claude</code></div>
          <div><code>npx volt-ui-mcp cursor</code></div>
          <div>
            <code><span class="text-zinc-500"># multiple</span></code>
          </div>
          <div><code>npx volt-ui-mcp cursor copilot</code></div>
        </div>
      </div>

      <!-- Supported Agents -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Supported Agents
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Claude -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <icon-sparkles class="w-5 h-5 text-orange-500" />
              <h3 class="font-semibold">Claude</h3>
              <span
                class="ml-auto text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium"
                >MCP native</span
              >
            </div>
            <p class="text-sm text-muted-foreground">
              Claude Desktop and Claude Code — full tool access via the hosted MCP server.
            </p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp claude</code>
            </div>
            <p class="text-xs text-muted-foreground">
              Writes <code class="bg-muted px-1 rounded">.claude/mcp.json</code> and patches the
              Claude Desktop global config if found.
            </p>
          </div>

          <!-- Cursor -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <icon-tabs class="w-5 h-5 text-blue-500" />
              <h3 class="font-semibold">Cursor</h3>
              <span
                class="ml-auto text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium"
                >MCP native</span
              >
            </div>
            <p class="text-sm text-muted-foreground">
              Full MCP support plus a <code class="bg-muted px-1 rounded">.cursorrules</code> file
              with component context for inline suggestions.
            </p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp cursor</code>
            </div>
            <p class="text-xs text-muted-foreground">
              Writes <code class="bg-muted px-1 rounded">.cursor/mcp.json</code> and
              <code class="bg-muted px-1 rounded">.cursorrules</code>.
            </p>
          </div>

          <!-- Windsurf -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <icon-sparkles class="w-5 h-5 text-cyan-500" />
              <h3 class="font-semibold">Windsurf</h3>
              <span
                class="ml-auto text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium"
                >MCP native</span
              >
            </div>
            <p class="text-sm text-muted-foreground">
              Codeium's Windsurf editor with native MCP support.
            </p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp windsurf</code>
            </div>
            <p class="text-xs text-muted-foreground">
              Writes <code class="bg-muted px-1 rounded">.codeium/windsurf/mcp_config.json</code>.
            </p>
          </div>

          <!-- Copilot -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <icon-sparkles class="w-5 h-5 text-purple-500" />
              <h3 class="font-semibold">GitHub Copilot</h3>
              <span
                class="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium"
                >instructions</span
              >
            </div>
            <p class="text-sm text-muted-foreground">
              Copilot doesn't support MCP HTTP yet — the installer writes a Copilot instructions
              file and VS Code snippets instead.
            </p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp copilot</code>
            </div>
            <p class="text-xs text-muted-foreground">
              Writes <code class="bg-muted px-1 rounded">.github/copilot-instructions.md</code> and
              <code class="bg-muted px-1 rounded">.vscode/volt-snippets.code-snippets</code>.
            </p>
          </div>
        </div>
      </div>

      <!-- Manual config -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Manual Configuration
        </h2>
        <p class="text-muted-foreground text-sm">
          For MCP-native agents, add this entry to your config file:
        </p>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <pre>{{ manualConfig }}</pre>
        </div>
        <p class="text-sm text-muted-foreground">Config file locations:</p>
        <ul class="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
          <li>
            <strong>Claude Desktop</strong> —
            <code class="bg-muted px-1 rounded"
              >~/Library/Application Support/Claude/claude_desktop_config.json</code
            >
          </li>
          <li>
            <strong>Claude Code</strong> —
            <code class="bg-muted px-1 rounded">.claude/mcp.json</code> in your project
          </li>
          <li>
            <strong>Cursor</strong> — <code class="bg-muted px-1 rounded">.cursor/mcp.json</code> in
            your project
          </li>
          <li>
            <strong>Windsurf</strong> —
            <code class="bg-muted px-1 rounded">.codeium/windsurf/mcp_config.json</code> in your
            project
          </li>
        </ul>
      </div>

      <!-- What AI Understands -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          What AI understands
        </h2>
        <ul class="space-y-2 text-muted-foreground">
          <li class="flex items-start gap-2">
            <icon-check class="w-[18px] h-[18px] text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>17 components</strong> — button, card, input, tabs, accordion, select, and
              more
            </span>
          </li>
          <li class="flex items-start gap-2">
            <icon-check class="w-[18px] h-[18px] text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>Correct selectors</strong> —
              <code class="bg-muted px-1 rounded">ui-button</code>,
              <code class="bg-muted px-1 rounded">ui-card</code>,
              <code class="bg-muted px-1 rounded">ui-form-field</code> and all sub-components
            </span>
          </li>
          <li class="flex items-start gap-2">
            <icon-check class="w-[18px] h-[18px] text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>Variants &amp; inputs</strong> — solid, outline, ghost, destructive + sizes
            </span>
          </li>
          <li class="flex items-start gap-2">
            <icon-check class="w-[18px] h-[18px] text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>Theme system</strong> — 5 colors × 5 styles,
              <code class="bg-muted px-1 rounded">provideVoltTheme</code> and
              <code class="bg-muted px-1 rounded">applyVoltTheme</code>
            </span>
          </li>
          <li class="flex items-start gap-2">
            <icon-check class="w-[18px] h-[18px] text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>CLI commands</strong> —
              <code class="bg-muted px-1 rounded">npx volt add</code>,
              <code class="bg-muted px-1 rounded">npx volt init</code>,
              <code class="bg-muted px-1 rounded">npx volt list</code>
            </span>
          </li>
          <li class="flex items-start gap-2">
            <icon-check class="w-[18px] h-[18px] text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>Angular patterns</strong> — standalone components, zoneless signals, OnPush,
              CVA variants, ng-primitives host directives
            </span>
          </li>
        </ul>
      </div>

      <!-- Example Prompts -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Example prompts
        </h2>
        <p class="text-muted-foreground">After setup, try asking your AI assistant:</p>
        <div class="space-y-2">
          @for (prompt of examplePrompts; track prompt) {
            <div class="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              "{{ prompt }}"
            </div>
          }
        </div>
      </div>

      <!-- API reference -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          API reference
        </h2>
        <div class="grid gap-3">
          <a
            [href]="mcpUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 class="font-semibold">MCP Server</h3>
              <p class="text-sm text-muted-foreground">
                <code class="bg-muted px-1 rounded">GET {{ mcpUrl }}</code> — server info &amp; tool
                list
              </p>
            </div>
            <icon-external-link class="w-5 h-5 text-muted-foreground shrink-0" />
          </a>

          <a
            [href]="setupUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 class="font-semibold">Setup configs</h3>
              <p class="text-sm text-muted-foreground">
                <code class="bg-muted px-1 rounded">GET {{ setupUrl }}?agent=claude</code> — exact
                files to write per agent
              </p>
            </div>
            <icon-external-link class="w-5 h-5 text-muted-foreground shrink-0" />
          </a>
        </div>
      </div>
    </div>
  `,
})
export default class McpDocsPage {
  readonly mcpUrl = MCP_URL;
  readonly setupUrl = `${MCP_URL}/setup`;

  readonly manualConfig = JSON.stringify(
    { mcpServers: { 'volt-ui': { type: 'url', url: MCP_URL } } },
    null,
    2
  );

  readonly examplePrompts = [
    'Create a login form with Volt UI card, form-field, input, and button',
    'Add a settings page with Volt UI tabs for Account and Security sections',
    'Build a navigation header using Volt UI navigation-menu with dropdown items',
    'Create a data table with Volt UI badge for status and avatar for user column',
    'Apply the ember color with brutal style to this app using provideVoltTheme',
  ];
}
