import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpDatePickerNextMonth } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-next-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerNextMonth],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerNextMonth {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );
}
