import { Directive, input, output } from '@angular/core';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Directive({
  selector: '[voltFileUpload]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpFileUpload,
      inputs: [
        'ngpFileUploadFileTypes: fileTypes',
        'ngpFileUploadMultiple: multiple',
        'ngpFileUploadDirectory: directory',
        'ngpFileUploadDragDrop: dragDrop',
        'ngpFileUploadDisabled: disabled',
      ],
      outputs: [
        'ngpFileUploadSelected: selected',
        'ngpFileUploadCanceled: canceled',
        'ngpFileUploadRejected: rejected',
        'ngpFileUploadDragOver: dragOver',
      ],
    },
  ],
})
export class VoltFileUpload {
  readonly fileTypes = input<string | string[]>();
  readonly multiple = input<boolean>(false);
  readonly directory = input<boolean>(false);
  readonly dragDrop = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly selected = output<FileList | null>();
  readonly canceled = output<void>();
  readonly rejected = output<void>();
  readonly dragOver = output<boolean>();
}
