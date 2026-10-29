import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toast-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltToastTitle {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('text-sm font-semibold text-foreground', this.class())
  );
}
