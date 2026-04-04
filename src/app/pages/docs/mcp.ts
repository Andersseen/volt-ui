import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mcp-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 max-w-3xl">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">AI Integration (MCP)</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Supercharge your development with AI assistants that understand Volt UI components.
        </p>
      </div>

      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <div class="flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-primary mt-0.5"
          >
            <path d="M12 2v4" />
            <path d="m5 5 2.8 2.8" />
            <path d="m19 5-2.8 2.8" />
            <path d="M12 12v8" />
            <path d="m5 19 2.8-2.8" />
            <path d="m19 19-2.8-2.8" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <div>
            <h3 class="font-semibold">What is MCP?</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Model Context Protocol (MCP) provides AI assistants with complete context about Volt
              UI components, including usage patterns, variants, themes, and CLI commands.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Supported Editors
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg border border-border p-4 space-y-2">
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-500"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
              <h3 class="font-semibold">Cursor</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Full MCP support with .cursorrules and dedicated MCP server.
            </p>
            <code class="text-xs bg-muted px-2 py-1 rounded block">
              node mcp/scripts/install-mcp.js -e cursor
            </code>
          </div>

          <div class="rounded-lg border border-border p-4 space-y-2">
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-orange-500"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              </svg>
              <h3 class="font-semibold">Claude</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Claude Desktop & Code with MCP tools and prompts.
            </p>
            <code class="text-xs bg-muted px-2 py-1 rounded block">
              node mcp/scripts/install-mcp.js -e claude
            </code>
          </div>

          <div class="rounded-lg border border-border p-4 space-y-2">
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-purple-500"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8 12v4" />
                <path d="M16 12v4" />
                <path d="M12 16v4" />
              </svg>
              <h3 class="font-semibold">GitHub Copilot</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Instructions and snippets for VS Code Copilot.
            </p>
            <code class="text-xs bg-muted px-2 py-1 rounded block">
              node mcp/scripts/install-mcp.js -e copilot
            </code>
          </div>

          <div class="rounded-lg border border-border p-4 space-y-2">
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-400"
              >
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
              <h3 class="font-semibold">VS Code</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Settings and code snippets for IntelliSense.
            </p>
            <code class="text-xs bg-muted px-2 py-1 rounded block">
              node mcp/scripts/install-mcp.js -e vscode
            </code>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Quick Setup
        </h2>
        <div class="space-y-3">
          <p class="text-muted-foreground">
            Install MCP in your Angular project to get AI assistance for Volt UI:
          </p>
          <div
            class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
          >
            <code>node /path/to/volt-ui/mcp/scripts/install-mcp.js</code>
          </div>
          <p class="text-sm text-muted-foreground">Or use the shell script:</p>
          <div
            class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
          >
            <code>/path/to/volt-ui/mcp/scripts/setup-mcp.sh</code>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          What AI Understands
        </h2>
        <ul class="space-y-2 text-muted-foreground">
          <li class="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-green-500 mt-0.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              <strong>17 Components</strong> — button, card, input, tabs, select, and more
            </span>
          </li>
          <li class="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-green-500 mt-0.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              <strong>Selectors</strong> — Use <code class="bg-muted px-1 rounded">ui-button</code>,
              <code class="bg-muted px-1 rounded">ui-card</code> with correct prefixes
            </span>
          </li>
          <li class="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-green-500 mt-0.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              <strong>Variants</strong> — solid, outline, ghost, destructive, and custom sizes
            </span>
          </li>
          <li class="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-green-500 mt-0.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span> <strong>Themes</strong> — 5 colors × 5 styles = 25 theme combinations </span>
          </li>
          <li class="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-green-500 mt-0.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              <strong>CLI Commands</strong> — <code class="bg-muted px-1 rounded">volt add</code>,
              <code class="bg-muted px-1 rounded">volt init</code>,
              <code class="bg-muted px-1 rounded">volt list</code>
            </span>
          </li>
        </ul>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Example Prompts
        </h2>
        <div class="space-y-3">
          <p class="text-muted-foreground">
            After MCP installation, try these prompts with your AI assistant:
          </p>
          <div class="space-y-2">
            <div class="rounded-lg border border-border p-3 text-sm">
              <span class="text-muted-foreground"
                >"Create a login form with Volt UI card, form-field, input, and button
                components"</span
              >
            </div>
            <div class="rounded-lg border border-border p-3 text-sm">
              <span class="text-muted-foreground"
                >"Add a settings page with Volt UI tabs for Account and Security sections"</span
              >
            </div>
            <div class="rounded-lg border border-border p-3 text-sm">
              <span class="text-muted-foreground"
                >"Build a navigation header with Volt UI navigation-menu"</span
              >
            </div>
            <div class="rounded-lg border border-border p-3 text-sm">
              <span class="text-muted-foreground"
                >"Create a data table with Volt UI badge for status and avatar for users"</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Documentation
        </h2>
        <div class="grid gap-3">
          <a
            href="https://github.com/your-org/volt-ui/blob/main/mcp/README.md"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 class="font-semibold">MCP README</h3>
              <p class="text-sm text-muted-foreground">
                Complete documentation for MCP setup and usage
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-muted-foreground"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </a>

          <a
            href="https://github.com/your-org/volt-ui/blob/main/mcp/QUICKSTART.md"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 class="font-semibold">Quick Start Guide</h3>
              <p class="text-sm text-muted-foreground">Get started in under 2 minutes</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-muted-foreground"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </a>

          <a
            href="https://github.com/your-org/volt-ui/blob/main/mcp/INTEGRATION.md"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 class="font-semibold">Integration Guide</h3>
              <p class="text-sm text-muted-foreground">Editor-specific integration instructions</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-muted-foreground"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class McpDocsPage {}
