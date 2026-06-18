import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { NgpMeter, provideMeterState } from 'ng-primitives/meter';

@Component({
  selector: 'volt-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMeterState()],
  host: {
    class: 'block w-full',
  },
  hostDirectives: [
    {
      directive: NgpMeter,
      inputs: [
        'ngpMeterValue: value',
        'ngpMeterMin: min',
        'ngpMeterMax: max',
        'ngpMeterValueLabel: valueLabel',
      ],
    },
  ],
  template: `<ng-content />`,
})
export class VoltMeter {
  readonly value = input<number, number>(0, { transform: numberAttribute });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly valueLabel = input<(value: number, max: number) => string>();
}
