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
    const baseStyles =
      'fixed z-50 bg-surface text-surface-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out duration-300 ease-out';

    const sideStyles: Record<DrawerSide, string> = {
      left: 'inset-y-0 left-0 h-full w-[300px] max-w-[85vw] border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      right:
        'inset-y-0 right-0 h-full w-[300px] max-w-[85vw] border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      top: 'inset-x-0 top-0 w-full h-[300px] max-h-[85vh] border-b border-border data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
      bottom:
        'inset-x-0 bottom-0 w-full h-[300px] max-h-[85vh] border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    };

    const classes = [baseStyles, sideStyles[this.side()], this.class()].filter(Boolean).join(' ');

    return classes;
  });
}
