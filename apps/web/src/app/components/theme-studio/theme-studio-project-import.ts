import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltNativeButton, VoltTextarea } from 'volt';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import type { ThemeProjectError } from '../../lib/theme-project';
import { THEME_PROJECT_MAX_BYTES } from '../../lib/theme-project';
import { ThemeStudioStore } from '../../services/theme-studio-store';

const ERRORS: Record<ThemeProjectError['code'], PlainTranslationKey> = {
  'too-large': 'themeStudio.project.errorTooLarge',
  'not-json': 'themeStudio.project.errorNotJson',
  'not-a-project': 'themeStudio.project.errorNotProject',
  'unsupported-version': 'themeStudio.project.errorVersion',
  invalid: 'themeStudio.project.errorInvalid',
};

/**
 * Opens a theme project (`.json` exported by the studio), from a file or pasted. The draft changes
 * only when the whole project is valid, and the change can be undone.
 */
@Component({
  selector: 'app-theme-studio-project-import',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltNativeButton, VoltTextarea],
  template: `
    <div class="space-y-3 rounded-lg border border-border/70 bg-muted/25 p-3">
      <p class="text-sm font-medium">{{ t('themeStudio.project.importTitle') }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <label for="theme-project-file" class="text-sm text-muted-foreground">
          {{ t('themeStudio.project.fileLabel') }}
        </label>
        <input
          id="theme-project-file"
          type="file"
          accept="application/json,.json"
          class="max-w-full text-xs file:mr-2 file:rounded-md file:border file:border-input file:bg-background file:px-2 file:py-1 file:text-foreground"
          (change)="readFile($event)"
        />
      </div>
      <label for="theme-project-paste" class="block text-sm text-muted-foreground">
        {{ t('themeStudio.project.pasteLabel') }}
      </label>
      <volt-textarea
        [id]="'theme-project-paste'"
        [rows]="3"
        class="font-mono text-xs"
        [value]="text()"
        (valueChange)="text.set($event); store.clearProjectError()"
      />
      <button
        voltButton
        size="sm"
        variant="outline"
        [disabled]="!text().trim()"
        (click)="open(text())"
      >
        {{ t('themeStudio.project.open') }}
      </button>
      @if (store.projectError(); as error) {
        <div role="alert" class="space-y-1 text-xs text-error">
          <p>{{ t(errors[error.code]) }}</p>
          <p class="font-mono break-words">{{ error.detail }}</p>
        </div>
      }
    </div>
  `,
})
export class ThemeStudioProjectImport {
  protected readonly t = injectAppI18n().t;
  protected readonly store = inject(ThemeStudioStore);
  protected readonly errors = ERRORS;
  protected readonly text = signal('');

  protected async readFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    // Refused before reading: a file this large cannot be a project, whatever its extension says.
    if (file.size > THEME_PROJECT_MAX_BYTES) {
      this.store.projectError.set({
        code: 'too-large',
        detail: `${file.name}: ${file.size} bytes`,
      });
      return;
    }
    this.open(await file.text());
  }

  protected open(text: string): void {
    if (this.store.importProject(text)) this.text.set('');
  }
}
