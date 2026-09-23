import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpMeterValue } from 'ng-primitives/meter';
import { cn } from '../../utils';

@Component({
  selector: 'volt-meter-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterValue],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltMeterValue {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-sm text-muted-foreground', this.class())
  );
}
