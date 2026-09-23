import { Directive, computed, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { cn } from '../../utils';

@Directive({
  selector: '[voltToolbarButton]',
  hostDirectives: [
    { directive: NgpButton, inputs: ['disabled'] },
    {
      directive: NgpRovingFocusItem,
      inputs: ['ngpRovingFocusItemDisabled: disabled'],
    },
  ],
  host: {
    type: 'button',
    '[class]': 'classes()',
  },
})
export class VoltToolbarButton {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );
}
