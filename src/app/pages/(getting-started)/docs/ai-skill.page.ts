import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnCheckIcon, LmnCopyIcon, LmnDownloadIcon } from 'lumen-icons';
import skillMarkdown from '../../../../../.agents/skills/volt-ui/SKILL.md?raw';

@Component({
  selector: 'app-ai-skill-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LmnCopyIcon, LmnCheckIcon, LmnDownloadIcon],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Local Skill</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A built-in skill file that OpenCode / Claude Code auto-discover in any workspace that uses
          Volt UI components.
        </p>
      </div>

      <!-- What it is -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <h3 class="font-semibold">What it is</h3>
        <p class="text-sm text-muted-foreground mt-1">
          The skill lives at
          <code class="bg-muted px-1 rounded">.agents/skills/volt-ui/SKILL.md</code>
          in the Volt UI repository. Any AI agent that supports OpenCode-style skills will load it
          automatically and use the conventions, selectors, and component catalog when writing code
          for your project.
        </p>
      </div>

      <!-- Install -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Install the skill
        </h2>
        <p class="text-muted-foreground">
          The fastest way to install the skill in a consumer project is to copy it into the standard
          local-skills location:
        </p>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <code>{{ installCommand }}</code>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            (click)="copyInstallCommand()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            @if (installCopied()) {
              <lmn-check [size]="16" />
              <span>Copied</span>
            } @else {
              <lmn-copy [size]="16" />
              <span>Copy install command</span>
            }
          </button>

          <button
            type="button"
            (click)="downloadSkill()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <lmn-download [size]="16" />
            <span>Download SKILL.md</span>
          </button>

          <button
            type="button"
            (click)="copySkill()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            @if (skillCopied()) {
              <lmn-check [size]="16" />
              <span>Copied</span>
            } @else {
              <lmn-copy [size]="16" />
              <span>Copy skill contents</span>
            }
          </button>
        </div>
      </div>

      <!-- What it covers -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          What the skill covers
        </h2>
        <ul class="space-y-2 text-muted-foreground">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Stack context</strong> — Angular 21, zoneless signals, OnPush, standalone,
              Tailwind v4, ng-primitives, CVA
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Naming conventions</strong> —
              <code class="bg-muted px-1 rounded">ui-*</code>
              vs
              <code class="bg-muted px-1 rounded">volt-*</code>
              , element vs attribute selectors
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Component catalog</strong> — stable and beta components with selectors and key
              inputs
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Overlay rules</strong> — attribute-directive triggers +
              <code class="bg-muted px-1 rounded">&lt;ng-template&gt;</code>
              for dialog, drawer, popover, tooltip, dropdown-menu
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Reactive Forms</strong> — which components are CVA and how to wire
              <code class="bg-muted px-1 rounded">FormControl</code>
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>Theme system</strong> —
              <code class="bg-muted px-1 rounded">provideVoltTheme</code>
              , colors, styles, and dark mode
            </span>
          </li>
        </ul>
      </div>

      <!-- Example rule -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          Example rule from the skill
        </h2>
        <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <div>// Overlays are template-based</div>
          <div>&lt;button [uiDialog]="dialogTpl"&gt;Open&lt;/button&gt;</div>
          <div>&lt;ng-template #dialogTpl let-close="close"&gt;</div>
          <div>&nbsp;&nbsp;&lt;div uiDialogOverlay&gt;&lt;/div&gt;</div>
          <div>&nbsp;&nbsp;&lt;div uiDialogContent&gt;...&lt;/div&gt;</div>
          <div>&lt;/ng-template&gt;</div>
        </div>
        <p class="text-sm text-muted-foreground">
          The skill explicitly tells the agent never to write
          <code class="bg-muted px-1 rounded">&lt;ui-dialog&gt;</code>
          ,
          <code class="bg-muted px-1 rounded">&lt;ui-tooltip&gt;</code>
          , or other invalid element selectors.
        </p>
      </div>
    </div>
  `,
})
export default class AiSkillPage {
  readonly skillContent = skillMarkdown;
  readonly installCommand = `mkdir -p .agents/skills/volt-ui && curl -fsSL https://volt-ui.pages.dev/.agents/skills/volt-ui/SKILL.md -o .agents/skills/volt-ui/SKILL.md`;
  readonly installCopied = signal(false);
  readonly skillCopied = signal(false);

  async copyInstallCommand() {
    await this.copyText(this.installCommand, this.installCopied);
  }

  async copySkill() {
    await this.copyText(this.skillContent, this.skillCopied);
  }

  downloadSkill() {
    const blob = new Blob([this.skillContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SKILL.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async copyText(text: string, copiedSignal: ReturnType<typeof signal<boolean>>) {
    try {
      await navigator.clipboard.writeText(text);
      copiedSignal.set(true);
      setTimeout(() => copiedSignal.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
