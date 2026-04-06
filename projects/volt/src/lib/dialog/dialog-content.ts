import { Directive, input, computed } from '@angular/core';
import { NgpDialog } from 'ng-primitives/dialog';

export type DialogVariant = 'default' | 'drawer-left' | 'drawer-right';

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
  readonly variant = input<DialogVariant>('default');
  readonly class = input<string>('');

  protected computedClass = computed(() => {
    const baseStyles =
      'fixed z-50 bg-background shadow-xl border transition-transform duration-300 ease-out';

    const variants: Record<DialogVariant, string> = {
      default:
        'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg border-border p-6',
      'drawer-left': 'inset-y-0 left-0 h-full w-[300px] max-w-[85vw] border-r border-border',
      'drawer-right': 'inset-y-0 right-0 h-full w-[300px] max-w-[85vw] border-l border-border',
    };

    const classes = [baseStyles, variants[this.variant()], this.class()].filter(Boolean).join(' ');

    return classes;
  });
}
