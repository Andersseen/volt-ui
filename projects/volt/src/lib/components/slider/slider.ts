import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import {
  NgpSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
  provideSliderState,
} from 'ng-primitives/slider';
import type { NgpOrientation } from 'ng-primitives/common';

@Component({
  selector: 'volt-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideSliderState()],
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'ngpSliderValue: value',
        'ngpSliderMin: min',
        'ngpSliderMax: max',
        'ngpSliderStep: step',
        'ngpSliderDisabled: disabled',
        'ngpSliderOrientation: orientation',
      ],
      outputs: ['ngpSliderValueChange: valueChange'],
    },
  ],
  host: {
    class: 'relative flex w-full touch-none select-none items-center',
  },
  imports: [NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
  template: `
    <div ngpSliderTrack class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <div ngpSliderRange class="absolute h-full rounded-full bg-primary"></div>
    </div>
    <div
      ngpSliderThumb
      class="absolute top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[press]:cursor-grabbing"
    ></div>
  `,
})
export class VoltSlider {
  readonly value = input<number, number>(0, { transform: numberAttribute });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly step = input<number, number>(1, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<NgpOrientation>('horizontal');
  readonly valueChange = output<number>();
}
