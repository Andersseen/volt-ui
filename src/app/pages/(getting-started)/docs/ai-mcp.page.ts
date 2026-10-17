import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnCheckIcon, LmnExternalLinkIcon, LmnListIcon, LmnSparklesIcon } from 'lumen-icons';
import { SITE_STATS } from '../../../lib/generated/site-stats';
import { Prose } from '../../../components/prose';
import { injectAppI18n, type PlainTranslationKey } from '../../../i18n/i18n';

const MCP_URL = 'https://voltui.dev/api/mcp';

interface AgentCard {
  readonly id: string;
  readonly iconClass: string;
  readonly native: boolean;
  readonly name: PlainTranslationKey;
  readonly badge: PlainTranslationKey;
  readonly body: PlainTranslationKey;
  readonly writes: PlainTranslationKey;
}

@Component({
  selector: 'app-ai-mcp-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, LmnSparklesIcon, LmnCheckIcon, LmnExternalLinkIcon, LmnListIcon],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.aiMcpPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">{{ t('guide.aiMcpPage.lede') }}</p>
      </div>

      <!-- What is MCP -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <div class="flex items-start gap-3">
          <lmn-sparkles [size]="20" class="text-primary mt-0.5 shrink-0" />
          <div>
            <h3 class="font-semibold">{{ t('guide.aiMcpPage.whatTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">
              <app-prose
                [text]="t('guide.aiMcpPage.whatBody', { url: mcpUrl })"
                codeClass="bg-muted px-1 rounded"
              />
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Setup -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiMcpPage.setupTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.aiMcpPage.setupLede') }}</p>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <code>npx @voltui/agent</code>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('guide.aiMcpPage.setupNote') }}</p>
        <div
          class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto space-y-1"
        >
          <div>
            <code><span class="text-zinc-500"># one agent</span></code>
          </div>
          <div><code>npx @voltui/agent claude</code></div>
          <div><code>npx @voltui/agent cursor</code></div>
          <div>
            <code><span class="text-zinc-500"># multiple</span></code>
          </div>
          <div><code>npx @voltui/agent cursor copilot</code></div>
          <div><code>npx @voltui/agent codex gemini opencode</code></div>
          <div>
            <code><span class="text-zinc-500"># check what is installed</span></code>
          </div>
          <div><code>npx @voltui/agent doctor</code></div>
        </div>
      </div>

      <!-- Supported Agents -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiMcpPage.agentsTitle') }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          @for (agent of agents; track agent.id) {
            <div class="rounded-lg border border-border p-4 space-y-3">
              <div class="flex items-center gap-2">
                <lmn-sparkles [size]="20" [class]="agent.iconClass" />
                <h3 class="font-semibold">{{ t(agent.name) }}</h3>
                <span
                  class="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                  [class]="
                    agent.native
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-muted text-muted-foreground'
                  "
                  >{{ t(agent.badge) }}</span
                >
              </div>
              <p class="text-sm text-muted-foreground"><app-prose [key]="agent.body" /></p>
              <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
                <code>npx @voltui/agent {{ agent.id }}</code>
              </div>
              <p class="text-xs text-muted-foreground"><app-prose [key]="agent.writes" /></p>
            </div>
          }
        </div>
        <p class="text-sm text-muted-foreground">
          {{ t('guide.aiMcpPage.serves', { count: componentCount }) }}
        </p>
      </div>

      <!-- Manual config -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiMcpPage.manualTitle') }}
        </h2>
        <p class="text-muted-foreground text-sm">{{ t('guide.aiMcpPage.manualLede') }}</p>
        <pre
          class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto"
        ><code>{{ manualConfig }}</code></pre>
      </div>
    </div>
  `,
})
export default class AiMcpPage {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly mcpUrl = MCP_URL;
  readonly componentCount = SITE_STATS.components;

  readonly agents: readonly AgentCard[] = [
    {
      id: 'claude',
      iconClass: 'text-orange-500',
      native: true,
      name: 'guide.aiMcpPage.claudeName',
      badge: 'guide.aiMcpPage.claudeBadge',
      body: 'guide.aiMcpPage.claudeBody',
      writes: 'guide.aiMcpPage.claudeWrites',
    },
    {
      id: 'codex',
      iconClass: 'text-emerald-500',
      native: true,
      name: 'guide.aiMcpPage.codexName',
      badge: 'guide.aiMcpPage.codexBadge',
      body: 'guide.aiMcpPage.codexBody',
      writes: 'guide.aiMcpPage.codexWrites',
    },
    {
      id: 'opencode',
      iconClass: 'text-sky-500',
      native: true,
      name: 'guide.aiMcpPage.opencodeName',
      badge: 'guide.aiMcpPage.opencodeBadge',
      body: 'guide.aiMcpPage.opencodeBody',
      writes: 'guide.aiMcpPage.opencodeWrites',
    },
    {
      id: 'cursor',
      iconClass: 'text-blue-500',
      native: true,
      name: 'guide.aiMcpPage.cursorName',
      badge: 'guide.aiMcpPage.cursorBadge',
      body: 'guide.aiMcpPage.cursorBody',
      writes: 'guide.aiMcpPage.cursorWrites',
    },
    {
      id: 'windsurf',
      iconClass: 'text-cyan-500',
      native: true,
      name: 'guide.aiMcpPage.windsurfName',
      badge: 'guide.aiMcpPage.windsurfBadge',
      body: 'guide.aiMcpPage.windsurfBody',
      writes: 'guide.aiMcpPage.windsurfWrites',
    },
    {
      id: 'gemini',
      iconClass: 'text-indigo-500',
      native: false,
      name: 'guide.aiMcpPage.geminiName',
      badge: 'guide.aiMcpPage.geminiBadge',
      body: 'guide.aiMcpPage.geminiBody',
      writes: 'guide.aiMcpPage.geminiWrites',
    },
    {
      id: 'copilot',
      iconClass: 'text-purple-500',
      native: false,
      name: 'guide.aiMcpPage.copilotName',
      badge: 'guide.aiMcpPage.copilotBadge',
      body: 'guide.aiMcpPage.copilotBody',
      writes: 'guide.aiMcpPage.copilotWrites',
    },
  ];
  readonly setupUrl = `${MCP_URL}/setup`;

  readonly manualConfig = JSON.stringify(
    { mcpServers: { 'volt-ui': { type: 'url', url: MCP_URL } } },
    null,
    2
  );

  readonly tools = [
    { name: 'list_components', descriptionKey: 'guide.aiMcpPage.tools.listComponents' },
    { name: 'get_component', descriptionKey: 'guide.aiMcpPage.tools.getComponent' },
    { name: 'get_usage_example', descriptionKey: 'guide.aiMcpPage.tools.getUsageExample' },
    { name: 'get_theme_info', descriptionKey: 'guide.aiMcpPage.tools.getThemeInfo' },
    { name: 'get_project_info', descriptionKey: 'guide.aiMcpPage.tools.getProjectInfo' },
    { name: 'generate_cli_command', descriptionKey: 'guide.aiMcpPage.tools.generateCliCommand' },
  ];

  readonly resources = [
    { uri: 'component://{name}', descriptionKey: 'guide.aiMcpPage.resources.componentName' },
    { uri: 'theme://info', descriptionKey: 'guide.aiMcpPage.resources.themeInfo' },
    { uri: 'project://info', descriptionKey: 'guide.aiMcpPage.resources.projectInfo' },
  ];

  readonly prompts = [
    {
      name: 'generate-volt-ui-component',
      descriptionKey: 'guide.aiMcpPage.prompts.generateVoltUiComponent',
    },
    {
      name: 'volt-ui-troubleshooting',
      descriptionKey: 'guide.aiMcpPage.prompts.voltUiTroubleshooting',
    },
  ];

  readonly examplePromptKeys: readonly PlainTranslationKey[] = [
    'guide.aiMcpPage.examples.e1',
    'guide.aiMcpPage.examples.e2',
    'guide.aiMcpPage.examples.e3',
    'guide.aiMcpPage.examples.e4',
    'guide.aiMcpPage.examples.e5',
  ];
}
