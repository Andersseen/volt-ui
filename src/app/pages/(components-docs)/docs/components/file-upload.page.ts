import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltFileDropzone, VoltFileUpload, VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { FILE_UPLOAD_SNIPPET } from '../../../../lib/snippets';
import { FILE_UPLOAD_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-file-upload-demo',
  standalone: true,
  imports: [VoltFileDropzone, VoltFileUpload, VoltButton, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">File Upload</h1>
        <p class="text-base text-muted-foreground mt-2">
          File picker trigger and drag-and-drop dropzone primitives.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
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
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add file-upload"
        description="Copy this code to your project. The component uses ng-primitives/file-upload."
      />
    </div>
  `,
})
export default class FileUploadDemo {
  readonly code = FILE_UPLOAD_SNIPPET;
  readonly usage = FILE_UPLOAD_USAGE;
  readonly fileLabel = signal('No files selected');

  setFiles(files: FileList | null) {
    this.fileLabel.set(files?.length ? `${files.length} file(s) selected` : 'No files selected');
  }
}
