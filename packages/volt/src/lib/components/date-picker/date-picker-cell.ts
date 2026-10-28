import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpDatePickerCell } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerCell],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerCell {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('relative size-9 p-0 text-center text-sm', this.class())
  );
}
