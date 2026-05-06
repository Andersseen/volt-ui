import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpListbox, provideListboxState } from 'ng-primitives/listbox';
import type { NgpSelectionMode } from 'ng-primitives/common';

@Component({
  selector: 'volt-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideListboxState()],
  hostDirectives: [
    {
      directive: NgpListbox,
      inputs: [
        'id',
        'ngpListboxMode: mode',
        'ngpListboxValue: value',
        'ngpListboxDisabled: disabled',
        'ngpListboxCompareWith: compareWith',
      ],
      outputs: ['ngpListboxValueChange: valueChange'],
    },
  ],
  host: {
    class:
      'grid min-w-[12rem] gap-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-sm outline-none',
  },
  template: `<ng-content />`,
})
export class VoltListbox<T = unknown> {
  readonly id = input<string>();
  readonly mode = input<NgpSelectionMode>('single');
  readonly value = model<T[]>([]);
  readonly disabled = input<boolean>(false);
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
}
