import {
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
  computed,
} from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressTrack,
  provideProgressState,
} from 'ng-primitives/progress';
import { cn } from '../../utils';

@Component({
  selector: 'volt-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideProgressState()],
  hostDirectives: [
    {
      directive: NgpProgress,
      inputs: [
        'ngpProgressValue: value',
        'ngpProgressMin: min',
        'ngpProgressMax: max',
        'ngpProgressValueLabel: valueLabel',
      ],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  imports: [NgpProgressTrack, NgpProgressIndicator],
  template: `
    <ng-content select="volt-progress-label" />
    <div
      ngpProgressTrack
      class="relative col-span-2 row-start-2 block h-track w-full overflow-hidden rounded-pill border-(length:--volt-track-border-width) border-border bg-track"
    >
      <div
        ngpProgressIndicator
        class="h-full rounded-pill bg-primary transition-[width] duration-300 ease-in-out motion-reduce:transition-none data-[indeterminate]:mx-auto data-[indeterminate]:w-2/5 motion-safe:data-[indeterminate]:animate-pulse"
      ></div>
    </div>
    <ng-content select="volt-progress-value" />
  `,
})
export class VoltProgress {
  readonly class = input<string>('');

  // The label and value share a row above the track, whichever of them is projected.
  protected readonly classes = computed(() =>
    cn('grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-inset-sm', this.class())
  );

  readonly value = input<number | null, number | null>(null, {
    transform: numberAttribute as never,
  });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly valueLabel = input<(value: number, max: number, min: number) => string>(
    (value, max, min) => `${max === min ? 0 : Math.round(((value - min) / (max - min)) * 100)}%`
  );
}
