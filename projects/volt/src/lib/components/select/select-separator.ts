import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-select-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: ``,
})
export class VoltSelectSeparator {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('block -mx-1 my-1 h-px bg-muted', this.class()));
}
