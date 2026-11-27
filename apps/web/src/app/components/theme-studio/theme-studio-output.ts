import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltNativeButton,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';
import { CodeEditor, type CodeEditorLanguage } from '@shared/components/code-editor';
import { CopyButton } from '@shared/components/copy-button';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { ThemeStudioStore } from '../../services/theme-studio-store';

type OutputKind = 'css' | 'json' | 'ts';

interface Output {
  readonly kind: OutputKind;
  readonly labelKey: PlainTranslationKey;
  readonly descriptionKey: PlainTranslationKey;
  readonly language: CodeEditorLanguage;
  readonly extension: string;
  readonly mime: string;
}

const OUTPUTS: readonly Output[] = [
  {
    kind: 'css',
    labelKey: 'themeStudio.output.css',
    descriptionKey: 'themeStudio.output.cssLede',
    language: 'css',
    extension: 'css',
    mime: 'text/css',
  },
  {
    kind: 'json',
    labelKey: 'themeStudio.output.json',
    descriptionKey: 'themeStudio.output.jsonLede',
    language: 'json',
    extension: 'theme.json',
    mime: 'application/json',
  },
  {
    kind: 'ts',
    labelKey: 'themeStudio.output.ts',
    descriptionKey: 'themeStudio.output.tsLede',
    language: 'typescript',
    extension: 'theme.ts',
    mime: 'text/typescript',
  },
];

/**
 * What the draft becomes: the stylesheet, the editable project, and the TypeScript that wires the
 * palette into an app. Shown, copied and downloaded from the same strings the store derives from
 * the one draft — there is no second serializer.
 */
@Component({
  selector: 'app-theme-studio-output',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeEditor,
    CopyButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltNativeButton,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
  ],
  template: `
    <volt-card
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/25"
    >
      <volt-card-header>
        <volt-card-title>{{ t('themeStudio.output.title') }}</volt-card-title>
        <volt-card-description>{{ t('themeStudio.output.lede') }}</volt-card-description>
      </volt-card-header>
      <volt-card-content>
        <volt-tabs [value]="active()" (valueChange)="setActive($event)">
          <volt-tabs-list class="grid w-full grid-cols-3">
            @for (output of outputs; track output.kind) {
              <volt-tabs-trigger [value]="output.kind">{{ t(output.labelKey) }}</volt-tabs-trigger>
            }
          </volt-tabs-list>
          @for (output of outputs; track output.kind) {
            <volt-tabs-content [value]="output.kind">
              <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p class="text-xs text-muted-foreground">{{ t(output.descriptionKey) }}</p>
                <div class="flex gap-2">
                  <app-copy-button [code]="contents()[output.kind]" />
                  <button
                    voltButton
                    size="sm"
                    variant="outline"
                    [attr.aria-label]="
                      t('themeStudio.output.downloadNamed', { file: fileName(output) })
                    "
                    (click)="download(output)"
                  >
                    {{ t('themeStudio.output.download') }}
                  </button>
                </div>
              </div>
              <div class="mt-3 overflow-hidden rounded-xl border border-border/70 bg-muted/30">
                <app-code-editor
                  [code]="contents()[output.kind]"
                  [language]="output.language"
                  [ariaLabel]="t(output.labelKey)"
                  height="420px"
                />
              </div>
            </volt-tabs-content>
          }
        </volt-tabs>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioOutput {
  private readonly translations = injectAppI18n();
  private readonly document = inject(DOCUMENT);

  protected readonly t = this.translations.t;
  protected readonly store = inject(ThemeStudioStore);
  protected readonly outputs = OUTPUTS;
  protected readonly active = signal<OutputKind>('css');

  protected readonly contents = computed<Record<OutputKind, string>>(() => ({
    css: this.store.generatedCss(),
    json: this.store.projectJson(),
    ts: this.store.integrationSnippet(),
  }));

  protected setActive(value: unknown): void {
    if (value === 'css' || value === 'json' || value === 'ts') this.active.set(value);
  }

  protected fileName(output: Output): string {
    return `${this.store.normalizedName()}.${output.extension}`;
  }

  /** A click handler, so it only ever runs in a browser. */
  protected download(output: Output): void {
    const view = this.document.defaultView;
    if (!view?.URL?.createObjectURL) return;
    const url = view.URL.createObjectURL(
      new Blob([this.contents()[output.kind]], { type: `${output.mime};charset=utf-8` })
    );
    const link = this.document.createElement('a');
    link.href = url;
    link.download = this.fileName(output);
    link.click();
    view.setTimeout(() => view.URL.revokeObjectURL(url), 0);
  }
}
