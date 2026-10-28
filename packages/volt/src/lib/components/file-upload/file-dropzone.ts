import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
} from '@angular/core';
import { NgpFileDropzone } from 'ng-primitives/file-upload';
import { cn } from '../../utils';

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
        'ngpFileDropzoneDragOver: dragOverChange',
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltFileDropzone {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background p-8 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground data-[dragover]:border-primary data-[dragover]:bg-primary/5 cursor-pointer',
      this.class()
    )
  );

  readonly fileTypes = input<string | string[]>();
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly directory = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly selected = output<FileList | null>();
  readonly rejected = output<void>();
  readonly dragOverChange = output<boolean>();
}
