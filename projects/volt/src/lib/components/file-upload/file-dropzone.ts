import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgpFileDropzone } from 'ng-primitives/file-upload';

@Component({
  selector: 'volt-file-dropzone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpFileDropzone,
      inputs: [
        'ngpFileDropzoneFileTypes: fileTypes',
        'ngpFileDropzoneMultiple: multiple',
        'ngpFileDropzoneDirectory: directory',
        'ngpFileDropzoneDisabled: disabled',
      ],
      outputs: [
        'ngpFileDropzoneSelected: selected',
        'ngpFileDropzoneRejected: rejected',
        'ngpFileDropzoneDragOver: dragOver',
      ],
    },
  ],
  host: {
    class:
      'flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-input bg-background p-8 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground data-[drag-over]:border-primary data-[drag-over]:bg-primary/5 cursor-pointer',
  },
  template: `<ng-content />`,
})
export class VoltFileDropzone {
  readonly fileTypes = input<string | string[]>();
  readonly multiple = input<boolean>(false);
  readonly directory = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly selected = output<FileList | null>();
  readonly rejected = output<void>();
  readonly dragOver = output<boolean>();
}
