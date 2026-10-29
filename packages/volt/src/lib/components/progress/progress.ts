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
    <div ngpProgressTrack class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        ngpProgressIndicator
        class="h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out"
      ></div>
    </div>
    <ng-content select="volt-progress-value" />
  `,
})
export class VoltProgress {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('block w-full', this.class()));

  readonly value = input<number | null, number | null>(null, {
    transform: numberAttribute as never,
  });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly valueLabel = input<(value: number, max: number) => string>(
    (value, max) => `${Math.round((value / max) * 100)}%`
  );
}
