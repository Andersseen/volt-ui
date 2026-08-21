import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { RouterLink } from '@angular/router';
import { LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import promptMarkdown from '../../../../../VOLT_UI_PROMPT.md?raw';

@Component({
  selector: 'app-ai-prompt-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LmnCopyIcon, LmnCheckIcon],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Prompt Reference</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A single-file prompt you can paste into any LLM chat to get correct selectors, examples,
          and rules for Volt UI components.
        </p>
      </div>

      <!-- What it is -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <h3 class="font-semibold">What it is</h3>
        <p class="text-sm text-muted-foreground mt-1">
          <code class="bg-muted px-1 rounded">VOLT_UI_PROMPT.md</code>
          is a self-contained prompt reference. It tells the LLM everything it needs to know about
          Volt UI: installation, naming, the full component catalog, overlay rules, Reactive Forms
          examples, and troubleshooting.
        </p>
      </div>

      <!-- Copy prompt -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Copy the prompt
        </h2>
        <p class="text-muted-foreground">
          Paste the contents below at the top of a new chat with any LLM (ChatGPT, Claude, Gemini,
          Cursor Chat, etc.), then ask your question.
        </p>
        <div class="relative">
          <button
            type="button"
            (click)="copyPrompt()"
            class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background text-foreground border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors z-10"
          >
            @if (copied()) {
              <lmn-check [size]="14" />
              <span>Copied</span>
            } @else {
              <lmn-copy [size]="14" />
              <span>Copy prompt</span>
            }
          </button>
          <textarea
            readonly
            [value]="promptContent"
            class="w-full h-80 p-4 rounded-lg bg-[#1e1e1e] text-zinc-300 font-mono text-sm resize-y focus:outline-none"
          ></textarea>
        </div>
      </div>

      <!-- How to use -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          How to use it
        </h2>
        <ol class="space-y-3 text-muted-foreground list-decimal ml-4">
          <li>Click <strong>Copy prompt</strong> above.</li>
          <li>Paste it at the top of a new chat with your LLM.</li>
          <li>Ask your question, e.g. "Create a login form with Volt UI components."</li>
        </ol>
      </div>

      <!-- What's inside -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          What's inside
        </h2>
        <ul class="space-y-2 text-muted-foreground">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span> <strong>Installation</strong> — npm package and CLI workflows </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Naming conventions</strong> —
              <code class="bg-muted px-1 rounded">ui-*</code>
              / <code class="bg-muted px-1 rounded">UiXxx</code>
              vs
              <code class="bg-muted px-1 rounded">volt-*</code>
              / <code class="bg-muted px-1 rounded">VoltXxx</code>
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Component catalog</strong> — stable and beta components with selectors and
              notes
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Overlay rules</strong> — dialog, drawer, popover, tooltip, dropdown-menu
              templates
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Reactive Forms</strong> — CVA components and
              <code class="bg-muted px-1 rounded">FormControl</code>
              wiring
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Theme system</strong> — colors, styles,
              <code class="bg-muted px-1 rounded">provideVoltTheme</code>
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>AI assistant rules</strong> — what to do and what not to do when generating
              Volt UI code
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span> <strong>Troubleshooting</strong> — common mistakes and fixes </span>
          </li>
        </ul>
      </div>

      <!-- When to use -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          When to use it
        </h2>
        <p class="text-muted-foreground">
          Use the prompt reference when your editor or agent doesn't support MCP or local skills
          yet. It's also handy for one-off questions in web-based LLM chats.
        </p>
        <p class="text-sm text-muted-foreground">
          For integrated agents, prefer the
          <a [routerLink]="path('/docs/ai-mcp')" class="text-primary hover:underline">MCP server</a>
          or the
          <a [routerLink]="path('/docs/ai-skill')" class="text-primary hover:underline"
            >local skill</a
          >
          so the context stays in sync automatically.
        </p>
      </div>
    </div>
  `,
})
export default class AiPromptPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  readonly promptContent = promptMarkdown;
  readonly copied = signal(false);

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(this.promptContent);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  }
}
