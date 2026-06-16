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
  styles: [
    `
      :host {
        position: relative;
        display: flex;
        width: 100%;
        touch-action: none;
        user-select: none;
        align-items: center;
      }

      :host([data-orientation='vertical']) {
        height: 100%;
        width: auto;
        flex-direction: column;
      }

      [ngpSliderTrack] {
        position: relative;
        height: 0.5rem;
        width: 100%;
        flex-grow: 1;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--secondary, oklch(0.96 0.004 265));
      }

      [ngpSliderTrack][data-orientation='vertical'] {
        height: 100%;
        width: 0.5rem;
      }

      [ngpSliderRange] {
        position: absolute;
        height: 100%;
        border-radius: var(--radius-full, 9999px);
        background: var(--primary, oklch(0.6 0.22 265));
      }

      [ngpSliderRange][data-orientation='vertical'] {
        bottom: 0;
        width: 100%;
      }

      [ngpSliderThumb] {
        position: absolute;
        top: 50%;
        display: block;
        height: 1.25rem;
        width: 1.25rem;
        cursor: grab;
        border: 2px solid var(--primary, oklch(0.6 0.22 265));
        border-radius: var(--radius-full, 9999px);
        background: var(--background, oklch(1 0 0));
        transform: translate(-50%, -50%);
        transition-property: color, background-color, border-color, outline-color, box-shadow;
        transition-duration: 150ms;
      }

      [ngpSliderThumb][data-press] {
        cursor: grabbing;
      }

      [ngpSliderThumb][data-disabled] {
        pointer-events: none;
        opacity: 0.5;
      }

      [ngpSliderThumb]:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow:
          0 0 0 2px var(--background, oklch(1 0 0)),
          0 0 0 4px var(--ring, oklch(0.6 0.22 265));
      }
    `,
  ],
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
