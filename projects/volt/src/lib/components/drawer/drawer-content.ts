import { Directive, input, computed } from '@angular/core';
import { NgpDialog } from 'ng-primitives/dialog';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

@Directive({
  selector: '[voltDrawerContent]',
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
export class VoltDrawerContent {
  readonly side = input<DrawerSide>('right');
  readonly class = input<string>('');

  protected computedClass = computed(() => {
    // ng-primitives drives the open/close lifecycle with `data-enter` / `data-exit`
    // and keeps the element mounted until the exit animation finishes. It never sets
    // `data-state`, so keying animations off that attribute leaves them dead.
    const baseStyles =
      'fixed z-50 bg-surface text-surface-foreground shadow-xl animate-in data-[exit]:animate-out duration-300 ease-out';

    const sideStyles: Record<DrawerSide, string> = {
      left: 'inset-y-0 left-0 h-full w-[300px] max-w-[85vw] border-r border-border slide-in-from-left data-[exit]:slide-out-to-left',
      right:
        'inset-y-0 right-0 h-full w-[300px] max-w-[85vw] border-l border-border slide-in-from-right data-[exit]:slide-out-to-right',
      top: 'inset-x-0 top-0 w-full h-[300px] max-h-[85vh] border-b border-border slide-in-from-top data-[exit]:slide-out-to-top',
      bottom:
        'inset-x-0 bottom-0 w-full h-[300px] max-h-[85vh] border-t border-border slide-in-from-bottom data-[exit]:slide-out-to-bottom',
    };

    const classes = [baseStyles, sideStyles[this.side()], this.class()].filter(Boolean).join(' ');

    return classes;
  });
}
