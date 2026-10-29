import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpMeterLabel } from 'ng-primitives/meter';
import { cn } from '../../utils';

@Component({
  selector: 'volt-meter-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpMeterLabel,
      inputs: ['id'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltMeterLabel {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-sm font-medium text-foreground', this.class())
  );
}
