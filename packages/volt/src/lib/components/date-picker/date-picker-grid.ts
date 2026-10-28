import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpDatePickerGrid } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerGrid],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerGrid {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('grid gap-1', this.class()));
}
