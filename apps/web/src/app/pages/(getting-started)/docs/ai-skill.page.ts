import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnCheckIcon, LmnCopyIcon, LmnDownloadIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';
import skillMarkdown from '../../../../../../../.agents/skills/volt-ui/SKILL.md?raw';

/** The skills the installer writes, read from their files so the page cannot list a stale set. */
const SKILL_FILES = import.meta.glob('../../../../../cli/agent/skills/*/SKILL.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function describeSkill(text: string): { name: string; description: string } {
  const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const name = front.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? '';
  const description = (front.match(/^description:\s*>?\s*\n?([\s\S]*)$/m)?.[1] ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ');
  return { name, description };
}
import { Prose } from '@shared/components/prose';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';

@Component({
  selector: 'app-ai-skill-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink, VoltNativeButton, LmnCopyIcon, LmnCheckIcon, LmnDownloadIcon],
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
          <button voltButton size="sm" type="button" class="gap-1.5" (click)="copyInstallCommand()">
            @if (installCopied()) {
              <lmn-check [size]="16" />
              <span>{{ t('guide.aiSkillPage.copiedCmd') }}</span>
            } @else {
              <lmn-copy [size]="16" />
              <span>{{ t('guide.aiSkillPage.copyCmd') }}</span>
            }
          </button>

          <button
            voltButton
            variant="outline"
            size="sm"
            type="button"
            class="gap-1.5"
            (click)="downloadSkill()"
          >
            <lmn-download [size]="16" />
            <span>{{ t('guide.aiSkillPage.downloadSkill') }}</span>
          </button>

          <button
            voltButton
            variant="outline"
            size="sm"
            type="button"
            class="gap-1.5"
            (click)="copySkill()"
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
          @for (key of coverKeys; track key) {
            <li class="flex items-start gap-2">
              <span class="text-primary mt-0.5">•</span>
              <span><app-prose [key]="key" /></span>
            </li>
          }
        </ul>
        <h3 class="text-lg font-semibold">{{ t('guide.aiSkillPage.listTitle') }}</h3>
        <p class="text-sm text-muted-foreground">
          {{ t('guide.aiSkillPage.count', { count: skills.length }) }}
        </p>
        <ul class="grid gap-3 sm:grid-cols-2">
          @for (skill of skills; track skill.name) {
            <li class="rounded-lg border border-border p-3">
              <code class="text-sm font-medium">{{ skill.name }}</code>
              <p class="mt-1 text-xs text-muted-foreground">{{ skill.description }}</p>
            </li>
          }
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
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly skillContent = skillMarkdown;
  readonly skills = Object.values(SKILL_FILES)
    .map(describeSkill)
    .sort((a, b) =>
      a.name === 'volt-ui' ? -1 : b.name === 'volt-ui' ? 1 : a.name.localeCompare(b.name)
    );
  readonly coverKeys: readonly PlainTranslationKey[] = [
    'guide.aiSkillPage.coversAdoption',
    'guide.aiSkillPage.coversSelection',
    'guide.aiSkillPage.coversForms',
    'guide.aiSkillPage.coversOverlays',
    'guide.aiSkillPage.coversStyling',
    'guide.aiSkillPage.coversDistribution',
  ];
  readonly installCommand = 'npx @voltui/agent claude';
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
