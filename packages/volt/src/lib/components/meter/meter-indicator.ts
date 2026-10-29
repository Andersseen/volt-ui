import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpMeterIndicator } from 'ng-primitives/meter';
import { cn } from '../../utils';

@Component({
  selector: 'volt-meter-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterIndicator],
  host: {
    '[class]': 'classes()',
  },
  template: ``,
})
export class VoltMeterIndicator {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'block h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out',
      this.class()
    )
  );
}
