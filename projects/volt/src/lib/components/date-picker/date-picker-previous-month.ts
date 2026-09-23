import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpDatePickerPreviousMonth } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-previous-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerPreviousMonth],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerPreviousMonth {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );
}
