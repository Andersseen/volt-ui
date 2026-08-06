import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Directive({
  selector: '[voltFileUpload]',
  standalone: true,
  host: {
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled()',
  },
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
        'ngpFileUploadDragOver: dragOverChange',
      ],
    },
  ],
})
export class VoltFileUpload {
  readonly fileTypes = input<string | string[]>();
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly directory = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dragDrop = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly selected = output<FileList | null>();
  readonly canceled = output<void>();
  readonly rejected = output<void>();
  readonly dragOverChange = output<boolean>();
}
