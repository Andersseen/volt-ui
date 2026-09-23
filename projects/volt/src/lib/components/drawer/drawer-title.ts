import { Directive, computed, input } from '@angular/core';
import { NgpDialogTitle } from 'ng-primitives/dialog';
import { cn } from '../../utils';

@Directive({
  selector: '[voltDrawerTitle]',
  hostDirectives: [NgpDialogTitle],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltDrawerTitle {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('text-lg font-semibold leading-none tracking-tight', this.class())
  );
}
