import { Directive, computed, input } from '@angular/core';
import { NgpDialogOverlay } from 'ng-primitives/dialog';
import { cn } from '../../utils';

@Directive({
  selector: '[voltDialogOverlay]',
  hostDirectives: [
    {
      directive: NgpDialogOverlay,
      inputs: ['ngpDialogOverlayCloseOnClick: closeOnClick'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltDialogOverlay {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'fixed inset-0 bg-foreground/50 animate-in fade-in-0 data-[exit]:animate-out data-[exit]:fade-out-0 duration-200',
      this.class()
    )
  );
}
