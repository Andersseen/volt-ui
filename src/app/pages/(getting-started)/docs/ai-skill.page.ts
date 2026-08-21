import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnCheckIcon, LmnCopyIcon, LmnDownloadIcon } from 'lumen-icons';
import skillMarkdown from '../../../../../.agents/skills/volt-ui/SKILL.md?raw';
import { Prose } from '../../../components/prose';
import { Translations } from '../../../i18n/translations';

@Component({
  selector: 'app-ai-skill-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink, LmnCopyIcon, LmnCheckIcon, LmnDownloadIcon],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.aiSkillPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">{{ t('guide.aiSkillPage.lede') }}</p>
      </div>

      <!-- What it is -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <h3 class="font-semibold">{{ t('guide.aiSkillPage.whatTitle') }}</h3>
        <p class="text-sm text-muted-foreground mt-1">
          <app-prose key="guide.aiSkillPage.whatBody" />
        </p>
      </div>

      <!-- Install -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiSkillPage.installTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.aiSkillPage.installBody') }}</p>
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
              <span>{{ t('guide.aiSkillPage.copiedCmd') }}</span>
            } @else {
              <lmn-copy [size]="16" />
              <span>{{ t('guide.aiSkillPage.copyCmd') }}</span>
            }
          </button>

          <button
            type="button"
            (click)="downloadSkill()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <lmn-download [size]="16" />
            <span>{{ t('guide.aiSkillPage.downloadSkill') }}</span>
          </button>

          <button
            type="button"
            (click)="copySkill()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            @if (skillCopied()) {
              <lmn-check [size]="16" />
              <span>{{ t('guide.aiSkillPage.copiedSkill') }}</span>
            } @else {
              <lmn-copy [size]="16" />
              <span>{{ t('guide.aiSkillPage.copySkill') }}</span>
            }
          </button>
        </div>
      </div>

      <!-- What it covers -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiSkillPage.coversTitle') }}
        </h2>
        <ul class="space-y-2 text-muted-foreground">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiSkillPage.coversStack" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiSkillPage.coversNaming" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiSkillPage.coversCatalog" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiSkillPage.coversOverlays" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiSkillPage.coversForms" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiSkillPage.coversTheme" /></span>
          </li>
        </ul>
      </div>

      <!-- Example rule -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiSkillPage.exampleTitle') }}
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
          <app-prose key="guide.aiSkillPage.exampleBody" />
        </p>
      </div>
    </div>
  `,
})
export default class AiSkillPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

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
