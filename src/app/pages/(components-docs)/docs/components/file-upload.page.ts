import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltFileDropzone, VoltFileUpload, VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { FILE_UPLOAD_SNIPPET } from '../../../../lib/snippets';
import { FILE_UPLOAD_USAGE } from '../../../../lib/snippets/usage';
import { FILE_UPLOAD_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-file-upload-demo',
  standalone: true,
  imports: [VoltFileDropzone, VoltFileUpload, VoltButton, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.fileUpload.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.fileUpload.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 flex justify-center">
          <div class="w-full max-w-md space-y-4">
            <volt-file-dropzone multiple (selected)="setFiles($event)">
              <span class="font-medium text-foreground">Drop files here</span>
              <span class="mt-1 text-xs">or click to browse from your computer</span>
            </volt-file-dropzone>
            <volt-button voltFileUpload multiple (selected)="setFiles($event)">
              Browse files
            </volt-button>
            <p class="text-sm text-muted-foreground">{{ fileLabel() }}</p>
          </div>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="fileUploadApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add file-upload"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/file-upload' })"
      />
    </div>
  `,
})
export default class FileUploadDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly fileUploadApi = FILE_UPLOAD_API;
  readonly code = FILE_UPLOAD_SNIPPET;
  readonly usage = FILE_UPLOAD_USAGE;
  readonly fileLabel = signal('No files selected');

  setFiles(files: FileList | null) {
    this.fileLabel.set(files?.length ? `${files.length} file(s) selected` : 'No files selected');
  }
}
