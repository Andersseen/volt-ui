import { Directive, computed, input } from '@angular/core';
import { NgpDialogDescription } from 'ng-primitives/dialog';
import { cn } from '../../utils';

@Directive({
  selector: '[voltDrawerDescription]',
  hostDirectives: [NgpDialogDescription],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltDrawerDescription {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-sm text-muted-foreground', this.class()));
}
