import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
      outputs: ['ngpFileDropzoneSelected: selected', 'ngpFileDropzoneRejected: rejected'],
    },
  ],
  host: {
    class:
      'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background p-8 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground data-[dragover]:border-primary data-[dragover]:bg-primary/5 cursor-pointer',
  },
  template: `<ng-content />`,
})
export class VoltFileDropzone {
  readonly fileTypes = input<string | string[]>();
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly directory = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly selected = output<FileList | null>();
  readonly rejected = output<void>();
  readonly dragOverChange = output<boolean>();
  /** @deprecated Use `dragOverChange` instead. Removed in v1.0. */
  readonly dragOver = output<boolean>();

  constructor() {
    // hostDirectives can only map one primitive output to one public alias (mapping
    // the same internal output to two public names silently drops both), so the
    // dragOver/dragOverChange pair is bridged manually from the primitive's own
    // output instead of via hostDirectives.outputs.
    outputToObservable(inject(NgpFileDropzone).dragOver)
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.dragOverChange.emit(value);
        this.dragOver.emit(value);
      });
  }
}
