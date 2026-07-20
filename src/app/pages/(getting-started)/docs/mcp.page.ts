import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const MCP_URL = 'https://volt-ui.pages.dev/api/mcp';

@Component({
  selector: 'app-mcp-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">AI Integration</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Volt UI gives AI assistants three ways to understand and use the component library
          correctly: a local skill, a hosted MCP server, and a prompt reference.
        </p>
      </div>

      <!-- Three options -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Choose your integration
        </h2>

        <div class="grid gap-4">
          <a
            routerLink="/docs/ai-skill"
            class="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span class="font-bold">1</span>
            </div>
            <div>
              <h3 class="font-semibold group-hover:text-primary">Local Skill</h3>
              <p class="text-sm text-muted-foreground mt-1">
                Best for OpenCode / Claude Code users. The skill file is auto-discovered in your
                workspace and teaches the agent Volt UI conventions, selectors, and the component
                catalog.
              </p>
              <p class="text-sm text-primary mt-2">Learn more →</p>
            </div>
          </a>

          <a
            routerLink="/docs/ai-mcp"
            class="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span class="font-bold">2</span>
            </div>
            <div>
              <h3 class="font-semibold group-hover:text-primary">MCP Server</h3>
              <p class="text-sm text-muted-foreground mt-1">
                Best for Claude, Cursor, Windsurf, and any MCP-native agent. The hosted server at
                <code class="bg-muted px-1 rounded">{{ mcpUrl }}</code>
                exposes tools to query components, examples, themes, and CLI commands on demand.
              </p>
              <p class="text-sm text-primary mt-2">Learn more →</p>
            </div>
          </a>

          <a
            routerLink="/docs/ai-prompt"
            class="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span class="font-bold">3</span>
            </div>
            <div>
              <h3 class="font-semibold group-hover:text-primary">Prompt Reference</h3>
              <p class="text-sm text-muted-foreground mt-1">
                Best for web-based LLM chats or agents without MCP/skill support. Paste the contents
                of <code class="bg-muted px-1 rounded">VOLT_UI_PROMPT.md</code> into any chat for a
                complete usage guide.
              </p>
              <p class="text-sm text-primary mt-2">Learn more →</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Quick start -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Quick start (MCP)
        </h2>
        <p class="text-muted-foreground">
          If you want the fastest path with Claude, Cursor, or Windsurf:
        </p>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <code>npx volt-ui-mcp</code>
        </div>
        <p class="text-sm text-muted-foreground">
          The installer writes the right config files for your agent and adds Cursor rules / Copilot
          instructions where applicable.
        </p>
      </div>

      <!-- When to use what -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          When to use what
        </h2>
        <div class="p-4 rounded-lg border border-border bg-muted/30">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted-foreground border-b border-border">
                <th class="pb-2 font-medium">Situation</th>
                <th class="pb-2 font-medium">Recommended tool</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-border/50">
                <td class="py-2">You use Claude Code or OpenCode</td>
                <td class="py-2">
                  <a routerLink="/docs/ai-skill" class="text-primary hover:underline"
                    >Local Skill</a
                  >
                </td>
              </tr>
              <tr class="border-b border-border/50">
                <td class="py-2">You use Claude Desktop, Cursor, or Windsurf</td>
                <td class="py-2">
                  <a routerLink="/docs/ai-mcp" class="text-primary hover:underline">MCP Server</a>
                </td>
              </tr>
              <tr class="border-b border-border/50">
                <td class="py-2">You use GitHub Copilot in VS Code</td>
                <td class="py-2">
                  <a routerLink="/docs/ai-mcp" class="text-primary hover:underline">MCP Server</a>
                  (instructions + snippets)
                </td>
              </tr>
              <tr>
                <td class="py-2">You use a web chat (ChatGPT, Gemini, etc.)</td>
                <td class="py-2">
                  <a routerLink="/docs/ai-prompt" class="text-primary hover:underline"
                    >Prompt Reference</a
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export default class McpDocsPage {
  readonly mcpUrl = MCP_URL;
}
