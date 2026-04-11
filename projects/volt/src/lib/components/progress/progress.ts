import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressTrack,
  provideProgressState,
} from 'ng-primitives/progress';

@Component({
  selector: 'volt-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideProgressState()],
  hostDirectives: [
    {
      directive: NgpProgress,
      inputs: ['ngpProgressValue: value', 'ngpProgressMin: min', 'ngpProgressMax: max'],
    },
  ],
  host: {
    class: 'block w-full',
  },
  imports: [NgpProgressTrack, NgpProgressIndicator],
  template: `
    <div ngpProgressTrack class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        ngpProgressIndicator
        class="h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out"
      ></div>
    </div>
  `,
})
export class VoltProgress {
  readonly value = input<number | null, number | null>(null, {
    transform: numberAttribute as never,
  });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
}
