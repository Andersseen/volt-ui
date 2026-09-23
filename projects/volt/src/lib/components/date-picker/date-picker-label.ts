import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpDatePickerLabel } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpDatePickerLabel,
      inputs: ['id', 'aria-live'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerLabel {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-sm font-medium', this.class()));

  readonly id = input<string>();
  readonly ariaLive = input<string>('polite', { alias: 'aria-live' });
}
