import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { RouterLink } from '@angular/router';
import { LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import promptMarkdown from '../../../../../VOLT_UI_PROMPT.md?raw';
import { Prose } from '../../../components/prose';

@Component({
  selector: 'app-ai-prompt-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink, LmnCopyIcon, LmnCheckIcon],
  template: `
    <div class="space-y-8 max-w-3xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.aiPromptPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">{{ t('guide.aiPromptPage.lede') }}</p>
      </div>

      <!-- What it is -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <h3 class="font-semibold">{{ t('guide.aiPromptPage.whatTitle') }}</h3>
        <p class="text-sm text-muted-foreground mt-1">
          <app-prose key="guide.aiPromptPage.whatBody" />
        </p>
      </div>

      <!-- Copy prompt -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiPromptPage.copyTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.aiPromptPage.copyLede') }}</p>
        <div class="relative">
          <button
            type="button"
            (click)="copyPrompt()"
            class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background text-foreground border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors z-10"
          >
            @if (copied()) {
              <lmn-check [size]="14" />
              <span>{{ t('guide.aiPromptPage.copied') }}</span>
            } @else {
              <lmn-copy [size]="14" />
              <span>{{ t('guide.aiPromptPage.copyButton') }}</span>
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
          {{ t('guide.aiPromptPage.howTitle') }}
        </h2>
        <ol class="space-y-3 text-muted-foreground list-decimal ml-4">
          <li><app-prose key="guide.aiPromptPage.howStep1" /></li>
          <li>{{ t('guide.aiPromptPage.howStep2') }}</li>
          <li>{{ t('guide.aiPromptPage.howStep3') }}</li>
        </ol>
      </div>

      <!-- What's inside -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiPromptPage.insideTitle') }}
        </h2>
        <ul class="space-y-2 text-muted-foreground">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideInstall" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideNaming" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideCatalog" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideOverlays" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideForms" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideTheme" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideRules" /></span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-0.5">•</span>
            <span><app-prose key="guide.aiPromptPage.insideTroubleshooting" /></span>
          </li>
        </ul>
      </div>

      <!-- When to use -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          {{ t('guide.aiPromptPage.whenTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.aiPromptPage.whenBody') }}</p>
        <p class="text-sm text-muted-foreground">{{ t('guide.aiPromptPage.whenAlt') }}</p>
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
