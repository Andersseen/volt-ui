import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { RouterLink } from '@angular/router';
import { Prose } from '../../../components/prose';

const MCP_URL = 'https://volt-ui.pages.dev/api/mcp';

@Component({
  selector: 'app-mcp-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.mcpPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">{{ t('guide.mcpPage.lede') }}</p>
      </div>

      <!-- Three options -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.mcpPage.chooseTitle') }}
        </h2>

        <div class="grid gap-4">
          <a
            [routerLink]="path('/docs/ai-skill')"
            class="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span class="font-bold">1</span>
            </div>
            <div>
              <h3 class="font-semibold group-hover:text-primary">
                {{ t('guide.mcpPage.skillTitle') }}
              </h3>
              <p class="text-sm text-muted-foreground mt-1">{{ t('guide.mcpPage.skillBody') }}</p>
              <p class="text-sm text-primary mt-2">{{ t('guide.mcpPage.skillLink') }}</p>
            </div>
          </a>

          <a
            [routerLink]="path('/docs/ai-mcp')"
            class="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span class="font-bold">2</span>
            </div>
            <div>
              <h3 class="font-semibold group-hover:text-primary">
                {{ t('guide.mcpPage.mcpTitle') }}
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                <app-prose
                  key="guide.mcpPage.mcpBody"
                  [params]="{ url: mcpUrl }"
                  codeClass="bg-muted px-1 rounded"
                />
              </p>
              <p class="text-sm text-primary mt-2">{{ t('guide.mcpPage.mcpLink') }}</p>
            </div>
          </a>

          <a
            [routerLink]="path('/docs/ai-prompt')"
            class="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span class="font-bold">3</span>
            </div>
            <div>
              <h3 class="font-semibold group-hover:text-primary">
                {{ t('guide.mcpPage.promptTitle') }}
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                <app-prose key="guide.mcpPage.promptBody" />
              </p>
              <p class="text-sm text-primary mt-2">{{ t('guide.mcpPage.promptLink') }}</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Quick start -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.mcpPage.quickStartTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.mcpPage.quickStartLede') }}</p>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <code>npx volt-ui-mcp</code>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('guide.mcpPage.quickStartNote') }}</p>
      </div>

      <!-- When to use what -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.mcpPage.whenTitle') }}
        </h2>
        <div class="p-4 rounded-lg border border-border bg-muted/30">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted-foreground border-b border-border">
                <th class="pb-2 font-medium">{{ t('guide.mcpPage.colSituation') }}</th>
                <th class="pb-2 font-medium">{{ t('guide.mcpPage.colTool') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-border/50">
                <td class="py-2">{{ t('guide.mcpPage.row1') }}</td>
                <td class="py-2">{{ t('guide.mcpPage.row1Tool') }}</td>
              </tr>
              <tr class="border-b border-border/50">
                <td class="py-2">{{ t('guide.mcpPage.row2') }}</td>
                <td class="py-2">{{ t('guide.mcpPage.row2Tool') }}</td>
              </tr>
              <tr class="border-b border-border/50">
                <td class="py-2">{{ t('guide.mcpPage.row3') }}</td>
                <td class="py-2">{{ t('guide.mcpPage.row3Tool') }}</td>
              </tr>
              <tr>
                <td class="py-2">{{ t('guide.mcpPage.row4') }}</td>
                <td class="py-2">{{ t('guide.mcpPage.row4Tool') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export default class McpDocsPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  readonly mcpUrl = MCP_URL;
}
