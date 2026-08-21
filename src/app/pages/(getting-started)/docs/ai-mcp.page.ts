import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LmnCheckIcon, LmnExternalLinkIcon, LmnListIcon, LmnSparklesIcon } from 'lumen-icons';
import { Prose } from '../../../components/prose';
import { Translations, type TranslationKey } from '../../../i18n/translations';

const MCP_URL = 'https://volt-ui.pages.dev/api/mcp';

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
                key="guide.aiMcpPage.whatBody"
                [params]="{ url: mcpUrl }"
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
          <code>npx volt-ui-mcp</code>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('guide.aiMcpPage.setupNote') }}</p>
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
          {{ t('guide.aiMcpPage.agentsTitle') }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Claude -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <lmn-sparkles [size]="20" class="text-orange-500" />
              <h3 class="font-semibold">{{ t('guide.aiMcpPage.claudeName') }}</h3>
              <span
                class="ml-auto text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium"
                >{{ t('guide.aiMcpPage.claudeBadge') }}</span
              >
            </div>
            <p class="text-sm text-muted-foreground">{{ t('guide.aiMcpPage.claudeBody') }}</p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp claude</code>
            </div>
            <p class="text-xs text-muted-foreground">
              <app-prose key="guide.aiMcpPage.claudeWrites" />
            </p>
          </div>

          <!-- Cursor -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <lmn-list [size]="20" class="text-blue-500" />
              <h3 class="font-semibold">{{ t('guide.aiMcpPage.cursorName') }}</h3>
              <span
                class="ml-auto text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium"
                >{{ t('guide.aiMcpPage.cursorBadge') }}</span
              >
            </div>
            <p class="text-sm text-muted-foreground">
              <app-prose key="guide.aiMcpPage.cursorBody" />
            </p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp cursor</code>
            </div>
            <p class="text-xs text-muted-foreground">
              <app-prose key="guide.aiMcpPage.cursorWrites" />
            </p>
          </div>

          <!-- Windsurf -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <lmn-sparkles [size]="20" class="text-cyan-500" />
              <h3 class="font-semibold">{{ t('guide.aiMcpPage.windsurfName') }}</h3>
              <span
                class="ml-auto text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium"
                >{{ t('guide.aiMcpPage.windsurfBadge') }}</span
              >
            </div>
            <p class="text-sm text-muted-foreground">{{ t('guide.aiMcpPage.windsurfBody') }}</p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp windsurf</code>
            </div>
            <p class="text-xs text-muted-foreground">
              <app-prose key="guide.aiMcpPage.windsurfWrites" />
            </p>
          </div>

          <!-- Copilot -->
          <div class="rounded-lg border border-border p-4 space-y-3">
            <div class="flex items-center gap-2">
              <lmn-sparkles [size]="20" class="text-purple-500" />
              <h3 class="font-semibold">{{ t('guide.aiMcpPage.copilotName') }}</h3>
              <span
                class="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium"
                >{{ t('guide.aiMcpPage.copilotBadge') }}</span
              >
            </div>
            <p class="text-sm text-muted-foreground">{{ t('guide.aiMcpPage.copilotBody') }}</p>
            <div class="bg-[#1e1e1e] rounded p-2 font-mono text-xs text-zinc-300 overflow-x-auto">
              <code>npx volt-ui-mcp copilot</code>
            </div>
            <p class="text-xs text-muted-foreground">
              <app-prose key="guide.aiMcpPage.copilotWrites" />
            </p>
          </div>
        </div>
      </div>

      <!-- Manual config -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiMcpPage.manualTitle') }}
        </h2>
        <p class="text-muted-foreground text-sm">{{ t('guide.aiMcpPage.manualLede') }}</p>
        <div
          class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto"
        ></div>
      </div>
    </div>
  `,
})
export default class AiMcpPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly mcpUrl = MCP_URL;
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

  readonly examplePromptKeys: readonly TranslationKey[] = [
    'guide.aiMcpPage.examples.e1',
    'guide.aiMcpPage.examples.e2',
    'guide.aiMcpPage.examples.e3',
    'guide.aiMcpPage.examples.e4',
    'guide.aiMcpPage.examples.e5',
  ];
}
