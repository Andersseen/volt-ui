import { Directive, computed, input } from '@angular/core';
import { NgpDialogDescription } from 'ng-primitives/dialog';
import { cn } from '../../utils';

@Directive({
  selector: '[voltDialogDescription]',
  hostDirectives: [NgpDialogDescription],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltDialogDescription {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-sm text-muted-foreground', this.class()));
}
