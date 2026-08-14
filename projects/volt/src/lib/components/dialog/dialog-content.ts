import { Directive, input, computed } from '@angular/core';
import { NgpDialog } from 'ng-primitives/dialog';
import { cn } from '../../utils';

@Directive({
  selector: '[voltDialogContent]',
  hostDirectives: [
    {
      directive: NgpDialog,
      inputs: ['ngpDialogRole: role', 'ngpDialogModal: modal'],
    },
  ],
  host: {
    '[class]': 'computedClass()',
  },
})
export class VoltDialogContent {
  readonly class = input<string>('');

  protected computedClass = computed(() =>
    cn(
      // Keyed off ng-primitives' `data-exit`; it never sets `data-state`.
      'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface text-surface-foreground p-6 shadow-xl duration-200 ease-out animate-in fade-in-0 zoom-in-95 data-[exit]:animate-out data-[exit]:fade-out-0 data-[exit]:zoom-out-95',
      this.class()
    )
  );
}
