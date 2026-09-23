import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toast-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltToastDescription {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-sm text-muted-foreground', this.class()));
}
